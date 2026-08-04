const { default: slugify } = require("slugify");
const Store = require("../models/Store");
const Product = require("../models/Product");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const User = require("../models/User");
const Category = require("../models/Category");
const Subcategory = require("../models/Subcategory");
const Brand = require("../models/Brand");
const Type = require("../models/Type");
const Fabric = require("../models/Fabric");
const Color = require("../models/Color");
const Size = require("../models/Size");
const ProductLabel = require("../models/ProductLabel");
const ProductVariant = require("../models/ProductVariant");
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

    const existingStore = await Store.findOne({ email: email.toLowerCase().trim() });
    if (existingStore) {
      return sendResponse(res, false, null, "A store with this email already exists");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpKey = `store_${email.toLowerCase().trim()}`;
    storeOtpMap[otpKey] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 };

    await sendOtpEmail(email, otp);

    return sendResponse(
      res,
      true,
      { otp: process.env.NODE_ENV === "production" ? undefined : otp },
      "OTP sent to email successfully"
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
      return sendResponse(res, false, null, "No OTP request found. Please request a new OTP.");
    }

    if (Date.now() > record.expiresAt) {
      delete storeOtpMap[otpKey];
      return sendResponse(res, false, null, "OTP has expired. Please request a new one.");
    }

    if (String(otp).trim() !== String(record.otp).trim()) {
      return sendResponse(res, false, null, "Invalid OTP. Please check and try again.");
    }

    delete storeOtpMap[otpKey];
    return sendResponse(res, true, { verified: true }, "Store email verified successfully!");
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
      {  returnDocument: 'after'  },
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

// const getStoreByDomain = async (req, res) => {
//   try {
//     const origin = req.headers.origin || "";
//     let domain = "";
//     if (origin) {
//       const url = new URL(origin);
//       domain = url.host.toLowerCase();
//     } else {
//       domain = (req.headers.host || "").toLowerCase();
//     }

//     const store = await Store.findOne({ domain, status: "active" });

//     if (!store) {
//       return res.status(404).json({
//         success: false,
//         message: "Store not found for this domain",
//       });
//     }

//     res.json({ success: true, data: store });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

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
      {  returnDocument: 'after'  },
    );

    if (!updatedStore) return sendResponse(res, false, null, "Store not found");
    sendResponse(res, true, updatedStore, "Store updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const getProductFacetCounts = async (storeId, field, lookupCollection) => {
  return Product.aggregate([
    { $match: { storeId } },
    { $group: { _id: `$${field}`, count: { $sum: 1 } } },
    {
      $lookup: {
        from: lookupCollection,
        localField: "_id",
        foreignField: "_id",
        as: "info",
      },
    },
    {
      $project: {
        _id: 0,
        id: "$_id",
        count: 1,
        name: {
          $ifNull: [{ $arrayElemAt: ["$info.name", 0] }, "Unspecified"],
        },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

const getVariantFacetCounts = async (
  storeId,
  field,
  lookupCollection,
  isArrayField = false,
) => {
  const pipeline = [
    {
      $lookup: {
        from: "products",
        localField: "product_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    { $match: { "product.storeId": storeId } },
  ];

  if (isArrayField) {
    pipeline.push({
      $unwind: { path: `$${field}`, preserveNullAndEmptyArrays: true },
    });
  }

  pipeline.push({ $group: { _id: `$${field}`, count: { $sum: 1 } } });

  if (lookupCollection) {
    pipeline.push(
      {
        $lookup: {
          from: lookupCollection,
          localField: "_id",
          foreignField: "_id",
          as: "info",
        },
      },
      {
        $project: {
          _id: 0,
          id: "$_id",
          count: 1,
          name: {
            $ifNull: [{ $arrayElemAt: ["$info.name", 0] }, "Unspecified"],
          },
        },
      },
    );
  } else {
    pipeline.push({
      $project: {
        _id: 0,
        id: "$_id",
        count: 1,
        name: { $ifNull: ["$_id", "Unspecified"] },
      },
    });
  }

  pipeline.push({ $sort: { count: -1 } });

  return ProductVariant.aggregate(pipeline);
};

const getMasterListFacet = async (Model, ownerId) => {
  const items = await Model.find({ createdBy: ownerId }).select("_id name");
  return items.map((i) => ({ id: i._id, name: i.name }));
};

const getStoreCustomers = async (ownerId) => {
  const customers = await Order.aggregate([
    { $match: { store_owner_id: ownerId } },
    {
      $group: {
        _id: "$user_id",
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: "$total_price" },
        lastOrderAt: { $max: "$createdAt" },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        id: "$_id",
        name: { $ifNull: ["$user.name", "Deleted User"] },
        email: { $ifNull: ["$user.email", "-"] },
        mobile_number: { $ifNull: ["$user.mobile_number", "-"] },
        totalOrders: 1,
        totalSpent: 1,
        lastOrderAt: 1,
      },
    },
    { $sort: { totalOrders: -1 } },
  ]);
  return customers;
};

const getStoreDashboard = async (req, res) => {
  try {
    const { id } = req.params;
    const storeObjectId = new mongoose.Types.ObjectId(id);

    const store = await Store.findById(id);
    if (!store) return sendResponse(res, false, null, "Store not found");

    let owner = await User.findOne({
      storeId: storeObjectId,
      role: "store_owner",
    });

    if (!owner) {
      owner = await User.findOne({ storeId: storeObjectId });
    }

    if (!owner) {
      return sendResponse(res, false, null, "No owner found for this store");
    }

    const ownerId = owner._id;
    const [
      totalProducts,
      totalOrders,
      customers,
      cancelledOrders,
      refundedOrders,
      returnOrders,
      deliveredOrders,
      pendingOrders,
      ProductsWise,
      categoryWise,
      subCategoryWise,
      brandWise,
      typeWise,
      fabricWise,
      colorWise,
      sizeWise,
      productLabelWise,
      recentOrderItems,
    ] = await Promise.all([
      Product.countDocuments({ storeId: id }),

      Order.countDocuments({ store_owner_id: ownerId }),
      getStoreCustomers(ownerId),
      Order.countDocuments({ store_owner_id: ownerId, status: "cancelled" }),
      Order.countDocuments({ store_owner_id: ownerId, status: "refunded" }),
      Order.countDocuments({ store_owner_id: ownerId, status: "completed" }),
      Order.countDocuments({ store_owner_id: ownerId, status: "pending" }),
      Order.countDocuments({ store_owner_id: ownerId, status: "rto" }),

      getMasterListFacet(Product, ownerId),
      getMasterListFacet(Category, ownerId),
      getMasterListFacet(Subcategory, ownerId),
      getMasterListFacet(Brand, ownerId),
      getMasterListFacet(Type, ownerId),
      getMasterListFacet(Fabric, ownerId),
      getMasterListFacet(Color, ownerId),
      getMasterListFacet(Size, ownerId),
      getMasterListFacet(ProductLabel, ownerId),

      Order.aggregate([
        { $match: { store_owner_id: ownerId } },
        { $sort: { createdAt: -1 } },
        { $limit: 20 },
        {
          $lookup: {
            from: "orderitems",
            localField: "_id",
            foreignField: "order_id",
            as: "items",
          },
        },
        { $unwind: "$items" },
        {
          $lookup: {
            from: "products",
            localField: "items.product_id",
            foreignField: "_id",
            as: "items.product",
          },
        },
        {
          $unwind: { path: "$items.product", preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: "subcategories",
            localField: "items.product.category_id",
            foreignField: "_id",
            as: "subcategory",
          },
        },
        {
          $unwind: {
            path: "$subcategory",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 0,
            orderId: "$_id",
            orderStatus: "$status",
            createdAt: 1,
            productName: "$items.product.name",
            categoryName: {
              $ifNull: ["$subcategory.name", "No Subcategory"],
            },
            quantity: "$items.quantity",
          },
        },
      ]),
    ]);

    const revenue = await Payment.aggregate([
      { $match: { store_owner_id: ownerId, status: "completed" } },
      { $group: { _id: null, totalRevenue: { $sum: "$amount_paid" } } },
    ]);

    return sendResponse(res, true, {
      store,
      analytics: {
        totalProducts,
        totalOrders,
        totalUsers: customers.length,
        customersList: customers,
        cancelledOrders,
        returnOrders,
        refundedOrders,
        deliveredOrders,
        pendingOrders,
        totalRevenue: revenue[0]?.totalRevenue || 0,
        totalCategories: categoryWise.length,
        totalSubCategories: subCategoryWise.length,
        totalBrands: brandWise.length,
        totalTypes: typeWise.length,
        totalFabrics: fabricWise.length,
        totalColors: colorWise.length,
        totalSizes: sizeWise.length,
        totalProductLabels: productLabelWise.length,
        ProductsWise,
        categoryWise,
        subCategoryWise,
        brandWise,
        typeWise,
        fabricWise,
        colorWise,
        sizeWise,
        productLabelWise,
        recentOrderItems,
      },
    });
  } catch (err) {
    console.error("getStoreDashboard error:", err);
    sendResponse(res, false, null, err.message);
  }
};

module.exports = {
  getStores,
  getAllStores,
  getMyStore,
  updateMyStore,
  // getStoreByDomain,
  getStoreById,
  createStore,
  updateStore,
  deleteStore,
  bulkDeleteStores,
  getStoreDashboard,
  sendStoreOtp,
  verifyStoreOtp,
};
