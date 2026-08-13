import React from "react";
import Button from "../ui/Button";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { getItemShipping } from "../../utils/chargecalculet";

export default function CartSummary({ appliedCoupon }) {
  const { items = [] } = useSelector((state) => state.cart);
  
  const getDiscountedPrice = (item) => {
    if (item.is_gift) {
      return { discount: 0, originalPrice: 0, discountedPrice: 0 };
    }
    const discount = item?.variant_id?.offerprice || 0;
    const originalPrice = item?.variant_id?.price || 0;
    const discountedPrice = discount;
    return { discount, originalPrice, discountedPrice };
  };
  const subtotal = items.reduce((sum, item) => {
    const { discountedPrice } = getDiscountedPrice(item);
    return sum + discountedPrice * (item.quantity || 1);
  }, 0);

  let discountAmount = 0;
  if (appliedCoupon) {
    const couponStoreIds = (appliedCoupon?.storeIds || []).map((s) =>
      typeof s === "object" ? String(s._id) : String(s),
    );
    if (appliedCoupon?.storeId) {
      const sId =
        typeof appliedCoupon.storeId === "object"
          ? String(appliedCoupon.storeId._id)
          : String(appliedCoupon.storeId);
      if (!couponStoreIds.includes(sId)) couponStoreIds.push(sId);
    }

    const isGlobalCoupon = Boolean(
      appliedCoupon?.is_global ||
      (!appliedCoupon?.storeId && couponStoreIds.length === 0),
    );

    const couponProductIds = (appliedCoupon.products || []).map((p) =>
      typeof p === "object" ? String(p._id) : String(p),
    );

    const eligibleItems = items.filter((item) => {
      const itemStoreId = item?.product_id?.storeId?._id
        ? String(item.product_id.storeId._id)
        : item?.product_id?.storeId
          ? String(item.product_id.storeId)
          : null;

      if (!isGlobalCoupon && couponStoreIds.length > 0) {
        if (!itemStoreId || !couponStoreIds.includes(itemStoreId)) {
          return false;
        }
      }

      const productId = item?.product_id?._id
        ? String(item.product_id._id)
        : String(item.product_id);

      if (appliedCoupon.apply_type === "specificproducts") {
        return couponProductIds.includes(productId);
      }
      if (appliedCoupon.apply_type === "Excludeproduct") {
        return !couponProductIds.includes(productId);
      }

      return true;
    });

    const eligibleSubtotal = eligibleItems.reduce((sum, item) => {
      const { discountedPrice } = getDiscountedPrice(item);
      return sum + discountedPrice * (item.quantity || 1);
    }, 0);

    if (appliedCoupon.discount_type === "fixed") {
      discountAmount = Math.min(appliedCoupon.discount_value, eligibleSubtotal);
    } else if (appliedCoupon.discount_type === "percentage") {
      discountAmount = (eligibleSubtotal * appliedCoupon.discount_value) / 100;
    }

    if (appliedCoupon.max_discount_amount) {
      discountAmount = Math.min(
        discountAmount,
        appliedCoupon.max_discount_amount,
      );
    }
  }
  const discountedTotal = subtotal - discountAmount;

  const shipping = items.reduce((sum, item) => {
    return sum + getItemShipping(item, discountedTotal) * (item.quantity || 1);
  }, 0);

  const total = discountedTotal + shipping;

  return (
    <div className="w-full rounded-[3px] py-[45px] px-[22px] light-color ">
      <h2 className="text-[22px] text-black mb-[50px] text-center">
        Subtotal
        <div className="flex justify-center">
          <span className="theme-border-block w-[34px] h-[2px] rounded-[10px] block"></span>
        </div>
      </h2>
      <div className="space-y-[25px] text-light text-p mb-[50px]">
        <div className="border border-1 light-border" />

        <div className="flex justify-between">
          <span>Sub-Total:</span>
          <span>₹{Math.round(subtotal).toLocaleString("en-IN")}</span>
        </div>

        {appliedCoupon && (
          <div className="flex justify-between text-green-600 pb-[10px]">
            <span>Coupon ({appliedCoupon.code}):</span>
            <span>- ₹{Math.round(discountAmount).toLocaleString("en-IN")}</span>
          </div>
        )}

        <div className="border border-1 light-border !mt-0" />

        <div className="flex justify-between">
          <span>After Discount:</span>
          <span>{subtotal - discountAmount}</span>
        </div>

        <div className="flex justify-between pb-[10px]">
          <span>Shipping-Cost:</span>
          <span>
            {shipping > 0
              ? `₹ ${Math.round(shipping).toLocaleString("en-IN")}`
              : "Free"}
          </span>
        </div>

        <div className="border border-1 light-border !mt-0" />

        <div className="flex justify-between font-bold">
          <span>TOTAL:</span>
          <span>₹{Math.round(total).toLocaleString("en-IN")}</span>
        </div>
      </div>

      <div className="text-center flex flex-col gap-[20px]">
        <label className="font-18 text-black leading">Order Note:</label>
        <textarea
          rows={3}
          className="w-full h-[114px] box-shadow p-2 text-sm focus:ring-1 focus:ring-pink-500"
        />
      </div>
      <div className="text-center">
        <Link to="/checkout">
          <Button
            variant="common"
            className="min-w-auto sm:min-w-[211px] mt-[50px] uppercase"
          >
            PROCEED CHECKOUT
          </Button>
        </Link>
      </div>
    </div>
  );
}
