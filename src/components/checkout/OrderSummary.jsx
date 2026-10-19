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



import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import { fetchCart } from "../../features/cart/cartThunk";
import { fetchPublicSettings } from "../../features/setting/settingThunk";
import { getMyGiftCards, validateGiftCard } from "../../features/giftCards/giftCardThunk";
import {getItemShipping, getPlatformCharge,} from "../../utils/chargecalculet";
import Button from "../ui/Button";
import { removeAppliedGiftCard } from "../../features/giftCards/giftCradSlice";
import { Gift, GiftIcon } from "lucide-react";

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
  const { appliedGiftCard, loading: giftCardApplying, error: giftCardError } = useSelector((state) => state.giftCards);
  const [giftCardCode, setGiftCardCode] = useState("");

  const [checkoutInfo, setCheckoutInfo] = useState(() => {
    try {
      return (
        JSON.parse(sessionStorage.getItem("checkoutInfo") || "null") || {}
      );
    } catch {
      return {};
    }
  });

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
        originalPrice: 0,
        discountedPrice: 0,
      };
    }
    const offerPrice = Number(item?.variant_id?.offerprice) || 0;
    const originalPrice = Number(item?.variant_id?.price) || 0;
    return {
      originalPrice,
      discountedPrice: offerPrice,
    };
  };

  const subtotal = items.reduce((sum, item) => {
    const { discountedPrice } = getDiscountedPrice(item);
    const quantity = Number(item?.quantity) || 1;
    return sum + discountedPrice * quantity;
  }, 0);
  let discountAmount = 0;
  if (appliedCoupon) {
    const couponStoreIds = (appliedCoupon?.storeIds || []).map((store) =>
      typeof store === "object" ? String(store._id) : String(store),
    );
    if (appliedCoupon?.storeId) {
      const storeId =
        typeof appliedCoupon.storeId === "object"
          ? String(appliedCoupon.storeId?._id || "")
          : String(appliedCoupon.storeId);
      if (storeId && !couponStoreIds.includes(storeId)) {
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
      const storeValue = item?.product_id?.storeId;
      const itemStoreId = typeof storeValue === "object"
        ? String(storeValue?._id || "")
        : String(storeValue || "");

      if (
        !isGlobalCoupon &&  couponStoreIds.length > 0 &&
        (!itemStoreId || !couponStoreIds.includes(itemStoreId))
      ) {
        return false;
      }
      const productValue = item?.product_id;
      const productId = typeof productValue === "object"
          ? String(productValue?._id || "")
          : String(productValue || "");

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
    const discountValue = Number(appliedCoupon?.discount_value) || 0;

    if (appliedCoupon?.discount_type === "fixed") {
      discountAmount = Math.min(
        Math.max(0, discountValue), eligibleSubtotal
      );
    }

    if (appliedCoupon?.discount_type === "percentage") {
      discountAmount = (eligibleSubtotal * Math.max(0, discountValue))/100;
    }
    if (appliedCoupon.max_discount_amount) {
      discountAmount = Math.min(
        discountAmount,
        Math.max(0, Number(appliedCoupon.max_discount_amount) || 0)
      );
    }
  }

  discountAmount = Number(Math.min(Math.max(0, discountAmount), subtotal).toFixed(2));

  const discountedTotal = Number(Math.max(0, subtotal - discountAmount).toFixed(2));
  const shipping = Number(items.reduce((sum, item) => {
      return (
        sum + (Number(getItemShipping(item, discountedTotal)) || 0) * (Number(item?.quantity) || 1)
      );
    }, 0).toFixed(2)
  );

  const platformCharge = Number((Number(getPlatformCharge(settings, discountedTotal)) || 0).toFixed(2));
  const tax = Number(Math.max(0, Number(checkoutInfo?.tax) || 0).toFixed(2));
  const orderTotal = Number(
    (discountedTotal +  shipping + platformCharge + tax).toFixed(2)
  );

  const giftCardBalance = Math.max(0, Number(appliedGiftCard?.remainingBalance) || 0);

  const giftCardRedeemed = Number(Math.min(giftCardBalance, Math.max(0, orderTotal)).toFixed(2));
  const creditCardPayment = Number(Math.max(0, orderTotal - giftCardRedeemed).toFixed(2));
  const remainingPayment = creditCardPayment;
  const handleApplyGiftCard = async () => {
    const code = giftCardCode.trim().toUpperCase();

    if (!code) {
      toast.error("Please enter your Gift Card code.");
      return;
    }

    if (appliedGiftCard) {
      toast.error("A Gift Card is already applied.");
      return;
    }

    if (!user) {
      toast.error("Please login before applying a Gift Card.");
      navigate("/login");
      return;
    }

    try {
      const result = await dispatch(
        validateGiftCard({ code })
      ).unwrap();

      const card = result?.data?.giftCard || result?.giftCard;

      if (
        !card?._id ||
        !Number.isFinite(Number(card.remainingBalance)) ||
        Number(card.remainingBalance) <= 0
      ) {
        throw new Error("Gift Card has no available balance.");
      }

      setGiftCardCode("");
      toast.success("Gift Card applied successfully.");
    } catch (error) {
      toast.error(
        typeof error === "string"
          ? error
          : error?.message || "Unable to apply Gift Card."
      );
    }
  };

  const handleRemoveGiftCard = () => {
    dispatch(removeAppliedGiftCard());
    setGiftCardCode("");
    toast.success("Gift Card removed.");
  };

  const handleContinueToPayment = () => {
    let userLS = null;

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

    if (appliedGiftCard && (!appliedGiftCard._id || giftCardBalance <= 0)) {
      toast.error(
        "Please apply a valid Gift Card again"
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

    const updatedCheckoutInfo = {
        ...checkoutInfo,
        cart_id,
        email: formData.email,
        shippingAddress,
        coupon_id: appliedCoupon?._id || null,
        subtotal: Number(subtotal.toFixed(2)),
        discountAmount: Number(discountAmount.toFixed(2)),
        shipping: Number(shipping.toFixed(2)),
        platformCharge: Number(platformCharge.toFixed(2)),
        tax: Number(tax.toFixed(2)),
        orderTotal,
        appliedGiftCardId: appliedGiftCard?._id || null,
        giftCardCode: appliedGiftCard?.code || null,
        useGiftCardBalance: Boolean(appliedGiftCard),
        giftCardRedeemed,
        creditCardPayment,
        paymentMethod: paymentMethod || null,
        items: items.map((item) => ({
          variant_id: item?.variant_id?._id || item?.variant_id,
          quantity: Number(item?.quantity) || 1,
        })),
    };

    try {
      sessionStorage.setItem("checkoutInfo", JSON.stringify(updatedCheckoutInfo));
      setCheckoutInfo(updatedCheckoutInfo);

      navigate("/payment");
    } catch (error) {
      toast.error("Unable to save checkout details. Please try again.");
    }
  };


  if (loading) {
    return <p className="text-center">Loading cart...</p>;
  }
  if (!items.length) {
    return <p className="text-center mb-[100px]">Your cart is empty.</p>;
  }

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
          <div className="flex justify-between gap-2 text-black">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {appliedCoupon && discountAmount > 0 && (
            <div className="flex justify-between gap-2 text-green-600">
              <span>Coupon ({appliedCoupon.code})</span>
              <span>-{formatPrice(discountAmount)}</span>
            </div>
          )} 
          <div className="flex justify-between gap-2">
            <span>Shipping</span>
            <span>
              {shipping > 0 ? formatPrice(shipping) : "FREE"}
            </span>
          </div>

          <div className="flex justify-between gap-2">
            <span>Tax</span>
            <span>{formatPrice(tax)}</span>
          </div>

          {platformCharge > 0 && (
            <div className="flex justify-between gap-2">
              <span>Platform Charge</span>
              <span>{formatPrice(platformCharge)}</span>
            </div>
          )}
  
        <div className="mt-5 border-t light-border pt-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-700">
              <span className="text-xl"><GiftIcon size={20}/></span>
            </div>

            <div>
              <h3 className="font-semibold text-black">
                Apply Gift Card
              </h3>
              <p className="text-14 text-gray-500">
                Use your Gift Card balance at checkout
              </p>
            </div>
          </div>

        {!appliedGiftCard ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={giftCardCode}
                onChange={(e) => setGiftCardCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (giftCardCode.trim() && !giftCardApplying) {
                      handleApplyGiftCard();
                    }
                  }
                }}
                placeholder="Enter Gift Card code"
                autoComplete="off"
                disabled={giftCardApplying}
                // className="min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-3 text-sm outline-none focus:border-[var(--primary-color)]"
                className="input-common"
              />

              <Button
                type="button"
                variant="common"
                onClick={handleApplyGiftCard}
                disabled={giftCardApplying || !giftCardCode.trim()}
                className="items-center max-md:!px-4 max-md:!min-w-[80px]"
              >
                {giftCardApplying ? "Applying..." : "APPLY"}
              </Button>
            </div>

            {giftCardError && (
              <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                {typeof giftCardError === "string"
                  ? giftCardError
                  : "Unable to apply Gift Card. Please try again."}
              </p>
            )}
          </div>
        ) : (
            <div className="space-y-3 rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 font-semibold text-green-800">
                    <span>✓</span>
                    Gift Card applied successfully
                  </p>
                  <p className="mt-1 break-all text-[12px] text-green-700">
                    Code: {appliedGiftCard.code}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveGiftCard}
                  className="shrink-0 text-sm font-medium text-red-600 underline"
                >
                  Remove
                </button>
              </div>

              <div className="flex justify-between gap-2 border-t border-green-200 pt-3 text-sm">
                <span className="text-gray-600">Available balance</span>
                <span className="font-semibold text-black">
                  {formatPrice(giftCardBalance)}
                </span>
              </div>

              <div className="flex justify-between gap-2 text-sm">
                <span className="text-gray-600">Applied to this order</span>
                <span className="font-semibold text-green-700">
                  -{formatPrice(giftCardRedeemed)}
                </span>
              </div>
            </div>
          )}
        </div>

          <div className="flex justify-between gap-2">
            <span>Total before Gift Card</span>
            <span>{formatPrice(orderTotal)}</span>
          </div>

          {appliedGiftCard && (
            <div className="flex justify-between gap-2 text-green-600">
              <span>Gift Card redeemed</span>

              <span>
                -{formatPrice(giftCardRedeemed)}
              </span>
            </div>
          )}

        <div className="flex gap-2 justify-between text-black border-t light-border pt-[20px]">
          <span className="text-[20px] font-semibold">
            Payable Amount
          </span>

          <span className="text-[20px] font-medium">
            {/* {formatPrice(creditCardPayment)} */}
            {formatPrice(remainingPayment)}
          </span>
        </div>
      </div>

        <div className="text-center mt-[35px]">
          <Button
            variant="common"
            className="min-w-auto sm:min-w-[300px] uppercase"
            onClick={handleContinueToPayment}
            disabled={
              orderLoading || giftCardApplying
            }
          >
            {orderLoading
              ? "Processing..."
                : "PLACE ORDER"}
          </Button>
        </div>
      </div>
    </>
  );
}
