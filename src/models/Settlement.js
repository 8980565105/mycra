const mongoose = require("mongoose");

const settlementSchema = new mongoose.Schema(
  {
    store_owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },

    payment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },

    // Original eligible sales amount before deductions
    gross_amount: {
      type: Number,
      required: true,
      min: 0,
    },

    commission_rate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    commission_amount: {
      type: Number,
      required: true,
      min: 0,
    },

    shipping_amount: {
      type: Number,
      default: 0,
      min: 0,
    },

    tax_amount: {
      type: Number,
      default: 0,
      min: 0,
    },

    refund_amount: {
      type: Number,
      default: 0,
      min: 0,
    },

    other_expenses: {
      type: Number,
      default: 0,
      min: 0,
    },

    net_amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
      uppercase: true,
      trim: true,
    },

    transaction_id: {
      type: String,
      default: "",
      trim: true,
    },

    payout_reference: {
      type: String,
      default: "",
      trim: true,
    },

    payout_provider: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "on_hold",
        "available",
        "processing",
        "paid",
        "failed",
        "reversed",
      ],
      default: "pending",
      index: true,
    },

    available_at: {
      type: Date,
      default: null,
    },

    settlement_date: {
      type: Date,
      default: null,
    },

    requested_at: {
      type: Date,
      default: null,
    },

    processed_at: {
      type: Date,
      default: null,
    },

    paid_at: {
      type: Date,
      default: null,
    },

    processed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    failure_reason: {
      type: String,
      default: "",
      trim: true,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

// One seller-level settlement per order.
settlementSchema.index(
  { order_id: 1, store_owner_id: 1 },
  { unique: true }
);

module.exports = mongoose.model("Settlement", settlementSchema);