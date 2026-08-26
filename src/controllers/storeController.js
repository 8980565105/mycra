const { default: slugify } = require("slugify");
const Store = require("../models/Store");
const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const mongoose = require("mongoose");
const { sendResponse } = require("../utils/response");
const Payment = require("../models/Payment");

const getStores = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search = "",
      isDownload = "false",
      status,
    } = req.query;
    const download = isDownload.toLowerCase() === "true";

    page = parseInt(page);
    limit = parseInt(limit);

    const matchQuery = {};
    if (search) matchQuery.name = { $regex: search, $options: "i" };
    if (status && ["active", "inactive"].includes(status))
      matchQuery.status = status;

    const pipeline = [
      { $match: matchQuery },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "storeId",
          as: "assignedUsers",
        },
      },
      {
        $addFields: {
          assignedName: {
            $cond: [
              { $gt: [{ $size: "$assignedUsers" }, 0] },
              { $arrayElemAt: ["$assignedUsers.name", 0] },
              null,
            ],
          },
        },
      },
      { $project: { assignedUsers: 0 } },
      { $sort: { createdAt: -1 } },
    ];

    if (download) {
      const stores = await Store.aggregate(pipeline);
      return sendResponse(
        res,
        true,
        { stores },
        "All stores retrieved for download",
      );
    }

    const totalPipeline = [...pipeline, { $count: "total" }];
    const totalResult = await Store.aggregate(totalPipeline);
    const total = totalResult.length > 0 ? totalResult[0].total : 0;

    const paginatedPipeline = [
      ...pipeline,
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ];

    const stores = await Store.aggregate(paginatedPipeline);

    sendResponse(res, true, {
      stores,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Error in getStores:", err);
    sendResponse(res, false, null, err.message);
  }
};

const getAllStores = async (req, res) => {
  try {
    const stores = await Store.find().select("_id name");
    res.json({ success: true, data: stores });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getStoreById = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) return sendResponse(res, false, null, "Store not found");
    sendResponse(res, true, store, "Store retrieved successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const nodemailer = require("nodemailer");
const escapeHtml = require("escape-html");

const storeOtpMap = {};

const createTransporter = () => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return null;

  const port = parseInt(process.env.SMTP_PORT) || 465;
  const isSecure = port === 465;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: port,
    secure: isSecure,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });
};

const sendOtpEmail = async (toEmail, otp, storeName = "Store Creation") => {
  const transporter = createTransporter();
  if (!transporter)
    throw new Error("SMTP not configured. Set SMTP_USER and SMTP_PASS in .env");

  const safeStoreName = escapeHtml(storeName);
  const safeOtp = escapeHtml(otp);

  await transporter.sendMail({
    from: `"${safeStoreName}" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `Store Creation Verification OTP — ${safeStoreName}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #eee;border-radius:8px;">
        <h2 style="color:#333;">${safeStoreName}</h2>
        <p style="color:#555;">Your OTP for Store Creation verification is:</p>
        <div style="font-size:40px;font-weight:bold;letter-spacing:10px;color:#e91e8c;margin:24px 0;text-align:center;">${safeOtp}</div>
        <p style="color:#888;font-size:13px;">Expires in <strong>10 minutes</strong>. Do not share it.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;"/>
        <p style="color:#aaa;font-size:12px;">If you did not request this, ignore this email.</p>
      </div>`,
  });
};

const sendStoreOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return sendResponse(res, false, null, "Email is required");

    const existingStore = await Store.findOne({
      email: email.toLowerCase().trim(),
    });
    if (existingStore) {
      return sendResponse(
        res,
        false,
        null,
        "A store with this email already exists",
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpKey = `store_${email.toLowerCase().trim()}`;
    storeOtpMap[otpKey] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 };

    await sendOtpEmail(email, otp);

    return sendResponse(
      res,
      true,
      { otp: process.env.NODE_ENV === "production" ? undefined : otp },
      "OTP sent to email successfully",
    );
  } catch (err) {
    return sendResponse(res, false, null, err.message);
  }
};

const verifyStoreOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return sendResponse(res, false, null, "Email and OTP are required");
    }

    const otpKey = `store_${email.toLowerCase().trim()}`;
    const record = storeOtpMap[otpKey];

    if (!record) {
      return sendResponse(
        res,
        false,
        null,
        "No OTP request found. Please request a new OTP.",
      );
    }

    if (Date.now() > record.expiresAt) {
      delete storeOtpMap[otpKey];
      return sendResponse(
        res,
        false,
        null,
        "OTP has expired. Please request a new one.",
      );
    }

    if (String(otp).trim() !== String(record.otp).trim()) {
      return sendResponse(
        res,
        false,
        null,
        "Invalid OTP. Please check and try again.",
      );
    }

    delete storeOtpMap[otpKey];
    return sendResponse(
      res,
      true,
      { verified: true },
      "Store email verified successfully!",
    );
  } catch (err) {
    return sendResponse(res, false, null, err.message);
  }
};

const createStore = async (req, res) => {
  const {
    name,
    email,
    phone,
    website,
    logo,
    banner,
    description,
    theme,
    address,
    status,
  } = req.body;

  if (!name || !email)
    return res
      .status(400)
      .json({ success: false, message: "Name and email are required" });

  const storeData = {
    name,
    email,
    phone,
    website,
    logo,
    banner,
    description: description || "",
    theme: theme || {
      primaryColor: "#000000",
      secondaryColor: "#ffffff",
      fontFamily: "Roboto",
    },
    address: address || {},
    status: status || "active",
  };

  try {
    const store = new Store(storeData);
    const savedStore = await store.save();
    sendResponse(res, true, savedStore, "Store created successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updateStore = async (req, res) => {
  try {
    const updateData = { ...req.body };
    const updatedStore = await Store.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: "after" },
    );
    if (!updatedStore) return sendResponse(res, false, null, "Store not found");
    sendResponse(res, true, updatedStore, "Store updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const deleteStore = async (req, res) => {
  try {
    const deletedStore = await Store.findByIdAndDelete(req.params.id);
    if (!deletedStore) return sendResponse(res, false, null, "Store not found");
    sendResponse(res, true, null, "Store deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const bulkDeleteStores = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
      return sendResponse(res, false, null, "No IDs provided");

    const result = await Store.deleteMany({ _id: { $in: ids } });
    sendResponse(
      res,
      true,
      { deletedCount: result.deletedCount },
      "Stores deleted successfully",
    );
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const getMyStore = async (req, res) => {
  try {
    const storeId = req.user.storeId;
    if (!storeId) return sendResponse(res, false, null, "No store assigned");

    const store = await Store.findById(storeId);
    if (!store) return sendResponse(res, false, null, "Store not found");

    sendResponse(res, true, store, "Store fetched successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updateMyStore = async (req, res) => {
  try {
    const storeId = req.user.storeId;
    if (!storeId) return sendResponse(res, false, null, "No store assigned");

    const updatedStore = await Store.findByIdAndUpdate(
      storeId,
      { $set: req.body },
      { returnDocument: "after" },
    );

    if (!updatedStore) return sendResponse(res, false, null, "Store not found");
    sendResponse(res, true, updatedStore, "Store updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const getStoreDashboard = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid store ID",
      });
    }
    const storeId = new mongoose.Types.ObjectId(id);
    const store = await Store.findById(storeId).lean();
    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }
    const totalProducts = await Product.countDocuments({
      storeId: storeId,
    });
    const productsList = await Product.find({ storeId: storeId })
      .select("_id name price status createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const ProductsWise = productsList.map((p) => ({
      id: p._id,
      name: p.name || "Unnamed Product",
    }));

    const storeOrders = await Order.find({
      store_owner_id: storeId,
    })
      .select(
        "_id order_number total_price status user_id createdAt payment_status",
      )
      .sort({ createdAt: -1 })
      .lean();
    const totalOrders = storeOrders.length;
    const pendingOrders = storeOrders.filter(
      (order) => order.status === "pending",
    ).length;
    const processingOrders = storeOrders.filter(
      (order) => order.status === "processing",
    ).length;
    const packedOrders = storeOrders.filter(
      (order) => order.status === "packed",
    ).length;
    const readyToShipOrders = storeOrders.filter(
      (order) => order.status === "ready_to_ship",
    ).length;
    const shippedOrders = storeOrders.filter(
      (order) => order.status === "shipped",
    ).length;
    const inTransitOrders = storeOrders.filter(
      (order) => order.status === "in_transit",
    ).length;
    const deliveredOrders = storeOrders.filter(
      (order) => order.status === "completed",
    ).length;
    const cancelledOrders = storeOrders.filter(
      (order) => order.status === "cancelled",
    ).length;
    const rtoOrders = storeOrders.filter(
      (order) => order.status === "rto",
    ).length;
    const returnedOrders = storeOrders.filter(
      (order) => order.status === "returned",
    ).length;
    const refundedOrders = storeOrders.filter(
      (order) => order.status === "refunded",
    ).length;
    const totalRevenue = storeOrders.reduce(
      (total, order) => total + Number(order.total_price || 0),
      0,
    );
    const uniqueUserIds = [
      ...new Set(
        storeOrders.map((order) => order.user_id?.toString()).filter(Boolean),
      ),
    ];
    const totalUsers = uniqueUserIds.length;
    const customers = await User.find({
      _id: {
        $in: uniqueUserIds,
      },
    })
      .select("_id name email phone")
      .lean();
    const customersList = customers.map((user) => ({
      id: user._id,
      name: user.name || "Unknown User",
      email: user.email || "-",
      phone: user.phone || "-",
    }));
    const recentOrders = storeOrders.slice(0, 10);
    return res.status(200).json({
      success: true,
      data: {
        store: {
          id: store._id,
          name: store.name,
          email: store.email,
          phone: store.phone,
        },
        analytics: {
          totalProducts,
          totalOrders,
          totalUsers,
          totalRevenue,
          pendingOrders,
          processingOrders,
          packedOrders,
          readyToShipOrders,
          shippedOrders,
          inTransitOrders,
          deliveredOrders,
          cancelledOrders,
          rtoOrders,
          returnOrders: returnedOrders,
          refundedOrders,
          customersList,
          ProductsWise,
          recentOrders,
        },
      },
    });
  } catch (error) {
    console.error("Store dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch store dashboard",
      error: error.message,
    });
  }
};

module.exports = {
  getStores,
  getAllStores,
  getMyStore,
  updateMyStore,
  getStoreById,
  createStore,
  updateStore,
  deleteStore,
  bulkDeleteStores,
  getStoreDashboard,
  sendStoreOtp,
  verifyStoreOtp,
};
