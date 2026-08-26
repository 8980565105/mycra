const User = require("../models/User");
const Store = require("../models/Store");
const Order = require("../models/Order");
const LoginHistory = require("../models/LoginHistory");
const PageVisit = require("../models/PageVisit");
const { sendResponse } = require("../utils/response");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const OrderItem = require("../models/OrderItem");
const deleteOldProfilePicture = (filename) => {
  if (!filename || filename.startsWith("http")) return;

  const safeFilename = path.basename(filename);
  const filePath = path.join(__dirname, "../uploads", safeFilename);

  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) console.error("[Upload] Error:", err.message);
    });
  }
};

// const getUsers = async (req, res) => {
//   try {
//     let {
//       page = 1,
//       limit = 10,
//       search = "",
//       isDownload = "false",
//       is_active,
//       role: roleFilter,
//     } = req.query;
//     const download = isDownload.toLowerCase() === "true";
//     const loggedInUser = req.user;

//     if (!loggedInUser)
//       return sendResponse(res, false, null, "User not authenticated");

//     page = parseInt(page);
//     limit = parseInt(limit);
//     if (isNaN(page) || page < 1) page = 1;
//     if (isNaN(limit) || limit < 1) limit = 10;

//     if (loggedInUser.role === "admin") {
//       const baseQuery = {};
//       if (roleFilter) baseQuery.role = roleFilter;

//       if (search) {
//         baseQuery.$or = [
//           { name: { $regex: search, $options: "i" } },
//           { email: { $regex: search, $options: "i" } },
//         ];
//       }

//       if (is_active === "true") baseQuery.is_active = true;
//       else if (is_active === "false") baseQuery.is_active = false;

//       if (download) {
//         const users = await User.find(baseQuery)
//           .sort({ createdAt: -1 })
//           .select("-password")
//           .populate("storeId");
//         return sendResponse(
//           res,
//           true,
//           { users },
//           "All users downloaded successfully",
//         );
//       }

//       const total = await User.countDocuments(baseQuery);
//       const users = await User.find(baseQuery)
//         .skip((page - 1) * limit)
//         .limit(limit)
//         .sort({ createdAt: -1 })
//         .select("-password")
//         .populate("storeId");

//       return sendResponse(
//         res,
//         true,
//         { users, total, page, pages: Math.ceil(total / limit) },
//         "Users retrieved successfully",
//       );
//     }

//     if (loggedInUser.role === "store_owner") {
//       const ownerId = new mongoose.Types.ObjectId(loggedInUser._id);

//       const pipeline = [
//         { $match: { store_owner_id: ownerId } },
//         {
//           $group: {
//             _id: "$user_id",
//             totalOrders: { $sum: 1 },
//             totalSpent: { $sum: "$total_price" },
//             lastOrderAt: { $max: "$createdAt" },
//           },
//         },
//         {
//           $lookup: {
//             from: "users",
//             localField: "_id",
//             foreignField: "_id",
//             as: "user",
//           },
//         },
//         { $unwind: "$user" },
//       ];

//       if (search) {
//         pipeline.push({
//           $match: {
//             $or: [
//               { "user.name": { $regex: search, $options: "i" } },
//               { "user.email": { $regex: search, $options: "i" } },
//             ],
//           },
//         });
//       }

//       if (is_active === "true")
//         pipeline.push({ $match: { "user.is_active": true } });
//       else if (is_active === "false")
//         pipeline.push({ $match: { "user.is_active": false } });

//       pipeline.push({
//         $project: {
//           _id: 0,
//           _id: "$user._id",
//           name: "$user.name",
//           email: "$user.email",
//           mobile_number: "$user.mobile_number",
//           profile_picture: "$user.profile_picture",
//           is_active: "$user.is_active",
//           gender: "$user.gender",
//           address: "$user.address",
//           createdAt: "$user.createdAt",
//           totalOrders: 1,
//           totalSpent: 1,
//           lastOrderAt: 1,
//         },
//       });

//       pipeline.push({ $sort: { lastOrderAt: -1 } });

//       if (download) {
//         const users = await Order.aggregate(pipeline);
//         return sendResponse(
//           res,
//           true,
//           { users },
//           "All customers downloaded successfully",
//         );
//       }

//       const countPipeline = [...pipeline, { $count: "total" }];
//       const totalResult = await Order.aggregate(countPipeline);
//       const total = totalResult[0]?.total || 0;

//       const paginatedPipeline = [
//         ...pipeline,
//         { $skip: (page - 1) * limit },
//         { $limit: limit },
//       ];
//       const users = await Order.aggregate(paginatedPipeline);

//       return sendResponse(
//         res,
//         true,
//         { users, total, page, pages: Math.ceil(total / limit) },
//         "Customers retrieved successfully",
//       );
//     }

//     return sendResponse(res, false, null, "Access denied: Unauthorized role");
//   } catch (err) {
//     return sendResponse(
//       res,
//       false,
//       null,
//       "Failed to retrieve users: " + err.message,
//     );
//   }
// };

// const getUsers = async (req, res) => {
//   try {
//     let {
//       page = 1,
//       limit = 10,
//       search = "",
//       isDownload = "false",
//       is_active,
//       role: roleFilter,
//     } = req.query;
//     const download = isDownload.toLowerCase() === "true";
//     const loggedInUser = req.user;

//     if (loggedInUser.role === "store_owner") {
//       const ownerProducts = await Product.find(
//         { createdBy: loggedInUser._id },
//         { _id: 1 },
//       );
//       const ownerProductIds = ownerProducts.map((p) => p._id);

//       if (ownerProductIds.length === 0) {
//         return sendResponse(
//           res,
//           true,
//           { users: [], total: 0, page, pages: 0 },
//           "Customers retrieved successfully",
//         );
//       }

//       const pipeline = [
//         { $match: { product_id: { $in: ownerProductIds } } },
//         {
//           $lookup: {
//             from: "orders",
//             localField: "order_id",
//             foreignField: "_id",
//             as: "order",
//           },
//         },
//         { $unwind: "$order" },
//         {
//           $group: {
//             _id: "$order.user_id",
//             orderIds: { $addToSet: "$order._id" },
//             totalSpent: {
//               $sum: { $multiply: ["$price_at_order", "$quantity"] },
//             },
//             lastOrderAt: { $max: "$order.createdAt" },
//           },
//         },
//         {
//           $lookup: {
//             from: "users",
//             localField: "_id",
//             foreignField: "_id",
//             as: "user",
//           },
//         },
//         { $unwind: "$user" },
//       ];

//       if (search) {
//         pipeline.push({
//           $match: {
//             $or: [
//               { "user.name": { $regex: search, $options: "i" } },
//               { "user.email": { $regex: search, $options: "i" } },
//             ],
//           },
//         });
//       }

//       if (is_active === "true")
//         pipeline.push({ $match: { "user.is_active": true } });
//       else if (is_active === "false")
//         pipeline.push({ $match: { "user.is_active": false } });

//       pipeline.push({
//         $project: {
//           _id: "$user._id",
//           name: "$user.name",
//           email: "$user.email",
//           mobile_number: "$user.mobile_number",
//           profile_picture: "$user.profile_picture",
//           is_active: "$user.is_active",
//           gender: "$user.gender",
//           address: "$user.address",
//           createdAt: "$user.createdAt",
//           totalOrders: { $size: "$orderIds" },
//           totalSpent: 1,
//           lastOrderAt: 1,
//         },
//       });

//       pipeline.push({ $sort: { lastOrderAt: -1 } });

//       if (download) {
//         const users = await OrderItem.aggregate(pipeline);
//         return sendResponse(
//           res,
//           true,
//           { users },
//           "All customers downloaded successfully",
//         );
//       }

//       const countPipeline = [...pipeline, { $count: "total" }];
//       const totalResult = await OrderItem.aggregate(countPipeline);
//       const total = totalResult[0]?.total || 0;

//       const paginatedPipeline = [
//         ...pipeline,
//         { $skip: (page - 1) * limit },
//         { $limit: limit },
//       ];
//       const users = await OrderItem.aggregate(paginatedPipeline);

//       return sendResponse(
//         res,
//         true,
//         { users, total, page, pages: Math.ceil(total / limit) },
//         "Customers retrieved successfully",
//       );
//     }
//     return sendResponse(res, false, null, "Access denied: Unauthorized role");
//   } catch (err) {
//     return sendResponse(
//       res,
//       false,
//       null,
//       "Failed to retrieve users: " + err.message,
//     );
//   }
// };

const getUsers = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search = "",
      isDownload = "false",
      is_active,
      role: roleFilter,
    } = req.query;
    const download = isDownload.toLowerCase() === "true";
    const loggedInUser = req.user;

    if (!loggedInUser)
      return sendResponse(res, false, null, "User not authenticated");

    page = parseInt(page);
    limit = parseInt(limit);
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;

    if (loggedInUser.role === "admin") {
      const baseQuery = {};
      if (roleFilter) baseQuery.role = roleFilter;

      if (search) {
        baseQuery.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }

      if (is_active === "true") baseQuery.is_active = true;
      else if (is_active === "false") baseQuery.is_active = false;

      if (download) {
        const users = await User.find(baseQuery)
          .sort({ createdAt: -1 })
          .select("-password")
          .populate("storeId");
        return sendResponse(
          res,
          true,
          { users },
          "All users downloaded successfully",
        );
      }

      const total = await User.countDocuments(baseQuery);
      const users = await User.find(baseQuery)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .select("-password")
        .populate("storeId");

      return sendResponse(
        res,
        true,
        { users, total, page, pages: Math.ceil(total / limit) },
        "Users retrieved successfully",
      );
    }

    if (loggedInUser.role === "store_owner") {
      const ownerProducts = await Product.find(
        { createdBy: loggedInUser._id },
        { _id: 1 },
      );
      const ownerProductIds = ownerProducts.map((p) => p._id);

      if (ownerProductIds.length === 0) {
        return sendResponse(
          res,
          true,
          { users: [], total: 0, page, pages: 0 },
          "Customers retrieved successfully",
        );
      }

      const pipeline = [
        { $match: { product_id: { $in: ownerProductIds } } },
        {
          $lookup: {
            from: "orders",
            localField: "order_id",
            foreignField: "_id",
            as: "order",
          },
        },
        { $unwind: "$order" },
        {
          $group: {
            _id: "$order.user_id",
            orderIds: { $addToSet: "$order._id" },
            totalSpent: {
              $sum: { $multiply: ["$price_at_order", "$quantity"] },
            },
            lastOrderAt: { $max: "$order.createdAt" },
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
        { $unwind: "$user" },
      ];

      if (search) {
        pipeline.push({
          $match: {
            $or: [
              { "user.name": { $regex: search, $options: "i" } },
              { "user.email": { $regex: search, $options: "i" } },
            ],
          },
        });
      }

      if (is_active === "true")
        pipeline.push({ $match: { "user.is_active": true } });
      else if (is_active === "false")
        pipeline.push({ $match: { "user.is_active": false } });

      pipeline.push({
        $project: {
          _id: "$user._id",
          name: "$user.name",
          email: "$user.email",
          mobile_number: "$user.mobile_number",
          profile_picture: "$user.profile_picture",
          is_active: "$user.is_active",
          gender: "$user.gender",
          address: "$user.address",
          createdAt: "$user.createdAt",
          totalOrders: { $size: "$orderIds" },
          totalSpent: 1,
          lastOrderAt: 1,
        },
      });

      pipeline.push({ $sort: { lastOrderAt: -1 } });

      if (download) {
        const users = await OrderItem.aggregate(pipeline);
        return sendResponse(
          res,
          true,
          { users },
          "All customers downloaded successfully",
        );
      }

      const countPipeline = [...pipeline, { $count: "total" }];
      const totalResult = await OrderItem.aggregate(countPipeline);
      const total = totalResult[0]?.total || 0;

      const paginatedPipeline = [
        ...pipeline,
        { $skip: (page - 1) * limit },
        { $limit: limit },
      ];
      const users = await OrderItem.aggregate(paginatedPipeline);

      return sendResponse(
        res,
        true,
        { users, total, page, pages: Math.ceil(total / limit) },
        "Customers retrieved successfully",
      );
    }

    return sendResponse(res, false, null, "Access denied: Unauthorized role");
  } catch (err) {
    return sendResponse(
      res,
      false,
      null,
      "Failed to retrieve users: " + err.message,
    );
  }
};
  
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("storeId");
    if (!user) return sendResponse(res, false, null, "User not found");
    return sendResponse(res, true, user, "User details retrieved successfully");
  } catch (err) {
    return sendResponse(
      res,
      false,
      null,
      "Failed to retrieve user: " + err.message,
    );
  }
};

const createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = "store_user",
      mobile_number,
      address,
      gender,
      date_of_birth,
      domain,
      storeId: bodyStoreId,
    } = req.body;
    const profile_picture = req.files?.profile_picture?.[0]?.filename || null;

    let resolvedStoreId = bodyStoreId || null;
    let storeDomain = domain || "";

    if (!resolvedStoreId && domain) {
      const safeDomain =
        typeof domain === "string"
          ? domain.toLowerCase().trim()
          : String(domain).toLowerCase().trim();

      const store = await Store.findOne({
        domain: safeDomain,
      });

      if (store) {
        resolvedStoreId = store._id;
        storeDomain = store.domain;
      }
    }

    if (!resolvedStoreId && req.user?.role === "store_owner") {
      resolvedStoreId = req.user.storeId;
      if (!storeDomain) {
        const store = await Store.findById(resolvedStoreId).select("domain");
        if (store) storeDomain = store.domain;
      }
    }

    if (role === "store_user" && !resolvedStoreId)
      return sendResponse(
        res,
        false,
        null,
        "storeId or domain is required for store_user",
      );

    if (resolvedStoreId) {
      const exists = await User.findOne({ email, storeId: resolvedStoreId });
      if (exists)
        return sendResponse(
          res,
          false,
          null,
          "A user with this email is already registered in this store",
        );
    }

    const newUser = await User.create({
      name,
      email,
      password: password || "Temp1234!",
      role,
      mobile_number,
      address,
      gender,
      date_of_birth,
      profile_picture,
      domain: storeDomain,
      storeId: resolvedStoreId,
    });

    return sendResponse(
      res,
      true,
      { user: { ...newUser.toObject(), password: undefined } },
      "User created successfully",
    );
  } catch (err) {
    if (err.code === 11000)
      return sendResponse(
        res,
        false,
        null,
        "A user with this email is already registered in this store",
      );
    return sendResponse(
      res,
      false,
      null,
      "Failed to create user: " + err.message,
    );
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const existingUser = await User.findById(userId);
    if (!existingUser) return sendResponse(res, false, null, "User not found");

    const {
      name,
      email,
      password,
      role,
      mobile_number,
      address,
      gender,
      date_of_birth,
    } = req.body;
    const newProfilePicture = req.files?.profile_picture?.[0]?.filename;

    if (email && email !== existingUser.email) {
      const dup = await User.findOne({
        email,
        storeId: existingUser.storeId,
        _id: { $ne: userId },
      });
      if (dup)
        return sendResponse(
          res,
          false,
          null,
          "This email is already in use in this store",
        );
    }

    const updateData = {
      name,
      email,
      mobile_number,
      address,
      gender,
      date_of_birth,
    };

    if (newProfilePicture) {
      deleteOldProfilePicture(existingUser.profile_picture);
      updateData.profile_picture = newProfilePicture;
    }
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }
    if (role && req.user.role === "admin") updateData.role = role;

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      returnDocument: "after",
    }).select("-password");
    return sendResponse(
      res,
      true,
      { user: updatedUser },
      "User updated successfully",
    );
  } catch (err) {
    if (err.code === 11000)
      return sendResponse(
        res,
        false,
        null,
        "This email is already in use in this store",
      );
    return sendResponse(
      res,
      false,
      null,
      "Failed to update user: " + err.message,
    );
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendResponse(res, false, null, "User not found");
    if (req.user._id.toString() === user._id.toString())
      return sendResponse(
        res,
        false,
        null,
        "You cannot delete your own account",
      );
    deleteOldProfilePicture(user.profile_picture);
    await User.findByIdAndDelete(user._id);
    return sendResponse(res, true, null, "User deleted successfully");
  } catch (err) {
    return sendResponse(
      res,
      false,
      null,
      "Failed to delete user: " + err.message,
    );
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { is_active } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return sendResponse(res, false, null, "User not found");
    if (req.user._id.toString() === req.params.id)
      return sendResponse(
        res,
        false,
        null,
        "You cannot change your own status",
      );
    user.is_active = Boolean(is_active);
    await user.save();
    return sendResponse(
      res,
      true,
      { user },
      "User status updated successfully",
    );
  } catch (err) {
    return sendResponse(
      res,
      false,
      null,
      "Failed to update user status: " + err.message,
    );
  }
};

const bulkDeleteUsers = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0)
      return sendResponse(
        res,
        false,
        null,
        "No user IDs provided for deletion",
      );
    const users = await User.find({ _id: { $in: ids } });
    users.forEach((u) => deleteOldProfilePicture(u.profile_picture));
    await User.deleteMany({ _id: { $in: ids } });
    return sendResponse(
      res,
      true,
      { deletedCount: ids.length },
      "Selected users deleted successfully",
    );
  } catch (err) {
    return sendResponse(
      res,
      false,
      null,
      "Failed to delete users: " + err.message,
    );
  }
};

const getOwnProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("storeId");
    if (!user) return sendResponse(res, false, null, "User not found");
    return sendResponse(res, true, { user }, "Profile fetched successfully");
  } catch (err) {
    return sendResponse(
      res,
      false,
      null,
      "Failed to fetch profile: " + err.message,
    );
  }
};

const updateOwnProfile = async (req, res) => {
  try {
    const {
      name,
      email,
      mobile_number,
      address,
      gender,
      date_of_birth,
      password,
    } = req.body;
    const newProfilePicture = req.files?.profile_picture?.[0]?.filename;
    const updateData = {
      name,
      email,
      mobile_number,
      address,
      gender,
      date_of_birth,
    };

    if (email && email !== req.user.email) {
      const dup = await User.findOne({
        email,
        storeId: req.user.storeId,
        _id: { $ne: req.user._id },
      });
      if (dup)
        return sendResponse(
          res,
          false,
          null,
          "This email is already in use in this store",
        );
    }
    if (newProfilePicture) {
      const cur = await User.findById(req.user._id);
      if (cur?.profile_picture) deleteOldProfilePicture(cur.profile_picture);
      updateData.profile_picture = newProfilePicture;
    }
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
      returnDocument: "after",
    }).select("-password");
    return sendResponse(
      res,
      true,
      { user: updatedUser },
      "Profile updated successfully",
    );
  } catch (err) {
    return sendResponse(
      res,
      false,
      null,
      "Failed to update profile: " + err.message,
    );
  }
};

const deleteOwnProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user?.profile_picture) deleteOldProfilePicture(user.profile_picture);
    await User.findByIdAndDelete(req.user._id);
    return sendResponse(res, true, null, "Account deleted successfully");
  } catch (err) {
    return sendResponse(
      res,
      false,
      null,
      "Failed to delete account: " + err.message,
    );
  }
};

const getUserTracking = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select("-password");
    if (!user) return sendResponse(res, false, null, "User not found");
    const uid = new mongoose.Types.ObjectId(userId);
    const now = new Date();
    const daysAgo = (d) => new Date(now - d * 24 * 60 * 60 * 1000);
    const orders = await Order.find({ user_id: uid }).sort({ createdAt: -1 });
    const totalOrders = orders.length;
    const totalSpending = orders.reduce((s, o) => s + (o.total_price || 0), 0);
    const avgOrderValue = totalOrders ? totalSpending / totalOrders : 0;
    const lastOrder = orders[0];
    const cancelledOrders = orders.filter(
      (o) => o.status === "cancelled",
    ).length;
    const returnedOrders = orders.filter((o) => o.status === "returned").length;
    const refundedOrders = orders.filter((o) => o.status === "refunded").length;
    const totalItemsPurchased = orders.reduce(
      (s, o) => s + (o.items?.reduce((a, i) => a + (i.quantity || 1), 0) || 0),
      0,
    );
    const avgItemsPerOrder = totalOrders
      ? totalItemsPurchased / totalOrders
      : 0;
    const productCount = {};
    orders.forEach((o) =>
      o.items?.forEach((i) => {
        const name = i.name || i.product_name || "Unknown";
        productCount[name] = (productCount[name] || 0) + (i.quantity || 1);
      }),
    );
    const mostPurchasedProduct =
      Object.entries(productCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
    const dayCount = {};
    const hourBuckets = { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 };
    orders.forEach((o) => {
      const d = new Date(o.createdAt);
      const day = d.toLocaleDateString("en-US", { weekday: "short" });
      dayCount[day] = (dayCount[day] || 0) + 1;
      const h = d.getHours();
      if (h >= 5 && h < 12) hourBuckets.Morning++;
      else if (h >= 12 && h < 17) hourBuckets.Afternoon++;
      else if (h >= 17 && h < 21) hourBuckets.Evening++;
      else hourBuckets.Night++;
    });
    const preferredDay =
      Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
    const preferredTime =
      Object.entries(hourBuckets).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
    const accountAgeMonths = Math.max(
      1,
      (now - new Date(user.createdAt)) / (1000 * 60 * 60 * 24 * 30),
    );
    const purchaseFrequency = (totalOrders / accountAgeMonths).toFixed(1);
    const cart = user.cart || [];
    const cartAbandoned = cart.length > 0 && !lastOrder;
    const logins = await LoginHistory.find({ userId: uid }).sort({
      createdAt: -1,
    });
    const loginCount30d = logins.filter(
      (l) => l.createdAt >= daysAgo(30),
    ).length;
    const lastLogin = logins[0];
    const daysSinceLastLogin = lastLogin
      ? Math.floor((now - lastLogin.createdAt) / (1000 * 60 * 60 * 24))
      : null;
    const daysSinceLastOrder = lastOrder
      ? Math.floor((now - lastOrder.createdAt) / (1000 * 60 * 60 * 24))
      : null;
    const wishlistCount = user.wishlist?.length || 0;
    const cartItemsCount = cart.length;
    let engagementScore = 0;
    if (daysSinceLastLogin !== null && daysSinceLastLogin <= 7)
      engagementScore += 30;
    if (loginCount30d >= 4) engagementScore += 25;
    if (daysSinceLastOrder !== null && daysSinceLastOrder <= 30)
      engagementScore += 25;
    if (totalOrders > 0) engagementScore += 20;
    engagementScore = Math.min(engagementScore, 100);
    const engagementLevel =
      engagementScore >= 60
        ? "Active"
        : engagementScore >= 30
          ? "Moderate"
          : "Inactive";
    const signals = [];
    if (daysSinceLastLogin !== null && daysSinceLastLogin <= 7)
      signals.push("Logged in within last 7 days");
    if (loginCount30d >= 4) signals.push("Frequent logins (4+/month)");
    if (daysSinceLastOrder !== null && daysSinceLastOrder <= 30)
      signals.push("Ordered within last 30 days");
    const uniqueIps = new Set(logins.map((l) => l.ip)).size;
    let riskScore = 0;
    const flags = [];
    if (uniqueIps > 3) {
      riskScore += 15;
      flags.push("Multiple IP addresses");
    }
    if (cancelledOrders > totalOrders * 0.3 && totalOrders > 0) {
      riskScore += 20;
      flags.push("High cancellation rate");
    }
    if (refundedOrders > 2) {
      riskScore += 15;
      flags.push("Frequent refunds");
    }
    const riskLevel =
      riskScore >= 60 ? "High" : riskScore >= 30 ? "Medium" : "Low";
    const deviceLocation = lastLogin
      ? {
          device_type: lastLogin.device_type,
          browser: lastLogin.browser,
          os: lastLogin.os,
          ip: lastLogin.ip,
          location: lastLogin.location,
        }
      : null;
    const pageVisits = await PageVisit.find({ userId: uid }).sort({
      createdAt: -1,
    });
    const totalPageViews = pageVisits.length;
    const uniquePages = new Set(pageVisits.map((p) => p.page)).size;
    const pageCount = {};
    pageVisits.forEach(
      (p) => (pageCount[p.page] = (pageCount[p.page] || 0) + 1),
    );
    const mostVisitedPage =
      Object.entries(pageCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
    const lastVisit = pageVisits[0];
    const clv = totalSpending;
    const recency = lastOrder ? lastOrder.createdAt : null;
    return sendResponse(
      res,
      true,
      {
        user,
        accountTracking: {
          registration_date: user.createdAt,
          registration_type:
            user.registration_type || (user.googleId ? "google" : "email"),
          last_login: lastLogin?.createdAt || null,
          login_count: logins.length,
          account_status: user.is_active ? "Active" : "Inactive",
        },
        deviceLocation,
        recentLogins: logins,
        purchaseAnalytics: {
          total_orders: totalOrders,
          total_spending: totalSpending,
          avg_order_value: avgOrderValue.toFixed(2),
          last_order_date: lastOrder?.createdAt || null,
          cancelled_orders: cancelledOrders,
          returned_orders: returnedOrders,
          refunded_orders: refundedOrders,
        },
        shoppingBehavior: {
          total_items_purchased: totalItemsPurchased,
          avg_items_per_order: avgItemsPerOrder.toFixed(1),
          most_purchased_product: mostPurchasedProduct,
          preferred_day: preferredDay,
          preferred_time: preferredTime,
          purchase_frequency: `${purchaseFrequency} orders/month`,
          cart_abandoned: cartAbandoned,
        },
        engagement: {
          level: engagementLevel,
          score: engagementScore,
          days_since_last_login: daysSinceLastLogin,
          login_frequency: `${loginCount30d} / month`,
          logins_last_30_days: loginCount30d,
          days_since_last_order: daysSinceLastOrder,
          wishlist_items: wishlistCount,
          cart_items: cartItemsCount,
          signals,
        },
        riskFraud: { score: riskScore, level: riskLevel, flags },
        clvRfm: {
          clv,
          frequency: totalOrders,
          recency,
        },
        cartWishlist: {
          cart_items: cartItemsCount,
          wishlist_items: wishlistCount,
        },
        pageVisitHistory: {
          total_page_views: totalPageViews,
          unique_pages_visited: uniquePages,
          most_visited_page: mostVisitedPage,
          last_visited_page: lastVisit?.page || "N/A",
          last_visit_time: lastVisit?.createdAt || null,
          recent_pages: pageVisits,
        },
      },
      "User tracking data retrieved successfully",
    );
  } catch (err) {
    return sendResponse(
      res,
      false,
      null,
      "Failed to fetch user tracking: " + err.message,
    );
  }
};

const addAddress = async (req, res) => {
  const user = await User.findById(req.user._id);

  const address = req.body;

  if (address.is_default) {
    user.addresses.forEach((a) => (a.is_default = false));
  }

  user.addresses.push(address);

  await user.save();

  return sendResponse(res, true, user.addresses, "Address added");
};

const getAddresses = async (req, res) => {
  const user = await User.findById(req.user._id);

  return sendResponse(res, true, user.addresses, "Addresses fetched");
};

const updateAddress = async (req, res) => {
  const { addressId } = req.params;

  const user = await User.findById(req.user._id);

  const address = user.addresses.id(addressId);

  if (!address) {
    return sendResponse(res, false, null, "Address not found");
  }

  Object.assign(address, req.body);

  if (req.body.is_default) {
    user.addresses.forEach((a) => (a.is_default = false));

    address.is_default = true;
  }

  await user.save();

  return sendResponse(res, true, user.addresses, "Address updated");
};
const deleteAddress = async (req, res) => {
  const { addressId } = req.params;

  const user = await User.findById(req.user._id);

  user.addresses.pull(addressId);

  await user.save();

  return sendResponse(res, true, user.addresses, "Address deleted");
};

const setDefaultAddress = async (req, res) => {
  const { addressId } = req.params;

  const user = await User.findById(req.user._id);

  user.addresses.forEach((address) => {
    address.is_default = address._id.toString() === addressId;
  });

  await user.save();

  return sendResponse(res, true, user.addresses, "Default address updated");
};

module.exports = {
  // getUsers,
  // getUserById,
  // getUserTracking,
  // createUser,
  // updateUser,
  // deleteUser,
  // bulkDeleteUsers,
  // getOwnProfile,
  // updateOwnProfile,
  // deleteOwnProfile,
  // updateUserStatus,
  getUsers,
  getUserById,
  getUserTracking,
  createUser,
  updateUser,
  deleteUser,
  bulkDeleteUsers,
  getOwnProfile,
  updateOwnProfile,
  deleteOwnProfile,
  updateUserStatus,
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
