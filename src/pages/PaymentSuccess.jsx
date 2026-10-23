import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearCart } from "../features/cart/cartSlice";
import Row from "../components/ui/Row";
import Section from "../components/ui/Section";
import Button from "../components/ui/Button";
export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);
  const paymentIntent = searchParams.get("payment_intent");
  const finalizePayment = async (retryCount = 0) => {
    if (!paymentIntent) {
      setError("Payment information not found.");
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/payments/stripe/finalize`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
          body: JSON.stringify({ paymentIntentId: paymentIntent }),
        },
      );
      const data = await response.json();

      if (!response.ok || !data?.success) {
        if (data?.message?.includes("being processed") && retryCount < 5) {
          setTimeout(() => finalizePayment(retryCount + 1), 2000);
          return;
        }
        throw new Error(data?.message || "Unable to create order");
      }

      const confirmedOrder = data?.data?.order;

      if (!confirmedOrder?._id) {
        throw new Error("Payment was verified, but order confirmation was not returned. Please check My Orders before retrying.");
      }

      setOrder(confirmedOrder);
      dispatch(clearCart());
      sessionStorage.removeItem("pendingPayment");
      sessionStorage.removeItem("checkoutInfo");
      localStorage.removeItem("appliedCoupon");
      setLoading(false);
    } catch (err) {
      setError(err.message || "Unable to finalize payment");
      setLoading(false);
    }
  };
  useEffect(() => {
    finalizePayment();
  }, [paymentIntent]);
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p>Confirming your payment...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-5">
        <div className="text-center">
          <h1 className="text-[28px] text-red-500 mb-4">
            Payment Verification Failed
          </h1>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link
            to="/my-account/orders"
            className="inline-block px-7 py-3 bg-black text-white"
          >
            VIEW MY ORDERS
          </Link>
        </div>
      </div>
    );
  }
  return (
    <Section className="!py-0 !pt-[25px] md:!pt-[50px]">
    <Row className="min-h-[60vh] flex items-center justify-center px-5">
      <div className="text-center">
        <div className="w-[70px] h-[70px] rounded-full border-2 border-green-500 flex items-center justify-center mx-auto mb-5">
          <span className="text-green-500 text-[32px]">✓</span>
        </div>
        <h1 className="text-[28px] text-black mb-3">Payment Successful</h1>
        <p className="text-light mb-6">
          Your payment has been received successfully.
        </p>
        {order?.order_number && (
          <p className="text-[14px] mb-4">
            Order No: <strong>{order.order_number}</strong>
          </p>
        )}
        {paymentIntent && (
          <p className="text-[12px] text-gray-500 mb-6 break-all">
            Payment ID: {paymentIntent}
          </p>
        )}
        <Button
          variant="common"
          onClick={() => navigate("/my-account/orders")}
        >
          VIEW MY ORDERS
        </Button>
      </div>
    </Row>
    </Section>
  );
}
