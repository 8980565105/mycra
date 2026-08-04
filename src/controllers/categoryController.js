const mongoose = require("mongoose");
const slugify = require("slugify");
const Category = require("../models/Category");
const { sendResponse } = require("../utils/response");
const { applyOwnershipFilter } = require("../middlewares/ownershipFilter");

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ status: "active" })
      .select("_id name slug image_url parent_id status storeId")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getCategories = async (req, res) => {
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
    pipeline.push({ $sort: { createdAt: -1 } });
    if (download) {
      const categories = await Category.aggregate(pipeline);
      return sendResponse(
        res,
        true,
        { categories },
        "All categories retrieved for download",
      );
    }
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await Category.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;
    pipeline.push({ $skip: (page - 1) * limit });
    pipeline.push({ $limit: limit });
    const categories = await Category.aggregate(pipeline);
    sendResponse(res, true, {
      categories,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return sendResponse(res, false, null, "Category not found");
    sendResponse(res, true, category, "Category retrieved successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};
const createCategory = async (req, res) => {
  const { name, slug, image, status, description } = req.body;
  if (!name)
    return res
      .status(400)
      .json({ success: false, message: "Name is required" });
  const image_url = req.file ? `/uploads/${req.file.filename}` : image || null;
  const storeId =
    req.user.role === "admin" ? req.body.storeId || null : req.user.storeId;
  const categoryData = {
    name,
    slug: slug || slugify(name, { lower: true, strict: true }),
    image_url,
    description: description || "",
    status: status || "active",
    createdBy: req.user._id,
    storeId,
  };
  try {
    const category = new Category(categoryData);
    const savedCategory = await category.save();
    sendResponse(res, true, savedCategory, "Category created successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};
const updateCategory = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.image_url = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      updateData.image_url = req.body.image;
    }
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: "after" },
    );
    if (!updatedCategory)
      return sendResponse(res, false, null, "Category not found");
    sendResponse(res, true, updatedCategory, "Category updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};
const updateCategoryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    if (!["active", "inactive"].includes(status))
      return sendResponse(res, false, null, "Invalid status value");
    const category = await Category.findByIdAndUpdate(
      id,
      { status },
      { returnDocument: "after" },
    );
    if (!category) return sendResponse(res, false, null, "Category not found");
    sendResponse(res, true, category, "Category status updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};
const deleteCategory = async (req, res) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);
    if (!deletedCategory)
      return sendResponse(res, false, null, "Category not found");
    sendResponse(res, true, null, "Category deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};
const bulkDeleteCategories = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
      return sendResponse(res, false, null, "No IDs provided");

    const result = await Category.deleteMany({ _id: { $in: ids } });
    sendResponse(
      res,
      true,
      { deletedCount: result.deletedCount },
      "Categories deleted successfully",
    );
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};
module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  bulkDeleteCategories,
  getAllCategories,
  updateCategoryStatus,
};
