const KycRecord = require("../models/KycRecord");
const Wallet = require("../models/Wallet");
const setKycData = async (req, res) => {
  try {
    const { userId } = req.params;
    const { mobile, pan, nameOnPan, dob, aadhaar } = req.body;
    if (!mobile || !pan || !nameOnPan || !dob || !aadhaar) {
      return res.status(400).json({
        success: false,
        message: "Badha fields required che (mobile, pan, nameOnPan, dob, aadhaar)",
      });
    }
    if (req.user.role === "store_owner") {
      const User = require("../models/User");
      const targetUser = await User.findById(userId);
      if (!targetUser || targetUser.storeId?.toString() !== req.user.storeId?.toString()) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: Tame biji store na customers nu KYC set na kari shako.",
        });
      }
    }
    let kycRecord = await KycRecord.findOne({ user: userId });
    if (!kycRecord) {
      kycRecord = new KycRecord({ user: userId });
    }
    kycRecord.mobile = mobile;
    kycRecord.pan = pan.toUpperCase();
    kycRecord.nameOnPan = nameOnPan;
    kycRecord.dob = dob;
    kycRecord.aadhaar = aadhaar;
    kycRecord.panVerified = false;
    kycRecord.aadhaarVerified = false;
    kycRecord.tempOtp = null;
    kycRecord.tempOtpExpiry = null;
    await kycRecord.save();
    return res.status(200).json({
      success: true,
      message: "KYC data set thai gayu",
      kycRecord,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const validatePan = async (req, res) => {
  try {
    const userId = req.user._id;
    const { mobile, pan, nameOnPan, dob } = req.body;
    const kycRecord = await KycRecord.findOne({ user: userId });
    if (!kycRecord) {
      return res.status(404).json({
        success: false,
        message: "KycRecord nathi malyu. Admin pase KYC data set karavo.",
      });
    }
    const cleanMobileInput = (mobile || "").trim();
    const cleanPanInput = (pan || "").trim().toUpperCase();
    const cleanNameInput = (nameOnPan || "").trim().toLowerCase().replace(/\s+/g, " ");
    const cleanDobInput = (dob || "").trim();
    const cleanMobileStored = (kycRecord.mobile || "").trim();
    const cleanPanStored = (kycRecord.pan || "").trim().toUpperCase();
    const cleanNameStored = (kycRecord.nameOnPan || "").trim().toLowerCase().replace(/\s+/g, " ");
    const cleanDobStored = (kycRecord.dob || "").trim();
    const mobileMatch = cleanMobileStored === cleanMobileInput;
    const panMatch = cleanPanStored === cleanPanInput;
    const nameMatch = cleanNameStored === cleanNameInput;
    const dobMatch = cleanDobStored === cleanDobInput;
    const isMatch = mobileMatch && panMatch && nameMatch && dobMatch;
    if (!isMatch) {
      console.log("❌ PAN verification mismatch details:");
      console.log(`- Mobile Match: ${mobileMatch} (Stored: "${cleanMobileStored}" vs Input: "${cleanMobileInput}")`);
      console.log(`- PAN Match: ${panMatch} (Stored: "${cleanPanStored}" vs Input: "${cleanPanInput}")`);
      console.log(`- Name Match: ${nameMatch} (Stored: "${cleanNameStored}" vs Input: "${cleanNameInput}")`);
      console.log(`- DOB Match: ${dobMatch} (Stored: "${cleanDobStored}" vs Input: "${cleanDobInput}")`);
      return res.status(400).json({
        success: false,
        message: "PAN details match nathi thata",
        details: {
          mobile: mobileMatch,
          pan: panMatch,
          nameOnPan: nameMatch,
          dob: dobMatch,
        }
      });
    }

    kycRecord.panVerified = true;
    await kycRecord.save();
    return res.status(200).json({
      success: true,
      message: "PAN details match thai gaya",
      panVerified: true,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const generateOtp = async (req, res) => {
  try {
    const userId = req.user._id;
    const { aadhaar } = req.body;
    const kycRecord = await KycRecord.findOne({ user: userId });
    if (!kycRecord) {
      return res.status(404).json({
        success: false,
        message: "KYC data set nathi karyu. Admin no sampark karo.",
      });
    }
    if (!kycRecord.panVerified) {
      return res.status(400).json({
        success: false,
        message: "Phela PAN card verification complete karo.",
      });
    }
    if (kycRecord.aadhaar !== aadhaar) {
      return res.status(400).json({
        success: false,
        message: "Aadhaar details match nathi thata",
      });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    kycRecord.tempOtp = otp;
    kycRecord.tempOtpExpiry = new Date(Date.now() + 5 * 60 * 1000); 
    await kycRecord.save();

    console.log("-----------------------------------------");
    console.log(`🔑 [SMS DUMMY OTP] Aadhaar OTP for user ${req.user.name}: ${otp}`);
    console.log("-----------------------------------------");

    return res.status(200).json({
      success: true,
      message: "OTP generate thai gayo che terminal ma",
      otp: process.env.NODE_ENV === "production" ? undefined : otp, 
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const userId = req.user._id;
    const { otp } = req.body;

    const kycRecord = await KycRecord.findOne({ user: userId });
    if (!kycRecord) {
      return res.status(404).json({
        success: false,
        message: "KYC details not found",
      });
    }

    if (!kycRecord.tempOtp || kycRecord.tempOtp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please try again.",
      });
    }

    if (new Date() > kycRecord.tempOtpExpiry) {
      return res.status(400).json({
        success: false,
        message: "OTP expired thai gayo che",
      });
    }

    kycRecord.aadhaarVerified = true;
    kycRecord.tempOtp = null;
    kycRecord.tempOtpExpiry = null;
    await kycRecord.save();

    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      wallet = new Wallet({ user: userId });
    }
    wallet.isKycVerified = true;
    await wallet.save();

    return res.status(200).json({
      success: true,
      message: "KYC completed successfully!",
      wallet,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  setKycData,
  validatePan,
  generateOtp,
  verifyOtp,
};
