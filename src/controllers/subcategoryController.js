const { default: slugify } = require("slugify");
const SubCategory = require("../models/Subcategory");
const { sendResponse } = require("../utils/response");
const { applyOwnershipFilter } = require("../middlewares/ownershipFilter");
const { default: mongoose } = require("mongoose");

const getAllsubCategories = async (req, res) => {
  try {
    const subcategories = await SubCategory.find({ status: "active" })
      .select("_id name slug image_url parent_id status storeId")
      .populate("parent_id", "_id name")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: subcategories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// const getAllsubCategories = async (req, res) => {
//   try {
//     const subcategories = await SubCategory.aggregate([
//       {
//         $match: {
//           status: "active",
//         },
//       },
//       {
//         $lookup: {
//           from: "categories",
//           localField: "parent_id",
//           foreignField: "_id",
//           as: "parent_id",
//         },
//       },
//       {
//         $unwind: {
//           path: "$parent_id",
//           preserveNullAndEmptyArrays: true,
//         },
//       },

//       // Duplicate name remove
//       {
//         $group: {
//           _id: {
//             name: "$name",
//           },
//           subcategory: {
//             $first: "$$ROOT",
//           },
//         },
//       },

//       {
//         $replaceRoot: {
//           newRoot: "$subcategory",
//         },
//       },

//       {
//         $sort: {
//           name: 1,
//         },
//       },
//     ]);

//     sendResponse(
//       res,
//       true,
//       subcategories,
//       "SubCategories retrieved successfully"
//     );
//   } catch (err) {
//     sendResponse(res, false, null, err.message);
//   }
// };

const getsubCategories = async (req, res) => {
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

    if (req.query.parent_id || req.query.category) {
      const catId = req.query.parent_id || req.query.category;
      if (mongoose.Types.ObjectId.isValid(catId)) {
        matchStage.parent_id = new mongoose.Types.ObjectId(catId);
      }
    }

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
      {
        $lookup: {
          from: "categories",
          localField: "parent_id",
          foreignField: "_id",
          as: "parent_id",
        },
      },
      { $unwind: { path: "$parent_id", preserveNullAndEmptyArrays: true } },
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
      const subcategories = await SubCategory.aggregate(pipeline);
      return sendResponse(
        res,
        true,
        { categories: subcategories },
        "All subcategories retrieved for download",
      );
    }

    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await SubCategory.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    pipeline.push({ $skip: (page - 1) * limit });
    pipeline.push({ $limit: limit });

    const subcategories = await SubCategory.aggregate(pipeline);

    sendResponse(res, true, {
      categories: subcategories,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const getsubCategoryById = async (req, res) => {
  try {
    const subcategory = await SubCategory.findById(req.params.id).populate(
      "parent_id",
      "_id name",
    );
    if (!subcategory)
      return sendResponse(res, false, null, "SubCategory not found");
    sendResponse(res, true, subcategory, "SubCategory retrieved successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ═══════════════════════════════════════════════════════════════════
// CREATE — storeId auto set
// ═══════════════════════════════════════════════════════════════════
const createsubCategory = async (req, res) => {
  const { name, slug, parent_id, image, status, description, allowedAttributes } = req.body;

  if (!name)
    return res
      .status(400)
      .json({ success: false, message: "Name is required" });

  if (!parent_id)
    return res
      .status(400)
      .json({ success: false, message: "Parent category is required" });

  const image_url = req.file ? `/uploads/${req.file.filename}` : image || null;

  const storeId =
    req.user.role === "admin" ? req.body.storeId || null : req.user.storeId;

  const subcategoryData = {
    name,
    slug: slug || slugify(name, { lower: true, strict: true }),
    parent_id,
    image_url,
    description: description || "",
    allowedAttributes: Array.isArray(allowedAttributes) ? allowedAttributes : [],
    status: status || "active",
    createdBy: req.user._id,
    storeId,
  };

  try {
    const subcategory = new SubCategory(subcategoryData);
    const savedSubCategory = await subcategory.save();
    sendResponse(
      res,
      true,
      savedSubCategory,
      "SubCategory created successfully",
    );
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updatesubCategory = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (!updateData.parent_id)
      return sendResponse(res, false, null, "Parent category is required");

    if (req.file) {
      updateData.image_url = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      updateData.image_url = req.body.image;
    }

    const updatedSubCategory = await SubCategory.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: "after" },
    ).populate("parent_id", "_id name");

    if (!updatedSubCategory)
      return sendResponse(res, false, null, "SubCategory not found");

    sendResponse(
      res,
      true,
      updatedSubCategory,
      "SubCategory updated successfully",
    );
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updatesubCategoryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!["active", "inactive"].includes(status))
      return sendResponse(res, false, null, "Invalid status value");

    const subcategory = await SubCategory.findByIdAndUpdate(
      id,
      { status },
      { returnDocument: "after" },
    );
    if (!subcategory)
      return sendResponse(res, false, null, "SubCategory not found");

    sendResponse(
      res,
      true,
      subcategory,
      "SubCategory status updated successfully",
    );
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const deletesubCategory = async (req, res) => {
  try {
    const deletedSubCategory = await SubCategory.findByIdAndDelete(
      req.params.id,
    );
    if (!deletedSubCategory)
      return sendResponse(res, false, null, "SubCategory not found");
    sendResponse(res, true, null, "SubCategory deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const bulkDeletesubCategories = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
      return sendResponse(res, false, null, "No IDs provided");

    const result = await SubCategory.deleteMany({ _id: { $in: ids } });
    sendResponse(
      res,
      true,
      { deletedCount: result.deletedCount },
      "SubCategories deleted successfully",
    );
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

module.exports = {
  getsubCategories,
  getsubCategoryById,
  createsubCategory,
  updatesubCategory,
  deletesubCategory,
  bulkDeletesubCategories,
  getAllsubCategories,
  updatesubCategoryStatus,
};
