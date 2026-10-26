import React, { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearCart } from "../features/cart/cartSlice";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const attemptRef = useRef(0);
  const timerRef = useRef(null);

  const paymentIntent =
    searchParams.get("payment_intent") ||
    searchParams
      .get("payment_intent_client_secret")
      ?.split("_secret_")[0];

    useEffect(() => {
      if (!paymentIntent) return;

      sessionStorage.setItem(
        "paymentVerificationPending",
        paymentIntent
      );

      sessionStorage.removeItem("checkoutInfo");
    }, [paymentIntent]);

  useEffect(() => {
    let cancelled = false;

    attemptRef.current = 0;
    setLoading(true);
    setError("");

    const finalizePayment = async () => {
      if (!paymentIntent) {
        if (!cancelled) {
          setError("Payment information not found.");
          setLoading(false);
        }
        return;
      }

      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/payments/stripe/finalize`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${
                localStorage.getItem("token") || ""
              }`,
            },
            body: JSON.stringify({
              paymentIntentId: paymentIntent,
            }),
          }
        );

        const data = await response.json();

        if (cancelled) return;
        const resultData = data?.data ?? data;

        const isProcessing =
          response.status === 202 ||
          resultData?.processing === true ||
          resultData?.code === "PAYMENT_PROCESSING";

        if (isProcessing) {
          if (attemptRef.current < 5) {
            attemptRef.current += 1;

            timerRef.current = setTimeout(() => {
              finalizePayment();
            }, 2000);

            return;
          }

          throw new Error(
            "Payment is still processing. Please check My Orders before retrying."
          );
        }

        if (!response.ok || !data?.success) {
          throw new Error(
            data?.message || "Unable to confirm payment."
          );
        }

        const confirmedOrder =
          data?.data?.order ||
          data?.order ||
          resultData?.order;

        if (!confirmedOrder?._id) {
          throw new Error(
            "Order ID was not returned. Please check My Orders before retrying."
          );
        }

        dispatch(clearCart());
        sessionStorage.removeItem("checkoutInfo");
        sessionStorage.removeItem("pendingPayment");
        sessionStorage.removeItem("paymentVerificationPending");
        localStorage.removeItem("appliedCoupon");

        window.location.replace(
          `/order-success/${confirmedOrder._id}`
        );
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || "Unable to verify payment."
          );
          setLoading(false);
        }
      }
    };

    finalizePayment();

    return () => {
      cancelled = true;

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [paymentIntent, dispatch]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-5">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-pink-500 rounded-full animate-spin mb-5" />

        <h1 className="text-2xl font-semibold mb-2">
          Verifying Your Payment
        </h1>

        <p className="text-gray-500 text-center">
          Please wait while we confirm your payment
          and prepare your order. Do not refresh this page.
        </p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-5">
        <div className="text-center max-w-lg">
          <h1 className="text-2xl font-semibold text-red-500 mb-4">
            Payment Confirmation Pending
          </h1>

          <p className="text-gray-600 mb-6">
            {error}
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/my-account/orders"
              className="inline-block px-6 py-3 bg-black text-white"
            >
              CHECK MY ORDERS
            </Link>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-block px-6 py-3 border border-gray-300"
            >
              RETRY VERIFICATION
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Do not pay again until you have checked whether your order
            was created.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
