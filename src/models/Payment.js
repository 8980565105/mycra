const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: false,
      default: null,
    },

    stripe_payment_intent_id: {
      type: String,
      default: "",
      index: true,
    },

    checkout_data: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    store_owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    payment_method: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    transaction_id: {
      type: String,
      required: false,
      default: "",
    },
    amount_paid: {
      type: Number,
      required: true,
      default: 0,
    },
    discount_amount: {
      type: Number,
      default: 0,
    },
    coupon_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      required: false,
      default: null,
    },
    payment_date: {
      type: Date,
      default: Date.now,
    },
    _locked: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Payment", paymentSchema);
