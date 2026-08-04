import React, { useState, useEffect } from "react";
import { Gift, Info, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchWallet, redeemGiftCard } from "../../features/wallet/walletThunk";
import Row from "../ui/Row";
import Section from "../ui/Section";
import Button from "../ui/Button";

export default function GiftCardToBalance() {
  const navigation = useNavigate();
  const dispatch = useDispatch();
  const { wallet, loading, error } = useSelector((state) => state.wallet);

  const [giftCardCode, setGiftCardCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState("");
  const [redeemSuccess, setRedeemSuccess] = useState("");

  useEffect(() => {
    dispatch(fetchWallet());
  }, [dispatch]);

  const handleAddGiftCard = async () => {
    setRedeemError("");
    setRedeemSuccess("");

    if (!giftCardCode.trim()) {
      setRedeemError("Please enter a gift card code.");
      return;
    }

    setRedeeming(true);
    try {
      const result = await dispatch(
        redeemGiftCard({ code: giftCardCode.trim() }),
      );
      if (redeemGiftCard.fulfilled.match(result)) {
        setRedeemSuccess("Gift card added to your balance.");
        setGiftCardCode("");
        dispatch(fetchWallet());
      } else {
        setRedeemError(
          result.payload?.message || "Invalid or expired gift card code.",
        );
      }
    } catch (e) {
      setRedeemError("Something went wrong. Please try again.");
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <Section className="bg-gray-100">
      <Row>
        <h1 className="text-[28px] font-bold text-gray-900 mb-4">
          Amazon Pay Gift card
        </h1>
      </Row>

      <Row>
        <div className="flex flex-col lg:flex-row gap-4 max-w-6xl">
          <div className="flex-1 space-y-4">
            <div className="bg-white rounded-lg shadow-sm flex items-center gap-3 px-5 py-4">
              <div className="w-11 h-11 rounded-full border border-gray-200 flex items-center justify-center bg-gray-50">
                <Gift size={20} className="text-amber-500" />
              </div>
              <div>
                <div className="font-bold text-gray-900">Gift Cards</div>
                <div className="text-sm text-gray-500">
                  Available balance:{" "}
                  <span className="text-teal-700 font-semibold">
                    ₹{wallet?.giftCardBalance?.toFixed(2) || "0.00"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-3">
                Add gift card to balance
              </h2>

              <input
                type="text"
                value={giftCardCode}
                onChange={(e) => setGiftCardCode(e.target.value.toUpperCase())}
                placeholder="Enter gift card code"
                className="w-full max-w-xs border border-teal-600 focus:border-teal-700 rounded-md px-3 py-2 text-sm text-gray-900 outline-none mb-1"
              />
              <p className="text-xs text-gray-400 mb-3">
                e.g. 8U95-Y3E8CQ-39MPQ
              </p>

              <Button
                onClick={handleAddGiftCard}
                variant="primary"
                disabled={redeeming || !giftCardCode.trim()}
                className="max-w-xs"
              >
                {redeeming ? "Adding..." : "Add gift card to balance"}
              </Button>

              {redeemError && (
                <p className="text-red-500 text-xs mt-2">{redeemError}</p>
              )}
              {redeemSuccess && (
                <p className="text-teal-700 text-xs mt-2">{redeemSuccess}</p>
              )}

              <div className="flex items-start gap-2 text-xs text-gray-500 mt-4">
                <Info size={14} className="text-gray-400 mt-0.5 shrink-0" />
                <span>
                  For optimal utilisation, balance expiring the earliest will be
                  redeemed first.
                </span>
              </div>

              <button
                onClick={() => navigation("/help")}
                className="text-sm text-blue-600 hover:underline mt-3 block"
              >
                Need more help?
              </button>
            </div>

            <div className="bg-amber-300 rounded-lg overflow-hidden relative p-8 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-extrabold text-gray-900 leading-snug">
                  Give a gift of choice
                </h3>
                <p className="text-lg text-gray-900 mb-4">
                  Select from a wide range of Gift Cards
                </p>
                <div className="font-bold text-gray-900 text-xl">
                  amazon <span className="font-normal">pay</span>
                  <div className="text-base font-medium -mt-1">gift card</div>
                </div>
              </div>
              <div className="hidden sm:block w-40 h-40 rounded-full bg-white/70" />
            </div>
          </div>

          <div className="w-full lg:w-72 space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-bold text-gray-900 mb-2">Add money</h3>
              <p className="text-sm text-gray-600 mb-3">
                You can directly add money to your wallet with UPI, Netbanking,
                any available cards.
              </p>
              <Button
                onClick={() => navigation("/wallets")}
                variant="secondary"
              >
                Add money to Wallet
              </Button>
              <button
                onClick={() => navigation("/help")}
                className="text-sm text-blue-600 hover:underline mt-3 block"
              >
                Need more help?
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <RowItem
                label="Transaction history"
                bold
                url="/transectionhistory"
              />
            </div>
          </div>
        </div>
      </Row>
    </Section>
  );
}

function RowItem({ icon, label, bold, url }) {
  return (
    <a
      href={url}
      className="flex items-center justify-between py-1 cursor-pointer hover:bg-gray-50 -mx-1 px-1 rounded"
    >
      <div className="flex items-center gap-2">
        {icon && <span className="text-gray-500">{icon}</span>}
        <span className={bold ? "font-bold text-gray-900" : "text-gray-800"}>
          {label}
        </span>
      </div>
      <ChevronRight size={18} className="text-gray-400" />
    </a>
  );
}
