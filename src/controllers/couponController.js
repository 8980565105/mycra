const Coupon = require("../models/Coupon");
const { sendResponse } = require("../utils/response");
const { applyOwnershipFilter } = require("../middlewares/ownershipFilter");
const { default: mongoose } = require("mongoose");

const generateCouponCode = (length = 8) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const getCoupons = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search = "",
      isDownload = "false",
      status,
      role,
      store,
    } = req.query;
    const download = isDownload.toLowerCase() === "true";
    page = parseInt(page);
    limit = parseInt(limit);

    const matchStage = {};

    if (!req.user) {
      matchStage.status = "active";
    } else {
      if (status && ["active", "inactive"].includes(status)) {
        matchStage.status = status;
      }
      // ✅ Category/Subcategory ni jem — admin => all, store_owner => potanu j
      applyOwnershipFilter(req, matchStage);
    }

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdByUser",
        },
      },
      { $unwind: { path: "$createdByUser", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "stores",
          localField: "storeId",
          foreignField: "_id",
          as: "storeId",
        },
      },
      { $unwind: { path: "$storeId", preserveNullAndEmptyArrays: true } },
    ];

    if (role && ["admin", "store_owner"].includes(role)) {
      pipeline.push({
        $match: { "createdBy.role": role },
      });
    }

    if (store) {
      pipeline.push({
        $match: {
          createdBy: {
            $exists: true,
          },
        },
      });

      pipeline.push({
        $match: {
          "createdBy._id": new mongoose.Types.ObjectId(store),
        },
      });
    }

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { code: { $regex: search, $options: "i" } },
            { name: { $regex: search, $options: "i" } },
            { "createdByUser.name": { $regex: search, $options: "i" } },
            { "createdByUser.email": { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    pipeline.push({ $sort: { createdAt: -1 } });

    if (download) {
      const coupons = await Coupon.aggregate(pipeline);
      return sendResponse(
        res,
        true,
        { coupons },
        "All coupons retrieved for download",
      );
    }

    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await Coupon.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    pipeline.push({ $skip: (page - 1) * limit });
    pipeline.push({ $limit: limit });

    const coupons = await Coupon.aggregate(pipeline);

    sendResponse(res, true, {
      coupons,
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
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return sendResponse(res, false, null, "Coupon not found");
    sendResponse(res, true, coupon, "Coupon retrieved successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const createCoupon = async (req, res) => {
  try {
    let { code } = req.body;

    // ✅ Category/Brand ni jem storeId set karo
    const storeId =
      req.user.role === "admin" ? req.body.storeId || null : req.user.storeId;

    if (!code) {
      code = generateCouponCode();
      req.body.code = code;
    }

    // ✅ code check — hamna storeId ma j unique check karo (globally nahi)
    const existingCoupon = await Coupon.findOne({ code, storeId });
    if (existingCoupon) {
      return sendResponse(
        res,
        false,
        null,
        "Coupon code already exists in this store",
      );
    }

    const coupon = new Coupon({
      ...req.body,
      createdBy: req.user.id,
      storeId,
    });
    const savedCoupon = await coupon.save();
    sendResponse(res, true, savedCoupon, "Coupon created successfully");
  } catch (err) {
    if (err.code === 11000) {
      return sendResponse(
        res,
        false,
        null,
        "Coupon code already exists in this store",
      );
    }
    sendResponse(res, false, null, err.message);
  }
};

const updateCoupon = async (req, res) => {
  try {
    if (req.body.code) {
      const coupon = await Coupon.findById(req.params.id);
      if (!coupon) return sendResponse(res, false, null, "Coupon not found");

      const existingCoupon = await Coupon.findOne({
        code: req.body.code,
        storeId: coupon.storeId,
        _id: { $ne: req.params.id },
      });
      if (existingCoupon) {
        return sendResponse(
          res,
          false,
          null,
          "Coupon code already exists in this store",
        );
      }
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

    if (!coupon) {
      return sendResponse(res, false, null, "Coupon not found");
    }

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

module.exports = {
  getCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  bulkDeleteCoupons,
  updateCouponStatus,
};
