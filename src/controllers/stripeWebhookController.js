const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const Payment = require("../models/Payment");
const {
  finalizeOrderFromPaymentIntent,
} = require("../utils/finalizeOrderFromPayment");

const handleStripeWebhook = async (req, res) => {
  console.log("[Stripe Webhook] Request received");
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log("[Stripe Webhook Received]", {
      type: event.type, id: event.id,
    });
  } catch (err) {
    console.error("Stripe signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  try {
    switch (event.type) {
      case "payment_intent.payment_failed": {
        const intent = event.data.object;

        console.log("[Payment Failed Event]", {
          paymentIntentId: intent.id,
          stripeStatus: intent.status,
          errorCode: intent.last_payment_error?.code,
          errorMessage: intent.last_payment_error?.message,
        });

        const result = await Payment.updateOne(
          {
            stripe_payment_intent_id: intent.id,
            order_id: null,
            status: { $ne: "completed" },
            _locked: { $ne: true },
          },
          {
            $set: {
              status: "failed",
              last_payment_error:
                intent.last_payment_error?.message ||
                "Card payment attempt failed",
            },
          }
        );

        console.log("[Payment MongoDB Update]", {
          paymentIntentId: intent.id,
          matchedCount: result.matchedCount,
          modifiedCount: result.modifiedCount,
        });

        break;
      }

      case "payment_intent.succeeded": {
        const intent = event.data.object;

        console.log("Stripe payment succeeded:", intent.id);

        const result = await finalizeOrderFromPaymentIntent(
          intent.id
        );

        console.log("Stripe order finalization:", {
          paymentIntentId: intent.id,
          orderId: result.order?._id || null,
          alreadyProcessed: result.alreadyProcessed || false,
          processing: result.processing || false,
        });

        break;
      }

      case "payment_intent.processing": {
        const intent = event.data.object;

        await Payment.updateOne(
          {
            stripe_payment_intent_id: intent.id,
            order_id: null,
            status: { $ne: "completed" },
            _locked: { $ne: true },
          },
          {
            $set: { status: "pending" },
          }
        );

        break;
      }
      default:
        console.log("Unhandled Stripe event:", event.type);
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
