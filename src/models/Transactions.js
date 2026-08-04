const mongoose = require("mongoose");

const transectionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["Money sent", "Money received", "Self transfer"],
      required: true,
    },
    category: {
      type: String,
      enum: [
        "Amazon.in",
        "Credit Card Payment",
        "Partners",
        "Bills and Recharges",
        "Daily Transit",
        "Travel",
        "Financial Services",
      ],
      required: true,
    },
    paymentMode: {
      type: String,
      enum: [
        "Amazon Pay Balance",
        "Credit/Debit Card",
        "UPI",
        "Net Banking",
        "Amazon Credit",
        "Cash on Delivery",
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ["Success", "Pending", "Failed"],
      default: "Pending",
    },
    tab: {
      type: String,
      enum: ["All", "Refund", "Cashback"],
      default: "All",
    },
    description: {
      type: String,
      default: "",
    },
    referenceId: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true },
);

transectionSchema.index({ description: "text" });

module.exports = mongoose.model("transection", transectionSchema);
