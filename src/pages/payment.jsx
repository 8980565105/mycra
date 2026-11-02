import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import CartProgress from "../components/cart/CartProgress";
import { clearCart } from "../features/cart/cartSlice";
import {
  CreditCard,
  Wallet as WalletIcon,
  Banknote,
  QrCode,
} from "lucide-react";
import { fetchWallet } from "../features/wallet/walletThunk";
import { createOrder } from "../features/orders/orderThunk";

const stripePublishableKey =
  process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;

  if (!stripePublishableKey) {
    console.error("Stripe publishable key missing. Check frontend .env");
  }

  const stripePromise = stripePublishableKey
    ? loadStripe(stripePublishableKey)
    : Promise.resolve(null);

const PAYMENT_METHODS = [
  {
    key: "card",
    label: "Credit / Debit Card",
    icon: CreditCard,
    type: "stripe",
  },
  { key: "upi", label: "UPI", icon: QrCode, type: "upi_qr" },
  { key: "wallet", label: "Wallet", icon: WalletIcon, type: "direct" },
  { key: "cod", label: "Cash on Delivery", icon: Banknote, type: "direct" },
];

const money = (value) =>
  Number(Number(value || 0).toFixed(2));

const formatPrice = (value) =>
  `₹${money(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

function StripePaymentForm({ paymentData }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePayment = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || loading) return;

    setLoading(true);
    setError("");
    try {
      const { error: paymentError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: "always",
      });

      if (paymentError) {
        setError(paymentError.message || "Payment failed. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Stripe payment confirmation error:", err);
      setError(err?.message || "Unable to process payment.");
      setLoading(false);
    }
  };
  return (
    <form onSubmit={handlePayment} className="space-y-6">
      <div className="bg-white p-5 rounded-[4px] border border-gray-200">
        <PaymentElement options={{ layout: "tabs" }} />
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || !elements || loading}
        className="w-full py-[15px] bg-black text-white uppercase tracking-wide disabled:opacity-50"
      >
        {loading
          ? "PROCESSING..."
          : `PAY ${formatPrice(paymentData.amount)}`}
      </button>
      <button
        type="button"
        onClick={() => navigate("/checkout")}
        className="w-full py-[14px] border border-black text-black uppercase"
      >
        Back to Checkout
      </button>
    </form>
  );
}

function UpiQrPayment({
  clientSecret,
  amount,
  customerName,
  customerEmail,
  shippingAddress,
}) {
  const stripe = useStripe();
  const navigate = useNavigate();
  const [showQr, setShowQr] = useState(false);
  const [qrImage, setQrImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [polling, setPolling] = useState(false);
  const [instructionsUrl, setInstructionsUrl] = useState("");

  const pollPaymentStatus = (secret) => {
    if (!stripe || !secret) return;

    setPolling(true);

    let attempts = 0;
    const maxAttempts = 100;

    const interval = window.setInterval(async () => {
      attempts += 1;

      try {
        const { paymentIntent, error: retrieveError } =
          await stripe.retrievePaymentIntent(secret);

        if (retrieveError) {
          console.error("Retrieve PaymentIntent error:", retrieveError);
        }

        if (paymentIntent?.status === "succeeded") {
          window.clearInterval(interval);
          setPolling(false);
          navigate(
            `/payment-success?payment_intent=${paymentIntent.id}`
          );
          return;
        }

        if (
          paymentIntent?.status === "canceled" ||
          attempts >= maxAttempts
        ) {
          window.clearInterval(interval);
          setPolling(false);

          if (paymentIntent?.status === "canceled") {
            setError("This UPI payment was canceled. You can try again.");
          } else {
            setError(
              "Payment confirmation is taking longer than expected. Please verify your payment status before retrying."
            );
          }
        }
      } catch (err) {
        console.error("UPI payment polling error:", err);
      }
    }, 3000);
  };

  useEffect(() => {
    return () => {
      setPolling(false);
    };
  }, []);

  const handleShowQr = async () => {
    if (!stripe || !clientSecret || loading) return;

    setLoading(true);
    setError("");
    try {
      const { paymentIntent, error: confirmError } =
      await stripe.confirmPayment({
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
          payment_method_data: {
            type: "upi",
            billing_details: {
              name: customerName || "Customer",
              email: customerEmail || undefined,
              address: {
                line1:
                  shippingAddress?.addressLine1 ||
                  shippingAddress?.address ||
                  "NA",
                city: shippingAddress?.city || "NA",
                state: shippingAddress?.state || "NA",
                postal_code:
                  shippingAddress?.pincode ||
                  shippingAddress?.postal_code ||
                  "000000",
                country: "IN",
              },
            },
          },
          payment_method_options: {
            upi: { flow: "qr" },
          },
        },
        redirect: "if_required",
      });

      if (confirmError) {
        setError(
          `${confirmError.message || "Unable to generate QR code."}${
            confirmError.code ? ` (${confirmError.code})` : ""
          }`
        );
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        navigate(`/payment-success?payment_intent=${paymentIntent.id}`);
        return;
      }

      const upiAction =
        paymentIntent?.next_action?.upi_handle_redirect_or_display_qr_code;

      const qrImageUrl =
        upiAction?.qr_code?.image_url_png ||
        upiAction?.qr_code?.image_url_svg ||
        paymentIntent?.next_action?.upi_display_qr_code?.image_data_url;

      const hostedInstructionsUrl =
        upiAction?.hosted_instructions_url ||
        paymentIntent?.next_action?.upi_display_qr_code?.hosted_instructions_url;

      if (qrImageUrl || hostedInstructionsUrl) {
        setQrImage(qrImageUrl || "");
        setInstructionsUrl(hostedInstructionsUrl || "");
        setShowQr(true);
        pollPaymentStatus(clientSecret);
      } else {
        setError(
          `UPI QR details unavailable. Status: ${
            paymentIntent?.status || "unknown"
          }`,
        );
      }
    } catch (err) {
      console.error("UPI QR error:", err);
      setError(err?.message || "Unable to process UPI payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-5 rounded-[4px] border border-gray-200 space-y-5">
      {!showQr && (
        <>
          <p className="text-[14px] text-gray-600">
            Pay {formatPrice(amount)} using a supported UPI app.
          </p>
          <button
            type="button"
            disabled={loading || !stripe}
            onClick={handleShowQr}
            className="w-full py-[15px] bg-black text-white uppercase tracking-wide disabled:opacity-50"
          >
            {loading ? "GENERATING QR..." : "SHOW QR CODE"}
          </button>
        </>
      )}

      {showQr && (
        <div className="flex flex-col items-center gap-4">
          <h3 className="text-[16px] font-medium">Scan QR and Pay</h3>
          <div className="text-[20px] font-semibold">
            {formatPrice(amount)}
          </div>
          {qrImage ? (
              <img
                src={qrImage}
                alt="UPI QR Code"
                className="w-[220px] h-[220px] border border-gray-200 p-2"
              />
            ) : instructionsUrl ? (
              <a
                href={instructionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-600"
              >
                Open Stripe UPI payment instructions
              </a>
            ) : null
          }
          {polling && (
            <p className="text-[12px] text-gray-500 animate-pulse">
              Waiting for payment confirmation...
            </p>
          )}
          <p className="text-[12px] text-gray-500 text-center">
            Do not close this screen until the transaction is complete.
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded text-[13px]">
          {error}
        </div>
      )}
    </div>
  );
}

export default function Payment() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [paymentInitError, setPaymentInitError] = useState("");
  const [checkoutInfo, setCheckoutInfo] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState("wallet");
  const [clientSecret, setClientSecret] = useState("");
  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [stripeAmountData, setStripeAmountData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  const currentMethod = PAYMENT_METHODS.find(
    (method) => method.key === selectedMethod
  );

  const needsClientSecret =
    currentMethod?.type === "stripe" || currentMethod?.type === "upi_qr";

  useEffect(() => {
    const stored = sessionStorage.getItem("checkoutInfo");
    if (!stored) {
      window.location.replace("/cart");
      return;
    }
    try {
      const parsed = JSON.parse(stored);

      if (!parsed || typeof parsed !== "object") {
        throw new Error("Invalid checkout session");
      }

      sessionStorage.removeItem("paymentVerificationPending");

      setCheckoutInfo(parsed);
      setError("");
      setLoading(false);
    } catch (err) {
      console.error("Invalid checkout session:", err);
      sessionStorage.removeItem("checkoutInfo");
      window.location.replace("/cart");
    }
  }, []);

  useEffect(() => {
    const handlePageShow = () => {
      if (!sessionStorage.getItem("checkoutInfo")) {
        window.location.replace("/cart");
      }
    };
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  const orderTotal = money(
    checkoutInfo?.orderTotal ??
    checkoutInfo?.total ??
    0
  );

  const giftCardRedeemed = money(
    Math.min(
      Math.max(0, Number(checkoutInfo?.giftCardRedeemed) || 0),
      orderTotal
    )
  );

  const remainingPayment = money(
    Math.max(0, orderTotal - giftCardRedeemed)
  );

  const isGiftCardApplied =
    Boolean(checkoutInfo?.appliedGiftCardId) &&
    Boolean(checkoutInfo?.useGiftCardBalance) &&
    giftCardRedeemed > 0;

  useEffect(() => {
    if (!needsClientSecret || !checkoutInfo) return;

  let cancelled = false;

  const initPayment = async () => {
    setInitializing(true);
    setPaymentInitError("");

    try {
      const isNewIntent = !paymentIntentId;

      const endpoint = isNewIntent
        ? "/payments/stripe/create-intent"
        : "/payments/stripe/update-intent";

      const requestedGiftCardAmount = money(
        checkoutInfo.requestedGiftCardAmount ??
        checkoutInfo.giftCardRedeemed ??
        0
      );

      const effectiveGiftCardId =
        checkoutInfo.appliedGiftCardId || null;

      const useGiftCardBalance = Boolean(
        effectiveGiftCardId && requestedGiftCardAmount > 0
      );

      const expectedPayableAmount = money(
        Math.max(0, orderTotal - (
          useGiftCardBalance ? requestedGiftCardAmount : 0
        ))
      );

       const payload = {
        cart_id: checkoutInfo.cart_id,
        coupon_id: checkoutInfo.coupon_id || null,
        shippingAddress: checkoutInfo.shippingAddress,
        email: checkoutInfo.email,
        method: selectedMethod,

          appliedGiftCardId: useGiftCardBalance ? effectiveGiftCardId : null,

          giftCardCode: useGiftCardBalance
            ? checkoutInfo.giftCardCode || null
            : null,
          requestedGiftCardAmount: checkoutInfo.requestedGiftCardAmount || 0,

          useGiftCardBalance: Boolean(checkoutInfo.useGiftCardBalance),

          giftCardRedeemed: useGiftCardBalance
            ? requestedGiftCardAmount
            : 0,

        expectedPayableAmount,

        ...(isNewIntent ? {} : { paymentIntentId }),
      };

      console.log("FRONTEND STRIPE GIFT CARD PAYLOAD:", {
        endpoint,
        appliedGiftCardId: payload.appliedGiftCardId,
        giftCardCode: payload.giftCardCode,
        useGiftCardBalance: payload.useGiftCardBalance,
        requestedGiftCardAmount: payload.requestedGiftCardAmount,
        expectedPayableAmount: payload.expectedPayableAmount,
      });

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      console.log("Payment initialization response:", {
        httpStatus: response.status,
        success: data?.success,
        message: data?.message,
        hasClientSecret: Boolean(data?.data?.clientSecret),
        paymentIntentId: data?.data?.paymentIntentId,
        amount: data?.data?.amount,
      });

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message || `Payment API failed (${response.status})`
        );
      }

      const nextClientSecret = data?.data?.clientSecret;
      const nextPaymentIntentId =
        data?.data?.paymentIntentId || paymentIntentId;

      if (
        !nextClientSecret ||
        typeof nextClientSecret !== "string"
      ) {
        throw new Error(
          "Backend response does not contain data.clientSecret"
        );
      }

      if (cancelled) return;

      setClientSecret(nextClientSecret);
      setPaymentIntentId(nextPaymentIntentId);

      if (data?.data?.amount != null) {
        setStripeAmountData({amount: Number(data.data.amount)});
      }

      if (isNewIntent) {
        sessionStorage.setItem(
          "pendingPayment",
          JSON.stringify({
            paymentIntentId: nextPaymentIntentId,
            clientSecret: nextClientSecret,
            amount: data?.data?.amount,
          })
        );
      }
    } catch (err) {
      console.error("Payment initialization error:", err);

      if (!cancelled) {
        setClientSecret("");
        setPaymentInitError(
          err?.message || "Unable to initialize payment."
        );
      }
    } finally {
      if (!cancelled) {
        setInitializing(false);
      }
    }
  };

  initPayment();

  return () => {
    cancelled = true;
  };
}, [
  needsClientSecret,
  checkoutInfo,
  selectedMethod,
  orderTotal,
]);

const handlePlaceOrder = async () => {
  if (!checkoutInfo || placing) return;

  if (!["wallet", "cod"].includes(selectedMethod)) {
    toast.error("Please select a valid payment method.");
    return;
  }

  setPlacing(true);

  try {
    const requestedGiftCardAmount = money(
      checkoutInfo.requestedGiftCardAmount ??
      checkoutInfo.giftCardRedeemed ??
      0
    );

    const useGiftCardBalance = Boolean(
      checkoutInfo.appliedGiftCardId &&
      requestedGiftCardAmount > 0
    );

    // const payableAmount = money(
    //   Math.max(
    //     0, orderTotal - (useGiftCardBalance ? requestedGiftCardAmount : 0)
    //   )
    // );
    const payableAmount = money(
      checkoutInfo.amount_payable
    );

    const orderPayload = {
      cart_id: checkoutInfo.cart_id,
      coupon_id: checkoutInfo.coupon_id || null,
      shippingAddress: checkoutInfo.shippingAddress,
      payment_method: selectedMethod === "wallet" ? "Wallet" : "COD",
      items: checkoutInfo.items,
      appliedGiftCardId: useGiftCardBalance ? checkoutInfo.appliedGiftCardId : null,
      giftCardCode: useGiftCardBalance ? checkoutInfo.giftCardCode || null : null,
      useGiftCardBalance,
      requestedGiftCardAmount: useGiftCardBalance ? requestedGiftCardAmount : 0,
      giftCardRedeemed: useGiftCardBalance ? requestedGiftCardAmount : 0,
      expectedPayableAmount: payableAmount,
    };

    const result = await dispatch(
      createOrder(orderPayload)
    ).unwrap();

    const createdOrder =
      result?.order ||
      result?.data?.order ||
      result?.data ||
      result;

    const orderId = createdOrder?._id;

    if (!orderId) {
      console.error("Unexpected createOrder response:", result);

      throw new Error(
        "Order ID was not returned. Please check My Orders before retrying."
      );
    }

    if (selectedMethod === "wallet") {
      try {
        await dispatch(fetchWallet()).unwrap();
      } catch (walletError) {
        console.error("Wallet refresh failed:", walletError);
      }
    }

    sessionStorage.setItem("orderCompleted", "true");

    dispatch(clearCart());

    sessionStorage.removeItem("checkoutInfo");
    sessionStorage.removeItem("pendingPayment");
    sessionStorage.removeItem("paymentVerificationPending");
    localStorage.removeItem("appliedCoupon");

    toast.success("Order placed successfully!");

    window.location.replace(`/order-success/${orderId}`);
  } catch (err) {
    console.error("Place order error:", err);

    toast.error(
      typeof err === "string"
        ? err
        : err?.message || "Unable to place order."
    );
  } finally {
    setPlacing(false);
  }
};

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-light">Loading...</p>
      </div>
    );
  }

  if (error || !checkoutInfo) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-5">
        <p className="text-red-500 mb-5">
          {error || "Checkout session not found."}
        </p>

        <Link
          to="/checkout"
          className="px-6 py-3 bg-black text-white"
        >
          BACK TO CHECKOUT
        </Link>
      </div>
    );
  }
  const appearance = {
    theme: "stripe",
    variables: {
      colorPrimary: "#F43297",
      colorText: "#111111",
      borderRadius: "3px",
    },
  };

  const stripeDisplayAmount = stripeAmountData?.amount ?? remainingPayment;

  return (
    <>
      <Toaster position="top-center" />
      <CartProgress currentStep={3} />
      <div className="py-[50px]">
        <div className="max-w-[1100px] mx-auto px-5">
          <h2 className="text-[28px] font-normal mb-[50px] hidden md:block">
            <Link to="/home">Home</Link> /{" "}
            <span className="font-light">Payment</span>
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-[30px] items-start">
            <div className="bg-[#f8f8f8] p-5 md:p-8">
              <h1 className="text-[24px] text-black mb-6">
                Payment Method
              </h1>

              <div className="bg-white border border-gray-200 rounded-[4px]">
                {PAYMENT_METHODS.map((method, index) => {
                  const Icon = method.icon;
                  const isSelected = selectedMethod === method.key;
                  return (
                    <label
                      key={method.key}
                      className={`flex items-center gap-3 px-5 py-4 cursor-pointer ${
                        index !== PAYMENT_METHODS.length - 1
                          ? "border-b border-gray-200"
                          : ""
                      } ${isSelected ? "bg-pink-50" : ""}`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.key}
                        checked={isSelected}
                        onChange={(event) => {
                          setSelectedMethod(event.target.value);
                          setPaymentInitError("");
                        }}
                        className="accent-[#F43297] w-[18px] h-[18px] cursor-pointer"
                      />
                      <Icon size={20} className="text-gray-600" />
                      <span className="text-[15px] text-black">
                        {method.label}
                      </span>
                    </label>
                  );
                })}
              </div>
              {selectedMethod === "card" && (
                <div className="mt-5 space-y-4">
                  {initializing && (
                    <p className="text-gray-500 text-sm">
                      Preparing secure payment...
                    </p>
                  )}

                  {!initializing && paymentInitError && (
                    <div className="rounded border border-red-200 bg-red-50 p-4">
                      <p className="text-sm text-red-600">
                        {paymentInitError}
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          setPaymentInitError("");
                          setPaymentIntentId("");
                          setClientSecret("");
                          setStripeAmountData(null);
                        }}
                        className="mt-3 border border-red-400 px-4 py-2 text-sm"
                      >
                        Retry Payment
                      </button>
                    </div>
                  )}

                  {!initializing && !paymentInitError &&
                    clientSecret && (
                      <Elements
                        key={clientSecret}
                        stripe={stripePromise}
                        options={{
                          clientSecret,
                          appearance,
                          paymentMethodOrder: ["card"],
                        }}
                      >
                        <StripePaymentForm
                          paymentData={{
                            amount: stripeDisplayAmount,
                          }}
                        />
                      </Elements>
                    )}
                </div>
              )}

              {selectedMethod === "upi" && (
                <div className="mt-5 space-y-4">
                  {initializing && (
                    <p className="text-light text-[14px]">
                      Preparing UPI payment...
                    </p>
                  )}
                  {!initializing && paymentInitError && (
                    <div className="rounded border border-red-200 bg-red-50 p-4">
                      <p className="text-sm text-red-600">
                        {paymentInitError}
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          setPaymentInitError("");
                          setPaymentIntentId("");
                          setClientSecret("");
                          setStripeAmountData(null);
                        }}
                        className="mt-3 border border-red-400 px-4 py-2 text-sm"
                      >
                        Retry Payment
                      </button>
                    </div>
                )}

                  {!initializing && !paymentInitError &&
                  clientSecret && (
                    <Elements
                      key={clientSecret}
                      stripe={stripePromise}
                      options={{
                        clientSecret,
                        appearance,
                      }}
                    >
                      <UpiQrPayment
                        clientSecret={clientSecret}
                        amount={stripeDisplayAmount}
                        customerName={
                          checkoutInfo?.shippingAddress?.fullName ||
                          checkoutInfo?.shippingAddress?.firstName ||
                          checkoutInfo?.shippingAddress?.name ||
                          "Customer"
                        }
                        customerEmail={checkoutInfo?.email}
                        shippingAddress={checkoutInfo?.shippingAddress}
                      />
                      </Elements>
                    )}
                </div>
              )}

              {(selectedMethod === "wallet" ||
                selectedMethod === "cod") && (
                <div className="space-y-4 mt-5">
                  <p className="text-light text-[14px]">
                    {selectedMethod === "wallet"
                      ? "Amount will be deducted from your wallet balance."
                      : "Pay in cash when your order is delivered."}
                  </p>
                  <button
                    type="button"
                    disabled={placing}
                    onClick={handlePlaceOrder}
                    className="w-full py-[15px] bg-black text-white uppercase tracking-wide disabled:opacity-50"
                  >
                    {placing
                      ? "PLACING ORDER..."
                      : `PLACE ORDER — ${formatPrice(remainingPayment)}`}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/checkout")}
                    className="w-full py-[14px] border border-black text-black uppercase"
                  >
                    Back to Checkout
                  </button>
                </div>
              )}
            </div>

            <div className="bg-[#f8f8f8] p-5 md:p-8">
              <h2 className="text-[22px] text-black mb-7">
                Order Summary
              </h2>

              <div className="space-y-4 text-[14px]">
                <div className="flex justify-between">
                  <span className="text-light">Subtotal</span>
                  <span>{formatPrice(checkoutInfo.subtotal)}</span>
                </div>

                {Number(checkoutInfo.discountAmount) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Discount</span>
                    <span>
                      -{formatPrice(checkoutInfo.discountAmount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-light">Shipping</span>
                  <span>
                    {Number(checkoutInfo.shipping) > 0
                      ? formatPrice(checkoutInfo.shipping)
                      : "Free"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-light">Platform Charge</span>
                  <span>
                    {Number(checkoutInfo.platformCharge) > 0
                      ? formatPrice(checkoutInfo.platformCharge)
                      : "Free"}
                  </span>
                </div>

                {Number(checkoutInfo.tax) > 0 && (
                <div className="flex justify-between">
                  <span className="text-light">Tax</span>
                  <span>{formatPrice(checkoutInfo.tax)}</span>
                </div>
                )}

                <div className="flex justify-between">
                  <span className="text-light">Total before Gift Card</span>
                  <span>{formatPrice(orderTotal)}</span>
                </div>

                {isGiftCardApplied && (
                  <>
                    <div className="flex justify-between text-green-600">
                      <span>Gift Card Redeemed</span>
                      <span>−{formatPrice(giftCardRedeemed)}</span>
                    </div>

                    <div className="text-xs text-gray-500">
                      Gift Card: {checkoutInfo.giftCardCode}
                    </div>
                  </>
                )}

                <div className="border-t border-gray-300 pt-4">
                  <div className="flex justify-between text-black text-[18px] font-medium">
                    <span>Payable Amount</span>
                    <span>{formatPrice(remainingPayment)}</span>
                  </div>
                </div>

                {needsClientSecret && stripeAmountData && (
                  <p className="text-xs text-gray-500">
                    Stripe amount: {formatPrice(stripeAmountData.amount)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}