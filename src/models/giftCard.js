const mongoose = require("mongoose");

const giftCardSchema = new mongoose.Schema(
  {
    cardNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    pinHash: {
      type: String,
      required: true,
    },

    originalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    remainingBalance: {
      type: Number,
      required: true,
      min: 0,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    recipientName: {
      type: String,
      default: "",
      trim: true,
    },

    recipientEmail: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "Inactive",
        "Active",
        "FullyRedeemed",
        "Expired",
        "Blocked",
      ],
      default: "Active",
      index: true,
    },

    source: {
      type: String,
      enum: [
        "Admin",
        "Purchase",
        "Promotion",
        "Campaign",
      ],
      default: "Admin",
    },

    expiresAt: {
      type: Date,
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    activatedAt: {
      type: Date,
      default: Date.now,
    },

    redeemedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("GiftCard", giftCardSchema);
