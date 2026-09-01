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
  Landmark,
  Wallet as WalletIcon,
  Banknote,
  QrCode,
} from "lucide-react";
// const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
const stripePromise = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;

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

  const handlePayment = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError("");
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
      });
      if (error) {
        setError(error.message || "Payment failed.");
        setLoading(false);
      }
    } catch (err) {
      setError("Unable to process payment.");
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

      const qrUrl =
        paymentIntent?.next_action?.upi_display_qr_code?.image_data_url ||
        paymentIntent?.next_action?.upi_display_qr_code
          ?.hosted_instructions_url;

      if (qrUrl) {
        setQrImage(qrUrl);
        setShowQr(true);
        pollPaymentStatus(clientSecret);
      } else {
        setError(
          `QR data not received. Status: ${paymentIntent?.status || "unknown"}, next_action type: ${paymentIntent?.next_action?.type || "none"}.`,
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
        setError("Payment was cancelled.");
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

      {showQr && qrImage && (
        <div className="flex flex-col items-center gap-4">
          <h3 className="text-[16px] font-medium">Scan QR and Pay</h3>
          <div className="text-[20px] font-semibold">
            ₹{Math.round(amount).toLocaleString("en-IN")}
          </div>
          <img
            src={qrImage}
            alt="UPI QR Code"
            className="w-[220px] h-[220px] border border-gray-200 p-2"
          />
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

  const [checkoutInfo, setCheckoutInfo] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState("card");
  const [clientSecret, setClientSecret] = useState("");
  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [fetchedForMethod, setFetchedForMethod] = useState("");
  const [stripeAmountData, setStripeAmountData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  const currentMethod = PAYMENT_METHODS.find((m) => m.key === selectedMethod);
  const needsClientSecret =
    currentMethod?.type === "stripe" || currentMethod?.type === "upi_qr";

  useEffect(() => {
    const stored = sessionStorage.getItem("checkoutInfo");
    if (!stored) {
      setError("Checkout session not found.");
      setLoading(false);
      return;
    }
    try {
      setCheckoutInfo(JSON.parse(stored));
    } catch (err) {
      setError("Invalid checkout session.");
    } finally {
      setLoading(false);
    }
  }, []);

  // useEffect(() => {
  //   if (!needsClientSecret || !checkoutInfo) return;
  //   if (fetchedForMethod === selectedMethod) return;

  //   const createIntent = async () => {
  //     setInitializing(true);
  //     setClientSecret("");
  //     try {
  //       const response = await fetch(
  //         `${process.env.REACT_APP_API_URL}/payments/stripe/create-intent`,
  //         {
  //           method: "POST",
  //           headers: {
  //             "Content-Type": "application/json",
  //             Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
  //           },
  //           body: JSON.stringify({
  //             cart_id: checkoutInfo.cart_id,
  //             coupon_id: checkoutInfo.coupon_id,
  //             shippingAddress: checkoutInfo.shippingAddress,
  //             email: checkoutInfo.email,
  //             method: selectedMethod,
  //           }),
  //         },
  //       );
  //       const data = await response.json();
  //       if (!response.ok || !data?.success) {
  //         throw new Error(data?.message || "Unable to initialize payment");
  //       }
  //       setClientSecret(data.data.clientSecret);
  //       setStripeAmountData({ amount: data.data.amount });
  //       setFetchedForMethod(selectedMethod);
  //       sessionStorage.setItem(
  //         "pendingPayment",
  //         JSON.stringify({
  //           paymentIntentId: data.data.paymentIntentId,
  //           clientSecret: data.data.clientSecret,
  //           subtotal: data.data.subtotal,
  //           discount: data.data.discount,
  //           shipping: data.data.shipping,
  //           platformCharge: data.data.platformCharge,
  //           amount: data.data.amount,
  //         }),
  //       );
  //     } catch (err) {
  //       toast.error(err.message || "Unable to initialize payment");
  //     } finally {
  //       setInitializing(false);
  //     }
  //   };
  //   createIntent();
  // }, [needsClientSecret, checkoutInfo, selectedMethod, fetchedForMethod]);

  useEffect(() => {
    if (!needsClientSecret || !checkoutInfo) return;

    const initPayment = async () => {
      setInitializing(true);
      try {
        if (!paymentIntentId) {
          // ==== First time: CREATE intent ====
          const response = await fetch(
            `${process.env.REACT_APP_API_URL}/payments/stripe/create-intent`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
              },
              body: JSON.stringify({
                cart_id: checkoutInfo.cart_id,
                coupon_id: checkoutInfo.coupon_id,
                shippingAddress: checkoutInfo.shippingAddress,
                email: checkoutInfo.email,
                method: selectedMethod,
              }),
            },
          );
          const data = await response.json();
          if (!response.ok || !data?.success) {
            throw new Error(data?.message || "Unable to initialize payment");
          }
          setClientSecret(data.data.clientSecret);
          setPaymentIntentId(data.data.paymentIntentId);
          setStripeAmountData({ amount: data.data.amount });
          sessionStorage.setItem(
            "pendingPayment",
            JSON.stringify({
              paymentIntentId: data.data.paymentIntentId,
              clientSecret: data.data.clientSecret,
              amount: data.data.amount,
            }),
          );
        } else {
          // ==== Already have an intent: UPDATE method type only ====
          const response = await fetch(
            `${process.env.REACT_APP_API_URL}/payments/stripe/update-intent`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
              },
              body: JSON.stringify({
                paymentIntentId,
                method: selectedMethod,
              }),
            },
          );
          const data = await response.json();
          if (!response.ok || !data?.success) {
            throw new Error(data?.message || "Unable to switch payment method");
          }
          setClientSecret(data.data.clientSecret);
          setStripeAmountData({ amount: data.data.amount });
        }
      } catch (err) {
        toast.error(err.message || "Unable to initialize payment");
      } finally {
        setInitializing(false);
      }
    };

    initPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsClientSecret, checkoutInfo, selectedMethod]);

  const handlePlaceOrder = async () => {
    if (!checkoutInfo) return;
    setPlacing(true);
    try {
      const orderPayload = {
        coupon_id: checkoutInfo.coupon_id,
        shippingAddress: checkoutInfo.shippingAddress,
        payment_method: selectedMethod === "wallet" ? "Wallet" : "COD",
        shipping: checkoutInfo.shipping,
        platform_charge: checkoutInfo.platformCharge,
        items: checkoutInfo.items,
      };
      const response = await fetch(`${process.env.REACT_APP_API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify(orderPayload),
      });
      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Unable to place order");
      }
      toast.success("Order placed successfully!");
      dispatch(clearCart());
      sessionStorage.removeItem("checkoutInfo");
      localStorage.removeItem("appliedCoupon");
      navigate(`/order-success/${data.data._id}`);
    } catch (err) {
      toast.error(err.message || "Unable to place order");
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

  const displayTotal = checkoutInfo.total;
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
          <h2 className="text-[28px] font-normal mb-[40px] hidden md:block">
            <Link to="/home">Home</Link> /{" "}
            <span className="font-light">Payment</span>
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-[30px] items-start">
            <div className="bg-[#f8f8f8] p-5 md:p-8">
              <h1 className="text-[24px] text-black mb-6">Payment Method</h1>

              <div className="bg-white border border-gray-200 rounded-[4px] mb-[24px]">
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
                <>
                  {initializing && (
                    <p className="text-light text-[14px]">
                      Preparing secure payment...
                    </p>
                  )}
                  {!initializing && clientSecret && (
                    <Elements
                      stripe={stripePromise}
                      options={{
                        clientSecret,
                        appearance,
                        paymentMethodOrder: ["card"],
                      }}
                    >
                      <StripePaymentForm
                        paymentData={{
                          amount: stripeAmountData?.amount || displayTotal,
                        }}
                      />
                    </Elements>
                  )}
                </>
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
                <div className="border-t border-gray-300 pt-4">
                  <div className="flex justify-between text-black text-[18px] font-medium">
                    <span>Total</span>
                    <span>
                      ₹{Math.round(displayTotal).toLocaleString("en-IN")}
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
