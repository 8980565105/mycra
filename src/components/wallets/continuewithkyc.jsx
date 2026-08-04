import React from "react";
import {
  CheckCircle2,
  ScanLine,
  IndianRupee,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const restrictions = [
  "Unlocking Amazon Pay ICICI Credit Card",
  "Transfering your gift cards / cashbacks to your bank account.",
];
const uses = [
  { icon: ScanLine, title: "Scan QR &", sub: "pay at any shop" },
  { icon: IndianRupee, title: "Send money", sub: "with 1-click" },
];

function ContinueWithKyc() {
  const navigate = useNavigate();

  return (
    <div className="bg-white min-h-screen font-sans">
      <div className="max-w-md md:max-w-3xl mx-auto pb-24">
        <div className="md:grid md:grid-cols-2 md:gap-10 md:px-10 md:py-10">
          <div>
            <h1 className="italic font-bold text-gray-900 text-xl text-center md:text-left md:not-italic md:text-2xl px-6 pt-6 md:px-0 md:pt-0">
              Complete your Aadhaar OTP based e-KYC with 1 year validity
            </h1>
            <div className="relative bg-gradient-to-br from-[#0b3d63] to-[#1a5c94] mt-5 mx-4 md:mx-0 rounded-xl overflow-hidden h-56 md:h-64 flex items-end justify-center">
              <div className="absolute bottom-5 left-5 bg-white rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-md">
                <CheckCircle2 size={16} className="text-green-500" />
                <span className="text-sm font-semibold text-gray-900">
                  KYC Verified
                </span>
              </div>
            </div>
          </div>
          <div className="px-6 md:px-0 mt-8">
            <h2 className="font-bold text-gray-900 text-center md:text-left">
              Please note that this KYC cannot be used for
            </h2>
            <ol className="mt-4 space-y-2 text-gray-800 text-[15px]">
              {restrictions.map((r, i) => (
                <li
                  key={i}
                  className="flex gap-2 justify-center md:justify-start"
                >
                  <span className="shrink-0">{i + 1}.</span>
                  <span className="text-center md:text-left">{r}</span>
                </li>
              ))}
            </ol>

            <h2 className="font-bold text-gray-900 text-center md:text-left mt-8">
              Continue to use Amazon Pay Wallet for :
            </h2>

            <div className="flex justify-center md:justify-start gap-10 md:gap-6 mt-6">
              {uses.map((u, i) => {
                const Icon = u.icon;
                return (
                  <div
                    key={i}
                    className="flex flex-col items-center md:flex-row md:items-center md:gap-3 text-center md:text-left"
                  >
                    <div className="w-11 h-11 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                      <Icon size={20} className="text-amber-500" />
                    </div>
                    <p className="text-sm text-gray-800 mt-2 md:mt-0 leading-tight">
                      <span className="font-medium block">{u.title}</span>
                      <span className="text-gray-500">{u.sub}</span>
                    </p>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => navigate("/kycform")}
              className="w-full flex items-center justify-center gap-2 mt-10 bg-[#f6c343] hover:bg-[#e8b93a] text-gray-900 font-bold py-3.5 rounded-full transition"
            >
              Continue With KYC
              <ChevronRight size={18} />
            </button>
            <button className="w-full flex items-center justify-center gap-1 mt-4 text-blue-600 font-medium text-sm">
              Manage Amazon Pay
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContinueWithKyc;
