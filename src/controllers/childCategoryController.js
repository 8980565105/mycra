const ChildCategory = require("../models/ChildCategory");
const SubCategory = require("../models/Subcategory");
const { sendResponse } = require("../utils/response");
const mongoose = require("mongoose");

exports.getChildCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const matchStage = {};

    if (req.query.search) {
      matchStage.name = { $regex: req.query.search, $options: "i" };
    }

    if (req.query.status) {
      matchStage.status = req.query.status;
    }

    if (req.query.subCategoryId) {
      matchStage.subCategoryId = new mongoose.Types.ObjectId(
        req.query.subCategoryId,
      );
    }

    const childCategories = await ChildCategory.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "subcategories",
          localField: "subCategoryId",
          foreignField: "_id",
          as: "subCategory",
        },
      },
      { $unwind: { path: "$subCategory", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "categories",
          localField: "subCategory.parent_id",
          foreignField: "_id",
          as: "mainCategory",
        },
      },
      { $unwind: { path: "$mainCategory", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdBy",
        },
      },
      { $unwind: { path: "$createdBy", preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    const total = await ChildCategory.countDocuments(matchStage);

    res.status(200).json({
      success: true,
      data: childCategories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllChildCategories = async (req, res) => {
  try {
    const matchStage = { status: "active" };
    if (req.query.subCategoryId) {
      matchStage.subCategoryId = new mongoose.Types.ObjectId(
        req.query.subCategoryId,
      );
    }
    const childCategories = await ChildCategory.find(matchStage)
      .populate({
        path: "subCategoryId",
        populate: { path: "parent_id", select: "name" },
      })
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: childCategories,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getChildCategoryById = async (req, res) => {
  try {
    const childCategory = await ChildCategory.findById(req.params.id).populate(
      "subCategoryId",
    );
    if (!childCategory) {
      return res
        .status(404)
        .json({ success: false, message: "Child Category not found" });
    }
    res.status(200).json({ success: true, data: childCategory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createChildCategory = async (req, res) => {
  try {
    const { name, subCategoryId, status, image_url } = req.body;
    if (!name || !subCategoryId) {
      return res.status(400).json({
        success: false,
        message: "Name and subCategoryId are required",
      });
    }

    const subCategory = await SubCategory.findById(subCategoryId);
    const CategoryId = subCategory ? subCategory.parent_id : null;

    const newChildCat = new ChildCategory({
      name,
      subCategoryId,
      CategoryId,
      image_url: image_url || null, // ✅ add
      status: status || "active",
      createdBy: req.user?._id || null,
    });

    await newChildCat.save();
    res.status(201).json({
      success: true,
      data: newChildCat,
      message: "Child Category created successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateChildCategory = async (req, res) => {
  try {
    const { name, subCategoryId, status } = req.body;

    let CategoryId;
    if (subCategoryId) {
      const subCategory = await SubCategory.findById(subCategoryId);
      if (subCategory) {
        CategoryId = subCategory.parent_id;
      }
    }

    const updateObj = { name, subCategoryId, status };
    if (CategoryId) updateObj.CategoryId = CategoryId;

    const childCategory = await ChildCategory.findByIdAndUpdate(
      req.params.id,
      updateObj,
      { new: true, runValidators: true },
    ).populate("subCategoryId");

    if (!childCategory) {
      return res
        .status(404)
        .json({ success: false, message: "Child Category not found" });
    }

    res.status(200).json({
      success: true,
      data: childCategory,
      message: "Child Category updated successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateChildCategory = async (req, res) => {
  try {
    const { name, subCategoryId, status, image_url } = req.body;

    let CategoryId;
    if (subCategoryId) {
      const subCategory = await SubCategory.findById(subCategoryId);
      if (subCategory) {
        CategoryId = subCategory.parent_id;
      }
    }

    const updateObj = { name, subCategoryId, status };
    if (CategoryId) updateObj.CategoryId = CategoryId;
    if (image_url !== undefined) updateObj.image_url = image_url; // ✅ add

    const childCategory = await ChildCategory.findByIdAndUpdate(
      req.params.id,
      updateObj,
      { new: true, runValidators: true },
    ).populate("subCategoryId");

    if (!childCategory) {
      return res
        .status(404)
        .json({ success: false, message: "Child Category not found" });
    }

    res.status(200).json({
      success: true,
      data: childCategory,
      message: "Child Category updated successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteChildCategory = async (req, res) => {
  try {
    const childCategory = await ChildCategory.findByIdAndDelete(req.params.id);
    if (!childCategory) {
      return res
        .status(404)
        .json({ success: false, message: "Child Category not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Child Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateChildCategoryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!["active", "inactive"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status value" });
    }

    const childCategory = await ChildCategory.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    ).populate("subCategoryId");

    if (!childCategory) {
      return res
        .status(404)
        .json({ success: false, message: "Child Category not found" });
    }

    res.status(200).json({
      success: true,
      data: childCategory,
      message: "Child Category status updated successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.bulkDeleteChildCategories = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No IDs provided" });
    }

    const result = await ChildCategory.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      success: true,
      data: { deletedCount: result.deletedCount },
      message: "Child Categories deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
