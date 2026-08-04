const ProductLabel = require("../models/ProductLabel");
const { default: slugify } = require("slugify");
const { sendResponse } = require("../utils/response");
const { applyOwnershipFilter } = require("../middlewares/ownershipFilter");
const { default: mongoose } = require("mongoose");

const getPublicProductLabels = async (req, res) => {
  try {
    const labels = await ProductLabel.find({ status: "active" }).sort({
      name: 1,
    });

    res.json({ success: true, data: labels });
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const getProductLabels = async (req, res) => {
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
    if (status && ["active", "inactive"].includes(status))
      matchStage.status = status;

    applyOwnershipFilter(req, matchStage);

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdBy",
        },
      },
      { $unwind: { path: "$createdBy", preserveNullAndEmptyArrays: true } },
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
            { name: { $regex: search, $options: "i" } },
            { "createdBy.name": { $regex: search, $options: "i" } },
            { "createdBy.email": { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    pipeline.push({ $sort: { name: 1 } });

    if (download) {
      const labels = await ProductLabel.aggregate(pipeline);
      return sendResponse(
        res,
        true,
        { labels },
        "All labels retrieved for download",
      );
    }

    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await ProductLabel.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    pipeline.push({ $skip: (page - 1) * limit });
    pipeline.push({ $limit: limit });

    const labels = await ProductLabel.aggregate(pipeline);

    sendResponse(res, true, {
      labels,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const getProductLabelById = async (req, res) => {
  try {
    const label = await ProductLabel.findById(req.params.id);
    if (!label)
      return sendResponse(res, false, null, "Product label not found");
    sendResponse(res, true, label, "Product label retrieved successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const createProductLabel = async (req, res) => {
  try {
    const { name, slug, color, status } = req.body;
    if (!name) return sendResponse(res, false, null, "Name is required");
    if (!color) return sendResponse(res, false, null, "Color is required");

    const storeId =
      req.user.role === "admin" ? req.body.storeId || null : req.user.storeId;

    const existing = await ProductLabel.findOne({ name, storeId });
    if (existing) {
      return sendResponse(
        res,
        false,
        null,
        `Product label "${name}" already exists in your account. Please use a different name.`,
      );
    }

    const label = new ProductLabel({
      name,
      slug: slug || slugify(name, { lower: true, strict: true }),
      color,
      status: status || "active",
      createdBy: req.user._id,
      storeId,
    });

    const savedLabel = await label.save();
    sendResponse(res, true, savedLabel, "Product label created successfully");
  } catch (err) {
    if (err.code === 11000) {
      return sendResponse(
        res,
        false,
        null,
        `Product label "${err.keyValue?.name}" already exists in your account.`,
      );
    }
    sendResponse(res, false, null, err.message);
  }
};

const updateProductLabel = async (req, res) => {
  try {
    const updatedLabel = await ProductLabel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: "after" },
    );
    if (!updatedLabel)
      return sendResponse(res, false, null, "Product label not found");
    sendResponse(res, true, updatedLabel, "Product label updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updateProductLabelStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!["active", "inactive"].includes(status)) {
      return sendResponse(res, false, null, "Invalid status value");
    }

    const label = await ProductLabel.findByIdAndUpdate(
      id,
      { status },
      { returnDocument: "after" },
    );
    if (!label)
      return sendResponse(res, false, null, "Product label not found");

    sendResponse(res, true, label, "Product label status updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const deleteProductLabel = async (req, res) => {
  try {
    const deletedLabel = await ProductLabel.findByIdAndDelete(req.params.id);
    if (!deletedLabel)
      return sendResponse(res, false, null, "Product label not found");
    sendResponse(res, true, null, "Product label deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const bulkDeleteProductLabels = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
      return sendResponse(res, false, null, "No IDs provided");

    const result = await ProductLabel.deleteMany({ _id: { $in: ids } });
    sendResponse(
      res,
      true,
      { deletedCount: result.deletedCount },
      "Product labels deleted successfully",
    );
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

module.exports = {
  getProductLabels,
  getPublicProductLabels,
  getProductLabelById,
  createProductLabel,
  updateProductLabel,
  deleteProductLabel,
  bulkDeleteProductLabels,
  updateProductLabelStatus,
};
