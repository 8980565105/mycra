const Transection = require("../models/Transactions");

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
    if (search) {
      filter.description = { $regex: search, $options: "i" };
    }
    if (timePeriod && timePeriod !== "Older transactions") {
      const [monthName, year] = timePeriod.split(" ");
      const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
      const startDate = new Date(year, monthIndex, 1);
      const endDate = new Date(year, monthIndex + 1, 1);

      filter.createdAt = { $gte: startDate, $lt: endDate };
    } else if (timePeriod === "Older transactions") {
      const cutoff = new Date();
      cutoff.setMonth(cutoff.getMonth() - 4);
      filter.createdAt = { $lt: cutoff };
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
    if (search) filter.description = { $regex: search, $options: "i" };

    const skip = (Number(page) - 1) * Number(limit);

    const [transactions, total] = await Promise.all([
      Transection.find(filter)
        .populate("user", "name email")
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

    if (!["Success", "Pending", "Failed"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const transection = await Transection.findByIdAndUpdate(
      id,
      { status },
      {  returnDocument: 'after'  },
    );

    if (!transection) {
      return res
        .status(404)
        .json({ success: false, message: "Transaction na madyu" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Status update thayu", transection });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
module.exports = {
  getTransactions,
  getTransactionById,
  getAllTransactionsAdmin,
  updateTransactionStatus,
};
