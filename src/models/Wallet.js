const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    giftCardBalance: {
      type: Number,
      default: 0,
    },
    voucherBalance: {
      type: Number,
      default: 0,
    },
    isKycVerified: {
      type: Boolean,
      default: false,
    },
    maxAddLimit: {
      type: Number,
      default: 10000,
    },
  },
  { timestamps: true }
);
walletSchema.virtual("totalBalance").get(function () {
  return this.balance + this.giftCardBalance + this.voucherBalance;
});
walletSchema.set("toJSON", { virtuals: true });
walletSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("wallet", walletSchema);