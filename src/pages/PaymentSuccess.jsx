import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearCart } from "../features/cart/cartSlice";
import Button from "../components/ui/Button";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("Verifying");

  const attemptRef = useRef(0);
  const timerRef = useRef(null);

  const paymentIntent =
    searchParams.get("payment_intent") ||
    searchParams
      .get("payment_intent_client_secret")
      ?.split("_secret_")[0];

  useEffect(() => {
    let cancelled = false;

    attemptRef.current = 0;
    setLoading(true);
    setError("");
    setConfirmedOrder(null);
    setPaymentStatus("Verifying");

    const finalizePayment = async () => {
      if (!paymentIntent) {
        if (!cancelled) {
          setError("Payment reference was not found.");
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
            setPaymentStatus("Processing");

            timerRef.current = setTimeout(
              finalizePayment, 2000
            );
            return;
          }

          throw new Error(
            "Payment is still processing. Please check My Orders before retrying."
          );
        }

        if (!response.ok || data?.success !== true) {
          throw new Error(
            data?.message || "Payment could not be verified."
          );
        }

        const order = resultData?.order || data?.order;
        const orderId = order?._id || order?.id;

        if (!orderId) {
          throw new Error(
            "Payment response did not contain an order ID. Check My Orders before retrying."
          );
        }
        setConfirmedOrder({...order, _id: orderId});
        setPaymentStatus("Paid");
        setLoading(false);

        dispatch(clearCart());
        sessionStorage.removeItem("checkoutInfo");
        sessionStorage.removeItem("pendingPayment");
        sessionStorage.removeItem("paymentVerificationPending");
        localStorage.removeItem("appliedCoupon");

        timerRef.current = setTimeout(() => {
          if (!cancelled) {
            navigate(`/order-success/${orderId}`, {replace: true});
          }
        }, 5000);
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
  }, [paymentIntent, dispatch, navigate]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-5">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-pink-500 rounded-full animate-spin mb-5" />

        <h1 className="text-2xl font-semibold mb-2">
          Verifying Your Payment
        </h1>

        <p className="text-gray-500 text-center max-w-md">
          We are confirming your payment and  your order. Please wait and do not pay again.
        </p>

        <p className="text-sm text-gray-500 mt-4">
          Status: {paymentStatus}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-5">
        <div className="text-center max-w-lg">
          <h1 className="text-2xl font-semibold text-amber-600 mb-4">
            Payment Confirmation Pending
          </h1>

          <p className="text-[16px] sec-text-color mb-6">
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
            Do not make another payment until you have checked whether your order already exists.
          </p>
        </div>
      </div>
    );
  }

  if (confirmedOrder) {
    const orderId = confirmedOrder._id;

    // const orderTotal =
    //   confirmedOrder.total_price ??
    //   confirmedOrder.amount_payable ??
    //   confirmedOrder.order_total ??
    //   confirmedOrder.total;
    const orderTotal = Number(
      confirmedOrder.order_total ??
      confirmedOrder.total_price ??
      0
    );

    const giftCardRedeemed = Number(
      confirmedOrder.gift_card_redeemed ?? 0
    );

    const amountPaid = Number(
      confirmedOrder.amount_payable ??
      orderTotal - giftCardRedeemed
    );

    return (
      <div className="min-h-[70vh] flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-xl bg-white border rounded-xl shadow-sm p-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 text-4xl">
            ✓
          </div>

          <h1 className="text-[20px] md:text-[30px] font-bold text-gray-900 mb-3">
            Payment Successful!
          </h1>

          <p className="text-gray-600 mb-6">
            Your payment was successful and your order has been placed.
          </p>

          <div className="rounded-lg bg-gray-50 p-5 text-left space-y-3">
            <div className="flex justify-between gap-4">
              <span className="text-gray-500">
                Payment Status
              </span>
              <span className="font-semibold text-green-600">
                {paymentStatus}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-500">
                Order ID
              </span>
              <span className="font-medium break-all text-right">
               {confirmedOrder.order_number ||
                  confirmedOrder.orderNumber ||
                  confirmedOrder.order_no ||
                  orderId}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-500">
                Payment Reference
              </span>
              <span className="font-medium break-all text-right">
                {paymentIntent}
              </span>
            </div>

            {/* {orderTotal != null && (
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">
                  Order Total
                </span>
                <span className="font-semibold">
                  ₹{Number(orderTotal).toLocaleString("en-IN")}
                </span>
              </div>
              
            )} */}
            <div className="flex justify-between gap-4">
                <span className="text-gray-500">Order Total</span>
                <span className="font-semibold">
                  ₹{orderTotal.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Gift Card Redeemed</span>
                <span className="font-semibold">
                  −₹{giftCardRedeemed.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Amount Paid</span>
                <span className="font-semibold">
                  ₹{amountPaid.toLocaleString("en-IN")}
                </span>
              </div>
          </div>

          <p className="text-sm text-gray-500 mt-5">
            Redirecting to your Order Success page...
          </p>

          <Button
            variant="common"
            onClick={() => navigate(`/order-success/${orderId}`)}
            className="mt-5"
          >
              VIEW ORDER NOW
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
