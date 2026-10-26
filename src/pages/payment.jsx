import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
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
// const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
// const stripePromise = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
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
    stripeTypes: ["card"],
  },
  { key: "upi", label: "UPI", icon: QrCode, type: "upi_qr" },
  { key: "wallet", label: "Wallet", icon: WalletIcon, type: "direct" },
  { key: "cod", label: "Cash on Delivery", icon: Banknote, type: "direct" },
];

function StripePaymentForm({ paymentData }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // const handlePayment = async (event) => {
  //   event.preventDefault();
  //   if (!stripe || !elements) return;
  //   setLoading(true);
  //   setError("");
  //   try {
  //     const { error } = await stripe.confirmPayment({
  //       elements,
  //       confirmParams: {
  //         return_url: `${window.location.origin}/payment-success`,
  //       },
  //     });
  //     if (error) {
  //       setError(error.message || "Payment failed.");
  //       setLoading(false);
  //     }
  //   } catch (err) {
  //     setError("Unable to process payment.");
  //     setLoading(false);
  //   }
  // };

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
      setError(err.message || "Unable to process payment.");
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
          : `PAY ₹${Math.round(paymentData.amount).toLocaleString("en-IN")}`}
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

  const handleShowQr = async () => {
    if (!stripe || !clientSecret) return;
    setLoading(true);
    setError("");
    try {
      const { paymentIntent, error } = await stripe.confirmPayment({
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
            upi: {
              flow: "qr",
            },
          },
        },
        redirect: "if_required",
      });

      console.log("Stripe confirmPayment error:", error);
      console.log("Stripe paymentIntent:", paymentIntent);
      console.log(
        "next_action:",
        JSON.stringify(paymentIntent?.next_action, null, 2),
      );

      if (error) {
        setError(
          `${error.message || "Unable to generate QR code."} (${error.code || ""})`,
        );
        setLoading(false);
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

      if (qrImageUrl) {
        setQrImage(qrImageUrl);
        setShowQr(true);
        pollPaymentStatus(clientSecret);
      } else if (hostedInstructionsUrl) {
        setQrImage("");
        setShowQr(true);
        setInstructionsUrl(hostedInstructionsUrl);
        pollPaymentStatus(clientSecret);
      } else {
        setError(
          `UPI QR details unavailable. Status: ${
            paymentIntent?.status || "unknown"
          }; next action: ${
            paymentIntent?.next_action?.type || "none"
          }`,
        );
      }
    } catch (err) {
      console.error("UPI QR catch error:", err);
      setError(err.message || "Unable to process UPI payment.");
    } finally {
      setLoading(false);
    }
  };

  const pollPaymentStatus = (secret) => {
    setPolling(true);
    const interval = setInterval(async () => {
      const { paymentIntent } = await stripe.retrievePaymentIntent(secret);
      if (paymentIntent?.status === "succeeded") {
        clearInterval(interval);
        setPolling(false);
        navigate(`/payment-success?payment_intent=${paymentIntent.id}`);
      }
      if (paymentIntent?.status === "canceled") {
        clearInterval(interval);
        setPolling(false);
        setError("his UPI payment attempt was canceled. You can try again.");
      }
    }, 3000);

    setTimeout(() => clearInterval(interval), 5 * 60 * 1000);
  };

  return (
    <div className="bg-white p-5 rounded-[4px] border border-gray-200 space-y-5">
      {!showQr && (
        <>
          <p className="text-[14px] text-gray-600">
            Pay ₹{Math.round(amount).toLocaleString("en-IN")} using any UPI app
            (GPay, PhonePe, Paytm).
          </p>
          <button
            type="button"
            disabled={loading}
            onClick={handleShowQr}
            className="w-full py-[15px] bg-black text-white uppercase tracking-wide disabled:opacity-50"
          >
            {loading ? "GENERATING QR..." : "SHOW QR CODE"}
          </button>
        </>
      )}

      {/* {showQr && qrImage && ( */}
      {showQr && (
        <div className="flex flex-col items-center gap-4">
          <h3 className="text-[16px] font-medium">Scan QR and Pay</h3>
          <div className="text-[20px] font-semibold">
            ₹{Math.round(amount).toLocaleString("en-IN")}
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
  const [giftCardBalance, setGiftCardBalance] = useState(0);
  const [giftCardLoading, setGiftCardLoading] = useState(false);
  const [giftCardError, setGiftCardError] = useState("");
  const currentMethod = PAYMENT_METHODS.find((m) => m.key === selectedMethod);
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
      const storedCheckout = sessionStorage.getItem("checkoutInfo");
      if (!storedCheckout) {
        window.location.replace("/cart");
      }
    };

    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

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

      const payload = isNewIntent
        ? {
            cart_id: checkoutInfo.cart_id,
            coupon_id: checkoutInfo.coupon_id,
            shippingAddress: checkoutInfo.shippingAddress,
            email: checkoutInfo.email,
            method: selectedMethod,

            appliedGiftCardId: checkoutInfo.appliedGiftCardId || null,
            giftCardCode: checkoutInfo.giftCardCode || null,
            useGiftCardBalance: Boolean(
              checkoutInfo.useGiftCardBalance
            ),
            giftCardRedeemed: Number(
              checkoutInfo.giftCardRedeemed
            ) || 0,
            expectedPayableAmount: remainingPayment,
          }
        : {
            paymentIntentId,
            method: selectedMethod,
          };

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

      if (data.data.amount != null) {
        setStripeAmountData({ amount: data.data.amount });
      }

      if (isNewIntent) {
        sessionStorage.setItem(
          "pendingPayment",
          JSON.stringify({
            paymentIntentId: nextPaymentIntentId,
            clientSecret: nextClientSecret,
            amount: data.data.amount,
          })
        );
      }
    } catch (err) {
      console.error("Payment initialization error:", err);

      if (!cancelled) {
        setClientSecret("");
        setPaymentInitError(
          err instanceof Error
            ? err.message
            : "Unable to initialize payment."
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
  paymentIntentId,
]);

  const isGiftCardApplied =
  Boolean(checkoutInfo?.useGiftCardBalance) &&
  Number(checkoutInfo?.giftCardRedeemed || 0) > 0;

const handlePlaceOrder = async () => {
  if (!checkoutInfo || placing) return;

  setPlacing(true);

  try {
    const orderPayload = {
      cart_id: checkoutInfo.cart_id,
      coupon_id: checkoutInfo.coupon_id,
      shippingAddress: checkoutInfo.shippingAddress,
      payment_method:
        selectedMethod === "wallet" ? "Wallet" : "COD",
      shipping: checkoutInfo.shipping,
      platform_charge: checkoutInfo.platformCharge,
      items: checkoutInfo.items,

      appliedGiftCardId: checkoutInfo.appliedGiftCardId || null,
      giftCardCode: checkoutInfo.giftCardCode || null,
      useGiftCardBalance: Boolean(
        checkoutInfo.useGiftCardBalance
      ),
      giftCardRedeemed:
        Number(checkoutInfo.giftCardRedeemed) || 0,
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

    dispatch(clearCart());

    sessionStorage.removeItem("checkoutInfo");
    sessionStorage.removeItem("pendingPayment");
    localStorage.removeItem("appliedCoupon");

    toast.success("Order placed successfully!");

    navigate(`/order-success/${orderId}`, {
      replace: true,
    });

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
        <Link to="/checkout" className="px-6 py-3 bg-black text-white">
          BACK TO CHECKOUT
        </Link>
      </div>
    );
  }
  // const orderTotal = Number(checkoutInfo.orderTotal ?? checkoutInfo.total ?? 0);
  // const giftCardRedeemed = Number(Math.min(giftCardBalance, orderTotal).toFixed(2));
  // const remainingPayment = Number(Math.max(0, orderTotal - giftCardRedeemed).toFixed(2));
  // // const displayTotal = checkoutInfo.total;
  // const displayTotal = Number(checkoutInfo?.orderTotal ?? checkoutInfo?.total ?? 0 );
  const orderTotal = Math.max(0, Number(checkoutInfo?.orderTotal ?? checkoutInfo?.total ?? 0) || 0);

  const giftCardRedeemed = Math.min(
    Math.max(0, Number(checkoutInfo?.giftCardRedeemed) || 0),
    orderTotal
  );

  const remainingPayment = Number(
    Math.max(0, orderTotal - giftCardRedeemed).toFixed(2)
  );

  const displayTotal = remainingPayment;
  const appearance = {
    theme: "stripe",
    variables: {
      colorPrimary: "#F43297",
      colorText: "#111111",
      borderRadius: "3px",
    },
  };

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
              <h1 className="text-[24px] text-black mb-6">Payment Method</h1>

              <div className="bg-white border border-gray-200 rounded-[4px]">
                {PAYMENT_METHODS.map((method, idx) => {
                  const Icon = method.icon;
                  const isSelected = selectedMethod === method.key;
                  return (
                    <label
                      key={method.key}
                      className={`flex items-center gap-3 px-5 py-4 cursor-pointer ${
                        idx !== PAYMENT_METHODS.length - 1
                          ? "border-b border-gray-200"
                          : ""
                      } ${isSelected ? "bg-pink-50" : ""}`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.key}
                        checked={isSelected}
                        onChange={(e) => setSelectedMethod(e.target.value)}
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
                        }}
                        className="mt-3 border border-red-400 px-4 py-2 text-sm"
                      >
                        Retry Payment
                      </button>
                    </div>
                  )}

                  {!initializing && !paymentInitError && clientSecret && (
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
                          amount: stripeAmountData?.amount ?? displayTotal,
                        }}
                      />
                    </Elements>
                  )}
                </div>
              )}

              {selectedMethod === "upi" && (
                <>
                  {initializing && (
                    <p className="text-light text-[14px]">
                      Preparing UPI payment...
                    </p>
                  )}
                  {!initializing && clientSecret && (
                    <Elements
                      stripe={stripePromise}
                      options={{ clientSecret, appearance }}
                    >
                      <UpiQrPayment
                        clientSecret={clientSecret}
                        amount={stripeAmountData?.amount || displayTotal}
                        customerName={
                          checkoutInfo?.shippingAddress?.fullName ||
                          checkoutInfo?.shippingAddress?.name ||
                          "Customer"
                        }
                        customerEmail={checkoutInfo?.email}
                        shippingAddress={checkoutInfo?.shippingAddress}
                      />
                    </Elements>
                  )}
                </>
              )}

              {(selectedMethod === "wallet" || selectedMethod === "cod") && (
                <div className="space-y-4">
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
                      : `PLACE ORDER — ₹${Math.round(displayTotal).toLocaleString("en-IN")}`}
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
              <h2 className="text-[22px] text-black mb-7">Order Summary</h2>
              <div className="space-y-4 text-[14px]">
                <div className="flex justify-between">
                  <span className="text-light">Subtotal</span>
                  <span>
                    ₹{Math.round(checkoutInfo.subtotal).toLocaleString("en-IN")}
                  </span>
                </div>
                {checkoutInfo.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>
                      - ₹
                      {Math.round(checkoutInfo.discountAmount).toLocaleString(
                        "en-IN",
                      )}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-light">Shipping</span>
                  <span>
                    {checkoutInfo.shipping > 0
                      ? `₹ ${Math.round(checkoutInfo.shipping).toLocaleString("en-IN")}`
                      : "Free"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-light">Platform Charge</span>
                  <span>
                    {checkoutInfo.platformCharge > 0
                      ? `₹ ${Math.round(checkoutInfo.platformCharge).toLocaleString("en-IN")}`
                      : "Free"}
                  </span>
                </div>
                
                {isGiftCardApplied && (
                <div className="flex justify-between">
                  <span className="text-light">Available Gift Card Balance</span>
                  <span>
                    {giftCardLoading
                      ? "Checking..."
                      : `₹${Number(giftCardBalance || 0).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`}
                  </span>
                </div>
                )}

                {isGiftCardApplied && (
                <div className="flex justify-between text-green-600">
                  <span>Gift Card Redeemed</span>
                  <span>
                    - ₹{giftCardRedeemed.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}

                <div className="flex justify-between">
                  <span className="text-light">Remaining Payment</span>
                  <span>
                    {giftCardLoading
                      ? "Checking..."
                      : `₹${remainingPayment.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`}
                  </span>
                </div>

                {giftCardError && (
                  <p className="text-sm text-red-600">
                    {giftCardError}
                  </p>
                )}

                <div className="border-t border-gray-300 pt-4">
                  <div className="flex justify-between text-black text-[18px] font-medium">
                    <span>Total</span>
                    <span>
                      {/* ₹{Math.round(displayTotal).toLocaleString("en-IN")} */}
                       {/* ₹{Math.round(
                          Number(checkoutInfo?.orderTotal ?? checkoutInfo?.total ?? 0) || 0
                        ).toLocaleString("en-IN")} */}
                        ₹{Math.round(remainingPayment).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
