const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const Payment = require("../models/Payment");
const {
  finalizeOrderFromPaymentIntent,
} = require("../utils/finalizeOrderFromPayment");

const handleStripeWebhook = async (req, res) => {
  const signature = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const intent = event.data.object;

        console.log("Stripe payment succeeded:", intent.id);

        const result = await finalizeOrderFromPaymentIntent(
          intent.id, { source: "webhook" }
        );

        console.log("Stripe Finalization result:", {
          paymentIntentId: intent.id,
          orderId: result.order?._id || null,
          alreadyProcessed: result.alreadyProcessed,
          processing: result.processing,
        });

        if (result.processing || !result.order) {
          return res.status(500).json({
            received: false, message: "Payment finalization is not complete",
          });
        }

        break;
      }

      case "payment_intent.payment_failed": {
        const intent = event.data.object;

        console.log("[Stripe Webhook] Payment failed:", intent.id);

        await Payment.updateOne(
          {
            stripe_payment_intent_id: intent.id,
            status: "pending",
            order_id: null,
          },
          {
            $set: { status: "failed" },
          }
        );

        break;
      }
      default:
        console.log("[Stripe Webhook] Unhandled event:", event.type);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("Stripe webhook processing error:", err);

    return res.status(500).json({
      received: false, message: "Webhook processing failed",
    });
  }
};

module.exports = { handleStripeWebhook };