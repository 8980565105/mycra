const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const GiftCard = require("../models/GiftCard");
const GiftCardTransaction = require("../models/GiftCardTransaction");
const Wallet = require("../models/Wallet");
const User = require("../models/User");

const {
  generateGiftCardNumber,
  generateGiftCardPin,
} = require("../utils/giftCardGenerator");
const { sendResponse } = require("../utils/response");

const parseProductExpiryDate = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (
    typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    throw new Error("Expiry date must use YYYY-MM-DD format.");
  }

  const [year, month, day] = value.split("-").map(Number);
  const dateCheck = new Date(Date.UTC(year, month - 1, day));

  if (
    dateCheck.getUTCFullYear() !== year ||
    dateCheck.getUTCMonth() !== month - 1 ||
    dateCheck.getUTCDate() !== day
  ) {
    throw new Error("Enter a valid expiry date.");
  }
  return new Date(`${value}T23:59:59.999+05:30`);
};


const createUniqueGiftCardNumber = async (session = null) => {
  let cardNumber;
  let exists = true;

  while (exists) {
    cardNumber = generateGiftCardNumber();

    const query = GiftCard.exists({ cardNumber });

    if (session) {
      query.session(session);
    }

    exists = await query;
  }

  return cardNumber;
};

const createReferenceId = () => {
  return `GC-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
};

const getAuthenticatedUserId = (req) => {
  return req.user?._id || req.user?.id || null;
};
const issuedCardFilter = {
  recordType: { $ne: "Product" },
};

const expireUserGiftCards = async (userId, session = null) => {
  const query = GiftCard.updateMany(
    {
      ...issuedCardFilter,
      assignedTo: userId,
      status: "Active",
      expiresAt: { $ne: null, $lte: new Date() },
    },
    {
      $set: { status: "Expired" },
    }
  );

  if (session) {
    query.session(session);
  }

  await query;
};

const adminCreateGiftCardProduct = async (req, res) => {
  try {
    const {
      productName,
      productDescription = "",
      productImage = "",
      amount,
      isPurchaseEnabled = true,
      productExpiresAt,
      allowCustomAmount = false,
      minAmount = 1000,
      maxAmount = 10000,
      amountStep = 1000,
    } = req.body;
    let parsedProductExpiresAt;

    if (parsedProductExpiresAt && parsedProductExpiresAt <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Expiry date must be in the future.",
      });
    }
    try {
      parsedProductExpiresAt = parseProductExpiryDate(productExpiresAt);
    } catch (error) {
      return res.status(error.statusCode || 400).json({
        success: false, message: error.message,
      });
    }

    const adminId = getAuthenticatedUserId(req);

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!productName || !String(productName).trim()) {
      return res.status(400).json({
        success: false,
        message: "Product name is required.",
      });
    }

    const numericAmount = Number(amount);

    if (typeof allowCustomAmount !== "boolean") {
      return res.status(400).json({
        success: false, message: "allowCustomAmount must be true or false.",
      });
    }

    const numericMin = Number(minAmount);
    const numericMax = Number(maxAmount);
    const numericStep = Number(amountStep);

    if (allowCustomAmount) {
      if (
        !Number.isInteger(numericMin) ||
        !Number.isInteger(numericMax) ||
        !Number.isInteger(numericStep) ||
        numericMin < 1 ||
        numericMax < numericMin ||
        numericStep < 1 ||
        numericStep > numericMax - numericMin + 1
      ) {
        return res.status(400).json({
          success: false, message: "Enter valid minimum, maximum and step amounts.",
        });
      }

      if ((numericMax - numericMin) % numericStep !== 0) {
        return res.status(400).json({
          success: false, message: "Maximum amount must match the selected amount step.",
        });
      }
    }

    if (
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid Gift Card amount.",
      });
    }

    if (typeof isPurchaseEnabled !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isPurchaseEnabled must be true or false.",
      });
    }

    const product = await GiftCard.create({
      recordType: "Product",
      productName: String(productName).trim(),
      productDescription: String(productDescription || "").trim(),
      productImage: String(productImage || "").trim(),
      originalAmount: numericAmount,
      remainingBalance: 0,
      isPurchaseEnabled,
      assignedTo: null,
      recipientName: "",
      recipientEmail: "",
      status: "Inactive",
      source: "Admin",
      createdBy: adminId,
      expiresAt: null,
      productExpiresAt: parsedProductExpiresAt,
      allowCustomAmount,
      minAmount: allowCustomAmount ? numericMin : numericAmount,
      maxAmount: allowCustomAmount ? numericMax : numericAmount,
      amountStep: allowCustomAmount ? numericStep : 1,
    });

    return res.status(201).json({
      success: true,
      message: "Gift Card product created successfully.",
      product: {
        _id: product._id,
        productName: product.productName,
        productDescription: product.productDescription,
        productImage: product.productImage,
        amount: product.originalAmount,
        isPurchaseEnabled: product.isPurchaseEnabled,
        productExpiresAt: product.productExpiresAt,  
        allowCustomAmount: product.allowCustomAmount,
        minAmount: product.minAmount,
        maxAmount: product.maxAmount,
        amountStep: product.amountStep,
        createdAt: product.createdAt,
      },
    });
  } catch (error) {
    console.error("adminCreateGiftCardProduct error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create Gift Card product.",
      error: error.message,
    });
  }
};

const getGiftCardPurchaseProducts = async (req, res) => {
  try {
    const now = new Date();
    const products = await GiftCard.find({
      recordType: "Product",
      isPurchaseEnabled: true,
      $or: [
        { productExpiresAt: null },
        { productExpiresAt: { $exists: false } },
        { productExpiresAt: { $gt: now } },
      ],
    })
      .select(
        "_id productName productDescription productImage originalAmount isPurchaseEnabled productExpiresAt allowCustomAmount minAmount maxAmount amountStep createdAt"
      )
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: products.length,
      products: products.map((product) => ({
        ...product,
        amount: product.originalAmount,
      })),
    });
  } catch (error) {
    return sendResponse(res, false, "Unable to fetch Gift Card products.");
  }
};

const adminCreateGiftCard = async (req, res) => {
  try {
    const {amount, userId, recipientName = "", recipientEmail = "", expiresAt = null,} = req.body;

    const adminId = getAuthenticatedUserId(req);

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid Gift Card amount.",
      });
    }

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "A valid userId is required.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    let expiryDate = null;

    if (expiresAt) {
      expiryDate = new Date(expiresAt);

      if (Number.isNaN(expiryDate.getTime()) || expiryDate <= new Date()) {
        return res.status(400).json({
          success: false,
          message: "Expiry date must be a valid future date.",
        });
      }
    }

    const cardNumber = await createUniqueGiftCardNumber();
    const pin = String(generateGiftCardPin());
    const pinHash = await bcrypt.hash(pin, 10);

    const giftCard = await GiftCard.create({
      recordType: "Issued",
      cardNumber,
      pinHash,
      originalAmount: numericAmount,
      remainingBalance: numericAmount,
      assignedTo: user._id,
      recipientName: String(recipientName).trim(),
      recipientEmail: String(recipientEmail).trim().toLowerCase(),
      status: "Active",
      source: "Admin",
      expiresAt: expiryDate,
      createdBy: adminId,
      activatedAt: new Date(),
    });

    await GiftCardTransaction.create({
      giftCard: giftCard._id,
      user: user._id,
      type: "Issued",
      amount: numericAmount,
      balanceBefore: 0,
      balanceAfter: numericAmount,
      referenceId: createReferenceId(),
      description: "Gift Card issued by admin",
    });

    return res.status(201).json({
      success: true,
      message: "Gift Card issued successfully.",
      giftCard: {
        _id: giftCard._id,
        cardNumber: giftCard.cardNumber,
        originalAmount: giftCard.originalAmount,
        remainingBalance: giftCard.remainingBalance,
        recipientName: giftCard.recipientName,
        recipientEmail: giftCard.recipientEmail,
        status: giftCard.status,
        expiresAt: giftCard.expiresAt,
      },
      // Display the PIN only once to the authorized admin.
      pin,
    });
  } catch (error) {
    console.error("adminCreateGiftCard error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to issue Gift Card.",
    });
  }
};

const purchaseGiftCard = async (req, res) => {
  const userId = getAuthenticatedUserId(req);

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Please log in before purchasing.",
    });
  }

  const { productId, customAmount, quantity = 1, receiverEmail, receiverName, gifterName = "", message = "", } = req.body;

  if (!mongoose.isValidObjectId(productId)) {
    return res.status(400).json({
      success: false,
      message: "A valid productId is required.",
    });
  }

  const numericQuantity = Number(quantity);

  // Preserve the existing maximum quantity policy of 3.
  if (
    !Number.isInteger(numericQuantity) ||
    numericQuantity < 1 ||
    numericQuantity > 3
  ) {
    return res.status(400).json({
      success: false,
      message: "Quantity must be between 1 and 3.",
    });
  }

  if (!receiverName || !String(receiverName).trim()) {
    return res.status(400).json({
      success: false,
      message: "Recipient name is required.",
    });
  }

  const normalizedEmail = String(receiverEmail || "").trim().toLowerCase();

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(normalizedEmail)) {
    return res.status(400).json({
      success: false,
      message: "Enter a valid recipient email.",
    });
  }

  if (String(message).trim().length > 100) {
    return res.status(400).json({
      success: false,
      message: "Message cannot exceed 100 characters.",
    });
  }

  const session = await mongoose.startSession();

  let result;

  try {
    await session.withTransaction(async () => {
      // Read the authoritative price from the database.
      // Never trust an amount supplied by the frontend.
      const product = await GiftCard.findOne({
        _id: productId,
        recordType: "Product",
        isPurchaseEnabled: true,
      }).session(session);

      if (!product) {
        const error = new Error(
          "Gift Card product was not found or is disabled."
        );
        error.statusCode = 404;
        throw error;
      }

      if (
        product.productExpiresAt &&
        product.productExpiresAt <= new Date()
      ) {
        const error = new Error(
          "This Gift Card product has expired and cannot be purchased."
        );
        error.statusCode = 400;
        throw error;
      }

      let unitAmount;

      if (product.allowCustomAmount === true) {
        unitAmount = Number(customAmount);

        const min = Number(product.minAmount);
        const max = Number(product.maxAmount);
        const step = Number(product.amountStep);

        if (
          !Number.isInteger(unitAmount) ||
          !Number.isFinite(min) ||
          !Number.isFinite(max) ||
          !Number.isFinite(step) ||
          step <= 0 ||
          unitAmount < min ||
          unitAmount > max ||
          (unitAmount - min) % step !== 0
        ) {
          const error = new Error(
            `Select an amount between ₹${min} and ₹${max} in ₹${step} increments.`
          );
          error.statusCode = 400;
          throw error;
        }
      } else {
        unitAmount = Number(product.originalAmount);
      }

      const totalAmount = unitAmount * numericQuantity;

      if (
        !Number.isSafeInteger(totalAmount) ||
        !Number.isFinite(unitAmount) ||
        unitAmount <= 0 ||
        totalAmount <= 0
      ) {
        const error = new Error("Invalid Gift Card amount.");
        error.statusCode = 400;
        throw error;
      }

      if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
        const error = new Error("Invalid product price.");
        error.statusCode = 400;
        throw error;
      }

      // Atomically deduct wallet money inside the transaction.
      const walletBefore = await Wallet.findOne({
        user: userId,
      }).session(session);

      if (!walletBefore) {
        const error = new Error("Wallet not found. Please contact support.");
        error.statusCode = 404;
        throw error;
      }

      if (Number(walletBefore.balance || 0) < totalAmount) {
        const error = new Error("Insufficient wallet balance.");
        error.statusCode = 400;
        throw error;
      }

      const walletAfter = await Wallet.findOneAndUpdate(
        {
          user: userId,
          balance: { $gte: totalAmount },
        },
        {
          $inc: { balance: -totalAmount },
        },
        {
          new: true,
          session,
          runValidators: true,
        }
      );

      if (!walletAfter) {
        const error = new Error(
          "Insufficient wallet balance or wallet was updated. Please retry."
        );
        error.statusCode = 400;
        throw error;
      }

      const issuedCards = [];
      const transactionDocs = [];

      for (let i = 0; i < numericQuantity; i += 1) {
        const cardNumber = await createUniqueGiftCardNumber(session);
        const pin = String(generateGiftCardPin());
        const pinHash = await bcrypt.hash(pin, 10);

        const [giftCard] = await GiftCard.create(
          [
            {
              recordType: "Issued",
              cardNumber,
              pinHash,
              originalAmount: unitAmount,
              remainingBalance: unitAmount,

              // Existing behavior: card belongs to the logged-in buyer.
              // Recipient fields store the intended recipient details.
              assignedTo: userId,
              recipientName: String(receiverName).trim(),
              recipientEmail: normalizedEmail,

              gifterName: String(gifterName).trim(),
              message: String(message).trim(),

              status: "Active",
              source: "Purchase",
              createdBy: userId,
              activatedAt: new Date(),
              expiresAt: null,
            },
          ],
          { session }
        );

        issuedCards.push({
          _id: giftCard._id,
          cardNumber: giftCard.cardNumber,
          pin,
          originalAmount: giftCard.originalAmount,
          remainingBalance: giftCard.remainingBalance,
          recipientName: giftCard.recipientName,
          recipientEmail: giftCard.recipientEmail,
          status: giftCard.status,
        });

        transactionDocs.push({
          giftCard: giftCard._id,
          user: userId,
          type: "Issued",
          amount: unitAmount,
          balanceBefore: 0,
          balanceAfter: unitAmount,
          referenceId: createReferenceId(),
          description: `Gift Card purchased: ${product.productName}`,
        });
      }

      await GiftCardTransaction.create(transactionDocs, { session });

      result = {
        productName: product.productName,
        quantity: numericQuantity,
        unitAmount,
        totalAmount,
        cards: issuedCards,
        walletBalance: walletAfter.balance,
      };
    });

    return res.status(201).json({
      success: true,
      message: "Gift Card purchased successfully.",
      purchase: {
        productName: result.productName,
        quantity: result.quantity,
        unitAmount: result.unitAmount,
        totalAmount: result.totalAmount,
      },
      giftCards: result.cards,
      wallet: {
        balance: result.walletBalance,
      },
    });
  } catch (error) {
    console.error("purchaseGiftCard error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.statusCode
          ? error.message
          : "Gift Card purchase failed. Please try again.",
    });
  } finally {
    await session.endSession();
  }
};

const getMyGiftCards = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const now = new Date();

    await expireUserGiftCards(userId);

    const giftCards = await GiftCard.find({
      ...issuedCardFilter,
      assignedTo: userId,
      status: "Active",
      remainingBalance: { $gt: 0 },
      $or: [
        { expiresAt: null },
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: now } },
      ],
    })
      .select("-pinHash")
      .sort({ createdAt: -1 })
      .lean();

    const giftCardBalance = giftCards.reduce(
      (total, card) => total + Number(card.remainingBalance || 0),
      0
    );

    let wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      wallet = await Wallet.create({
        user: userId,
        balance: 0,
        voucherBalance: 0,
      });
    }

    const voucherExpiry = wallet.expiresAt
      ? new Date(wallet.expiresAt)
      : null;

    const isVoucherActive =
      wallet.voucherStatus === true &&
      Number(wallet.voucherBalance || 0) > 0 &&
      voucherExpiry &&
      voucherExpiry > now;

    const voucherBalance = isVoucherActive
      ? Number(wallet.voucherBalance || 0)
      : 0;

    const normalBalance = Number(wallet.balance || 0);

    return res.status(200).json({
      success: true,
      count: giftCards.length,
      giftCards,
      giftCardBalance,
      wallet: {
        balance: normalBalance,
        giftCardBalance,
        voucherBalance,
        voucherStatus: Boolean(isVoucherActive),
        totalBalance: normalBalance + giftCardBalance + voucherBalance,
      },
    });
  } catch (error) {
    console.error("getMyGiftCards error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch your Gift Cards.",
    });
  }
};

const adminGetAllGiftCards = async (req, res) => {
  try {
    await GiftCard.updateMany(
      {
        ...issuedCardFilter,
        status: "Active",
        expiresAt: { $ne: null, $lte: new Date() },
      },
      {
        $set: { status: "Expired" },
      }
    );

    const giftCards = await GiftCard.find({})
      .select("-pinHash")
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: giftCards.length,
      giftCards,
    });
  } catch (error) {
    console.error("adminGetAllGiftCards error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch Gift Cards.",
    });
  }
};

const getPurchasedGiftCards = async (req, res) => {
  try {
    const giftCards = await GiftCard.find({
      ...issuedCardFilter,
      source: "Purchase",
      createdBy: { $ne: null },
    })
      .select("-pinHash")
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: giftCards.length,
      giftCards,
    });
  } catch (error) {
    console.error("adminGetAllPurchasedGiftCards error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch purchased Gift Cards.",
    });
  }
};

const getGiftCardProduct = async (req, res) => {
  try {
    const products = await GiftCard.find({
      recordType: "Product",
    })
      .select(
        "_id productName productDescription productImage originalAmount isPurchaseEnabled productExpiresAt allowCustomAmount minAmount maxAmount amountStep createdAt updatedAt"
      )
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: products.length,
      products: products.map((product) => ({
        ...product,
        amount: product.originalAmount,
      })),
    });
  } catch (error) {
    console.error("adminGetAllGiftCardProducts:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load Gift Card products.",
    });
  }
};

const updateGiftCardProduct = async (req, res) => {
  try {
    const { id } = req.params;
   const { productName, productDescription, productImage, amount, isPurchaseEnabled, productExpiresAt, allowCustomAmount, minAmount, maxAmount, amountStep } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false, message: "Invalid product ID.",
      });
    }

    const product = await GiftCard.findOne({
      _id: id, recordType: "Product",
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Gift Card product not found.",
      });
    }

    if (productName !== undefined) {
      if (
        typeof productName !== "string" ||
        !productName.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Product name is required.",
        });
      }

      product.productName = productName.trim();
    }

    if (productDescription !== undefined) {
      if (typeof productDescription !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid product description.",
        });
      }

      product.productDescription = productDescription.trim();
    }

    if (productImage !== undefined) {
      if (typeof productImage !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid product image URL.",
        });
      }

      product.productImage = productImage.trim();
    }

    if (amount !== undefined) {
      const numericAmount = Number(amount);

      if (
        !Number.isFinite(numericAmount) ||
        numericAmount <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Enter a valid Gift Card amount.",
        });
      }

      product.originalAmount = numericAmount;
    }

    if (allowCustomAmount !== undefined) {
      if (typeof allowCustomAmount !== "boolean") {
        return res.status(400).json({
          success: false,  message: "allowCustomAmount must be true or false.",
        });
      }
      product.allowCustomAmount = allowCustomAmount;
    }

    const nextMin = minAmount !== undefined ? Number(minAmount) : Number(product.minAmount);
    const nextMax = maxAmount !== undefined ? Number(maxAmount) : Number(product.maxAmount);
    const nextStep = amountStep !== undefined ? Number(amountStep) : Number(product.amountStep);

    if (
      !Number.isInteger(nextMin) ||
      !Number.isInteger(nextMax) ||
      !Number.isInteger(nextStep) ||
      nextMin < 1 ||
      nextMax < nextMin ||
      nextStep < 1 ||
      nextStep > nextMax - nextMin + 1 ||
      (nextMax - nextMin) % nextStep !== 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid custom amount settings.",
      });
    }

    product.minAmount = nextMin;
    product.maxAmount = nextMax;
    product.amountStep = nextStep;

    if (isPurchaseEnabled !== undefined) {
      if (typeof isPurchaseEnabled !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "isPurchaseEnabled must be true or false.",
        });
      }

      product.isPurchaseEnabled = isPurchaseEnabled;
    }

    if (productExpiresAt !== undefined) {
      try {
        product.productExpiresAt = parseProductExpiryDate(productExpiresAt);
      } catch (error) {
        return res.status(error.statusCode || 400).json({
          success: false,
          message: error.message,
        });
      }
    }
    await product.save();

    return res.status(200).json({
      success: true,
      message: "Gift Card product updated successfully.",
      product: {
        _id: product._id,
        productName: product.productName,
        productDescription: product.productDescription,
        productImage: product.productImage,
        amount: product.originalAmount,
        originalAmount: product.originalAmount,
        isPurchaseEnabled: product.isPurchaseEnabled,
        productExpiresAt: product.productExpiresAt ?? null,
        allowCustomAmount: product.allowCustomAmount,
        minAmount: product.minAmount,
        maxAmount: product.maxAmount,
        amountStep: product.amountStep,
        updatedAt: product.updatedAt,
      },
    });
  } catch (error) {
    console.error("adminUpdateGiftCardProduct:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update Gift Card product.",
    });
  }
};
const deleteGiftCards = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false, data: null, message: "Invalid gift card ID",
      });
    }
    const deletedGiftCard = await GiftCard.findByIdAndDelete(id);

    if (!deletedGiftCard) {
      return res.status(404).json({success: false,  data: null, message: "Gift card not found"});
    }

    return res.status(200).json({
      success: true,
      data: deletedGiftCard,
      message: "Gift card deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({success: false, data: null, message: "Failed to delete gift card", error: err.message});
  }
};

const validateGiftCardForCheckout = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return sendResponse(res, false, "Please login to apply your Gift Card.");
    }

    const code = String(req.body?.code || "")
      .trim()
      .toUpperCase();

    if (!code) {
      return sendResponse(res, false, "Gift Card code is required.");
    }

    const now = new Date();

    const giftCard = await GiftCard.findOne({
      recordType: "Issued",
      assignedTo: userId,
      cardNumber: code,
      status: "Active",
      remainingBalance: { $gt: 0 },
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: now } },
      ],
    }).select("_id cardNumber remainingBalance status expiresAt");

    if (!giftCard) {
      return sendResponse(res, false, "Invalid, expired, or unavailable Gift Card.");
    }

    return sendResponse(res, true, 
      {
        giftCard: {
          _id: giftCard._id,
          code: giftCard.cardNumber,
          remainingBalance: Number(giftCard.remainingBalance),
          expiresAt: giftCard.expiresAt || null,
        },
      },
      "Gift Card validated successfully."
    );
  } catch (error) {
     return sendResponse(res, false, "Unable to validate Gift Card.");
  }
};

module.exports = {
  adminCreateGiftCard,
  adminCreateGiftCardProduct,
  getGiftCardPurchaseProducts,
  adminGetAllGiftCards,
  getMyGiftCards,
  purchaseGiftCard,
  getPurchasedGiftCards,
  getGiftCardProduct,
  updateGiftCardProduct,
  deleteGiftCards,
  validateGiftCardForCheckout
};