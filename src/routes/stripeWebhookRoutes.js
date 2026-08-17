const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const Payment = require("../models/Payment");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const ProductVariant = require("../models/ProductVariant");

const handleStripeWebhook = async (req, res) => {
  const signature = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("Stripe webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        await handlePaymentSucceeded(paymentIntent);
        break;
      }
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        await Payment.findOneAndUpdate(
          {
            stripe_payment_intent_id: paymentIntent.id,
          },
          {
            status: "failed",
          },
        );
        break;
      }
      default:
        console.log("Unhandled Stripe event:", event.type);
    }
    return res.json({
      received: true,
    });
  } catch (err) {
    console.error("Stripe webhook processing error:", err);
    return res.status(500).json({
      received: false,
    });
  }
};
