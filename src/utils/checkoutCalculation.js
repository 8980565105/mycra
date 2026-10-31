const mongoose = require("mongoose");
const Coupon = require("../models/Coupon");

const calculateCheckoutTotals = async ({
  subtotal,
  couponId = null,
  userId,
  shipping = 0,
  platformCharge = 0,
  tax = 0,
  giftCardBalance = 0,
  session = null,
}) => {
  const safeSubtotal = Number(subtotal);
  const safeShipping = Number(shipping);
  const safePlatformCharge = Number(platformCharge);
  const safeTax = Number(tax);
  const safeGiftCardBalance = Number(giftCardBalance);

  for (const [name, value] of Object.entries({
    subtotal: safeSubtotal,
    shipping: safeShipping,
    platformCharge: safePlatformCharge,
    tax: safeTax,
    giftCardBalance: safeGiftCardBalance,
  })) {
    if (!Number.isFinite(value) || value < 0) {
      throw new Error(`Invalid ${name}`);
    }
  }

  let coupon = null;
  let couponDiscount = 0;

  if (couponId) {
    if (!mongoose.isValidObjectId(couponId)) {
      throw new Error("Invalid coupon ID");
    }

    let query = Coupon.findById(couponId);

    if (session) {
      query = query.session(session);
    }

    coupon = await query;

    if (!coupon) {
      throw new Error("Coupon not found");
    }

    const now = new Date();

    if (coupon.status !== "active") {
      throw new Error("Coupon is inactive");
    }

    if (coupon.start_date && now < new Date(coupon.start_date)) {
      throw new Error("Coupon is not active yet");
    }

    if (coupon.end_date && now > new Date(coupon.end_date)) {
      throw new Error("Coupon has expired");
    }

    if (
      safeSubtotal < Number(coupon.min_purchase_amount || 0)
    ) {
      throw new Error("Minimum purchase amount not reached");
    }

    if (
      coupon.usage_limit != null &&
      Number(coupon.used_count || 0) >= Number(coupon.usage_limit)
    ) {
      throw new Error("Coupon usage limit reached");
    }

    const discountType = String(coupon.discount_type || "")
      .trim()
      .toLowerCase();

    const discountValue = Number(coupon.discount_value);

    if (!Number.isFinite(discountValue) || discountValue < 0) {
      throw new Error("Invalid coupon discount value");
    }

    if (
      discountType === "percentage" ||
      discountType === "percent"
    ) {
      if (discountValue > 100) {
        throw new Error("Percentage cannot exceed 100");
      }

      couponDiscount = (safeSubtotal * discountValue) / 100;
    } else if (
      discountType === "fixed" ||
      discountType === "flat"
    ) {
      couponDiscount = Math.min(discountValue, safeSubtotal);
    } else if (
      discountType !== "freeshiping" &&
      discountType !== "freeshipping"
    ) {
      throw new Error(
        `Unsupported coupon type: ${coupon.discount_type}`
      );
    }

    const isFreeShipping =
      discountType === "freeshiping" ||
      discountType === "freeshipping";

    // Business rule: max_discount_amount = 0 means no cap.
    if (!isFreeShipping && coupon.max_discount_amount != null) {
      const maxDiscount = Number(coupon.max_discount_amount);

      if (!Number.isFinite(maxDiscount) || maxDiscount < 0) {
        throw new Error("Invalid maximum discount");
      }

      if (maxDiscount > 0) {
        couponDiscount = Math.min(couponDiscount, maxDiscount);
      }
    }

    couponDiscount = Number(
      Math.min(
        safeSubtotal,
        Math.max(0, couponDiscount)
      ).toFixed(2)
    );

    console.log("COUPON CALCULATION DEBUG:", {
      couponId: String(coupon._id),
      code: coupon.code,
      discountType,
      discountValue,
      maxDiscount: coupon.max_discount_amount,
      subtotal: safeSubtotal,
      couponDiscount,
    });
  }

  const finalDiscountType = String(coupon?.discount_type || "")
    .trim()
    .toLowerCase();

  const isFreeShipping = finalDiscountType === "freeshiping" || finalDiscountType === "freeshipping";

  const finalShipping = isFreeShipping ? 0 : safeShipping;

  const orderTotal = Number(
    Math.max(
      0,
      safeSubtotal -
        couponDiscount +
        finalShipping +
        safePlatformCharge +
        safeTax
    ).toFixed(2)
  );

  const giftCardRedeemed = Number(
    Math.min(orderTotal, safeGiftCardBalance).toFixed(2)
  );

  const amountPayable = Number(
    Math.max(0, orderTotal - giftCardRedeemed).toFixed(2)
  );

  const result = {
    subtotal: Number(safeSubtotal.toFixed(2)),
    coupon_id: coupon?._id || null,
    coupon_code: coupon?.code || null,
    coupon_discount: couponDiscount,
    shipping: Number(finalShipping.toFixed(2)),
    platform_charge: Number(safePlatformCharge.toFixed(2)),
    tax: Number(safeTax.toFixed(2)),
    order_total: orderTotal,
    gift_card_id: null,
    gift_card_redeemed: giftCardRedeemed,
    amount_payable: amountPayable,
  };

  console.log("CHECKOUT QUOTE DEBUG:", {
    userId: userId ? String(userId) : null, ...result,
  });

  return result;
};

function calculateGiftCardAmounts({
  orderTotal,
  giftCardBalance = 0,
  requestedGiftCardAmount = 0,
  hasGiftCard = false,
}) {
  const total = Math.max(0, Number(orderTotal) || 0);
  const balance = Math.max(0, Number(giftCardBalance) || 0);
  const requested = Math.max(
    0,
    Number(requestedGiftCardAmount) || 0
  );

  const giftCardRedeemed = hasGiftCard
    ? Number(Math.min(total, balance, requested).toFixed(2))
    : 0;

  const amountPayable = Number(
    Math.max(0, total - giftCardRedeemed).toFixed(2)
  );

  return {
    order_total: Number(total.toFixed(2)),
    gift_card_redeemed: giftCardRedeemed,
    amount_payable: amountPayable,
  };
}


module.exports = { calculateCheckoutTotals, calculateGiftCardAmounts };
