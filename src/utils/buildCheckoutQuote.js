const GiftCard = require("../models/giftCard");
const { getPlatformCharge } = require("./calculateCharges");

const { calculateCheckoutTotals, calculateGiftCardAmounts } = require("./checkoutCalculation");


const buildCheckoutQuote = async ({
  userId,
  subtotal,
  couponId = null,
  
  shipping = 0,
  tax = 0,
  giftCardId = null,
  giftCardCode = null,
  requestedGiftCardAmount = 0,
  session = null,
}) => {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  if (!Number.isFinite(Number(subtotal)) || Number(subtotal) < 0) {
    throw new Error("Invalid subtotal.");
  }

  // STEP 1: Coupon and shipping calculation
  const preliminaryQuote = await calculateCheckoutTotals({
    subtotal: Number(subtotal),
    couponId,
    userId,
    shipping: Number(shipping),
    platformCharge: 0,
    tax: Number(tax),
    giftCardBalance: 0,
    session,
  });

  // STEP 2: Calculate platform charge after coupon discount
  const discountedSubtotal = Math.max(
    0,
    Number(
      (
        Number(preliminaryQuote.subtotal) -
        Number(preliminaryQuote.coupon_discount || 0)
      ).toFixed(2)
    )
  );

  const platformCharge = Number(
    await getPlatformCharge(discountedSubtotal)
  );

  if (
    !Number.isFinite(platformCharge) ||
    platformCharge < 0
  ) {
    throw new Error("Invalid platform charge.");
  }

  // STEP 3: Calculate order total before gift card redemption
  const baseQuote = await calculateCheckoutTotals({
    subtotal: preliminaryQuote.subtotal,
    couponId: preliminaryQuote.coupon_id ?? couponId,
    userId,
    shipping: preliminaryQuote.shipping,
    platformCharge,
    tax: Number(tax),
    giftCardBalance: 0,
    session,
  });

  const orderTotal = Number(baseQuote.order_total);

  if (!Number.isFinite(orderTotal) || orderTotal < 0) {
    throw new Error(
      "Checkout calculation did not return a valid order_total."
    );
  }
  console.log("BUILD CHECKOUT QUOTE INPUT:", {
    userId: String(userId),
    couponId: couponId ? String(couponId) : null,
    giftCardId: giftCardId ? String(giftCardId) : null,
    giftCardCode: giftCardCode || null,
    requestedGiftCardAmount,
    hasGiftCardId: Boolean(giftCardId),
    hasGiftCardCode: Boolean(giftCardCode),
  });
  // STEP 4: Validate the gift card, if supplied
  let giftCard = null;

  if (giftCardId || giftCardCode) {
    const filter = {
      assignedTo: userId,
      recordType: "Issued",
      status: "Active",
      remainingBalance: { $gt: 0 },
      $or: [
        { expiresAt: null },
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } },
      ],
    };

    // Search by ID OR code, not both simultaneously
    if (giftCardId) {
      filter._id = giftCardId;
    } else {
      filter.cardNumber = giftCardCode;
    }

    giftCard = await GiftCard.findOne(filter)
      .session(session)
      .lean();

    if (!giftCard) {
      throw new Error(
        "Gift Card is invalid, expired, or unavailable."
      );
    }

    if (
      !Number.isFinite(Number(requestedGiftCardAmount)) ||
      Number(requestedGiftCardAmount) <= 0
    ) {
      throw new Error("Enter a valid Gift Card amount.");
    }
  }

  // STEP 5: Calculate gift card redemption and remaining payable
  const giftCardAmounts = calculateGiftCardAmounts({
    orderTotal,
    giftCardBalance: Number(giftCard?.remainingBalance ?? 0),
    requestedGiftCardAmount: giftCard
      ? Number(requestedGiftCardAmount)
      : 0,
    hasGiftCard: Boolean(giftCard),
  });
  console.log("GIFT CARD VALIDATION RESULT:", {
    foundGiftCard: Boolean(giftCard),
    giftCardId: giftCard?._id
      ? String(giftCard._id)
      : null,
    remainingBalance: Number(
      giftCard?.remainingBalance || 0
    ),
    requestedGiftCardAmount:
      Number(requestedGiftCardAmount || 0),
    orderTotal,
    giftCardAmounts,
  });
  // // STEP 6: Return one consistent quote
  // return {
  //   ...baseQuote,

  //   subtotal: Number(baseQuote.subtotal),
  //   coupon_id: baseQuote.coupon_id ?? couponId ?? null,
  //   coupon_discount: Number(baseQuote.coupon_discount || 0),
  //   shipping: Number(baseQuote.shipping || 0),
  //   platform_charge: platformCharge,
  //   tax: Number(baseQuote.tax ?? tax),

  //   order_total: orderTotal,

  //   ...giftCardAmounts,

  //   gift_card_id: giftCard?._id ?? null,
  //   gift_card_code: giftCard?.cardNumber ?? null,
  // };
  
  // STEP 6: Build and return one consistent quote
  const finalQuote = {
    ...baseQuote,

    subtotal: Number(baseQuote.subtotal),
    coupon_id: baseQuote.coupon_id ?? couponId ?? null,
    coupon_discount: Number(baseQuote.coupon_discount || 0),
    shipping: Number(baseQuote.shipping || 0),
    platform_charge: platformCharge,
    tax: Number(baseQuote.tax ?? tax),

    order_total: orderTotal,

    ...giftCardAmounts,

    gift_card_id: giftCard?._id ?? null,
    gift_card_code: giftCard?.cardNumber ?? null,
  };

  console.log("FINAL CHECKOUT QUOTE:", {
    order_total: finalQuote.order_total,
    gift_card_id: finalQuote.gift_card_id,
    gift_card_redeemed: finalQuote.gift_card_redeemed,
    amount_payable: finalQuote.amount_payable,
  });

  return finalQuote;

};

module.exports = { buildCheckoutQuote };
