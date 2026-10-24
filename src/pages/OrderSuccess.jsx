import React, { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrder } from "../features/orders/orderThunk";
import Button from "../components/ui/Button";
import Section from "../components/ui/Section";
import Row from "../components/ui/Row";

export default function OrderSuccess() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { order, loading, error } = useSelector((state) => state.orders);

  useEffect(() => {
    if (id) {
      dispatch(fetchOrder(id));
    }
  }, [dispatch, id]);

  if (!id) {
    return (
      <div className="p-10 text-center">
        <p>Order ID not found.</p>
        <Button
          variant="common"
          onClick={() => navigate("/my-account/orders")}
        >
          Check My Orders
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-10 text-center">
        Loading order details...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-10 text-center">
        <p>{error || "Order details not found."}</p>
        <Button
          variant="common"
          onClick={() => navigate("/my-account/orders")}
        >
          Check My Orders
        </Button>
      </div>
    );
  }

  const isCOD = ["cod", "cash on delivery"].includes(
    String(order.payment_method || "").toLowerCase()
  );

  const isPaid = String(order.payment_status || "").toLowerCase() === "paid";

  return (
    <Section className="!pt-[25px] custom-lg:!pt-[50px] !py-0">
      <Row>
        <div className="text-center max-w-xl w-full mx-auto rounded-xl border bg-white p-8 shadow-sm">
          <div className="text-green-600 text-5xl mb-4">✓</div>

          <h1 className="text-[24px] font-semibold mb-3">
            Order placed successfully!
          </h1>

          <p className="mb-4">
            Order No:{" "}
            <strong className="font-medium">{order.order_number || order._id}</strong>
          </p>

          <p className="mb-2">
            Total: ₹
            {Number(order.total_price || 0).toFixed(2)}
          </p>

          <p className="mb-4">
            Payment method: {order.payment_method || "Not available"}
          </p>

          <p className="mb-6">
            {isCOD
              ? "Payment is due on delivery."
              : isPaid
                ? "Payment received successfully."
                : "Payment is pending confirmation."}
          </p>

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