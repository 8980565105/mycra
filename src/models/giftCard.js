const mongoose = require("mongoose");

const giftCardSchema = new mongoose.Schema(
  {
    cardNumber: {
      type: String,
      required: function () {
        return this.recordType !== "Product";
      },
      trim: true,
    },

    pinHash: {
      type: String,
      required: function () {
        return this.recordType !== "Product";
      },
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
      enum: ["Admin", "Purchase", "Promotion", "Campaign"],
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

    gifterName: {
      type: String,
      default: "",
      trim: true,
    },

    message: {
      type: String,
      default: "",
      maxlength: 100,
      trim: true,
    },

    recordType: {
      type: String,
      enum: ["Product", "Issued"],
      default: "Issued",
      index: true,
    },

    productName: {
      type: String,
      trim: true,
      required: function () {
        return this.recordType === "Product";
      },
    },

    productDescription: {
      type: String,
      trim: true,
      default: "",
    },

    productImage: {
      type: String,
      trim: true,
      default: "",
    },

    allowCustomAmount: {
      type: Boolean,
      default: false,
    },

    minAmount: {
      type: Number,
      default: 1000,
      min: 1,
    },

    maxAmount: {
      type: Number,
      default: 10000,
      min: 1,
    },

    amountStep: {
      type: Number,
      default: 1000,
      min: 1,
    },

    productExpiresAt: {
      type: Date,
      default: null,
    },
    isPurchaseEnabled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

giftCardSchema.index(
  { cardNumber: 1 },
  {
    unique: true,
    partialFilterExpression: {
      cardNumber: { $type: "string" },
    },
    name: "cardNumber_unique_strings",
  }
);

module.exports = mongoose.model("GiftCard", giftCardSchema);
