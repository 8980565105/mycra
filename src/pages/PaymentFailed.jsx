import React from "react";
import { Link } from "react-router-dom";

export default function PaymentFailed() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-5">
      <div className="text-center max-w-lg">
        <div className="text-5xl text-red-500 mb-4">✕</div>
        <h1 className="text-3xl font-semibold mb-3">
          Payment Failed
        </h1>
        <p className="text-gray-500 mb-6">
          Your payment could not be completed. Please check
          your payment status before trying again.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/payment"
            className="inline-block bg-black text-white px-7 py-3"
          >
            RETURN TO PAYMENT
          </Link>
          <Link
            to="/my-account/orders"
            className="inline-block border border-black px-7 py-3"
          >
            MY ORDERS
          </Link>
        </div>
      </div>
    </div>
  );
}