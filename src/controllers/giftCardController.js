const bcrypt = require("bcryptjs");

const GiftCard = require("../models/GiftCard");
const GiftCardTransaction = require( "../models/GiftCardTransaction" );

const { generateGiftCardNumber, generateGiftCardPin, } = require("../utils/giftCardGenerator");

const createUniqueGiftCardNumber = async () => {
  let cardNumber;
  let exists = true;

  while (exists) {
    cardNumber = generateGiftCardNumber();
    exists = await GiftCard.exists({
      cardNumber,
    });
  }

  return cardNumber;
};
const getMyGiftCards = async (req, res) => {
  try {
    const userId = req.user?._id;

    console.log("LOGGED IN USER:", userId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const giftCards = await GiftCard.find({
      assignedTo: userId,
    })
      .select(
        "cardNumber originalAmount remainingBalance status expiresAt recipientName recipientEmail source createdAt"
      )
      .sort({
        createdAt: -1,
      })
      .lean();

    console.log("USER GIFT CARDS:", giftCards);

    return res.status(200).json({
      success: true,
      giftCards,
    });

  } catch (error) {
    console.error(
      "getMyGiftCards error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch gift cards",
    });
  }
};

const adminCreateGiftCard = async (req, res) => {
  try {
    const {
      amount,
      userId,
      recipientName,
      recipientEmail,
      expiresAt,
    } = req.body;

    const numericAmount = Number(amount);

    if (
      !amount ||
      Number.isNaN(numericAmount) ||
      numericAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid gift card amount is required",
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User is required",
      });
    }

    const cardNumber = await createUniqueGiftCardNumber();
    const pin = generateGiftCardPin();
    const pinHash = await bcrypt.hash(pin, 10);

    let expiryDate = null;

    if (expiresAt) {
      expiryDate = new Date(expiresAt);

      if (Number.isNaN(expiryDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid expiry date",
        });
      }
    }

    const giftCard = await GiftCard.create({
        cardNumber,
        pinHash,
        originalAmount: numericAmount,
        remainingBalance: numericAmount,
        assignedTo: userId,
        recipientName: recipientName || user.name || "",
        recipientEmail: recipientEmail || user.email || "",
        status: "Active",
        source: "Admin",
        expiresAt: expiresAt || null,
        createdBy: req.user?._id || null,
        activatedAt: new Date(),
    });

    const transaction =
      await GiftCardTransaction.create({
        giftCard: giftCard._id,
        user: userId,
        type: "Issued",
        amount: numericAmount,
        balanceBefore: 0,
        balanceAfter: numericAmount,
        referenceId:
          `GIFT-${Date.now()}-${Math.floor(
            Math.random() * 100000
          )}`,
        description: "Gift card created by admin",
      });

    return res.status(201).json({
      success: true,
      message: "Gift card created successfully",
      giftCard: {
        id: giftCard._id,
        cardNumber: giftCard.cardNumber,
        pin,
        originalAmount: giftCard.originalAmount,
        remainingBalance: giftCard.remainingBalance,
        status: giftCard.status,
        recipientName: giftCard.recipientName,
        recipientEmail: giftCard.recipientEmail,
        expiresAt: giftCard.expiresAt,
        createdAt: giftCard.createdAt,
      },
      transaction,
    });
  } catch (error) {
    console.error( "Admin create gift card error:", error );

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Gift card number already exists. Please try again.",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create gift card",
    });
  }
};

const adminGetAllGiftCards = async (req, res) => {
  try {
    const giftCards =
      await GiftCard.find()
        .populate(
          "assignedTo",
          "name email mobile_number"
        )
        .populate(
          "createdBy",
          "name email"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,

      count:
        giftCards.length,

      giftCards,
    });
  } catch (error) {
    console.error(
      "Get all gift cards error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getMyGiftCards,
  adminCreateGiftCard,
  adminGetAllGiftCards,
};
