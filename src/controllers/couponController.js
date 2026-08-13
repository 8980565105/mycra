const Coupon = require("../models/Coupon");

const { sendResponse } = require("../utils/response");

const getCoupons = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search = "",
      isDownload = "false",
      status,
      role,
      storeId,
    } = req.query;
    const download = isDownload.toLowerCase() === "true";
    const query = {};
    if (search) {
      query.$or = [
        { code: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
      ];
    }
    const userRole = req.user?.role;
    if (userRole === "store_owner") {
      if (req.user?.storeId) {
        query.storeId = req.user.storeId;
      }
      if (status && ["active", "inactive"].includes(status)) {
        query.status = status;
      }
    } else if (userRole === "admin") {
      if (storeId) {
        query.storeId = storeId;
      }
      if (status && ["active", "inactive"].includes(status)) {
        query.status = status;
      }
    } else {
      query.status = "active";
      query.$and = [
        {
          $or: [
            { end_date: { $exists: false } },
            { end_date: null },
            { end_date: { $gt: new Date() } },
          ],
        },
        {
          $or: [
            { start_date: { $exists: false } },
            { start_date: null },
            { start_date: { $lte: new Date() } },
          ],
        },
        {
          $or: [
            { usage_limit: null },
            { $expr: { $lt: ["$used_count", "$usage_limit"] } },
          ],
        },
      ];
    }

    if (download) {
      const coupons = await Coupon.find(query)
        .populate("storeId", "name store_name")
        .sort({ createdAt: -1 });
      return sendResponse(
        res,
        true,
        { coupons },
        "All coupons retrieved for download",
      );
    }

    page = parseInt(page);
    limit = parseInt(limit);

    let coupons = await Coupon.find(query)
      .populate("storeId", "name store_name")
      .populate("storeIds", "name store_name")
      .sort({ createdAt: -1 });

    if (userRole !== "admin" && userRole !== "store_owner") {
      if (req.user?._id) {
        const Order = require("../models/Order");
        const userOrders = await Order.find({
          user_id: req.user._id,
          status: { $nin: ["cancelled"] },
        }).select("storeId store_owner_id");

        const orderedStoreIds = userOrders
          .flatMap((o) => [
            o.storeId ? String(o.storeId) : null,
            o.store_owner_id ? String(o.store_owner_id) : null,
          ])
          .filter(Boolean);

        const hasAnyOrder = userOrders.length > 0;

        coupons = coupons.filter((c) => {
          if (c.coupon_type === "first_order") {
            let cStoreId = c.storeId?._id
              ? String(c.storeId._id)
              : c.storeId
                ? String(c.storeId)
                : null;

            if (!cStoreId && c.storeIds && c.storeIds.length > 0) {
              const firstStore = c.storeIds[0];
              cStoreId =
                typeof firstStore === "object"
                  ? String(firstStore._id)
                  : String(firstStore);
            }

            if (cStoreId) {
              return !orderedStoreIds.includes(cStoreId);
            } else {
              return !hasAnyOrder;
            }
          }
          return true;
        });
      }
    }

    const total = coupons.length;
    const paginatedCoupons = download
      ? coupons
      : coupons.slice((page - 1) * limit, page * limit);

    sendResponse(res, true, {
      coupons: paginatedCoupons,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id)
      .populate("storeId", "name store_name")
      .populate("storeIds", "name store_name")
      .populate("products", "name")
      .populate("subcategories", "name")
      .populate("gift_product_ids", "name _id images price")
      .populate("buy_x_get_y.free_products", "name _id images price");

    if (!coupon) return sendResponse(res, false, null, "Coupon not found");
    sendResponse(res, true, coupon, "Coupon retrieved successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const createCoupon = async (req, res) => {
  try {
    let { code, discount_type, coupon_type } = req.body;

    if (req.user?.role === "store_owner") {
      req.body.storeId = req.user.storeId;
      req.body.storeIds = [req.user.storeId];
      req.body.is_global = false;
    } else if (req.user?.role === "admin") {
      const hasStores =
        Array.isArray(req.body.storeIds) && req.body.storeIds.length > 0;
      const includeAdmin = req.body.include_admin_products === true;

      if (hasStores) {
        req.body.storeId = req.body.storeIds[0];
        req.body.is_global = false;
        req.body.include_admin_products = includeAdmin;
      } else if (includeAdmin) {
        req.body.storeId = null;
        req.body.storeIds = [];
        req.body.is_global = false;
        req.body.include_admin_products = true;
      } else {
        req.body.storeId = null;
        req.body.storeIds = [];
        req.body.is_global = true;
        req.body.include_admin_products = false;
      }
    }

    if (discount_type === "freeshiping" || coupon_type === "free_gift") {
      req.body.discount_value = 0;
    }

    if (coupon_type === "buy_x_get_y") {
      req.body.discount_value = 0;
      req.body.buy_x_get_y = {
        buy_quantity: Number(req.body.buy_x_get_y?.buy_quantity || 0),
        get_quantity: Number(req.body.buy_x_get_y?.get_quantity || 0),
        free_products: req.body.buy_x_get_y?.free_products || [],
      };
    }

    if (coupon_type === "free_gift") {
      req.body.discount_type = "fixed";
      req.body.discount_value = 0;

      if (!req.body.gift_product_ids || !req.body.gift_product_ids.length) {
        if (req.body.gift_product_id) {
          req.body.gift_product_ids = [req.body.gift_product_id];
        }
      }
      delete req.body.gift_product_id;
    } else {
      req.body.gift_product_ids = [];
      delete req.body.gift_product_id;
    }

    const existingCoupon = await Coupon.findOne({ code });
    if (existingCoupon) {
      return sendResponse(res, false, null, "Coupon code already exists");
    }

    req.body.code = code.toUpperCase();

    const coupon = new Coupon({ ...req.body, createdBy: req.user.id });
    const savedCoupon = await coupon.save();
    sendResponse(res, true, savedCoupon, "Coupon created successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updateCoupon = async (req, res) => {
  try {
    if (req.body.code) {
      const existingCoupon = await Coupon.findOne({
        code: req.body.code,
        _id: { $ne: req.params.id },
      });
      if (existingCoupon) {
        return sendResponse(res, false, null, "Coupon code already exists");
      }
    }

    if (req.user?.role === "store_owner") {
      req.body.storeId = req.user.storeId;
      req.body.storeIds = [req.user.storeId];
      req.body.is_global = false;
    } else if (req.user?.role === "admin") {
      const hasStores =
        Array.isArray(req.body.storeIds) && req.body.storeIds.length > 0;

      const includeAdmin = req.body.include_admin_products === true;

      if (!hasStores && !includeAdmin) {
        req.body.storeId = null;
        req.body.storeIds = [];
        req.body.is_global = true;
        req.body.include_admin_products = false;
      } else {
        req.body.is_global = false;
        req.body.include_admin_products = includeAdmin;

        req.body.storeId = hasStores ? req.body.storeIds[0] : null;
      }
    }

    const { coupon_type } = req.body;

    if (coupon_type === "free_gift") {
      req.body.discount_type = "fixed";
      req.body.discount_value = 0;

      if (!req.body.gift_product_ids || !req.body.gift_product_ids.length) {
        if (req.body.gift_product_id) {
          req.body.gift_product_ids = [req.body.gift_product_id];
        }
      }
      delete req.body.gift_product_id;
    } else {
      req.body.gift_product_ids = [];
      delete req.body.gift_product_id;
    }

    if (coupon_type === "buy_x_get_y") {
      req.body.discount_value = 0;
      req.body.buy_x_get_y = {
        buy_quantity: Number(req.body.buy_x_get_y?.buy_quantity || 0),
        get_quantity: Number(req.body.buy_x_get_y?.get_quantity || 0),
        free_products: req.body.buy_x_get_y?.free_products || [],
      };
    }

    const updatedCoupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: "after" },
    );

    if (!updatedCoupon)
      return sendResponse(res, false, null, "Coupon not found");

    sendResponse(res, true, updatedCoupon, "Coupon updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updateCouponStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!["active", "inactive"].includes(status)) {
      return sendResponse(res, false, null, "Invalid status value");
    }

    const coupon = await Coupon.findByIdAndUpdate(
      id,
      { status },
      { returnDocument: "after" },
    );

    if (!coupon) return sendResponse(res, false, null, "Coupon not found");

    sendResponse(res, true, coupon, "Coupon status updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const deletedCoupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!deletedCoupon)
      return sendResponse(res, false, null, "Coupon not found");
    sendResponse(res, true, null, "Coupon deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const bulkDeleteCoupons = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || !ids.length)
      return sendResponse(res, false, null, "No IDs provided");

    const result = await Coupon.deleteMany({ _id: { $in: ids } });
    sendResponse(
      res,
      true,
      { deletedCount: result.deletedCount },
      "Coupons deleted successfully",
    );
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const applyCoupon = async (req, res) => {
  try {
    const { code, cart_total } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return sendResponse(res, false, null, "Please login to apply coupon");
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() })
      .populate("products", "name storeId")
      .populate("subcategories", "name")
      .populate("gift_product_ids", "name _id images price storeId")
      .populate("buy_x_get_y.free_products", "name _id images price storeId");

    if (!coupon) {
      return sendResponse(res, false, null, "Invalid coupon code");
    }

    if (coupon.status !== "active") {
      return sendResponse(res, false, null, "Coupon is not active");
    }

    if (
      coupon.min_purchase_amount &&
      Number(cart_total) < coupon.min_purchase_amount
    ) {
      return sendResponse(
        res,
        false,
        null,
        `Minimum purchase of ₹${coupon.min_purchase_amount} required for this coupon`,
      );
    }

    if (coupon.coupon_type === "first_order") {
      const Order = require("../models/Order");
      const orderQuery = {
        user_id: userId,
        status: { $nin: ["cancelled"] },
      };

      let targetStoreId = coupon.storeId?._id
        ? String(coupon.storeId._id)
        : coupon.storeId
          ? String(coupon.storeId)
          : null;

      if (!targetStoreId && coupon.storeIds && coupon.storeIds.length > 0) {
        const firstStore = coupon.storeIds[0];
        targetStoreId =
          typeof firstStore === "object"
            ? String(firstStore._id)
            : String(firstStore);
      }

      if (targetStoreId) {
        orderQuery.$or = [
          { storeId: targetStoreId },
          { store_owner_id: targetStoreId },
        ];
      }

      const existingOrderCount = await Order.countDocuments(orderQuery);

      if (existingOrderCount > 0) {
        return sendResponse(
          res,
          false,
          null,
          "This coupon is only valid on your first order",
        );
      }
    }

    const now = new Date();
    if (coupon.start_date && now < coupon.start_date) {
      return sendResponse(res, false, null, "Coupon is not started yet");
    }
    if (coupon.end_date && now > coupon.end_date) {
      return sendResponse(res, false, null, "Coupon has expired");
    }

    if (
      coupon.usage_limit !== null &&
      coupon.used_count >= coupon.usage_limit
    ) {
      return sendResponse(res, false, null, "Coupon usage limit reached");
    }

    if (coupon.userusage_limit !== null) {
      const userEntry = coupon.user_usage.find(
        (u) => u.user_id.toString() === userId.toString(),
      );
      const userUsedCount = userEntry ? userEntry.count : 0;

      if (userUsedCount >= coupon.userusage_limit) {
        return sendResponse(
          res,
          false,
          null,
          "You have already used this coupon maximum times",
        );
      }
    }

    sendResponse(res, true, coupon, "Coupon is valid");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const markCouponUsed = async (couponId, userId) => {
  const coupon = await Coupon.findById(couponId);
  if (!coupon) return;

  coupon.used_count += 1;

  const userEntry = coupon.user_usage.find(
    (u) => u.user_id.toString() === userId.toString(),
  );

  if (userEntry) {
    userEntry.count += 1;
  } else {
    coupon.user_usage.push({ user_id: userId, count: 1 });
  }

  await coupon.save();
};

module.exports = {
  getCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  bulkDeleteCoupons,
  updateCouponStatus,
  applyCoupon,
  markCouponUsed,
};
