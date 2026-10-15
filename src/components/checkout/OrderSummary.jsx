// import React, { useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import toast, { Toaster } from "react-hot-toast";
// import { fetchCart } from "../../features/cart/cartThunk";
// import { createOrder } from "../../features/orders/orderThunk";
// import { getImageUrl } from "../utils/helper";
// import { getItemShipping, getPlatformCharge } from "../../utils/chargecalculet";
// import { fetchPublicSettings } from "../../features/setting/settingThunk";
// import Button from "../ui/Button";

// export default function OrderSummary({
//   formData,
//   appliedCoupon,
//   paymentMethod,
// }) {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { items = [], loading } = useSelector((state) => state.cart);
//   const { user } = useSelector((state) => state.auth);
//   const { data: settings } = useSelector((state) => state.settings);
//   const { loading: orderLoading } = useSelector((state) => state.orders);
//   useEffect(() => {
//     const cart_id = localStorage.getItem("cart_id");
//     if (user && cart_id) {
//       dispatch(fetchCart(cart_id));
//     }
//     dispatch(fetchPublicSettings());
//   }, [dispatch, user]);
//   if (loading) {
//     return <p className="text-center">Loading cart...</p>;
//   }
//   if (!items.length) {
//     return <p className="text-center mb-[100px]">Your cart is empty.</p>;
//   }
//   const getDiscountedPrice = (item) => {
//     if (item.is_gift) {
//       return {
//         discount: 0,
//         originalPrice: 0,
//         discountedPrice: 0,
//       };
//     }
//     const offerPrice = Number(item?.variant_id?.offerprice) || 0;
//     const originalPrice = Number(item?.variant_id?.price) || 0;
//     return {
//       discount: offerPrice,
//       originalPrice,
//       discountedPrice: offerPrice,
//     };
//   };
//   const subtotal = items.reduce((sum, item) => {
//     const { discountedPrice } = getDiscountedPrice(item);
//     return sum + discountedPrice * (item.quantity || 1);
//   }, 0);
//   let discountAmount = 0;
//   if (appliedCoupon) {
//     const couponStoreIds = (appliedCoupon?.storeIds || []).map((store) =>
//       typeof store === "object" ? String(store._id) : String(store),
//     );
//     if (appliedCoupon?.storeId) {
//       const storeId =
//         typeof appliedCoupon.storeId === "object"
//           ? String(appliedCoupon.storeId._id)
//           : String(appliedCoupon.storeId);
//       if (!couponStoreIds.includes(storeId)) {
//         couponStoreIds.push(storeId);
//       }
//     }
//     const isGlobalCoupon = Boolean(
//       appliedCoupon?.is_global ||
//       (!appliedCoupon?.storeId && couponStoreIds.length === 0),
//     );
//     const couponProductIds = (appliedCoupon.products || []).map((product) =>
//       typeof product === "object" ? String(product._id) : String(product),
//     );
//     const eligibleItems = items.filter((item) => {
//       const itemStoreId = item?.product_id?.storeId?._id
//         ? String(item.product_id.storeId._id)
//         : item?.product_id?.storeId
//           ? String(item.product_id.storeId)
//           : null;
//       if (!isGlobalCoupon && couponStoreIds.length > 0) {
//         if (!itemStoreId || !couponStoreIds.includes(itemStoreId)) {
//           return false;
//         }
//       }
//       const productId = item?.product_id?._id
//         ? String(item.product_id._id)
//         : String(item.product_id);
//       if (appliedCoupon.apply_type === "specificproducts") {
//         return couponProductIds.includes(productId);
//       }
//       if (appliedCoupon.apply_type === "Excludeproduct") {
//         return !couponProductIds.includes(productId);
//       }
//       return true;
//     });
//     const eligibleSubtotal = eligibleItems.reduce((sum, item) => {
//       const { discountedPrice } = getDiscountedPrice(item);
//       return sum + discountedPrice * (item.quantity || 1);
//     }, 0);
//     if (appliedCoupon.discount_type === "fixed") {
//       discountAmount = Math.min(
//         Number(appliedCoupon.discount_value) || 0,
//         eligibleSubtotal,
//       );
//     }
//     if (appliedCoupon.discount_type === "percentage") {
//       discountAmount =
//         (eligibleSubtotal * Number(appliedCoupon.discount_value)) / 100;
//     }
//     if (appliedCoupon.max_discount_amount) {
//       discountAmount = Math.min(
//         discountAmount,
//         Number(appliedCoupon.max_discount_amount),
//       );
//     }
//   }
//   const discountedTotal = subtotal - discountAmount;
//   const shipping = items.reduce((sum, item) => {
//     return sum + getItemShipping(item, discountedTotal) * (item.quantity || 1);
//   }, 0);
//   const platformCharge = getPlatformCharge(settings, discountedTotal);
//   const total = Number(
//     (discountedTotal + shipping + platformCharge).toFixed(2),
//   );
//   const getVariantInfo = (item) => {
//     const sku = item?.variant_id?.sku;
//     if (!sku) return null;
//     const parts = sku.split("-");
//     return {
//       color: parts[1] || "",
//       size: parts[2] || "",
//     };
//   };
//   const handleContinueToPayment = async () => {
//     const userLS = JSON.parse(localStorage.getItem("user"));

//     if (!userLS?._id) {
//       toast.error("Please login before placing order");
//       navigate("/login");
//       return;
//     }

//     const requiredFields = {
//       email: "Email Address",
//       firstName: "Full Name",
//       address: "Address",
//       country: "Country",
//       state: "State",
//       city: "City",
//       pincode: "Pin Code",
//     };

//     for (const [key, label] of Object.entries(requiredFields)) {
//       const value = formData[key];
//       if (!value || String(value).trim() === "") {
//         toast.error(`Please enter ${label}`);
//         return;
//       }
//     }

//     const cart_id = localStorage.getItem("cart_id");
//     if (!cart_id) {
//       toast.error("Cart not found");
//       return;
//     }

//     const shippingAddress = {
//       firstName: formData.firstName,
//       lastName: formData.lastName,
//       address: formData.address,
//       country: formData.country,
//       state: formData.state,
//       city: formData.city,
//       pincode: formData.pincode,
//       phone: formData.phone,
//     };

//     sessionStorage.setItem(
//       "checkoutInfo",
//       JSON.stringify({
//         cart_id,
//         email: formData.email,
//         shippingAddress,
//         coupon_id: appliedCoupon?._id || null,
//         subtotal,
//         discountAmount,
//         shipping,
//         platformCharge,
//         total,
//         items: items.map((item) => ({
//           variant_id: item.variant_id?._id || item.variant_id,
//           quantity: item.quantity,
//         })),
//       }),
//     );

//     navigate("/payment");
//   };
//   return (
//     <>
//       <Toaster position="top-center" />
//       <div className="w-full rounded-[3px] py-[45px] px-[22px] light-color sticky top-[120px]">
//         <h2 className="text-[22px] text-black mb-[50px] text-center">
//           Order Summary
//           <div className="flex justify-center">
//             <span className="theme-border-block w-[34px] h-[2px] rounded-[10px] block" />
//           </div>
//         </h2>
//         <div className="space-y-[14px] text-p text-light">
//           <div className="flex justify-between text-black">
//             <span>Subtotal</span>
//             <span>₹ {Math.round(subtotal).toLocaleString("en-IN")}</span>
//           </div>
//           {appliedCoupon && (
//             <div className="flex justify-between text-green-600">
//               <span>Coupon ({appliedCoupon.code})</span>
//               <span>
//                 - ₹ {Math.round(discountAmount).toLocaleString("en-IN")}
//               </span>
//             </div>
//           )}
//           <div className="flex justify-between">
//             <span>Shipping</span>
//             <span>
//               {shipping > 0
//                 ? `₹ ${Math.round(shipping).toLocaleString("en-IN")}`
//                 : "Free"}
//             </span>
//           </div>
//           <div className="flex justify-between">
//             <span>Platform Charge</span>
//             <span>
//               {platformCharge > 0
//                 ? `₹ ${Math.round(platformCharge).toLocaleString("en-IN")}`
//                 : "Free"}
//             </span>
//           </div>
//           <div className="border border-1 light-border" />
//           <div className="flex justify-between text-p text-black">
//             <span>Total (₹)</span>
//             <span className="text-20px font-medium">
//               ₹{Math.round(total).toLocaleString("en-IN")}
//             </span>
//           </div>
//         </div>
//         <div className="text-center mt-[50px]">
//           <Button
//             variant="common"
//             className="min-w-auto sm:min-w-[300px] uppercase"
//             onClick={handleContinueToPayment}
//           >
//             PLACE ORDER
//           </Button>
//         </div>
//       </div>
//     </>
//   );
// }


import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import { fetchCart } from "../../features/cart/cartThunk";
import { fetchPublicSettings } from "../../features/setting/settingThunk";
import { getMyGiftCards } from "../../features/giftCards/giftCardThunk";
import {getItemShipping, getPlatformCharge,} from "../../utils/chargecalculet";
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
  const {
    giftCardBalance = 0,
    myGiftCardsLoading = false,
    myGiftCardsError = null,
  } = useSelector((state) => state.giftCards);

  const checkoutInfo = (() => {
    try {
      return JSON.parse(
        sessionStorage.getItem("checkoutInfo") || "null"
      );
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    const cartId = localStorage.getItem("cart_id");

    if (user) {
      if (cartId) {
        dispatch(fetchCart(cartId));
      }
      dispatch(getMyGiftCards());
    }
    dispatch(fetchPublicSettings());
  }, [dispatch, user]);

  const formatPrice = (amount) => `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2, maximumFractionDigits: 2,
    })}`;

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
      discount: originalPrice - offerPrice,
      originalPrice,
      discountedPrice: offerPrice,
    };
  };

  if (loading) {
    return <p className="text-center">Loading cart...</p>;
  }
  if (!items.length) {
    return (
      <p className="text-center mb-[100px]">
        Your cart is empty.
      </p>
    );
  }
  const subtotal = items.reduce((sum, item) => {
    const { discountedPrice } = getDiscountedPrice(item);
    return (
      sum + discountedPrice * (Number(item.quantity) || 1)
    );
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
      if (
        !isGlobalCoupon &&  couponStoreIds.length > 0 &&
        (!itemStoreId || !couponStoreIds.includes(itemStoreId))
      ) {
        return false;
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
      return (
        sum + discountedPrice * (Number(item.quantity) || 1)
      );
    }, 0);
    if (appliedCoupon.discount_type === "fixed") {
      discountAmount = Math.min(
        Number(appliedCoupon.discount_value) || 0,
        eligibleSubtotal,
      );
    }
    if (appliedCoupon.discount_type === "percentage") {
      discountAmount =
        (eligibleSubtotal * (Number(appliedCoupon.discount_value) || 0)) / 100;
    }
    if (appliedCoupon.max_discount_amount) {
      discountAmount = Math.min(
        discountAmount,
        Number(appliedCoupon.max_discount_amount),
      );
    }
  }
  discountAmount = Math.min(Math.max(0, discountAmount), subtotal);

  const discountedTotal = Math.max(0, subtotal - discountAmount);
  const shipping = items.reduce((sum, item) => {
    return (
      sum + getItemShipping(item, discountedTotal) * (Number(item.quantity) || 1)
    );
  }, 0);

  const platformCharge = getPlatformCharge(settings, discountedTotal);
  const tax = Math.max(0, Number(checkoutInfo?.tax) || 0);
  const orderTotal = Number(
    (discountedTotal +  shipping + platformCharge + tax).toFixed(2)
  );

  const availableGiftCardBalance = Math.max(0, Number(giftCardBalance) || 0);

  const giftCardRedeemed = myGiftCardsLoading
    ? 0 : Number(
        Math.min(availableGiftCardBalance, orderTotal).toFixed(2)
      );

  const creditCardPayment = Number(Math.max(0, orderTotal - giftCardRedeemed).toFixed(2));
  const handleContinueToPayment = async () => {
    let userLS;

    try {
      userLS = JSON.parse(
        localStorage.getItem("user") || "null"
      );
    } catch {
      userLS = null;
    }

    if (!userLS?._id) {
      toast.error("Please login before placing order");
      navigate("/login");
      return;
    }

    const requiredFields = {
      email: "Email Address",
      firstName: "Full Name",
      address: "Address",
      country: "Country",
      state: "State",
      city: "City",
      pincode: "Pin Code",
    };

    for (const [key, label] of Object.entries(requiredFields)) {
      const value = formData?.[key];

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
    if (myGiftCardsLoading) {
      toast.error("Please wait while we check your gift card balance.");
      return;
    }

    if (myGiftCardsError) {
      toast.error(
        "Unable to verify gift card balance. Please try again."
      );
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
        ...checkoutInfo,
        cart_id,
        email: formData.email,
        shippingAddress,
        coupon_id: appliedCoupon?._id || null,
        subtotal,
        discountAmount,
        shipping,
        platformCharge,
        tax,
        orderTotal,
        giftCardRedeemed,
        creditCardPayment,
        useGiftCardBalance: giftCardRedeemed > 0,
        paymentMethod: paymentMethod || null,
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
      <div className="w-full rounded-[3px] py-[45px] px-[22px] light-color sticky top-[120px]">
         <h2 className="text-[22px] text-black mb-[50px] text-center">
          Order Summary
          <div className="flex justify-center">
            <span className="theme-border-block w-[34px] h-[2px] rounded-[10px] block" />
          </div>
        </h2>
        <div className="space-y-[20px] text-p text-light">
          <div className="flex justify-between text-black">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {appliedCoupon && discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Coupon ({appliedCoupon.code})</span>
              <span>-{formatPrice(discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>
              {shipping > 0 ? formatPrice(shipping) : "FREE"}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Tax</span>
            <span>{formatPrice(tax)}</span>
          </div>

          {platformCharge > 0 && (
            <div className="flex justify-between">
              <span>Platform Charge</span>
              <span>{formatPrice(platformCharge)}</span>
            </div>
          )}

          <div className="flex justify-between  border-t light-border pt-[20px]">
            <span>Gift Card Redeemed</span>
            <span className="text-green-600">
              {myGiftCardsLoading
                ? "Checking..."
                : giftCardRedeemed > 0
                  ? `-${formatPrice(giftCardRedeemed)}`
                  : formatPrice(0)}
            </span>
          </div>

          <div className="flex justify-between ">
            <span>Remaining Payment</span>
            <span>{formatPrice(creditCardPayment)}</span>
          </div>
          <div className="flex justify-between text-p text-black border-t light-border pt-[20px] ">
            <span className="text-[20px] font-semibold">Order total</span>
            <span className="text-[20px] font-medium">
              {formatPrice(orderTotal)}
            </span>
          </div>

          {myGiftCardsError && (
            <p className="text-sm text-red-600">
              Gift card balance could not be verified.
            </p>
          )}
        </div>
        <div className="text-center mt-[35px]">
          <Button
            variant="common"
            className="min-w-auto sm:min-w-[300px] uppercase"
            onClick={handleContinueToPayment}
            disabled={
              orderLoading ||
              myGiftCardsLoading ||
              Boolean(myGiftCardsError)
            }
          >
            {orderLoading
              ? "Processing..."
              : myGiftCardsLoading
                ? "Checking Gift Card..."
                : "PLACE ORDER"}
          </Button>
        </div>
      </div>
    </>
  );
}
