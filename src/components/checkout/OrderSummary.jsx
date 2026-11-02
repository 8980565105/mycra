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
import { GiftIcon } from "lucide-react";
import { ROUTES } from "../../services/routes";
import api from "../../services/api";

const money = (value) =>
  Number(Number(value || 0).toFixed(2));

const formatPrice = (amount) =>
  `₹${money(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function OrderSummary({
  formData,
  appliedCoupon,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items = [], loading } = useSelector(
    (state) => state.cart || {}
  );

  const { user } = useSelector((state) => state.auth || {});
  const { data: settings } = useSelector(
    (state) => state.settings || {}
  );

  const { loading: orderLoading } = useSelector(
    (state) => state.orders || {}
  );

  const {
    appliedGiftCard: reduxAppliedGiftCard,
    loading: giftCardApplying,
    error: giftCardError,
  } = useSelector((state) => state.giftCards || {});

  const [checkoutInfo, setCheckoutInfo] = useState(() => {
    try {
      return JSON.parse(
        sessionStorage.getItem("checkoutInfo") || "{}"
      );
    } catch {
      return {};
    }
  });

  const [giftCardCode, setGiftCardCode] = useState("");

  const [giftCardAmount, setGiftCardAmount] = useState(() => {
    try {
      const stored = JSON.parse(
        sessionStorage.getItem("checkoutInfo") || "{}"
      );

      const amount =
        stored?.requestedGiftCardAmount ??
        stored?.giftCardRedeemed ??
        "";

      return amount === 0 ? "" : String(amount ?? "");
    } catch {
      return "";
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

  const effectiveAppliedGiftCard =
    reduxAppliedGiftCard ||
    checkoutInfo?.appliedGiftCard ||
    (checkoutInfo?.appliedGiftCardId
      ? {
          _id: checkoutInfo.appliedGiftCardId,
          cardNumber: checkoutInfo.giftCardCode,
          remainingBalance: checkoutInfo.giftCardBalance,
        }
      : null);

  const getDiscountedPrice = (item) => {
    if (item?.is_gift) {
      return {
        originalPrice: 0,
        discountedPrice: 0,
      };
    }

    return {
      originalPrice: Number(item?.variant_id?.price) || 0,
      discountedPrice:
        Number(item?.variant_id?.offerprice) || 0,
    };
  };

  const subtotal = money(
    items.reduce((sum, item) => {
      const { discountedPrice } = getDiscountedPrice(item);
      const quantity = Number(item?.quantity) || 1;

      return sum + discountedPrice * quantity;
    }, 0)
  );

  let discountAmount = 0;

  if (appliedCoupon) {
    const couponStoreIds = (appliedCoupon?.storeIds || []).map((store) =>
      typeof store === "object" ? String(store?._id || "") : String(store || "")
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
    const couponProductIds = (appliedCoupon?.products || []).map((product) =>
      typeof product === "object" ? String(product?._id || "") : String(product || "")
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

      if (appliedCoupon?.apply_type === "specificproducts") {
        return couponProductIds.includes(productId);
      }

      if (appliedCoupon?.apply_type === "Excludeproduct") {
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
    } else if (
      appliedCoupon?.discount_type === "percentage"
    ) {
      discountAmount = (eligibleSubtotal * Math.max(0, discountValue)) / 100;
    }

    if (Number(appliedCoupon?.max_discount_amount) > 0) {
      discountAmount = Math.min(
        discountAmount,
        Number(appliedCoupon.max_discount_amount)
      );
    }
  }

  discountAmount = money(Math.min(Math.max(0, discountAmount), subtotal));

  const discountedTotal = money(Math.max(0, subtotal - discountAmount));

  const shipping = money(
    items.reduce((sum, item) => {
      const itemShipping = Number(getItemShipping(item, discountedTotal)) || 0;

      return (
        sum + itemShipping * (Number(item?.quantity) || 1)
      );
    }, 0)
  );

  const platformCharge = money(Number(getPlatformCharge(settings, discountedTotal)) || 0);
  const tax = money(Math.max(0, Number(checkoutInfo?.tax) || 0));
  const orderTotal = money(discountedTotal + shipping + platformCharge + tax);

  const giftCardBalance = Math.max(0, Number(
    effectiveAppliedGiftCard?.remainingBalance ??
    checkoutInfo?.giftCardBalance ??
    0
  ) || 0);

  const requestedGiftCardAmount = Number(
    giftCardAmount ||
    checkoutInfo?.requestedGiftCardAmount ||
    checkoutInfo?.giftCardRedeemed ||
    0
  );

  const giftCardRedeemed = effectiveAppliedGiftCard
    ? money(
        Math.min(
          Math.max(0, requestedGiftCardAmount),
          giftCardBalance, orderTotal
        )
      )
    : 0;

  const remainingPayment = money(Math.max(0, orderTotal - giftCardRedeemed));

  const handleApplyGiftCard = async () => {
    const code = giftCardCode.trim().toUpperCase();

    if (!code) {
      toast.error("Please enter your Gift Card code.");
      return;
    }

    if (effectiveAppliedGiftCard || checkoutInfo?.appliedGiftCardId) {
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

      const card = result?.data?.giftCard || result?.giftCard || result?.data;
      if (
        !card?._id ||
        !Number.isFinite(Number(card.remainingBalance)) ||
        Number(card.remainingBalance) <= 0
      ) {
        throw new Error("Gift Card has no available balance.");
      }

      const availableBalance = Number(card.remainingBalance);
      const maxUsableAmount = Math.min(availableBalance, orderTotal);
      const enteredAmount = Number(giftCardAmount);
      const selectedAmount =
        Number.isFinite(enteredAmount) && enteredAmount > 0
          ? Math.min(enteredAmount, maxUsableAmount)
          : maxUsableAmount;

      const redeemed = money(selectedAmount);

      const storedCheckout = JSON.parse(
        sessionStorage.getItem("checkoutInfo") || "{}"
      );

      const updatedCheckoutInfo = {
        ...storedCheckout,

        appliedGiftCard: card,
        appliedGiftCardId: String(card._id),
        giftCardCode: card.cardNumber || card.code || code,
        giftCardBalance: availableBalance,

        useGiftCardBalance: redeemed > 0,
        requestedGiftCardAmount: redeemed,
        giftCardRedeemed: redeemed,

        subtotal,
        discountAmount,
        shipping,
        platformCharge,
        tax,
        orderTotal,

        amount_payable: money(Math.max(0, orderTotal - redeemed)),
      };

      setGiftCardAmount(String(redeemed));
      setCheckoutInfo(updatedCheckoutInfo);

      sessionStorage.setItem(
        "checkoutInfo",
        JSON.stringify(updatedCheckoutInfo)
      );

      setGiftCardCode("");
      toast.success("Gift Card applied successfully.");
    } catch (error) {
      console.error("Apply Gift Card error:", error);
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
    setGiftCardAmount("");

    const updatedCheckoutInfo = {
      ...checkoutInfo,
      appliedGiftCard: null,
      appliedGiftCardId: null,
      giftCardCode: null,
      giftCardBalance: 0,
      useGiftCardBalance: false,
      requestedGiftCardAmount: 0,
      giftCardRedeemed: 0,
      subtotal,
      discountAmount,
      shipping,
      platformCharge,
      tax,
      orderTotal,
      amount_payable: orderTotal,
    };

    setCheckoutInfo(updatedCheckoutInfo);

    sessionStorage.setItem(
      "checkoutInfo", JSON.stringify(updatedCheckoutInfo)
    );

    toast.success("Gift Card removed.");
  };

  const handleContinueToPayment = async () => {
  try {
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

    const effectiveGiftCardId =
      effectiveAppliedGiftCard?._id ||
      checkoutInfo?.appliedGiftCardId ||
      null;

    const effectiveGiftCardCode =
      effectiveAppliedGiftCard?.cardNumber ||
      effectiveAppliedGiftCard?.code ||
      checkoutInfo?.giftCardCode ||
      null;

    const effectiveGiftCardBalance = Math.max(
      0, Number(
        effectiveAppliedGiftCard?.remainingBalance ??
        checkoutInfo?.giftCardBalance ??
        0
      ) || 0
    );

    const rawRequestedAmount = Number(
      giftCardAmount ||
      checkoutInfo?.requestedGiftCardAmount ||
      checkoutInfo?.giftCardRedeemed ||
      0
    );

    let selectedGiftCardAmount = 0;

    if (effectiveGiftCardId) {
      if (effectiveGiftCardBalance <= 0) {
        toast.error(
          "Gift Card balance is unavailable. Please apply the Gift Card again."
        );
        return;
      }

      if (
        !Number.isFinite(rawRequestedAmount) ||
        rawRequestedAmount <= 0
      ) {
        toast.error("Please enter a valid Gift Card amount.");
        return;
      }

      if (rawRequestedAmount > effectiveGiftCardBalance) {
        toast.error("Gift Card amount cannot exceed the available balance.");
        return;
      }

      selectedGiftCardAmount = money(
        Math.min(rawRequestedAmount, effectiveGiftCardBalance)
      );
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

    const quoteResponse = await api.post(
      ROUTES.orders.quote,
      {
        cart_id,
        coupon_id: appliedCoupon?._id || null,
        appliedGiftCardId: effectiveGiftCardId,
        giftCardCode: effectiveGiftCardCode,
        useGiftCardBalance: Boolean(
          effectiveGiftCardId && selectedGiftCardAmount > 0
        ),
        requestedGiftCardAmount: selectedGiftCardAmount,
      }
    );

    const quote = quoteResponse.data?.data;

    if (!quote) {
      console.error("Invalid quote response:", quoteResponse.data);
      throw new Error(
        quoteResponse.data?.message || "Backend checkout quote was not returned."
      );
    }

    const updatedCheckoutInfo = {
        ...checkoutInfo,
        cart_id,
        email: formData.email,
        shippingAddress,
        coupon_id: quote.coupon_id || null,
        couponCode: quote.coupon_code || "",
        subtotal: Number(quote.subtotal || 0),
        discountAmount: Number(quote.coupon_discount || 0),
        shipping: Number(quote.shipping || 0),
        platformCharge: Number(quote.platform_charge || 0),
        tax: Number(quote.tax || 0),
        orderTotal: Number(quote.order_total || 0),
        giftCardRedeemed: Number(quote.gift_card_redeemed || 0),
        requestedGiftCardAmount: Number(
          quote.gift_card_redeemed || 0
        ),
        amount_payable: Number(quote.amount_payable || 0),
        appliedGiftCardId: quote.gift_card_id || null,
        giftCardCode: quote.gift_card_code || "",
        useGiftCardBalance: Number(quote.gift_card_redeemed || 0) > 0,
        items: items.map((item) => ({
          variant_id: item?.variant_id?._id || item?.variant_id,
          quantity: Number(item?.quantity) || 1,
        })),
    };

      sessionStorage.setItem("checkoutInfo", JSON.stringify(updatedCheckoutInfo));
      setCheckoutInfo(updatedCheckoutInfo);

    toast.success("Checkout details verified successfully.");

      navigate("/payment");
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Unable to continue to payment. Please try again."
      );
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
              <GiftIcon size={20} />
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

        {!effectiveAppliedGiftCard ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={giftCardCode}
                onChange={(e) => setGiftCardCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && giftCardCode.trim() && !giftCardApplying) {
                    e.preventDefault();
                    handleApplyGiftCard();
                  }
                }}
                placeholder="Enter Gift Card code"
                autoComplete="off"
                disabled={giftCardApplying}
                className="input-common min-w-0 flex-1"
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
                    Code:{" "}
                    {effectiveAppliedGiftCard?.cardNumber ||
                      effectiveAppliedGiftCard?.code ||
                      checkoutInfo?.giftCardCode ||
                      "Applied Gift Card"}
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

              <div className="space-y-2 border-t border-green-200 pt-3">
                <label
                  htmlFor="giftCardAmount"
                  className="block text-sm font-medium text-gray-700"
                >
                  Gift Card amount to use
                </label>

                <div className="flex gap-2">
                  <span className="flex items-center rounded-lg border border-gray-300 px-3 text-gray-600">
                    ₹
                  </span>

                  <input
                    id="giftCardAmount"
                    type="number"
                    min="0.01"
                    max={Math.min(giftCardBalance, orderTotal)}
                    step="0.01"
                    value={giftCardAmount}
                    onChange={(event) =>
                      setGiftCardAmount(event.target.value)
                    }
                    placeholder="Enter amount (e.g. 500)"
                    className="input-common min-w-0 flex-1"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setGiftCardAmount(
                        String(
                          money(
                            Math.min(
                              giftCardBalance,
                              orderTotal
                            )
                          )
                        )
                      )
                    }
                    className="rounded-lg border border-green-300 px-3 text-sm font-medium text-green-700"
                  >
                    Use Max
                  </button>
                </div>

                {Number(giftCardAmount) >
                  Math.min(giftCardBalance, orderTotal) && (
                  <p className="text-sm text-red-600">
                    Amount cannot exceed your Gift Card balance or order total.
                  </p>
                )}

                {Number(giftCardAmount) <= 0 && (
                  <p className="text-xs text-gray-500">
                    Enter the amount you want to redeem.
                  </p>
                )}
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

          {effectiveAppliedGiftCard && (
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