const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const User = require("../models/User");
const Store = require("../models/Store");
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
  const isSecure = port === 465;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: port,
    secure: isSecure, // true for 465, false for other ports
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });
};

const sendOtpEmail = async (toEmail, otp, storeName = "MyApp", subject = null) => {
  const transporter = createTransporter();
  if (!transporter)
    throw new Error("SMTP not configured. Set SMTP_USER and SMTP_PASS in .env");

  const safeStoreName = escapeHtml(storeName);
  const safeOtp = escapeHtml(otp);
  const emailSubject = subject || `OTP Verification — ${safeStoreName}`;

  await transporter.sendMail({
    from: `"${safeStoreName}" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: emailSubject,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #eee;border-radius:8px;">
        <h2 style="color:#333;">${safeStoreName}</h2>
        <p style="color:#555;">Your OTP code is:</p>
        <div style="font-size:40px;font-weight:bold;letter-spacing:10px;color:#e91e8c;margin:24px 0;text-align:center;">${safeOtp}</div>
        <p style="color:#888;font-size:13px;">Expires in <strong>10 minutes</strong>. Do not share it.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;"/>
        <p style="color:#aaa;font-size:12px;">If you did not request this, ignore this email.</p>
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

const cleanDomain = (raw) => {
  if (!raw) return "";
  try {
    const withProto = raw.startsWith("http") ? raw : `http://${raw}`;
    const parsed = new URL(withProto);
    if (parsed.hostname === "localhost") {
      return `localhost:${parsed.port}`;
    }
    return parsed.host
      .replace(/^www\./i, "")
      .toLowerCase()
      .trim();
  } catch {
    return raw
      .replace(/^https?:\/\//i, "")
      .replace(/^www\./i, "")
      .toLowerCase()
      .trim();
  }
};

const findUserForOtp = async (email, storeId) => {
  console.log(`\n[OTP] ─────────────────────────────────`);
  console.log(`[OTP] email = "${email}", storeId = "${storeId || ""}"`);

  if (storeId) {
    const store = await Store.findById(storeId).select("_id name").lean();
    if (store) {
      const user = await User.findOne({ email, storeId: store._id });
      if (user) {
        const otpKey = `${email}__${store._id.toString()}`;
        return { user, storeName: store.name, otpKey };
      }
    }
  }

  const user = await User.findOne({ email }).populate("storeId");
  if (user) {
    const storeName = user.storeId?.name || process.env.STORE_NAME || "MyApp";
    const otpKey = `${email}__${user.storeId?._id?.toString() || "global"}`;
    return { user, storeName, otpKey };
  }

  console.log(`[OTP] ❌ No user found for email="${email}"`);
  return { user: null, storeName: null, otpKey: null };
};

const login = async (req, res) => {
  try {
    const { email, password, storeId: bodyStoreId } = req.body;
    const storeId = bodyStoreId || req.headers["x-store-id"];

    if (!email || !password)
      return sendResponse(res, false, null, "Email and password are required");

    let user = null;

    if (storeId) {
      user = await User.findOne({ email, storeId }).populate("storeId");
    }

    if (!user) {
      user = await User.findOne({ email }).populate("storeId");
    }

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
      domain,
      gender,
      date_of_birth,
      address,
      storeName,
      storeEmail,
      storegstno,
      storePhone,
      storeWebsite,
      storeLogo,
      storeBanner,
      storeDescription,
      storeTheme,
      storeAddress,
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
      req.files?.profile_picture?.[0]?.filename ||
      req.file?.filename ||
      (typeof req.body.profile_picture === "string"
        ? req.body.profile_picture
        : null) ||
      null;

    if (role === "admin") {
      const adminExists = await User.findOne({ role: "admin" });
      if (adminExists)
        return sendResponse(res, false, null, "Admin already exists");
      const user = await User.create({
        name,
        email,
        password,
        role,
        domain: "",
        storeId: null,
        mobile_number: mobile_number || null,
        gender: gender || undefined,
        date_of_birth: date_of_birth || null,
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
      const emailTaken = await User.findOne({
        email,
        role: { $in: ["admin", "store_owner"] },
      });
      if (emailTaken)
        return sendResponse(
          res,
          false,
          null,
          "A store owner with this email already exists",
        );

      const user = await User.create({
        name,
        email,
        password,
        domain: "",
        role: "store_owner",
        storeId: null,
        onboardingStatus: "not_started",
        mobile_number: mobile_number || null,
        gender: gender || undefined,
        date_of_birth: date_of_birth || null,
        address: cleanAddress,
        profile_picture,
      });

      const token = generateToken(user);
      const userObj = user.toObject();
      delete userObj.password;
      console.log(`[Register] Store owner account created: ${user.email}`);
      return sendResponse(
        res,
        true,
        { token, user: userObj },
        "Seller account created successfully. Please complete seller onboarding.",
      );
    }

    const targetStoreId = req.body.storeId || req.headers["x-store-id"] || null;
    let store = null;
    if (targetStoreId) {
      store = await Store.findById(targetStoreId);
    }

    if (targetStoreId && !store) {
      return res.status(404).json({
        success: false,
        message: `Store not found for storeId: ${targetStoreId}`,
      });
    }

    const alreadyInStore = await User.findOne({
      email,
      storeId: store ? store._id : null,
    });
    if (alreadyInStore)
      return sendResponse(
        res,
        false,
        null,
        "You are already registered. Please login.",
      );

    const user = await User.create({
      name,
      email,
      password,
      domain: store?.domain || "",
      role,
      storeId: store ? store._id : null,
      mobile_number: mobile_number || null,
      gender: gender || undefined,
      date_of_birth: date_of_birth || null,
      address: cleanAddress,
      profile_picture,
    });
    const token = generateToken(user);
    const userObj = user.toObject();
    delete userObj.password;
    console.log(
      `[Register] Store user: ${user.email}, storeId: ${user.storeId}`,
    );
    return sendResponse(
      res,
      true,
      { token, user: userObj },
      "User registered successfully",
    );
  } catch (err) {
    console.error("[Register] Error:", err.message);
    if (err.code === 11000) {
      const keys = err.keyPattern || {};
      if (keys.email && keys.storeId)
        return sendResponse(
          res,
          false,
          null,
          "You are already registered in this store. Please login.",
        );
      return sendResponse(res, false, null, "Duplicate entry error");
    }
    return sendResponse(res, false, null, err.message);
  }
};

const registerStoreOwner = async (req, res) => {
  req.body.role = "store_owner";
  return register(req, res);
};

const forgotPassword = async (req, res) => {
  try {
    const { email, domain: rawDomain } = req.body;
    if (!email)
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });

    const { user, storeName, otpKey } = await findUserForOtp(email, rawDomain);

    if (!user || !otpKey) {
      return res.status(200).json({
        success: true,
        data: null,
        message: "If this email exists, an OTP has been sent.",
      });
    }

    const otp = generateOtp();
    otpStore[otpKey] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 };
    console.log(`[ForgotPassword] ✅ OTP="${otp}" stored at key="${otpKey}"`);

    await sendOtpEmail(email, otp, storeName, `Password Reset OTP — ${storeName}`);
    console.log(`[ForgotPassword] ✅ Email sent to "${email}"`);

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
    const { email, otp, newPassword, domain: rawDomain } = req.body;

    if (!email || !otp || !newPassword)
      return res.status(400).json({
        success: false,
        message: "Email, OTP and new password are required",
      });

    const { user, otpKey } = await findUserForOtp(email, rawDomain);

    if (!user || !otpKey)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const record = otpStore[otpKey];
    console.log(
      `[ResetPassword] otpKey="${otpKey}" record:`,
      record ? "EXISTS" : "NOT FOUND",
    );

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

    if (!otp || record.otp !== String(otp).trim())
      return res
        .status(400)
        .json({ success: false, message: "Invalid OTP. Please try again." });

    const userDoc = await User.findById(user._id);
    userDoc.password = newPassword;
    await userDoc.save();

    delete otpStore[otpKey];
    console.log(`[ResetPassword] ✅ Password updated. key="${otpKey}"`);

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

const googleLogin = async (req, res) => {
  try {
    const { credential, domain: rawDomain } = req.body;
    if (!credential)
      return sendResponse(res, false, null, "Google credential is required");

    // Verify token with Google
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    if (!email)
      return sendResponse(res, false, null, "Google account has no email");

    const domain = cleanDomain(rawDomain);
    let store = null;
    if (domain) {
      store = await Store.findOne({ domain });
    }

    let user;
    if (store) {
      // Store-user flow: find or create user under this store
      user = await User.findOne({ email, storeId: store._id });
      if (!user) {
        user = await User.create({
          name,
          email,
          password: googleId + process.env.JWT_SECRET, // random unusable password
          role: "store_user",
          domain: store.domain,
          storeId: store._id,
          profile_picture: picture,
        });
      }
    } else {
      // Fallback: admin/store_owner login
      user = await User.findOne({
        email,
        role: { $in: ["admin", "store_owner"] },
      });
      if (!user)
        return sendResponse(
          res,
          false,
          null,
          "No account found for this email",
        );
    }

    if (!user.is_active)
      return sendResponse(res, false, null, "Account inactive");

    const populatedUser = await User.findById(user._id).populate("storeId");
    const token = generateToken(populatedUser);
    const userObj = populatedUser.toObject();
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

// const changePassword = async (req, res) => {
//   try {
//     const { currentPassword, newPassword, confirmNewPassword } = req.body;

//     if (!currentPassword || !newPassword || !confirmNewPassword) {
//       return sendResponse(
//         res,
//         false,
//         null,
//         "Current password, new password and confirm password are required",
//       );
//     }

//     if (newPassword !== confirmNewPassword) {
//       return sendResponse(
//         res,
//         false,
//         null,
//         "New password and confirm password do not match",
//       );
//     }

//     if (newPassword.length < 6) {
//       return sendResponse(
//         res,
//         false,
//         null,
//         "New password must be at least 6 characters long",
//       );
//     }

//     const user = await User.findById(req.user._id);
//     if (!user) return sendResponse(res, false, null, "User not found");

//     // Google-only accounts have a random unusable password set at signup.
//     // If you want to block password-change entirely for such accounts,
//     // check a flag like user.googleId here instead of comparing.
//     const isMatch = await bcrypt.compare(currentPassword, user.password);
//     if (!isMatch)
//       return sendResponse(res, false, null, "Current password is incorrect");

//     const isSamePassword = await bcrypt.compare(newPassword, user.password);
//     if (isSamePassword)
//       return sendResponse(
//         res,
//         false,
//         null,
//         "New password must be different from current password",
//       );

//     // Let the pre('save') hook hash it — do NOT hash it here again.
//     user.password = newPassword;
//     await user.save();

//     return sendResponse(res, true, null, "Password changed successfully");
//   } catch (err) {
//     return sendResponse(
//       res,
//       false,
//       null,
//       "Failed to change password: " + err.message,
//     );
//   }
// };

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return sendResponse(
        res,
        false,
        null,
        "Current password, new password and confirm password are required",
      );
    }
    if (newPassword !== confirmNewPassword) {
      return sendResponse(
        res,
        false,
        null,
        "New password and confirm password do not match",
      );
    }
    if (newPassword.length < 6) {
      return sendResponse(
        res,
        false,
        null,
        "New password must be at least 6 characters long",
      );
    }
    const user = await User.findById(req.user._id);
    if (!user) return sendResponse(res, false, null, "User not found");
    console.log(
      "[ChangePassword] userId:",
      user._id.toString(),
      "email:",
      user.email,
      "storeId:",
      user.storeId,
    );
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    console.log("[ChangePassword] currentPassword match:", isMatch);
    if (!isMatch)
      return sendResponse(res, false, null, "Current password is incorrect");
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return sendResponse(
        res,
        false,
        null,
        "New password must be different from current password",
      );
    }
    const oldHash = user.password;
    user.password = newPassword;
    const saved = await user.save({ validateBeforeSave: true }).catch((err) => {
      console.error("[ChangePassword] SAVE ERROR:", err.message);
      throw err;
    });
    console.log("[ChangePassword] Old hash:", oldHash);
    console.log("[ChangePassword] New hash:", saved.password);
    console.log("[ChangePassword] Hash changed:", oldHash !== saved.password);
    const verifyFromDB = await User.findById(user._id).select("+password");
    console.log(
      "[ChangePassword] Verify from DB after save:",
      verifyFromDB.password === saved.password,
    );
    return sendResponse(res, true, null, "Password changed successfully");
  } catch (err) {
    console.error("[ChangePassword] CATCH ERROR:", err);
    return sendResponse(
      res,
      false,
      null,
      "Failed to change password: " + err.message,
    );
  }
};
const sendRegistrationOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return sendResponse(res, false, null, "Email is required");

    const existingUser = await User.findOne({ email, role: "store_owner" });
    if (existingUser) {
      return sendResponse(res, false, null, "A seller account with this email already exists");
    }

    const otp = generateOtp();
    const otpKey = `reg_${email.toLowerCase().trim()}`;
    otpStore[otpKey] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 };

    console.log(`-----------------------------------------`);
    console.log(`🔑 [REGISTRATION EMAIL OTP] For ${email}: ${otp}`);
    console.log(`-----------------------------------------`);

    // Try sending email, but catch error so API returns success & OTP box opens
    try {
      await sendOtpEmail(email, otp, "Seller Registration", "Seller Registration Verification OTP");
    } catch (mailErr) {
      console.error("⚠️ Nodemailer Email Error (Invalid SMTP Credentials):", mailErr.message);
    }

    return sendResponse(
      res,
      true,
      { otp },
      "OTP sent to your email address (check backend log / toast in dev mode)"
    );
  } catch (err) {
    return sendResponse(res, false, null, err.message);
  }
};

const verifyRegistrationOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return sendResponse(res, false, null, "Email and OTP are required");
    }

    const otpKey = `reg_${email.toLowerCase().trim()}`;
    const record = otpStore[otpKey];

    if (!record) {
      return sendResponse(res, false, null, "No OTP request found. Please request a new OTP.");
    }

    if (Date.now() > record.expiresAt) {
      delete otpStore[otpKey];
      return sendResponse(res, false, null, "OTP has expired. Please request a new one.");
    }

    if (String(otp).trim() !== String(record.otp).trim()) {
      return sendResponse(res, false, null, "Invalid OTP. Please check and try again.");
    }

    delete otpStore[otpKey];
    return sendResponse(res, true, { verified: true }, "Email verified successfully!");
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
