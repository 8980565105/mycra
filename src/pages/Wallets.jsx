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
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addMoneyToWallet, fetchWallet } from "../features/wallet/walletThunk";

export default function Wallets() {
  const navigation = useNavigate();
  const dispatch = useDispatch();
  const { wallet, loading, error } = useSelector((state) => state.wallet);
  const [amount, setAmount] = useState(1000);
  const [addingMoney, setAddingMoney] = useState(false);
  useEffect(() => {
    dispatch(fetchWallet());
  }, [dispatch]);
  const isKycVerified = wallet?.isKycVerified;
  const handleAddMoney = async () => {
    if (!amount || amount <= 0) return;
    setAddingMoney(true);
    const result = await dispatch(
      addMoneyToWallet({ amount: Number(amount), paymentMode: "UPI" }),
    );
    setAddingMoney(false);
    if (addMoneyToWallet.fulfilled.match(result)) {
      setAmount(0);
    }
  };



  const maxAddLimit = Number(wallet?.maxAddLimit || 10000);

  const quickAdd = (val) => {
    const currentAmount = Number(amount) || 0;

    if (currentAmount + val > maxAddLimit) {
      return;
    }

    setAmount(currentAmount + val);
  };

  return (
    <>
      <h1 className="text-[28px] font-bold text-gray-900 mb-4">
        Mycra Pay balance
      </h1>
      <div className="flex flex-col lg:flex-row gap-4 max-w-6xl">
        <div className="flex-1 space-y-4">
          <div className="bg-gray-100 rounded-lg shadow-sm p-2 md:p-4">
            <div className="flex justify-between items-center py-4 border-b border-dashed border-gray-300">
              <span className="font-bold text-gray-900">Total balance</span>
              <span className="font-bold text-teal-700 text-xl">
                ₹{wallet?.totalBalance?.toFixed(2) || "0.00"}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Wallet</span>
              <span className="text-gray-600">
                ₹{wallet?.balance?.toFixed(2) || "0.00"}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <div>
                <div className="text-gray-600">Gift Cards</div>
                <div className="text-xs text-gray-400">
                  Includes Cashback & Refunds
                </div>
              </div>
              <span className="text-gray-600">
                ₹{wallet?.giftCardBalance?.toFixed(2) || "0.00"}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-600">Vouchers</span>
              <span className="text-gray-600">
                ₹{wallet?.voucherBalance?.toFixed(2) || "0.00"}
              </span>
            </div>
          </div>

          <div className="bg-gray-100 rounded-lg shadow-sm p-2 md:p-4">
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
                      type="numeric"
                      min={0}
                      maxlength={6}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
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
                        className={`border rounded-full px-3 py-1 text-sm font-medium transition
        ${isDisabled
                            ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
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
                    You can add up to ₹{wallet?.maxAddLimit || 10000}.00
                  </span>
                </div>
                {error && (
                  <p className="text-red-500 text-xs mb-2">{error}</p>
                )}
                <Button
                  onClick={handleAddMoney}
                  variant="common"
                  disabled={addingMoney || !amount || amount <= 0}
                >
                  {addingMoney ? "Adding..." : "Add Money"}
                </Button>
              </>
            )}
          </div>

          <div className="bg-gray-100 rounded-lg shadow-sm py-3 flex items-center gap-3 p-2 md:p-4 max-w-md">
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

        <div className="w-full lg:w-72 space-y-4">
          <div className="bg-gray-100 rounded-lg shadow-sm p-4">
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
      className="flex items-center justify-between py-3 cursor-pointer hover:bg-gray-50 -mx-1 px-1 rounded"
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
