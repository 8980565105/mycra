const { default: slugify } = require("slugify");
const Type = require("../models/Type");
const { sendResponse } = require("../utils/response");
const { applyOwnershipFilter } = require("../middlewares/ownershipFilter");
const { default: mongoose } = require("mongoose");
const getPublicTypes = async (req, res) => {
  try {
    const types = await Type.find({ status: "active" }).sort({ createdAt: -1 });

    res.json({ success: true, data: types });
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const getTypes = async (req, res) => {
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

    // if (req.query.subCategoryId || req.query.subCategory) {
    //   const subCatId = req.query.subCategoryId || req.query.subCategory;
    //   if (mongoose.Types.ObjectId.isValid(subCatId)) {
    //     matchStage.subCategoryId = new mongoose.Types.ObjectId(subCatId);
    //   }
    // }

    if (req.query.subCategoryId || req.query.subCategory) {
      const subCatId = req.query.subCategoryId || req.query.subCategory;
      if (mongoose.Types.ObjectId.isValid(subCatId)) {
        matchStage.subCategoryId = {
          $in: [new mongoose.Types.ObjectId(subCatId)],
        };
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
          from: "subcategories",
          localField: "subCategoryId",
          foreignField: "_id",
          as: "subCategoryId",
        },
      },

      { $unwind: { path: "$subCategoryId", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "attributes",
          localField: "allowedAttributes",
          foreignField: "_id",
          as: "allowedAttributes",
        },
      },
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
      const types = await Type.aggregate(pipeline);
      return sendResponse(
        res,
        true,
        { types },
        "All types retrieved for download",
      );
    }

    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await Type.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    pipeline.push({ $skip: (page - 1) * limit });
    pipeline.push({ $limit: limit });

    const types = await Type.aggregate(pipeline);

    sendResponse(res, true, {
      types,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const getTypeById = async (req, res) => {
  try {
    const type = await Type.findById(req.params.id)
      .populate("subCategoryId")
      .populate("allowedAttributes");
    if (!type) return sendResponse(res, false, null, "Type not found");
    sendResponse(res, true, type, "Type retrieved successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const createType = async (req, res) => {
  try {
    const { name, description, status, subCategoryId, allowedAttributes } =
      req.body;
    if (!name) return sendResponse(res, false, null, "Name is required");

    const storeId =
      req.user.role === "admin" ? req.body.storeId || null : req.user.storeId;

    const type = new Type({
      name,
      description: description || "",
      status: status || "active",
      subCategoryId: Array.isArray(subCategoryId)
        ? subCategoryId
        : subCategoryId
          ? [subCategoryId]
          : [],
      allowedAttributes: allowedAttributes || [],
      createdBy: req.user._id,
      storeId,
    });

    const savedType = await type.save();
    sendResponse(res, true, savedType, "Type created successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// const updateType = async (req, res) => {
//   try {
//     const updatedType = await Type.findByIdAndUpdate(req.params.id, req.body, {
//       returnDocument: "after",
//     })
//       .populate("subCategoryId")
//       .populate("allowedAttributes");
//     if (!updatedType) return sendResponse(res, false, null, "Type not found");
//     sendResponse(res, true, updatedType, "Type updated successfully");
//   } catch (err) {
//     sendResponse(res, false, null, err.message);
//   }
// };

const updateType = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.subCategoryId && !Array.isArray(updateData.subCategoryId)) {
      updateData.subCategoryId = [updateData.subCategoryId];
    }
    const updatedType = await Type.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        returnDocument: "after",
      },
    )
      .populate("subCategoryId")
      .populate("allowedAttributes");
    if (!updatedType) return sendResponse(res, false, null, "Type not found");
    sendResponse(res, true, updatedType, "Type updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updateTypeStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!["active", "inactive"].includes(status))
      return sendResponse(res, false, null, "Invalid status value");

    const type = await Type.findByIdAndUpdate(
      id,
      { status },
      { returnDocument: "after" },
    );
    if (!type) return sendResponse(res, false, null, "Type not found");

    sendResponse(res, true, type, "Type status updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const deleteType = async (req, res) => {
  try {
    const deletedType = await Type.findByIdAndDelete(req.params.id);
    if (!deletedType) return sendResponse(res, false, null, "Type not found");
    sendResponse(res, true, null, "Type deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const bulkDeleteTypes = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
      return sendResponse(res, false, null, "No IDs provided");

    const result = await Type.deleteMany({ _id: { $in: ids } });
    sendResponse(
      res,
      true,
      { deletedCount: result.deletedCount },
      "Types deleted successfully",
    );
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

module.exports = {
  getTypes,
  getPublicTypes,
  getTypeById,
  createType,
  updateType,
  deleteType,
  bulkDeleteTypes,
  updateTypeStatus,
};
