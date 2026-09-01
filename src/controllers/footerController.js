const Footer = require("../models/Footer");
const { sendResponse } = require("../utils/response");

const getPublicFooters = async (req, res) => {
  try {
    const footers = await Footer.find({ status: "active" }).sort({
      createdAt: -1,
    });
    res.json({ success: true, data: footers });
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const getFooters = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search = "",
      isDownload = "false",
      status,
    } = req.query;
    const download = isDownload.toLowerCase() === "true";
    const query = {};
    if (req.user) {
      if (req.user.role === "admin") {
      } else if (req.user.role === "store_owner") {
        query.storeId = req.user.storeId;
      } else {
        if (req.storeFilter?.storeId) {
          query.storeId = req.storeFilter.storeId;
        }
      }
    } else {
      if (req.storeFilter?.storeId) {
        query.storeId = req.storeFilter.storeId;
      }
    }

    if (search) {
      query.label = { $regex: search, $options: "i" };
    }

    if (status && ["active", "inactive"].includes(status)) {
      query.status = status;
    }

    if (download) {
      const footers = await Footer.find(query).sort({ createdAt: -1 });
      return sendResponse(
        res,
        true,
        { footers },
        "All footers retrieved for download",
      );
    }
    page = parseInt(page);
    limit = parseInt(limit);
    const total = await Footer.countDocuments(query);
    const footers = await Footer.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    sendResponse(res, true, {
      footers,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const getFooterById = async (req, res) => {
  try {
    const footer = await Footer.findById(req.params.id);
    if (!footer) return sendResponse(res, false, null, "Footer not found");

    if (req.user.role === "store_owner") {
      if (footer.storeId?.toString() !== req.user.storeId?.toString()) {
        return sendResponse(
          res,
          false,
          null,
          "Forbidden: Not your store's footer",
        );
      }
    }
    sendResponse(res, true, footer, "Footer retrieved successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const createFooter = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return sendResponse(
        res,
        false,
        null,
        "Forbidden: Only admin can create footer items",
      );
    }
    const data = { ...req.body };
    data.storeId = data.storeId || null;
    const footer = new Footer(data);
    const savedFooter = await footer.save();
    sendResponse(res, true, savedFooter, "Footer created successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updateFooter = async (req, res) => {
  try {
    const existing = await Footer.findById(req.params.id);
    if (!existing) return sendResponse(res, false, null, "Footer not found");

    if (req.user.role === "store_owner") {
      if (existing.storeId?.toString() !== req.user.storeId?.toString()) {
        return sendResponse(
          res,
          false,
          null,
          "Forbidden: Not your store's footer",
        );
      }
    }

    const data = { ...req.body };
    if (req.user.role === "store_owner") {
      data.storeId = req.user.storeId;
    }
    const updatedFooter = await Footer.findByIdAndUpdate(req.params.id, data, {
      returnDocument: "after",
    });
    sendResponse(res, true, updatedFooter, "Footer updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updateFooterStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    if (!["active", "inactive"].includes(status)) {
      return sendResponse(res, false, null, "Invalid status value");
    }
    const existing = await Footer.findById(id);
    if (!existing) return sendResponse(res, false, null, "Footer not found");

    if (req.user.role === "store_owner") {
      if (existing.storeId?.toString() !== req.user.storeId?.toString()) {
        return sendResponse(
          res,
          false,
          null,
          "Forbidden: Not your store's footer",
        );
      }
    }

    const footer = await Footer.findByIdAndUpdate(
      id,
      { status },
      { returnDocument: "after" },
    );
    sendResponse(res, true, footer, "Footer status updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const deleteFooter = async (req, res) => {
  try {
    const existing = await Footer.findById(req.params.id);
    if (!existing) return sendResponse(res, false, null, "Footer not found");

    if (req.user.role === "store_owner") {
      if (existing.storeId?.toString() !== req.user.storeId?.toString()) {
        return sendResponse(
          res,
          false,
          null,
          "Forbidden: Not your store's footer",
        );
      }
    }

    await Footer.findByIdAndDelete(req.params.id);
    sendResponse(res, true, null, "Footer deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const bulkDeleteFooters = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
      return sendResponse(res, false, null, "No IDs provided");

    const deleteQuery = { _id: { $in: ids } };

    if (req.user.role === "store_owner") {
      deleteQuery.storeId = req.user.storeId;
    }

    const result = await Footer.deleteMany(deleteQuery);
    sendResponse(
      res,
      true,
      { deletedCount: result.deletedCount },
      "Footers deleted successfully",
    );
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

module.exports = {
  getPublicFooters,
  getFooters,
  getFooterById,
  createFooter,
  updateFooter,
  deleteFooter,
  bulkDeleteFooters,
  updateFooterStatus,
};
