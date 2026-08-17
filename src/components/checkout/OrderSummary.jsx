import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import { fetchCart } from "../../features/cart/cartThunk";
import { createOrder } from "../../features/orders/orderThunk";
import { getImageUrl } from "../utils/helper";
import { getItemShipping, getPlatformCharge } from "../../utils/chargecalculet";
import { fetchPublicSettings } from "../../features/setting/settingThunk";
import Button from "../ui/Button";

export default function OrderSummary({
  formData,
  appliedCoupon,
  paymentMethod,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items = [], loading } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const { data: settings } = useSelector((state) => state.settings);
  const { loading: orderLoading } = useSelector((state) => state.orders);
  useEffect(() => {
    const cart_id = localStorage.getItem("cart_id");
    if (user && cart_id) {
      dispatch(fetchCart(cart_id));
    }
    dispatch(fetchPublicSettings());
  }, [dispatch, user]);
  if (loading) {
    return <p className="text-center">Loading cart...</p>;
  }
  if (!items.length) {
    return <p className="text-center mb-[100px]">Your cart is empty.</p>;
  }
  const getDiscountedPrice = (item) => {
    if (item.is_gift) {
      return {
        discount: 0,
        originalPrice: 0,
        discountedPrice: 0,
      };
    }
    const offerPrice = Number(item?.variant_id?.offerprice) || 0;
    const originalPrice = Number(item?.variant_id?.price) || 0;
    return {
      discount: offerPrice,
      originalPrice,
      discountedPrice: offerPrice,
    };
  };
  const subtotal = items.reduce((sum, item) => {
    const { discountedPrice } = getDiscountedPrice(item);
    return sum + discountedPrice * (item.quantity || 1);
  }, 0);
  let discountAmount = 0;
  if (appliedCoupon) {
    const couponStoreIds = (appliedCoupon?.storeIds || []).map((store) =>
      typeof store === "object" ? String(store._id) : String(store),
    );
    if (appliedCoupon?.storeId) {
      const storeId =
        typeof appliedCoupon.storeId === "object"
          ? String(appliedCoupon.storeId._id)
          : String(appliedCoupon.storeId);
      if (!couponStoreIds.includes(storeId)) {
        couponStoreIds.push(storeId);
      }
    }
    const isGlobalCoupon = Boolean(
      appliedCoupon?.is_global ||
      (!appliedCoupon?.storeId && couponStoreIds.length === 0),
    );
    const couponProductIds = (appliedCoupon.products || []).map((product) =>
      typeof product === "object" ? String(product._id) : String(product),
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
      discountAmount = Math.min(
        Number(appliedCoupon.discount_value) || 0,
        eligibleSubtotal,
      );
    }
    if (appliedCoupon.discount_type === "percentage") {
      discountAmount =
        (eligibleSubtotal * Number(appliedCoupon.discount_value)) / 100;
    }
    if (appliedCoupon.max_discount_amount) {
      discountAmount = Math.min(
        discountAmount,
        Number(appliedCoupon.max_discount_amount),
      );
    }
  }
  const discountedTotal = subtotal - discountAmount;
  const shipping = items.reduce((sum, item) => {
    return sum + getItemShipping(item, discountedTotal) * (item.quantity || 1);
  }, 0);
  const platformCharge = getPlatformCharge(settings, discountedTotal);
  const total = Number(
    (discountedTotal + shipping + platformCharge).toFixed(2),
  );
  const getVariantInfo = (item) => {
    const sku = item?.variant_id?.sku;
    if (!sku) return null;
    const parts = sku.split("-");
    return {
      color: parts[1] || "",
      size: parts[2] || "",
    };
  };
  const handleContinueToPayment = async () => {
    const userLS = JSON.parse(localStorage.getItem("user"));

    if (!userLS?._id) {
      toast.error("Please login before placing order");
      navigate("/login");
      return;
    }

    const requiredFields = {
      email: "Email Address",
      firstName: "First Name",
      lastName: "Last Name",
      address: "Address",
      country: "Country",
      state: "State",
      city: "City",
      pincode: "Pin Code",
    };

    for (const [key, label] of Object.entries(requiredFields)) {
      const value = formData[key];
      if (!value || String(value).trim() === "") {
        toast.error(`Please enter ${label}`);
        return;
      }
    }

    const cart_id = localStorage.getItem("cart_id");
    if (!cart_id) {
      toast.error("Cart not found");
      return;
    }

    const shippingAddress = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      address: formData.address,
      country: formData.country,
      state: formData.state,
      city: formData.city,
      pincode: formData.pincode,
      phone: formData.phone,
    };

    sessionStorage.setItem(
      "checkoutInfo",
      JSON.stringify({
        cart_id,
        email: formData.email,
        shippingAddress,
        coupon_id: appliedCoupon?._id || null,
        subtotal,
        discountAmount,
        shipping,
        platformCharge,
        total,
        items: items.map((item) => ({
          variant_id: item.variant_id?._id || item.variant_id,
          quantity: item.quantity,
        })),
      }),
    );

    navigate("/payment");
  };
  return (
    <>
      <Toaster position="top-center" />
      <div className="w-full rounded-[3px] py-[45px] px-[22px] light-color">
        <h2 className="text-[22px] text-black mb-[50px] text-center">
          Order Summary
          <div className="flex justify-center">
            <span className="theme-border-block w-[34px] h-[2px] rounded-[10px] block" />
          </div>
        </h2>
        <div className="pb-[10px] text-p">
          {items.reduce((sum, item) => sum + (item.quantity || 1), 0)} items
        </div>
        {items.map((item, index) => {
          const variant = getVariantInfo(item);
          return (
            <React.Fragment key={item._id || index}>
              <div className="flex py-[15px]">
                <div className="relative w-[80px] md:w-[105px] h-auto flex-shrink-0">
                  <Link to={`/products/${item.product_id?._id}`}>
                    <img
                      src={
                        item.variant_id?.images?.length > 0
                          ? getImageUrl(item.variant_id.images[0])
                          : getImageUrl(item.product_id?.images?.[0])
                      }
                      alt={item.product_id?.name}
                      className="w-full h-[122px] md:h-[150px] object-cover"
                    />
                  </Link>
                  <span className="absolute top-[-10px] right-[-10px] w-[22px] h-[22px] bg-white text-black text-p rounded-full flex items-center justify-center">
                    {item.quantity || 1}
                  </span>
                </div>
                <div className="flex justify-between gap-[10px] flex-1 ml-4">
                  <div>
                    <p className="text-14 text-gray-700 line-clamp-3">
                      {item.product_id?.name}
                    </p>
                    {variant && (
                      <p className="text-12 text-gray-500 mt-1 flex flex-col">
                        {variant.color && <span>Color: {variant.color}</span>}

                        {variant.size && <span>Size: {variant.size}</span>}
                      </p>
                    )}
                  </div>
                  <p className="text-p text-right">
                    ₹
                    {Math.round(
                      getDiscountedPrice(item).discountedPrice * item.quantity,
                    ).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
              <div className="border border-1 light-border" />
            </React.Fragment>
          );
        })}
        <div className="space-y-[14px] text-p mt-3 text-light">
          <div className="flex justify-between text-black">
            <span>Subtotal</span>
            <span>₹ {Math.round(subtotal).toLocaleString("en-IN")}</span>
          </div>
          {appliedCoupon && (
            <div className="flex justify-between text-green-600">
              <span>Coupon ({appliedCoupon.code})</span>
              <span>
                - ₹ {Math.round(discountAmount).toLocaleString("en-IN")}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>
              {shipping > 0
                ? `₹ ${Math.round(shipping).toLocaleString("en-IN")}`
                : "Free"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Platform Charge</span>
            <span>
              {platformCharge > 0
                ? `₹ ${Math.round(platformCharge).toLocaleString("en-IN")}`
                : "Free"}
            </span>
          </div>
          <div className="border border-1 light-border" />
          <div className="flex justify-between text-p text-black">
            <span>Total (₹)</span>
            <span className="text-20px font-medium">
              ₹{Math.round(total).toLocaleString("en-IN")}
            </span>
          </div>
        </div>
        <div className="text-center mt-[50px]">
          <Button
            variant="common"
            className="min-w-auto sm:min-w-[300px] uppercase"
            onClick={handleContinueToPayment}
          >
            CONTINUE TO PAYMENT
          </Button>
        </div>
      </div>
    </>
  );
}
