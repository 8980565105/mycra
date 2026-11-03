const mongoose = require("mongoose");
const Transection = require("../models/Transactions");
const { sendResponse } = require("../utils/response");

const getTransactions = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      search,
      category,
      type,
      paymentMode,
      status,
      timePeriod,
      tab,
      page = 1,
      limit = 10,
    } = req.query;
    const filter = { user: userId };
    if (tab && tab !== "All") {
      filter.tab = tab;
    }
    if (category) {
      filter.category = {
        $in: Array.isArray(category) ? category : [category],
      };
    }
    if (type) {
      filter.type = { $in: Array.isArray(type) ? type : [type] };
    }
    if (paymentMode) {
      filter.paymentMode = {
        $in: Array.isArray(paymentMode) ? paymentMode : [paymentMode],
      };
    }
    if (status) {
      filter.status = { $in: Array.isArray(status) ? status : [status] };
    }
    // if (search) {
    //   filter.description = { $regex: search, $options: "i" };
    // }
    if (search) {
      filter.$or = [
        {
          description: { $regex: search, $options: "i", },
        },
        {
          category: { $regex: search, $options: "i", },
        },
        {
          paymentMode: { $regex: search, $options: "i", },
        },
        {
          referenceId: { $regex: search, $options: "i", },
        },
      ];
    }

    if (timePeriod && /^\d{4}-\d{2}$/.test(timePeriod)) {
      const [year, month] = timePeriod.split("-").map(Number);

      if (month < 1 || month > 12) {
        return res.status(400).json({
          success: false, message: "Invalid time period. Expected YYYY-MM.",
        });
      }

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);

      filter.createdAt = {
        $gte: startDate, $lt: endDate,
      };
    } else if (timePeriod === "older") {
      const today = new Date();

      const cutoffDate = new Date(
        today.getFullYear(), today.getMonth() - 4, 1
      );

      filter.createdAt = {$lt: cutoffDate};
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [transactions, total] = await Promise.all([
      Transection.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Transection.countDocuments(filter),
    ]);
    return res.status(200).json({
      success: true,
      transactions,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getTransactionById = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const transection = await Transection.findOne({ _id: id, user: userId });
    if (!transection) {
      return res.status(404).json({
        success: false,
        message: "Transaction na madyu",
      });
    }
    return res.status(200).json({
      success: true,
      transection,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllTransactionsAdmin = async (req, res) => {
  try {
    const {
      search,
      category,
      type,
      paymentMode,
      status,
      tab,
      userId,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};
    if (userId) filter.user = userId;
    if (category)
      filter.category = {
        $in: Array.isArray(category) ? category : [category],
      };
    if (type) filter.type = { $in: Array.isArray(type) ? type : [type] };
    if (paymentMode)
      filter.paymentMode = {
        $in: Array.isArray(paymentMode) ? paymentMode : [paymentMode],
      };
    if (status)
      filter.status = { $in: Array.isArray(status) ? status : [status] };
    if (tab && tab !== "All") {
      filter.tab = tab;
    }
    if (search) filter.description = { $regex: search, $options: "i" };

    const skip = (Number(page) - 1) * Number(limit);

    const [transactions, total] = await Promise.all([
      Transection.find(filter)
        .populate("user", "name email")
        .populate({
          path: "order_id",
          select: "_id order_number orderNumber order_total total_price",
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Transection.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      transactions,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateTransactionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowedStatuses = ["Pending", "Success", "Failed"];

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendResponse(res, false, null, "Invalid transaction ID");
    }
    if (!allowedStatuses.includes(status)) {
      return sendResponse(res, false, null, "Invalid transaction status");
    }

    const transaction = await Transection.findById(id);

    if (!transaction) {
      return sendResponse(res, false, null, "Transaction not found");
    }

    transaction.status = status;

    await transaction.save();

    return sendResponse(res, true, transaction, "Transaction status updated successfully");

  } catch (error) {

    return sendResponse(res, false, null, error.message || "Internal server error");
  }
};

const getTransectionFilterOptions = async (req, res) => {
  try {
    const userId = req.user._id;

    const [ categories, types, paymentModes, statuses, ] = await Promise.all([
      Transection.distinct("category", {
        user: userId,
      }),

      Transection.distinct("type", {
        user: userId,
      }),

      Transection.distinct("paymentMode", {
        user: userId,
      }),

      Transection.distinct("status", {
        user: userId,
      }),
    ]);
    const tabs = Transection.schema.path("tab").enumValues;

    return res.status(200).json({
      success: true,

      filters: {
        categories: categories.filter(Boolean).sort(),
        types: types.filter(Boolean).sort(),
        paymentModes: paymentModes.filter(Boolean).sort(),
        statuses: statuses.filter(Boolean).sort(),
        tabs,
      },
    });
  } catch (error) {
    console.error(
      "Get transaction filter options error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load transiction filters",
    });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const deletedTransaction = await Transection.findByIdAndDelete(
      req.params.id,
    );
    if (!deletedTransaction)
      return sendResponse(res, false, null, "Transaction not found");
    sendResponse(res, true, null, "Transaction deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const bulkDeleteTransactions = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
      return sendResponse(res, false, null, "No IDs provided");

    const result = await Transection.deleteMany({ _id: { $in: ids } });
    sendResponse(
      res,
      true,
      { deletedCount: result.deletedCount },
      "transections deleted successfully",
    );
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};
module.exports = {
  getTransactions,
  getTransactionById,
  getAllTransactionsAdmin,
  updateTransactionStatus,
  getTransectionFilterOptions,
  deleteTransaction,
  bulkDeleteTransactions
};
