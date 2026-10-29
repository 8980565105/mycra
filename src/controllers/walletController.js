const Stripe = require("stripe");
const mongoose = require("mongoose");
const Wallet = require("../models/Wallet");
const User = require("../models/User");
const GiftCard = require("../models/giftCard");
const Transection = require("../models/Transactions");
const WalletTopUp = require("../models/WalletTopUp");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const getBalance = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      wallet = await Wallet.create({ user: userId });
    }

    await GiftCard.updateMany(
      {
        assignedTo: userId,
        status: "Active",
        expiresAt: { $lte: now },
      },
      {
        $set: { status: "Expired" },
      }
    );

    const activeCards = await GiftCard.find({
      assignedTo: userId,
      status: "Active",
      remainingBalance: { $gt: 0 },
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: now } },
      ],
    })
      .select("_id cardNumber remainingBalance status expiresAt")
      .lean();

    const giftCardBalance = activeCards.reduce(
      (sum, card) => sum + Number(card.remainingBalance || 0),
      0
    );

    const voucherIsActive =
      wallet.voucherStatus === true &&
      Boolean(wallet.expiresAt) &&
      new Date(wallet.expiresAt) > now;

    const balance = Number(wallet.balance || 0);

    const voucherBalance = voucherIsActive
      ? Number(wallet.voucherBalance || 0)
      : 0;

    return res.status(200).json({
      success: true,
      wallet: {
        ...wallet.toObject(),
        balance,
        giftCards: activeCards,
        giftCardBalance,
        voucherBalance,
        voucherStatus: voucherIsActive,
        isVoucherActive: voucherIsActive,
        totalBalance: balance + giftCardBalance + voucherBalance,
      },
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
    const now = new Date();
    const userFilter = { role: "store_user" };
    if (req.user?.role === "store_owner" && req.user.storeId) {
      userFilter.storeId = req.user.storeId;
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
          const createdWallet = await Wallet.create({
            user: user._id,
            balance: 0,
            voucherBalance: 0,
          });

          wallet = createdWallet.toObject();
        }
        await GiftCard.updateMany(
          {
            assignedTo: user._id,
            status: "Active",
            expiresAt: { $lte: now },
          },
          {
            $set: { status: "Expired" },
          }
        );

        const giftCards = await GiftCard.find({
          assignedTo: user._id,
          status: "Active",
          remainingBalance: { $gt: 0 },
          $or: [
            { expiresAt: null },
            { expiresAt: { $gt: now } },
          ],
        })
          .select(
            "_id cardNumber originalAmount remainingBalance status expiresAt recipientName recipientEmail source createdAt"
          )
          .sort({ createdAt: -1 })
          .lean();

        const purchasedGiftCards = await GiftCard.find({
          assignedTo: user._id, source: "Purchase",
        })
        .select("_id cardNumber originalAmount remainingBalance status expiresAt source createdAt")
        .sort({ createdAt: -1 })
        .lean();

        const purchasedGiftCardTotal = purchasedGiftCards.reduce(
          (total, card) => total + Number(card.originalAmount || 0), 0
        );
        const giftCardBalance = giftCards.reduce(
          (sum, card) =>
            sum + Number(card.remainingBalance || 0),
          0
        );

        const balance = Number(wallet.balance || 0);
        const voucherIsActive =
          wallet.voucherStatus === true &&
          Boolean(wallet.expiresAt) &&
          new Date(wallet.expiresAt) > now;

        const voucherBalance = voucherIsActive
          ? Number(wallet.voucherBalance || 0)
          : 0;
        const totalBalance = balance + giftCardBalance + voucherBalance;

        return {
          ...wallet,
          user,
          giftCards,
          purchasedGiftCards,
          purchasedGiftCardTotal,
          balance,
          giftCardBalance,
          voucherBalance,
          totalBalance,
          voucherStatus: voucherIsActive,
          isVoucherActive: voucherIsActive,
          expiresAt: wallet.expiresAt || null,
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
        voucherBalance: voucherAmount,
        expiresAt: voucherExpiryDate,
        voucherStatus: status,
      });
    } else {
      const now = new Date();

      const previousVoucherExpired =
        !wallet.expiresAt || new Date(wallet.expiresAt) <= now;

      const oldVoucherBalance = previousVoucherExpired
        ? 0
        : Number(wallet.voucherBalance || 0);

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

const createWalletTopUpSession = async (req, res) => {
  let topUp;
  try {
    const amount = Number(req.body.amount);
    const userId = req.user._id;

    if (!Number.isSafeInteger(amount) || amount < 50 || amount > 10000) {
      return res.status(400).json({
        success: false,
        message: "Wallet recharge amount must be between ₹50 and ₹10,000.",
      });
    }

    let wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      wallet = await Wallet.create({ user: userId });
    }

    if (!wallet.isKycVerified) {
      return res.status(403).json({
        success: false, message: "Complete eKYC before adding money",
      });
    }

    topUp = await WalletTopUp.create({
      user: userId,
      amount,
      currency: "inr",
      status: "pending",
    });

    const frontendUrl = process.env.FRONTEND_URL;

    if (!frontendUrl) {
      throw new Error("FRONTEND_URL is missing in environment");
    }

    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],

      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "Wallet Amount",
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],

      client_reference_id: String(topUp._id),

      metadata: {
        topUpId: String(topUp._id),
        userId: String(userId),
      },

      payment_intent_data: {
        metadata: {
          topUpId: String(topUp._id),
          userId: String(userId),
        },
      },

      success_url: `${frontendUrl}/my-account/wallets?topup=success&session_id={CHECKOUT_SESSION_ID}`,

      cancel_url: `${frontendUrl}/my-account/wallets?topup=cancelled`,
    });

    topUp.sessionId = checkout.id;
    await topUp.save();

    return res.status(200).json({
      success: true,
      url: checkout.url,
    });
  } catch (error) {
    console.error("Wallet checkout error:", error.message);
    if (topUp?._id && !topUp.sessionId) {
      await WalletTopUp.updateOne(
        { _id: topUp._id, status: "pending" },
        { $set: { status: "failed" } }
      ).catch((updateError) => {
        console.error(
          "Unable to update failed top-up:", updateError.message
        );
      });
    }
    return res.status(500).json({
      success: false, message: "Unable to start wallet payment",
    });
  }
};

const handleWalletStripeWebhook = async (req, res) => {
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log("✅ Wallet Stripe webhook received:", event.type);  
  } catch (error) {
    console.error("Wallet Stripe signature error:", error.message);
    return res.status(400).send("Invalid Stripe webhook signature");
  }

  const supportedEvents = [
    "checkout.session.completed",
    "checkout.session.async_payment_succeeded",
  ];

  if (!supportedEvents.includes(event.type)) {
    return res.status(200).json({ received: true });
  }

  const checkout = event.data.object;

  if (checkout.payment_status !== "paid") {
    console.log("Wallet top-up not credited: payment is not paid yet.");
    return res.status(200).json({ received: true });
  }
  const topUpId = checkout.metadata?.topUpId;

  if (!topUpId || !mongoose.isValidObjectId(topUpId)) {
    return res.status(400).send("Missing or invalid top-up reference");
  }

  const dbSession = await mongoose.startSession();

  try {
    await dbSession.withTransaction(async () => {
      const topUp = await WalletTopUp.findById(topUpId).session(dbSession);

      if (!topUp) {
        throw new Error("Wallet top-up record not found");
      }

      if (topUp.status === "paid") {
        return;
      }

      if (topUp.status !== "pending") {
        throw new Error("Wallet top-up is not pending");
      }

      if (
        checkout.mode !== "payment" ||
        checkout.payment_status !== "paid" ||
        checkout.client_reference_id !== String(topUp._id) ||
        checkout.metadata?.topUpId !== String(topUp._id) ||
        checkout.metadata?.userId !== String(topUp.user) ||
        checkout.id !== topUp.sessionId ||
        Number(checkout.amount_total) !== Math.round(topUp.amount * 100) ||
        String(checkout.currency).toLowerCase() !== String(topUp.currency).toLowerCase()
      ) {
        throw new Error("Stripe checkout details do not match top-up");
      }

      const wallet = await Wallet.findOne({ user: topUp.user })
        .session(dbSession);

      if (!wallet) {
        throw new Error("Wallet not found for this top-up");
      }

      wallet.balance = Number(wallet.balance || 0) + topUp.amount;
      await wallet.save({ session: dbSession });

      await Transection.create(
        [
          {
            user: topUp.user,
            order_id: null,
            stripe_payment_intent_id:
              typeof checkout.payment_intent === "string"
                ? checkout.payment_intent
                : checkout.payment_intent?.id || null,
            stripe_charge_id: null,
            currency: topUp.currency,
            amount: topUp.amount,
            type: "Money received",
            category: "Financial Services",
            paymentMode: "Stripe",
            status: "Success",
            tab: "All",
            description: "Wallet top-up via Stripe",
            referenceId: `STRIPE-${checkout.id}`,
          },
        ],
        { session: dbSession }
      );

      topUp.status = "paid";
      topUp.sessionId = checkout.id;
      topUp.paymentIntentId =
        typeof checkout.payment_intent === "string"
          ? checkout.payment_intent
          : checkout.payment_intent?.id || null;
      topUp.creditedAt = new Date();

      await topUp.save({ session: dbSession });
    });

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Wallet Stripe webhook processing error:", error.message);
    console.error("Webhook error stack:", error.stack);
    return res.status(500).json({
      received: false, message: "Wallet payment processing failed",
    });
  } finally {
    await dbSession.endSession();
  }
};

const getWalletTopUpStatus = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { sessionId } = req.params;

    if (!userId) {
      return sendResponse(res, false, null, "Please login first.");
    }

    if (!sessionId || !sessionId.startsWith("cs_")) {
      return sendResponse(res, false, null, "Invalid checkout session ID.");
    }

    const topUp = await WalletTopUp.findOne({
      user: userId, sessionId,
    }).select("amount currency status creditedAt sessionId");

    if (!topUp) {
      return sendResponse(res, false, null, "Wallet top-up not found.");
    }

    return res.status(200).json({
      success: true,
      data: {
        status: topUp.status,
        amount: topUp.amount,
        currency: topUp.currency,
        creditedAt: topUp.creditedAt,
      },
    });
  } catch (error) {
    console.error("Wallet top-up status error:", error);

    return sendResponse(res, false, null, "Unable to check wallet top-up status.");
  }
};

module.exports = {
  getBalance,
  verifyKyc,
  adminAdjustBalance,
  getAllWallets,
  adminVerifyKyc,
  adminAddVoucher,
  adminUpdateVoucher,
  createWalletTopUpSession,
  handleWalletStripeWebhook,
  getWalletTopUpStatus
};