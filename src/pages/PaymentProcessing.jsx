import React from "react";
import { Link } from "react-router-dom";

export default function PaymentProcessing() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-5">
      <div className="text-center max-w-lg">
        <div className="text-5xl mb-4">⏳</div>
        <h1 className="text-3xl font-semibold mb-3">
          Payment Processing
        </h1>
        <p className="text-gray-500 mb-6">
          Your payment is being verified. Please check your
          order status before trying to pay again.
        </p>
        <Link
          to="/my-account/orders"
          className="inline-block bg-black text-white px-7 py-3"
        >
          CHECK MY ORDERS
        </Link>
      </div>
    </div>
  );
}