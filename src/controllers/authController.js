const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const User = require("../models/User");
const nodemailer = require("nodemailer");
const escapeHtml = require("escape-html");
const { sendResponse } = require("../utils/response");
const trackLogin = require("../middlewares/trackLogin");

const otpStore = {};

const createTransporter = () => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return null;
  const port = parseInt(process.env.SMTP_PORT) || 465;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });
};

const sendOtpEmail = async (toEmail, otp, label = "MyApp", subject = null) => {
  const transporter = createTransporter();
  if (!transporter)
    throw new Error("SMTP not configured. Set SMTP_USER and SMTP_PASS in .env");

  const safeLabel = escapeHtml(label);
  const safeOtp = escapeHtml(otp);

  await transporter.sendMail({
    from: `"${safeLabel}" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: subject || `OTP Verification — ${safeLabel}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #eee;border-radius:8px;">
        <h2 style="color:#333;">${safeLabel}</h2>
        <p style="color:#555;">Your OTP code is:</p>
        <div style="font-size:40px;font-weight:bold;letter-spacing:10px;color:#e91e8c;margin:24px 0;text-align:center;">${safeOtp}</div>
        <p style="color:#888;font-size:13px;">Expires in <strong>10 minutes</strong>. Do not share it.</p>
      </div>`,
  });
};

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const generateToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, storeId: user.storeId || null },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
  );

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return sendResponse(res, false, null, "Email and password are required");

    const user = await User.findOne({ email }).populate("storeId");
    if (!user) return sendResponse(res, false, null, "Invalid credentials");
    if (!user.is_active)
      return sendResponse(res, false, null, "Account inactive");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return sendResponse(res, false, null, "Invalid credentials");

    const token = generateToken(user);
    const userObj = user.toObject();
    await trackLogin(req, user._id);
    delete userObj.password;

    console.log(`[Login] ✅ ${user.email} (${user.role})`);
    return sendResponse(
      res,
      true,
      { token, user: userObj },
      "Login successful",
    );
  } catch (err) {
    console.error("[Login] Error:", err.message);
    return sendResponse(res, false, null, err.message);
  }
};

const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = "store_user",
      mobile_number,
      gender,
      date_of_birth,
      address,
    } = req.body;

    if (!name || !email || !password)
      return sendResponse(
        res,
        false,
        null,
        "Name, email and password are required",
      );

    const parseIfString = (val) => {
      if (!val) return null;
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch {
          return null;
        }
      }
      return val;
    };
    const isEmptyObj = (obj) =>
      !obj || Object.values(obj).every((v) => !v || v === "");
    const parsedAddress = parseIfString(address);
    const cleanAddress = isEmptyObj(parsedAddress) ? null : parsedAddress;
    const profile_picture =
      req.files?.profile_picture?.[0]?.filename || req.file?.filename || null;

    const emailTaken = await User.findOne({ email });
    if (emailTaken)
      return sendResponse(
        res,
        false,
        null,
        "You are already registered. Please login.",
      );

    if (role === "admin") {
      const adminExists = await User.findOne({ role: "admin" });
      if (adminExists)
        return sendResponse(res, false, null, "Admin already exists");

      const user = await User.create({
        name,
        email,
        password,
        role: "admin",
        storeId: null,
        mobile_number,
        gender,
        date_of_birth,
        address: cleanAddress,
        profile_picture,
      });
      const token = generateToken(user);
      const userObj = user.toObject();
      delete userObj.password;
      return sendResponse(
        res,
        true,
        { token, user: userObj },
        "Admin registered successfully",
      );
    }

    if (role === "store_owner") {
      const user = await User.create({
        name,
        email,
        password,
        role: "store_owner",
        storeId: null,
        onboardingStatus: "not_started",
        mobile_number,
        gender,
        date_of_birth,
        address: cleanAddress,
        profile_picture,
      });
      const token = generateToken(user);
      const userObj = user.toObject();
      delete userObj.password;
      console.log(`[Register] Store owner created: ${user.email}`);
      return sendResponse(
        res,
        true,
        { token, user: userObj },
        "Seller account created successfully. Please complete seller onboarding.",
      );
    }

    // Default: store_user (customer) — GLOBAL, no store/domain binding
    const user = await User.create({
      name,
      email,
      password,
      role: "store_user",
      storeId: null,
      mobile_number,
      gender,
      date_of_birth,
      address: cleanAddress,
      profile_picture,
    });
    const token = generateToken(user);
    const userObj = user.toObject();
    delete userObj.password;
    console.log(`[Register] Customer: ${user.email}`);
    return sendResponse(
      res,
      true,
      { token, user: userObj },
      "User registered successfully",
    );
  } catch (err) {
    console.error("[Register] Error:", err.message);
    if (err.code === 11000)
      return sendResponse(
        res,
        false,
        null,
        "You are already registered. Please login.",
      );
    return sendResponse(res, false, null, err.message);
  }
};

const registerStoreOwner = async (req, res) => {
  req.body.role = "store_owner";
  return register(req, res);
};

// ── FORGOT / RESET PASSWORD (global email lookup) ──
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({
        success: true,
        data: null,
        message: "If this email exists, an OTP has been sent.",
      });
    }

    const otp = generateOtp();
    const otpKey = `pwd_${email.toLowerCase().trim()}`;
    otpStore[otpKey] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 };
    console.log(`[ForgotPassword] ✅ OTP="${otp}" for "${email}"`);

    await sendOtpEmail(email, otp, "Password Reset", "Password Reset OTP");

    return res.status(200).json({
      success: true,
      data: null,
      message: "OTP sent to your email address",
    });
  } catch (err) {
    console.error("[ForgotPassword] ❌", err.message);
    return res.status(500).json({
      success: false,
      data: null,
      message: err.message || "Failed to send OTP",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword)
      return res.status(400).json({
        success: false,
        message: "Email, OTP and new password are required",
      });

    const otpKey = `pwd_${email.toLowerCase().trim()}`;
    const record = otpStore[otpKey];

    if (!record)
      return res.status(400).json({
        success: false,
        message: "No OTP found. Please request a new one.",
      });

    if (Date.now() > record.expiresAt) {
      delete otpStore[otpKey];
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new one.",
      });
    }

    if (record.otp !== String(otp).trim())
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please try again.",
      });

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    user.password = newPassword;
    await user.save();
    delete otpStore[otpKey];
    console.log(`[ResetPassword] ✅ Password updated for "${email}"`);

    const freshUser = await User.findById(user._id)
      .select("-password")
      .populate("storeId");
    const token = generateToken(freshUser);

    return res.status(200).json({
      success: true,
      data: { token, user: freshUser.toObject() },
      message: "Password reset successfully.",
    });
  } catch (err) {
    console.error("[ResetPassword] ❌", err.message);
    return res.status(500).json({
      success: false,
      data: null,
      message: err.message || "Password reset failed",
    });
  }
};

// ── GOOGLE LOGIN (customer only — auto register + login) ──
const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential)
      return sendResponse(res, false, null, "Google credential is required");

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    if (!email)
      return sendResponse(res, false, null, "Google account has no email");

    let user = await User.findOne({ email, role: "store_user" });

    if (!user) {
      const existingPrivileged = await User.findOne({
        email,
        role: { $in: ["admin", "store_owner"] },
      });
      if (existingPrivileged)
        return sendResponse(
          res,
          false,
          null,
          "This email is already registered as an admin/store account. Please use a different email.",
        );

      user = await User.create({
        name,
        email,
        password: googleId + process.env.JWT_SECRET,
        role: "store_user",
        storeId: null,
        profile_picture: picture,
      });
      console.log(`[GoogleLogin] ✅ New customer created: ${email}`);
    }

    if (!user.is_active)
      return sendResponse(res, false, null, "Account inactive");

    const token = generateToken(user);
    const userObj = user.toObject();
    delete userObj.password;

    console.log(`[GoogleLogin] ✅ ${email}`);
    return sendResponse(
      res,
      true,
      { token, user: userObj },
      "Google login successful",
    );
  } catch (err) {
    console.error("[GoogleLogin] ❌", err.message);
    return sendResponse(res, false, null, err.message || "Google login failed");
  }
};

// ── CHANGE PASSWORD ──
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    if (!currentPassword || !newPassword || !confirmNewPassword)
      return sendResponse(
        res,
        false,
        null,
        "Current password, new password and confirm password are required",
      );
    if (newPassword !== confirmNewPassword)
      return sendResponse(
        res,
        false,
        null,
        "New password and confirm password do not match",
      );
    if (newPassword.length < 6)
      return sendResponse(
        res,
        false,
        null,
        "New password must be at least 6 characters long",
      );

    const user = await User.findById(req.user._id);
    if (!user) return sendResponse(res, false, null, "User not found");

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return sendResponse(res, false, null, "Current password is incorrect");

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword)
      return sendResponse(
        res,
        false,
        null,
        "New password must be different from current password",
      );

    user.password = newPassword;
    await user.save({ validateBeforeSave: true });

    return sendResponse(res, true, null, "Password changed successfully");
  } catch (err) {
    console.error("[ChangePassword] Error:", err.message);
    return sendResponse(
      res,
      false,
      null,
      "Failed to change password: " + err.message,
    );
  }
};

// ── SELLER (store_owner) REGISTRATION OTP FLOW ──
const sendRegistrationOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return sendResponse(res, false, null, "Email is required");

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return sendResponse(
        res,
        false,
        null,
        "An account with this email already exists",
      );

    const otp = generateOtp();
    const otpKey = `reg_${email.toLowerCase().trim()}`;
    otpStore[otpKey] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 };

    console.log(`🔑 [REGISTRATION OTP] For ${email}: ${otp}`);

    try {
      await sendOtpEmail(
        email,
        otp,
        "Seller Registration",
        "Seller Registration Verification OTP",
      );
    } catch (mailErr) {
      console.error("⚠️ Email send failed:", mailErr.message);
    }

    return sendResponse(
      res,
      true,
      { otp: process.env.NODE_ENV === "production" ? undefined : otp },
      "OTP sent to your email address",
    );
  } catch (err) {
    return sendResponse(res, false, null, err.message);
  }
};

const verifyRegistrationOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return sendResponse(res, false, null, "Email and OTP are required");

    const otpKey = `reg_${email.toLowerCase().trim()}`;
    const record = otpStore[otpKey];

    if (!record)
      return sendResponse(
        res,
        false,
        null,
        "No OTP request found. Please request a new OTP.",
      );
    if (Date.now() > record.expiresAt) {
      delete otpStore[otpKey];
      return sendResponse(
        res,
        false,
        null,
        "OTP has expired. Please request a new one.",
      );
    }
    if (String(otp).trim() !== String(record.otp).trim())
      return sendResponse(
        res,
        false,
        null,
        "Invalid OTP. Please check and try again.",
      );

    delete otpStore[otpKey];
    return sendResponse(
      res,
      true,
      { verified: true },
      "Email verified successfully!",
    );
  } catch (err) {
    return sendResponse(res, false, null, err.message);
  }
};

module.exports = {
  login,
  changePassword,
  register,
  registerStoreOwner,
  forgotPassword,
  resetPassword,
  googleLogin,
  sendRegistrationOtp,
  verifyRegistrationOtp,
};
