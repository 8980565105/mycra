import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  Info,
  Settings,
  Gift,
  Wallet as WalletIcon,
  History,
} from "lucide-react";
import Section from "../components/ui/Section";
import Row from "../components/ui/Row";
import Button from "../components/ui/Button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addMoneyToWallet, createWalletTopUpSession, fetchWallet, fetchWalletTopUpStatus } from "../features/wallet/walletThunk";
import { getMyGiftCards } from "../features/giftCards/giftCardThunk";

export default function Wallets() {
  const navigation = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();  
  const [paymentMessage, setPaymentMessage] = useState("");
  const topupStatus = searchParams.get("topup");
  const sessionId = searchParams.get("session_id");
  const { wallet, error } = useSelector((state) => state.wallet);
  const maxAddLimit = Number(wallet?.maxAddLimit ?? 10000);
  const walletBalance = Number(wallet?.balance ?? 0);
  const { giftCards } = useSelector((state) => state.giftCards);
  const [amount, setAmount] = useState(1000);
  const [addingMoney, setAddingMoney] = useState(false);
  const isKycVerified = wallet?.isKycVerified;
  // useEffect(() => {
  //   dispatch(fetchWallet());
  //   dispatch(getMyGiftCards());
  // }, [dispatch]);
  
  useEffect(() => {
    const refreshWalletData = async () => {
      const results = await Promise.allSettled([
        dispatch(fetchWallet()).unwrap(),
        dispatch(getMyGiftCards()).unwrap(),
      ]);

      results.forEach((result) => {
        if (result.status === "rejected") {
          console.error("Wallet refresh failed:", result.reason);
        }
      });
    };

    refreshWalletData();

    const handleFocus = () => {
      refreshWalletData();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [dispatch]);

  // useEffect(() => {
  //   if (topupStatus === "cancelled") {
  //     setPaymentMessage("Payment was cancelled.");
  //     setSearchParams({}, { replace: true });
  //     return;
  //   }

  //   if (topupStatus !== "success" || !sessionId) {
  //     return;
  //   }

  //   let cancelled = false;
  //   let timer;
  //   let attempts = 0;
  //   const maxAttempts = 5;

  //   const verifyWalletUpdate = async () => {
  //     if (cancelled) return;

  //     attempts++;

  //     setPaymentMessage("Payment completed. Refreshing your wallet balance...");

  //     try {
  //       await dispatch(fetchWallet()).unwrap();

  //       dispatch(getMyGiftCards());
  //     } catch (error) {
  //       console.error("Wallet verification failed:", error);
  //     }

  //     if (cancelled) return;

  //     if (attempts < maxAttempts) {
  //       timer = setTimeout(verifyWalletUpdate, 2000);
  //     } else {
  //       setPaymentMessage("Payment processing check completed. Please verify your wallet balance.");

  //       setSearchParams({}, { replace: true });
  //     }
  //   };

  //   verifyWalletUpdate();

  //   return () => {
  //     cancelled = true;
  //     clearTimeout(timer);
  //   };
  // }, [dispatch, topupStatus, sessionId, setSearchParams]);
    
  useEffect(() => {
    if (topupStatus === "cancelled") {
      setPaymentMessage("Payment was cancelled.");
      setSearchParams({}, { replace: true });
      return;
    }

    if (topupStatus !== "success" || !sessionId) {
      return;
    }

    let cancelled = false;
    let timer;
    let attempts = 0;
    const maxAttempts = 15;

    const verifyTopUp = async () => {
      if (cancelled) return;

      try {
        const topUp = await dispatch(
          fetchWalletTopUpStatus({ sessionId })
        ).unwrap();

        if (cancelled) return;

        if (topUp.status === "paid") {
          await dispatch(fetchWallet()).unwrap();

          if (cancelled) return;

          await dispatch(getMyGiftCards()).unwrap().catch(() => {});

          setPaymentMessage(
            `Wallet successfully recharged with ₹${Number(
              topUp.amount
            ).toLocaleString("en-IN")}.`
          );

          setSearchParams({}, { replace: true });
          return;
        }

        if (topUp.status === "failed") {
          setPaymentMessage(
            "Wallet recharge failed. Your wallet has not been credited."
          );
          setSearchParams({}, { replace: true });
          return;
        }
      } catch (error) {
        console.error("Top-up status check failed:", error);
      }

      if (cancelled) return;

      attempts += 1;

      if (attempts < maxAttempts) {
        setPaymentMessage(
          "Payment received or processing. Waiting for wallet confirmation..."
        );

        timer = setTimeout(verifyTopUp, 2000);
      } else {
        setPaymentMessage(
          "Wallet credit is not confirmed yet. Please check your wallet again before retrying payment."
        );
      }
    };

    verifyTopUp();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    dispatch,
    topupStatus,
    sessionId,
    setSearchParams,
  ]);

  const handleAddMoney = async () => {
    const numericAmount = Number(amount);

    if (
      !Number.isSafeInteger(numericAmount) ||
      numericAmount < 50 ||
      numericAmount > maxAddLimit
    ) {
      alert(
        `Please enter an amount between ₹50 and ₹${maxAddLimit}.`
      );
      return;
    }

    setAddingMoney(true);

    try {
      const result = await dispatch(
        createWalletTopUpSession({ amount: numericAmount })
      ).unwrap();

      if (!result?.url) {
        throw new Error("Stripe checkout URL was not received.");
      }
      window.location.assign(result.url);
    } catch (error) {
      alert(
        typeof error === "string"
          ? error
          : error?.message || "Unable to start Stripe payment."
      );
      setAddingMoney(false);
    }
  };

  const quickAdd = (val) => {
    const currentAmount = Number(amount) || 0;

    if (currentAmount + val > maxAddLimit) {
      return;
    }

    setAmount(currentAmount + val);
  };

// const walletBalance = Number(wallet?.balance || 0);
// const voucherBalance = Number(wallet?.voucherBalance || 0);

// const activeGiftCards = giftCards?.filter(
//     (card) =>
//       String(card.status || "").toLowerCase() === "active" &&
//       Number(card.remainingBalance || 0) > 0
//   ) || [];

const voucherBalance =
  wallet?.voucherStatus === true
    ? Number(wallet?.voucherBalance ?? 0)
    : 0;

const activeGiftCards = (giftCards || []).filter(
  (card) =>
    String(card.status || "").toLowerCase() === "active" &&
    Number(card.remainingBalance || 0) > 0
);

const totalGiftCardBalance = activeGiftCards.reduce(
  (total, card) => total + Number(card.remainingBalance || 0),
  0
);

const totalBalance =
  walletBalance + totalGiftCardBalance + voucherBalance;


// const totalGiftCardBalance = activeGiftCards.reduce(
//   (total, card) => total + Number(card.remainingBalance || 0),
//   0
// );

// const totalBalance = walletBalance + totalGiftCardBalance + voucherBalance;

  return (
    <>
      <h1 className="text-[28px] font-bold text-gray-900 mb-4">
        Mycra Pay balance
      </h1>
      {paymentMessage && (
        <p className="mb-4 text-sm text-blue-700">
          {paymentMessage}
        </p>
      )}
      <div className="flex flex-col lg:flex-row gap-[30px] max-w-6xl">
        <div className="flex-1 space-y-4">
          <div className="bg-gray-50 rounded-lg shadow-sm p-2 md:p-4">
            <div className="flex justify-between items-center py-4 border-b border-dashed border-gray-300">
              <span className="font-bold text-gray-900">Total balance</span>
              <span className="font-bold text-theme text-xl">
                ₹{totalBalance.toLocaleString("en-IN")}
              </span>
            </div>
            {walletBalance > 0 && (
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Wallet</span>
              <span className="text-gray-600">
                ₹{walletBalance.toLocaleString("en-IN")}
              </span>
            </div>
            )}
            {totalGiftCardBalance > 0 && (
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <div>
                <div className="text-gray-600">Gift Cards</div>
                <div className="text-xs sec-text-color">
                  Includes Cashback & Refunds
                </div>
              </div>
              <span className="text-gray-600">
                ₹{totalGiftCardBalance.toLocaleString("en-IN")}
              </span>
            </div>
            )}
            {voucherBalance > 0 && wallet?.voucherStatus === true && (
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-600">Vouchers</span>
              <span className="text-gray-600">
                ₹{Number(wallet?.voucherBalance || 0).toLocaleString("en-IN")}
              </span>
            </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg shadow-sm p-2 md:p-4">
            <h2 className="font-bold text-gray-900 mb-3">
              Add money to Wallet
            </h2>

            {!isKycVerified && (
              <>
                <label className="block text-xs text-gray-500 borde border-gray-300 rounded-md px-3 pt-1 pb-2 mb-3 w-full max-w-xs">
                  Enter Amount
                  <div className="flex items-center text-xl text-gray-400 mt-1">
                    <span className="mr-1">₹</span>
                    <input
                      type="numeric"
                      value={amount}
                      disabled
                      className="w-full outline-none"
                    />
                  </div>
                </label>
                <div className="flex gap-2 mb-3">
                  {[500, 1000, 1500].map((val) => (
                    <button
                      key={val}
                      onClick={() => quickAdd(val)}
                      className="border border-gray-300 rounded-full px-3 py-1 text-sm font-medium text-gray-800 hover:bg-gray-50"
                    >
                      + ₹{val}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <Info size={16} className="text-gray-500" />
                  <span>
                    You can add up to ₹{wallet?.maxAddLimit || 10000}.00
                  </span>
                </div>
                <Button
                  onClick={() => navigation("/walletkycintro")}
                  variant="common"
                >
                  Set-up wallet to add money
                </Button>
                <p className="text-xs text-gray-400 mt-3 ">
                  To set up your wallet, complete the eKYC journey.
                </p>
              </>
            )}

            {isKycVerified && (
              <>
                <label className="block bg-white text-xs text-gray-500 border border-gray-300 rounded-md px-3 pt-1 pb-2 mb-3 w-full max-w-xs">
                  Enter Amount
                  <div className="flex items-center text-xl text-gray-900 mt-1">
                    <span className="mr-1">₹</span>
                    <input
                      type="number"
                      min={50}
                      max={maxAddLimit}
                      step={1}
                      value={amount}
                      onChange={(e) => {
                        const value = e.target.value;

                        if (value === "") {
                          setAmount("");
                          return;
                        }

                        const numericValue = Number(value);

                        if (numericValue >= 0 && numericValue <= maxAddLimit) {
                          setAmount(value);
                        }
                      }}
                      className="w-full outline-none"
                    />
                  </div>
                </label>
                <div className="flex gap-2 mb-3">
                  {/* {[500, 1000, 1500].map((val) => (
                    <button
                      key={val}
                      onClick={() => quickAdd(val)}
                      className="border border-gray-300 rounded-full px-3 py-1 text-sm font-medium text-gray-800 hover:bg-gray-50"
                    >
                      + ₹{val}
                    </button>
                  ))} */}


                  {[500, 1000, 1500].map((val) => {
                    const currentAmount = Number(amount) || 0;
                    const isDisabled = currentAmount + val > maxAddLimit;

                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => quickAdd(val)}
                        disabled={isDisabled}
                        className={`border rounded-full px-3 py-1 text-sm font-medium transition ${isDisabled
                            ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                            : "border-gray-300 text-gray-800 hover:bg-gray-50 cursor-pointer"
                          }
                        `}
                      >
                        + ₹{val}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <Info size={16} className="text-gray-500" />
                  <span>
                    You can add up to ₹{maxAddLimit.toLocaleString("en-IN")}.00
                  </span>
                </div>
                {error && (
                  <p className="text-red-500 text-xs mb-2">{error}</p>
                )}
                <Button
                  variant="common"
                  onClick={handleAddMoney}
                  disabled={addingMoney}
                >
                  {addingMoney ? "Redirecting to payment..." : "Add Money"}
                </Button>
              </>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg shadow-sm py-3 flex items-center gap-3 p-2 md:p-4 max-w-md">
            <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
              <div className="w-12 h-12 bg-amber-300 rounded rotate-6 flex items-center justify-center text-[10px] text-gray-700">
                🎁
              </div>
            </div>
            <div>
              <div className="font-bold text-gray-900 text-sm">
                Scratch Card Rewards
              </div>
              <div className="text-sm text-gray-600">
                Win offers from top Brands every time you Pay
              </div>
              <div className="text-xs text-gray-400">
                Amazon, Swiggy, Uber & More
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-72 space-y-4 custom-lg:sticky custom-lg:top-[110px] self-start">
          <div className="bg-gray-50 rounded-lg shadow-sm p-4">
            <h3 className="font-bold text-gray-900 mb-2">
              Do more with Amazon Pay Balance
            </h3>
            <div className="divide-y divide-gray-100">
              <RowItem
                icon={<Gift size={18} />}
                label="Add Gift Card to Balance"
                url="/gifcard"
              />
              <RowItem
                icon={<WalletIcon size={18} />}
                label="Add Cash to balance"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm py-4">
            <RowItem
              icon={<History size={18} />}
              label="Transaction history"
              bold
              url="/transectionhistory"
            />
          </div>
        </div>
      </div>
    </>
  );
}

function RowItem({ icon, label, bold, url }) {
  return (
    <a
      href={url}
      className="flex items-center justify-between py-3 cursor-pointer hover:bg-gray-50 -mx-1 px-2 rounded"
    >
      <div className="flex items-center gap-2">
        <span className="text-gray-500">{icon}</span>
        <span className={bold ? "font-bold text-gray-900" : "text-gray-800"}>
          {label}
        </span>
      </div>
      <ChevronRight size={18} className="text-gray-400" />
    </a>
  );
}
