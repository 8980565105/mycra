const Wallet = require("../models/Wallet");
const User = require("../models/User");
const GiftCard = require("../models/GiftCard");
const Transection = require("../models/Transactions");

const getBalance = async (req, res) => {
  try {
    const userId = req.user._id;
    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      wallet = await Wallet.create({ user: userId,
        // balance: 0,
        // giftCardBalance: 0,
        // voucherBalance: 0,
        // giftCards: [],
       });
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

    wallet.balance += Number(amount);
    await wallet.save();
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
    const { page = 1, limit = 20, search = "", } = req.query;

    const currentPage = Math.max(Number(page) || 1, 1);
    const perPage = Math.max(Number(limit) || 10, 1);
    const userFilter = { role: "store_user" };
    if (req.user?.role === "store_owner") {
      if (req.user.storeId) {
        userFilter.storeId = req.user.storeId;
      }
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      userFilter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex }
      ];
    }

    const total = await User.countDocuments(userFilter);
    const users = await User.find(userFilter)
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
      .lean();

    const wallets = await Promise.all(
      users.map(async (user) => {
        let wallet = await Wallet.findOne({
          user: user._id,
        }).lean();

        if (!wallet) {
          wallet = await Wallet.create({
            user: user._id,
            balance: 0,
            giftCardBalance: 0,
            voucherBalance: 0,
          });

          wallet = wallet.toObject();
        }
        const giftCards = await GiftCard.find({assignedTo: user._id})
          .select("_id cardNumber originalAmount remainingBalance status expiresAt recipientName recipientEmail")
          .lean();

        const giftCardBalance = giftCards.reduce(
          (sum, card) => sum + Number(card.remainingBalance || 0),
          0
        );

        const balance = Number(wallet.balance || 0);
        const voucherBalance = Number( wallet.voucherBalance || 0 );
        const totalBalance = balance + giftCardBalance + voucherBalance;

        return {
          ...wallet,
          user,
          giftCards,
          giftCardBalance,
          voucherBalance,
          voucherStatus: wallet.voucherStatus ?? true,
          expiresAt: wallet.expiresAt ?? null,
          isVoucherActive:
            wallet.voucherStatus === true &&
            wallet.expiresAt &&
            new Date() <= new Date(wallet.expiresAt),
          balance,
          totalBalance,
        };
      })
    );

    return res.status(200).json({
      success: true,
      wallets,
      total,
      page: currentPage,
      limit: perPage,
      totalPages: Math.ceil(total / perPage),
    });
  } catch (error) {
    console.error( "getAllWallets error:", error );
    return res.status(500).json({success: false, message: error.message || "Failed to fetch wallets"});
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

const adminAddVoucher = async (req, res) => {
  try {
    const { userId, amount, status, expiresAt, } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const voucherAmount = Number(amount);

    if (!voucherAmount || voucherAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid voucher amount is required",
      });
    }
    if (typeof status !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Voucher status must be true or false",
      });
    }

    if (!expiresAt) {
      return res.status(400).json({
        success: false,
        message: "Voucher expiry date is required",
      });
    }

    const voucherExpiryDate = new Date(expiresAt);

    if (Number.isNaN(voucherExpiryDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid voucher expiry date",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiryDate = new Date(voucherExpiryDate);
    expiryDate.setHours(0, 0, 0, 0);

    if (expiryDate < today) {
      return res.status(400).json({
        success: false,
        message: "Voucher expiry date cannot be in the past",
      });
    }

    let wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      wallet = await Wallet.create({
        user: userId,
        balance: 0,
        giftCardBalance: 0,
        voucherBalance: voucherAmount,
        expiresAt: voucherExpiryDate,
        voucherStatus: status,
      });
    } else {
      const oldVoucherBalance = Number(
        wallet.voucherBalance || 0
      );

      wallet.voucherBalance = oldVoucherBalance + voucherAmount;
      wallet.expiresAt = voucherExpiryDate;
      wallet.voucherStatus = status;

      await wallet.save();
    } 
    return res.status(200).json({
      success: true,
      message: "Voucher amount added successfully",
    });
  } catch (error) {
    console.error(
      "Admin Add Voucher Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to add voucher amount",
      error: error.message,
    });
  }
};

const adminUpdateVoucher = async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount, status, expiresAt } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const voucherAmount = Number(amount);

    if (!voucherAmount || voucherAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid voucher amount is required",
      });
    }

    if (typeof status !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Voucher status must be true or false",
      });
    }

    if (!expiresAt) {
      return res.status(400).json({
        success: false,
        message: "Voucher expiry date is required",
      });
    }

    const voucherExpiryDate = new Date(expiresAt);

    if (Number.isNaN(voucherExpiryDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid voucher expiry date",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiryDate = new Date(voucherExpiryDate);
    expiryDate.setHours(0, 0, 0, 0);

    if (expiryDate < today) {
      return res.status(400).json({
        success: false,
        message: "Voucher expiry date cannot be in the past",
      });
    }

    const wallet = await Wallet.findOne({
      user: userId,
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found",
      });
    }

    wallet.voucherBalance = voucherAmount;
    wallet.voucherStatus = status;
    wallet.expiresAt = voucherExpiryDate;

    await wallet.save();
    return res.status(200).json({
      success: true,
      message: "Voucher updated successfully",
    });
  } catch (error) {
    console.error("Admin Update Voucher Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update voucher",
      error: error.message,
    });
  }
};
module.exports = {
  getBalance,
  addMoney,
  verifyKyc,
  adminAdjustBalance,
  getAllWallets,
  adminVerifyKyc,
  adminAddVoucher,
  adminUpdateVoucher
};