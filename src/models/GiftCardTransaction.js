const mongoose = require("mongoose");

const giftCardTransactionSchema = new mongoose.Schema(
  {
    giftCard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GiftCard",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    type: {
      type: String,
      enum: [
        "Issued",
        "Activated",
        "Assigned",
        "Redeemed",
        "Refunded",
        "Blocked",
        "Unblocked",
        "Expired",
        "Adjusted",
      ],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    balanceBefore: {
      type: Number,
      required: true,
      min: 0,
    },

    balanceAfter: {
      type: Number,
      required: true,
      min: 0,
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },

    referenceId: {
      type: String,
      required: true,
      unique: true,
    },

    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "GiftCardTransaction",
  giftCardTransactionSchema
);
