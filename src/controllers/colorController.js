const Color = require("../models/Color");
const { sendResponse } = require("../utils/response");
const { applyOwnershipFilter } = require("../middlewares/ownershipFilter");
const { default: mongoose } = require("mongoose");

// const getPublicColors = async (req, res) => {
//   try {
//     const colors = await Color.find({ status: "active" }).sort({ name: 1 });

//     res.json({ success: true, data: colors });
//   } catch (err) {
//     sendResponse(res, false, null, err.message);
//   }
// };
const getPublicColors = async (req, res) => {
  try {
    const colors = await Color.aggregate([
      {
        $match: {
          status: "active",
        },
      },
      {
        $group: {
          _id: {
            name: "$name",
            code: "$code",
          },
          color: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: {
          newRoot: "$color",
        },
      },
      {
        $sort: {
          name: 1,
        },
      },
    ]);

    sendResponse(res, true, colors, "Colors retrieved successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const getColors = async (req, res) => {
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

    const download = isDownload.toString().toLowerCase() === "true";
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
      const colors = await Color.aggregate(pipeline);
      return sendResponse(
        res,
        true,
        { colors },
        "All colors retrieved for download",
      );
    }

    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await Color.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    if (limit > 0) {
      pipeline.push({ $skip: (page - 1) * limit });
      pipeline.push({ $limit: limit });
    }

    const colors = await Color.aggregate(pipeline);

    sendResponse(res, true, {
      colors,
      total,
      page,
      pages: limit > 0 ? Math.ceil(total / limit) : 1,
    });
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};
const getColorById = async (req, res) => {
  try {
    const color = await Color.findById(req.params.id);
    if (!color) return sendResponse(res, false, null, "Color not found");
    sendResponse(res, true, color, "Color retrieved successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const createColor = async (req, res) => {
  try {
    const { name, code, status } = req.body;
    if (!name) return sendResponse(res, false, null, "Name is required");

    const storeId =
      req.user.role === "admin" ? req.body.storeId || null : req.user.storeId;

    const color = new Color({
      name,
      code,
      status: status || "active",
      createdBy: req.user._id,
      storeId,
    });
    const savedColor = await color.save();
    sendResponse(res, true, savedColor, "Color created successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updateColor = async (req, res) => {
  try {
    const updatedColor = await Color.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: "after" },
    );
    if (!updatedColor) return sendResponse(res, false, null, "Color not found");
    sendResponse(res, true, updatedColor, "Color updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updateColorStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!["active", "inactive"].includes(status))
      return sendResponse(res, false, null, "Invalid status value");

    const color = await Color.findByIdAndUpdate(
      id,
      { status },
      { returnDocument: "after" },
    );
    if (!color) return sendResponse(res, false, null, "Color not found");

    sendResponse(res, true, color, "Color status updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const deleteColor = async (req, res) => {
  try {
    const deletedColor = await Color.findByIdAndDelete(req.params.id);
    if (!deletedColor) return sendResponse(res, false, null, "Color not found");
    sendResponse(res, true, null, "Color deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const bulkDeleteColors = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || !ids.length)
      return sendResponse(res, false, null, "No IDs provided");

    const result = await Color.deleteMany({ _id: { $in: ids } });
    sendResponse(
      res,
      true,
      { deletedCount: result.deletedCount },
      "Colors deleted successfully",
    );
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

module.exports = {
  getColors,
  getPublicColors,
  getColorById,
  createColor,
  updateColor,
  deleteColor,
  bulkDeleteColors,
  updateColorStatus,
};
