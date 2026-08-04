const Wallet = require("../models/Wallet");
const Transection = require("../models/Transactions");

const getBalance = async (req, res) => {
  try {
    const userId = req.user._id;

    let wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      wallet = await Wallet.create({ user: userId });
    }

    return res.status(200).json({
      success: true,
      wallet,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const addMoney = async (req, res) => {
  try {
    const userId = req.user._id;
    const { amount, paymentMode } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid amount aapo",
      });
    }

    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      wallet = await Wallet.create({ user: userId });
    }

    // KYC check (frontend ma jem batavyu chhe)
    if (!wallet.isKycVerified) {
      return res.status(403).json({
        success: false,
        message: "Wallet set up karva mate eKYC complete karo",
      });
    }

    if (amount > wallet.maxAddLimit) {
      return res.status(400).json({
        success: false,
        message: `maximum ₹${wallet.maxAddLimit} add balance`,
      });
    }

    // Balance update
    wallet.balance += Number(amount);
    await wallet.save();

    // Transaction entry banavo
    const transection = await Transection.create({
      user: userId,
      amount,
      type: "Money received",
      category: "Financial Services",
      paymentMode: paymentMode || "UPI",
      status: "Success",
      description: "Wallet ma paisa add karya",
      referenceId: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
    });

    return res.status(200).json({
      success: true,
      message: "Paisa successfully add thai gaya",
      wallet,
      transection,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const verifyKyc = async (req, res) => {
  try {
    const userId = req.user._id;

    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      wallet = await Wallet.create({ user: userId });
    }

    wallet.isKycVerified = true;
    await wallet.save();

    return res.status(200).json({
      success: true,
      message: "KYC verify thai gayu",
      wallet,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const adminVerifyKyc = async (req, res) => {
  try {
    const { userId } = req.params;
    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) wallet = await Wallet.create({ user: userId });

    wallet.isKycVerified = true;
    await wallet.save();

    return res
      .status(200)
      .json({ success: true, message: "KYC verified by admin", wallet });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAllWallets = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const User = require("../models/User");

    const userFilter = { role: "store_user" };
    if (req.user.role === "store_owner") {
      userFilter.storeId = req.user.storeId;
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      userFilter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { mobile_number: searchRegex }
      ];
    }

    const users = await User.find(userFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(userFilter);

    const wallets = [];
    for (const user of users) {
      let wallet = await Wallet.findOne({ user: user._id });
      if (!wallet) {
        wallet = await Wallet.create({ user: user._id });
      }
      const walletObj = wallet.toObject();
      const userObj = user.toObject();
      userObj.phone = user.mobile_number; 
      walletObj.user = userObj;
      wallets.push(walletObj);
    }

    return res.status(200).json({
      success: true,
      wallets,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const adminAdjustBalance = async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount, type, reason } = req.body;

    if (!amount || amount <= 0 || !["credit", "debit"].includes(type)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid amount/type" });
    }

    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) wallet = await Wallet.create({ user: userId });

    if (type === "debit" && wallet.balance < amount) {
      return res
        .status(400)
        .json({ success: false, message: "Insufficient balance" });
    }

    wallet.balance += type === "credit" ? Number(amount) : -Number(amount);
    await wallet.save();

    const transection = await Transection.create({
      user: userId,
      amount,
      type: type === "credit" ? "Money received" : "Money sent",
      category: "Financial Services",
      paymentMode: "Amazon Pay Balance",
      status: "Success",
      description: reason || `Admin adjustment (${type})`,
      referenceId: `ADJ${Date.now()}${Math.floor(Math.random() * 1000)}`,
    });

    return res.status(200).json({
      success: true,
      message: `Balance ${type} thai gayu`,
      wallet,
      transection,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getBalance,
  addMoney,
  verifyKyc,
  adminAdjustBalance,
  getAllWallets,
  adminVerifyKyc,
};
