const Size = require("../models/Size");
const { sendResponse } = require("../utils/response");
const { applyOwnershipFilter } = require("../middlewares/ownershipFilter");
const { default: mongoose } = require("mongoose");

const getPublicSizes = async (req, res) => {
  try {
    const sizes = await Size.find({ status: "active" }).sort({ name: 1 });

    res.json({ success: true, data: sizes });
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// const getPublicSizes = async (req, res) => {
//   try {
//     const sizes = await Size.aggregate([
//       {
//         $match: {
//           status: "active",
//         },
//       },
//       {
//         $group: {
//           _id: {
//             name: "$name",
//             measurement: "$measurement",
//           },
//           size: { $first: "$$ROOT" },
//         },
//       },
//       {
//         $replaceRoot: {
//           newRoot: "$size",
//         },
//       },
//       {
//         $sort: {
//           name: 1,
//         },
//       },
//     ]);

//     sendResponse(res, true, sizes, "Sizes retrieved successfully");
//   } catch (err) {
//     sendResponse(res, false, null, err.message);
//   }
// };

const getSizes = async (req, res) => {
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
    page = Number.parseInt(page);
    limit = Number.parseInt(limit);

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
      const sizes = await Size.aggregate(pipeline);
      return sendResponse(
        res,
        true,
        { sizes },
        "All sizes retrieved for download",
      );
    }

    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await Size.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    pipeline.push({ $skip: (page - 1) * limit });
    pipeline.push({ $limit: limit });

    const sizes = await Size.aggregate(pipeline);

    sendResponse(res, true, {
      sizes,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const getSizeById = async (req, res) => {
  try {
    const size = await Size.findById(req.params.id);
    if (!size) return sendResponse(res, false, null, "Size not found");
    sendResponse(res, true, size, "Size retrieved successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const createSize = async (req, res) => {
  try {
    const { name, measurement, status } = req.body;
    if (!name) return sendResponse(res, false, null, "Name is required");

    const storeId =
      req.user.role === "admin" ? req.body.storeId || null : req.user.storeId;

    const existing = await Size.findOne({ name, storeId });
    if (existing) {
      return sendResponse(
        res,
        false,
        null,
        `Size "${name}" already exists in your account. Please use a different name.`,
      );
    }

    const size = new Size({
      name,
      measurement,
      status: status || "active",
      createdBy: req.user._id,
      storeId,
    });

    const savedSize = await size.save();
    sendResponse(res, true, savedSize, "Size created successfully");
  } catch (err) {
    if (err.code === 11000) {
      return sendResponse(
        res,
        false,
        null,
        `Size "${err.keyValue?.name}" already exists in your account.`,
      );
    }
    sendResponse(res, false, null, err.message);
  }
};

const updateSize = async (req, res) => {
  try {
    const updatedSize = await Size.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after",
    });
    if (!updatedSize) return sendResponse(res, false, null, "Size not found");
    sendResponse(res, true, updatedSize, "Size updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updateSizeStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!["active", "inactive"].includes(status)) {
      return sendResponse(res, false, null, "Invalid status value");
    }

    const size = await Size.findByIdAndUpdate(
      id,
      { status },
      { returnDocument: "after" },
    );
    if (!size) return sendResponse(res, false, null, "Size not found");

    sendResponse(res, true, size, "Size status updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const deleteSize = async (req, res) => {
  try {
    const deletedSize = await Size.findByIdAndDelete(req.params.id);
    if (!deletedSize) return sendResponse(res, false, null, "Size not found");
    sendResponse(res, true, null, "Size deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const bulkDeleteSizes = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
      return sendResponse(res, false, null, "No IDs provided");

    const result = await Size.deleteMany({ _id: { $in: ids } });
    sendResponse(
      res,
      true,
      { deletedCount: result.deletedCount },
      "Sizes deleted successfully",
    );
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

module.exports = {
  getSizes,
  getPublicSizes,
  getSizeById,
  createSize,
  updateSize,
  deleteSize,
  bulkDeleteSizes,
  updateSizeStatus,
};
