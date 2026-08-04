import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Info, ArrowRight, XCircle, CheckCircle } from "lucide-react";

export default function ContinueWithKyc() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="max-w-xl w-full bg-slate-900/60 backdrop-blur-xl border border-indigo-500/20 rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl relative overflow-hidden text-white">
        {/* Glow Effects */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-6 animate-pulse">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-purple-200 tracking-tight sm:text-4xl">
            Verify Your Wallet KYC
          </h2>
          <p className="mt-3 text-slate-400 text-sm sm:text-base max-w-md mx-auto">
            Unlock the full potential of your wallet with a quick, secure identity validation layer.
          </p>

          {/* Key Info Cards */}
          <div className="mt-8 space-y-4 text-left">
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/10">
              <h3 className="text-sm font-semibold text-indigo-300 flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                What You Get
              </h3>
              <ul className="text-xs text-slate-350 space-y-1.5 pl-6 list-disc">
                <li>Load money into your wallet instantly.</li>
                <li>Increased limits (up to ₹1,00,000 monthly).</li>
                <li>Fast refunds and seamless checkouts.</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/10">
              <h3 className="text-sm font-semibold text-purple-300 flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4 text-rose-400" />
                What We Don't Do
              </h3>
              <ul className="text-xs text-slate-350 space-y-1.5 pl-6 list-disc">
                <li>We will never share your personal documents.</li>
                <li>No hidden verification fees or subscription costs.</li>
                <li>Your Aadhaar/PAN data is validated safely and deleted post-verification.</li>
              </ul>
            </div>

            <div className="flex items-center gap-2 text-xs text-amber-400/90 bg-amber-500/5 border border-amber-500/10 p-3 rounded-xl">
              <Info className="w-4 h-4 shrink-0" />
              <span>Make sure you have your PAN number and Aadhaar-linked phone handy.</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/wallets")}
              className="flex-1 px-6 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-semibold transition duration-200"
            >
              Go Back
            </button>
            <button
              onClick={() => navigate("/kycform")}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 group transition duration-200"
            >
              Continue With KYC
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
