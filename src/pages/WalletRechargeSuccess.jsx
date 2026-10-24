import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api"; // તમારા project નો યોગ્ય API import વાપરો

export default function WalletRechargeSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState("checking");
  const [balance, setBalance] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    const verifyRecharge = async () => {
      if (!sessionId) {
        setStatus("pending");
        setMessage(
          "Recharge reference not found. Please check your wallet balance."
        );
        return;
      }

      try {
        // Backend endpoint બનાવવો જરૂરી છે.
        // આ endpoint Stripe session verify કરે, પરંતુ recharge
        // બીજી વાર credit ન કરે.
        const response = await api.post(
          "/wallet/verify-recharge",
          { session_id: sessionId }
        );

        const data = response.data;

        if (!data?.success) {
          throw new Error(
            data?.message || "Recharge verification is pending."
          );
        }

        if (cancelled) return;

        setBalance(data.data?.balance ?? null);
        setStatus("success");
      } catch (error) {
        if (cancelled) return;

        setStatus("pending");
        setMessage(
          error.response?.data?.message ||
            "Recharge is not yet confirmed. Please check your wallet shortly."
        );
      }
    };

    verifyRecharge();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-5">
      <div className="text-center max-w-lg">
        {status === "checking" && (
          <>
            <h1 className="text-3xl font-semibold mb-3">
              Verifying Recharge...
            </h1>
            <p>Please wait while we check your payment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-5xl text-green-600 mb-4">✓</div>
            <h1 className="text-3xl font-semibold mb-3">
              Wallet Recharge Successful
            </h1>
            <p className="mb-4">
              Your recharge has been verified.
            </p>
            {balance !== null && (
              <p className="mb-6">
                Updated balance: ₹{Number(balance).toFixed(2)}
              </p>
            )}
            <Link
              to="/wallets"
              className="inline-block bg-black text-white px-7 py-3"
            >
              GO TO WALLET
            </Link>
          </>
        )}

        {status === "pending" && (
          <>
            <h1 className="text-3xl font-semibold mb-3">
              Recharge Confirmation Pending
            </h1>
            <p className="text-gray-500 mb-6">{message}</p>
            <Link
              to="/wallets"
              className="inline-block bg-black text-white px-7 py-3"
            >
              CHECK WALLET
            </Link>
          </>
        )}
      </div>
    </div>
  );
}