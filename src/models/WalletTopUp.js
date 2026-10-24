
const mongoose = require("mongoose");

const walletTopUpSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 50,
      validate: {
        validator: Number.isSafeInteger,
        message: "Top-up amount must be a whole-rupee amount.",
      },
    },
    currency: {
      type: String,
      default: "inr",
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    sessionId: {
      type: String,
    //   unique: true,
    //   sparse: true,
        default: undefined,
    },
    paymentIntentId: {
      type: String,
      default: null,
    },
    creditedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);
walletTopUpSchema.index(
  { sessionId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      sessionId: { $type: "string" },
    },
  }
);
walletTopUpSchema.index(
  { paymentIntentId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      paymentIntentId: { $type: "string" },
    },
  }
);

module.exports = mongoose.model("WalletTopUp", walletTopUpSchema);
