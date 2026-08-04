import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "@/store";
import { fetchWallet, addMoneyToWallet } from "@/features/wallets/walletsThunk";
import { Wallet, ShieldCheck, ShieldAlert, ArrowUpRight, PlusCircle, CreditCard, Gift, Ticket, History } from "lucide-react";
import { toast } from "sonner";

export default function WalletsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { wallet, loading, error } = useSelector((state: RootState) => state.wallet);

  const [amount, setAmount] = useState<number | "">("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    dispatch(fetchWallet());
  }, [dispatch]);

  const handleAddMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setAdding(true);
    try {
      await dispatch(addMoneyToWallet({ amount: Number(amount), paymentMode: "netbanking" })).unwrap();
      toast.success(`Successfully added ₹${amount} to your wallet!`);
      setAmount("");
    } catch (err: any) {
      toast.error(err || "Failed to add money");
    } finally {
      setAdding(false);
    }
  };

  const handleQuickAdd = (value: number) => {
    setAmount(value);
  };

  if (loading && !wallet) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading wallet details...</p>
        </div>
      </div>
    );
  }

  const isKycVerified = wallet?.isKycVerified ?? false;

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-indigo-300">
              My Wallet
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">Manage your digital cash, vouchers, and transactions.</p>
          </div>

          {/* KYC Status Badge */}
          <div className={`px-4 py-2 rounded-2xl flex items-center gap-2 border text-xs font-semibold backdrop-blur-md transition duration-350 ${
            isKycVerified 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
              : "bg-amber-500/10 border-amber-500/20 text-amber-450"
          }`}>
            {isKycVerified ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>KYC Verified</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4 text-amber-400 animate-bounce" />
                <span>KYC Pending</span>
              </>
            )}
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Balance Card */}
          <div className="md:col-span-2 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between h-56 transition-transform hover:scale-[1.01] duration-300">
            <div className="absolute top-0 right-0 w-44 h-44 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-xl -ml-10 -mb-10" />
            
            <div className="relative flex justify-between items-start">
              <div>
                <p className="text-xs text-indigo-100 font-semibold uppercase tracking-wider">Total Available Balance</p>
                <h2 className="text-4xl sm:text-5xl font-black mt-2 tracking-tight">
                  ₹{wallet?.totalBalance ?? 0}
                </h2>
              </div>
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <Wallet className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Sub-balances breakdown */}
            <div className="relative grid grid-cols-3 gap-4 pt-4 border-t border-white/10 mt-4">
              <div>
                <p className="text-[10px] text-indigo-200 flex items-center gap-1 font-medium"><CreditCard className="w-3 h-3 text-indigo-200" /> Wallet Cash</p>
                <p className="text-sm font-bold mt-1">₹{wallet?.balance ?? 0}</p>
              </div>
              <div>
                <p className="text-[10px] text-indigo-200 flex items-center gap-1 font-medium"><Gift className="w-3 h-3 text-indigo-200" /> Gift Card</p>
                <p className="text-sm font-bold mt-1">₹{wallet?.giftCardBalance ?? 0}</p>
              </div>
              <div>
                <p className="text-[10px] text-indigo-200 flex items-center gap-1 font-medium"><Ticket className="w-3 h-3 text-indigo-200" /> Vouchers</p>
                <p className="text-sm font-bold mt-1">₹{wallet?.voucherBalance ?? 0}</p>
              </div>
            </div>
          </div>

          {/* Action Card: Unlocked Add Money or Locked Setup KYC */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-3xl p-6 flex flex-col justify-center shadow-xl">
            {!isKycVerified ? (
              <div className="text-center space-y-4 py-4">
                <div className="mx-auto w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20 mb-2">
                  <ShieldAlert className="w-6 h-6 text-amber-450" />
                </div>
                <h3 className="font-bold text-base text-slate-200">Wallet is Inactive</h3>
                <p className="text-xs text-slate-400 max-w-[220px] mx-auto leading-relaxed">
                  Complete your quick online identity KYC to activate your wallet and start adding money.
                </p>
                <button
                  onClick={() => navigate("/walletkycintro")}
                  className="w-full mt-2 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 group transition duration-200"
                >
                  Set-up wallet to add money
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleAddMoney} className="space-y-4 text-left">
                <h3 className="font-bold text-base text-slate-200 flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-indigo-400" /> Add Money
                </h3>
                
                <div>
                  <label className="block text-[10px] text-slate-400 font-semibold mb-1">Enter Amount (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full border border-slate-750 bg-slate-900/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition font-bold"
                  />
                </div>

                {/* Quick Add Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  {[500, 1000, 1500].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleQuickAdd(val)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition duration-200 ${
                        amount === val
                          ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20"
                          : "bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                      }`}
                    >
                      +₹{val}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={adding}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/30 transition duration-200"
                >
                  {adding ? "Adding money..." : "Add Money to Wallet"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Transaction History Section */}
        <div className="bg-slate-900/30 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-slate-200 flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-400" /> Recent Transactions
            </h3>
            <span className="text-[10px] uppercase text-indigo-400 tracking-wider font-semibold">Real-Time Status</span>
          </div>

          {wallet?.transactions && wallet.transactions.length > 0 ? (
            <div className="divide-y divide-slate-800/50">
              {wallet.transactions.map((tx: any) => (
                <div key={tx._id} className="py-3 flex justify-between items-center text-left">
                  <div>
                    <p className="text-xs font-semibold text-slate-200">{tx.description || tx.type === "credit" ? "Cash Added" : "Cash Debited"}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{new Date(tx.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${tx.type === "credit" ? "text-emerald-400" : "text-rose-450"}`}>
                      {tx.type === "credit" ? "+" : "-"}₹{tx.amount}
                    </p>
                    <span className="text-[9px] bg-slate-805 text-slate-400 px-1.5 py-0.5 rounded border border-slate-750 font-medium">
                      {tx.paymentMode || "wallet"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center">
              <p className="text-slate-400 text-xs">No transactions recorded yet.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
