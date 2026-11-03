const mongoose = require("mongoose");
const Settlement = require("../models/Settlement");
const { sendResponse } = require("../utils/response");
const getActorId = (req) => req.user?._id;

const isAdmin = (req) => req.user?.role === "admin";

const isStoreOwner = (req) =>
  req.user?.role === "store_owner";

const sendError = (res, status, message) =>
  res.status(status).json({
    success: false,
    data: null,
    message,
  });

const ALLOWED_STATUSES = [
  "pending",
  "on_hold",
  "available",
  "processing",
  "paid",
  "failed",
  "reversed",
];

const isValidId = (id) =>
  mongoose.isValidObjectId(id);

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getSettlements = async (req, res) => {
  try {
    if (!isAdmin(req) && !isStoreOwner(req)) {
      return sendError(res, 403, "Access denied");
    }
    const {
      page: pageQuery = 1,
      limit: limitQuery = 10,
      search = "",
      isDownload = "false",
      status = "",
      store = "",
    } = req.query;

    const download = String(isDownload).toLowerCase() === "true";

    const page = Math.max(1, parseInt(pageQuery, 10) || 1);

    const limit = Math.min(
      100,
      Math.max(1, parseInt(limitQuery, 10) || 10)
    );

    const safeSearchInput = String(search || "").trim();
    const selectedStatus = String(status || "").trim();
    const selectedStore = String(store || "").trim();

    const filter = {};

    if (selectedStatus) {
      if (!ALLOWED_STATUSES.includes(selectedStatus)) {
        return sendError(res, 400, "Invalid settlement status");
      }

      filter.status = selectedStatus;
    }

    if (isStoreOwner(req)) {
      filter.store_owner_id = getActorId(req);
    }

    if (isAdmin(req) && selectedStore) {
      if (!mongoose.isValidObjectId(selectedStore)) {
        return sendError(res, 400, "Invalid store owner ID");
      }

      filter.store_owner_id = new mongoose.Types.ObjectId(selectedStore);
    }

    if (safeSearchInput) {
      const safeSearch = escapeRegex(
        safeSearchInput.slice(0, 100)
      );

      const searchConditions = [
        {
          transaction_id: {
            $regex: safeSearch,
            $options: "i",
          },
        },
        {
          payout_reference: {
            $regex: safeSearch,
            $options: "i",
          },
        },
        {
          notes: {
            $regex: safeSearch,
            $options: "i",
          },
        },
      ];

      if (mongoose.isValidObjectId(safeSearchInput)) {
        const objectId =
          new mongoose.Types.ObjectId(safeSearchInput);

        searchConditions.push(
          { _id: objectId },
          { order_id: objectId },
          { payment_id: objectId },
          { store_owner_id: objectId }
        );
      }

      filter.$or = searchConditions;
    }

    // 8. Download all records without pagination
    if (download) {
      const settlements = await Settlement.find(filter)
        .populate("order_id")
        .populate("payment_id")
        .populate("store_owner_id", "name email")
        .populate("processed_by", "name email")
        .sort({ createdAt: -1 })
        .lean();

      return sendResponse(
        res,
        true,
        { settlements },
        "All settlements retrieved for download"
      );
    }

    // 9. Count total matching records
    const total = await Settlement.countDocuments(filter);

    const pages = Math.ceil(total / limit);

    // 11. Fetch only current page records
    const settlements = await Settlement.find(filter)
      .populate("order_id")
      .populate("payment_id")
      .populate("store_owner_id", "name email")
      .populate("processed_by", "name email")
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // 12. Final response
    return sendResponse(
      res,
      true,
      {
        settlements,
        total,
        page,
        limit,
        pages,
        pagination: {
          page,
          limit,
          total,
          pages,
        },
      },
      "Settlements retrieved successfully"
    );

  } catch (error) {
    console.error("getSettlements:", error);
    return sendError(
      res,
      500,
      "Failed to fetch settlements"
    );
  }
};

// POST /api/settlements/:id/withdraw
// Store owner requests withdrawal; no money is transferred here.
const withdrawSettlement = async (req, res) => {
  try {
    if (!isStoreOwner(req)) {
      return sendError(
        res,
        403,
        "Only store owners can request withdrawal"
      );
    }

    if (!isValidId(req.params.id)) {
      return sendError(res, 400, "Invalid settlement ID");
    }

    const settlement = await Settlement.findOne({
      _id: req.params.id,
      store_owner_id: getActorId(req),
    });

    if (!settlement) {
      return sendError(res, 404, "Settlement not found");
    }

    if (settlement.status !== "available") {
      return sendError(
        res,
        400,
        "Only available settlements can be withdrawn"
      );
    }

    settlement.status = "pending";
    settlement.requested_at = new Date();
    settlement.notes = "Withdrawal requested by store owner";

    await settlement.save();

    return res.json({
      success: true,
      data: { settlement },
      message: "Withdrawal request submitted",
    });
  } catch (error) {
    console.error("withdrawSettlement:", error);
    return sendError(
      res,
      500,
      "Withdrawal request failed"
    );
  }
};

// POST /api/settlements/process-available
// Admin queues eligible available settlements for payout.
const processAvailableSettlements = async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return sendError(res, 403, "Admin access required");
    }

    const now = new Date();

    const settlements = await Settlement.find({
      status: "available",
      $or: [
        { available_at: null },
        { available_at: { $lte: now } },
      ],
    }).sort({ createdAt: 1 });

    const processed = [];

    for (const settlement of settlements) {
      // Queue only. This does not transfer money.
      settlement.status = "processing";
      settlement.processed_at = now;
      settlement.processed_by = getActorId(req);
      settlement.failure_reason = "";

      await settlement.save();
      processed.push(settlement);
    }

    return res.json({
      success: true,
      data: {
        settlements: processed,
        pagination: {
          total: processed.length,
        },
      },
      message: "Available settlements queued for processing",
    });
  } catch (error) {
    console.error("processAvailableSettlements:", error);
    return sendError(
      res,
      500,
      "Failed to process settlements"
    );
  }
};

// PUT /api/settlements/:id/processing
const markSettlementProcessing = async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return sendError(res, 403, "Admin access required");
    }

    if (!isValidId(req.params.id)) {
      return sendError(res, 400, "Invalid settlement ID");
    }

    const settlement = await Settlement.findById(req.params.id);

    if (!settlement) {
      return sendError(res, 404, "Settlement not found");
    }

    if (
      !["available", "pending", "failed"].includes(
        settlement.status
      )
    ) {
      return sendError(
        res,
        400,
        "Settlement cannot enter processing from its current status"
      );
    }

    settlement.status = "processing";
    settlement.processed_at = new Date();
    settlement.processed_by = getActorId(req);
    settlement.failure_reason = "";

    await settlement.save();

    return res.json({
      success: true,
      data: { settlement },
      message: "Settlement is processing",
    });
  } catch (error) {
    console.error("markSettlementProcessing:", error);
    return sendError(
      res,
      500,
      "Failed to update settlement"
    );
  }
};

// PUT /api/settlements/:id/paid
// Call only after independently verifying actual payout success.
const markSettlementPaid = async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return sendError(res, 403, "Admin access required");
    }

    if (!isValidId(req.params.id)) {
      return sendError(res, 400, "Invalid settlement ID");
    }

    const payoutReference =
      typeof req.body.payout_reference === "string"
        ? req.body.payout_reference.trim()
        : "";

    const notes =
      typeof req.body.notes === "string"
        ? req.body.notes.trim().slice(0, 1000)
        : "";

    if (!payoutReference) {
      return sendError(
        res,
        400,
        "Payout reference is required"
      );
    }

    const settlement = await Settlement.findById(req.params.id);

    if (!settlement) {
      return sendError(res, 404, "Settlement not found");
    }

    if (settlement.status !== "processing") {
      return sendError(
        res,
        400,
        "Only processing settlements can be marked paid"
      );
    }

    settlement.status = "paid";
    settlement.payout_reference = payoutReference;
    settlement.paid_at = new Date();
    settlement.processed_by = getActorId(req);

    if (notes) {
      settlement.notes = notes;
    }

    await settlement.save();

    return res.json({
      success: true,
      data: { settlement },
      message: "Settlement marked paid",
    });
  } catch (error) {
    console.error("markSettlementPaid:", error);
    return sendError(
      res,
      500,
      "Failed to mark settlement paid"
    );
  }
};

// PUT /api/settlements/:id/failed
const markSettlementFailed = async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return sendError(res, 403, "Admin access required");
    }

    if (!isValidId(req.params.id)) {
      return sendError(res, 400, "Invalid settlement ID");
    }

    const reason =
      typeof req.body.reason === "string"
        ? req.body.reason.trim().slice(0, 1000)
        : "";

    if (!reason) {
      return sendError(
        res,
        400,
        "Failure reason is required"
      );
    }

    const settlement = await Settlement.findById(req.params.id);

    if (!settlement) {
      return sendError(res, 404, "Settlement not found");
    }

    if (settlement.status !== "processing") {
      return sendError(
        res,
        400,
        "Only processing settlements can be marked failed"
      );
    }

    settlement.status = "failed";
    settlement.failure_reason = reason;
    settlement.processed_by = getActorId(req);

    await settlement.save();

    return res.json({
      success: true,
      data: { settlement },
      message: "Settlement marked failed",
    });
  } catch (error) {
    console.error("markSettlementFailed:", error);
    return sendError(
      res,
      500,
      "Failed to mark settlement failed"
    );
  }
};


const deleteSettlement = async (req, res) => {
  try {
    const deletedSettlement = await Settlement.findByIdAndDelete(req.params.id);
    if (!deletedSettlement)
      return sendResponse(res, false, null, "Settlement not found");
    sendResponse(res, true, null, "Settlement deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};
const bulkDeleteSettlement = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
      return sendResponse(res, false, null, "No IDs provided");

    const result = await Settlement.deleteMany({ _id: { $in: ids } });
    sendResponse(
      res,
      true,
      { deletedCount: result.deletedCount },
      "Settlements deleted successfully",
    );
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

module.exports = {
  getSettlements,
  withdrawSettlement,
  processAvailableSettlements,
  markSettlementProcessing,
  markSettlementPaid,
  markSettlementFailed,
  deleteSettlement,
  bulkDeleteSettlement
};