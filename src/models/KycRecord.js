const mongoose = require("mongoose");

const kycRecordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    mobile: { type: String, required: true },
    pan: { type: String, required: true },
    nameOnPan: { type: String, required: true },
    dob: { type: String, required: true }, 
    aadhaar: { type: String, required: true },
    panVerified: { type: Boolean, default: false },
    aadhaarVerified: { type: Boolean, default: false },
    tempOtp: { type: String, default: null },
    tempOtpExpiry: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("KycRecord", kycRecordSchema);
