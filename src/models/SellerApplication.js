const mongoose = require("mongoose");

const sellerApplicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    businessDetails: {
      storeName: { type: String, trim: true },
      category: { type: String, trim: true },
      businessType: { type: String, trim: true },
      description: { type: String, trim: true },
      website: { type: String, trim: true },
      domain: { type: String, trim: true, lowercase: true },
      phone: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true },
    },
    pickupAddress: {
      full_name: { type: String },
      phone_number: { type: String },
      house_no: { type: String },
      apartment: { type: String },
      street: { type: String },
      landmark: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String, default: "India" },
      zip_code: { type: String },
    },
    bankDetails: {
      accountNumber: { type: String, trim: true },
      accountHolderName: { type: String, trim: true },
      ifscCode: { type: String, trim: true },
      bankName: { type: String, trim: true },
      branchName: { type: String, trim: true },
    },
    taxAndDocs: {
      gstNumber: { type: String, trim: true },
      panNumber: { type: String, trim: true },
      aadhaarNumber: { type: String, trim: true },
      gstDocUrl: { type: String, default: "" },
      panDocUrl: { type: String, default: "" },
      aadhaarDocUrl: { type: String, default: "" },
      cancelledChequeUrl: { type: String, default: "" },
      addressProofUrl: { type: String, default: "" },
    },
    status: {
      type: String,
      enum: ["draft", "submitted", "approved", "rejected"],
      default: "draft",
    },
    rejectionReason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SellerApplication", sellerApplicationSchema);
