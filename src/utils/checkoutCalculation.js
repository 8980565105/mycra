
const mongoose = require("mongoose");
const Coupon = require("../models/Coupon");

/**
 * Calculates checkout totals from server-calculated values.
 *
 * subtotal: product subtotal before coupon
 * shipping: server-calculated shipping
 * platformCharge: server-calculated platform fee
 * tax: server-calculated tax
 * giftCardBalance: validated gift-card balance
 */
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

  let couponDiscount = 0;
  let coupon = null;

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

    if (coupon.status !== "active") {
      throw new Error("Coupon is inactive");
    }

    const now = new Date();

    if (coupon.start_date && now < new Date(coupon.start_date)) {
      throw new Error("Coupon is not active yet");
    }

    if (coupon.end_date && now > new Date(coupon.end_date)) {
      throw new Error("Coupon has expired");
    }

    if (safeSubtotal < Number(coupon.min_purchase_amount || 0)) {
      throw new Error("Minimum purchase amount not reached");
    }

    if (
      coupon.usage_limit != null &&
      coupon.used_count >= coupon.usage_limit
    ) {
      throw new Error("Coupon usage limit reached");
    }

    if (coupon.discount_type === "percentage") {
      const percentage = Number(coupon.discount_value || 0);

      if (percentage < 0 || percentage > 100) {
        throw new Error("Invalid coupon percentage");
      }

      couponDiscount = (safeSubtotal * percentage) / 100;
    } else if (coupon.discount_type === "fixed") {
      couponDiscount = Number(coupon.discount_value || 0);
    } else if (coupon.discount_type === "freeshiping") {
      // Free shipping is applied to shipping below.
      couponDiscount = 0;
    } else {
      throw new Error("Unsupported coupon type");
    }

    if (coupon.discount_type !== "freeshiping") {
      if (coupon.max_discount_amount != null) {
        couponDiscount = Math.min(
          couponDiscount,
          Number(coupon.max_discount_amount)
        );
      }

      couponDiscount = Math.min(safeSubtotal, couponDiscount);
    }
  }

  couponDiscount = Number(Math.max(0, couponDiscount).toFixed(2));

  const finalShipping =
    coupon?.discount_type === "freeshiping" ? 0 : safeShipping;

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

  return {
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
};

module.exports = { calculateCheckoutTotals };
