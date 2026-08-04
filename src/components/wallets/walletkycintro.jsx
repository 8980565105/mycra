import React, { useState } from "react";
import {
  ScanLine,
  IndianRupee,
  Wallet,
  CalendarCheck,
  IdCard,
  Smartphone,
  ChevronDown,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";

const benefits = [
  { icon: ScanLine, title: "Scan & Pay", sub: "at any shop" },
  { icon: IndianRupee, title: "Send money", sub: "to anyone" },
  { icon: Wallet, title: "₹10K monthly", sub: "limit" },
  { icon: CalendarCheck, title: "1 year", sub: "validity" },
];

const kycSteps = [
  {
    icon: IdCard,
    title: "Add PAN card details",
    desc: "Enter your PAN card information to verify your identity",
  },
  {
    icon: Smartphone,
    title: "Verify AADHAR",
    desc: "Verify your Aadhaar number using OTP",
  },
];

const faqs = [
  {
    icon: CalendarCheck,
    q: "Your KYC is only valid for 1 year",
    a: "After 1 year you will need to re-verify your Aadhaar to continue using wallet limits above the minimum KYC threshold.",
  },
  {
    icon: Smartphone,
    q: "Please ensure your Amazon mobile number is the same as your AADHAR",
    a: "OTP verification only works if the mobile number linked to your Aadhaar matches the number on your Amazon account.",
  },
  {
    icon: UserRound,
    q: "You do not need to pay for KYC verification",
    a: "e-KYC through Aadhaar OTP is completely free of cost.",
  },
];

function FaqItem({ icon: Icon, q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 text-left py-4"
      >
        <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
          <Icon size={17} className="text-amber-500" />
        </div>
        <span className="flex-1 font-semibold text-gray-900 text-sm">{q}</span>
        <ChevronDown
          size={18}
          className={`text-gray-400 shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && <p className="text-sm text-gray-600 pb-4 pl-12">{a}</p>}
    </div>
  );
}

function WalletKycIntro() {
  const navigate = useNavigate();
  return (
    <div className="bg-[#fafafa] min-h-screen font-sans">
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-10">
        <div className="relative bg-gradient-to-br from-[#0b3d63] to-[#1a5c94] rounded-2xl overflow-hidden px-6 py-8 md:px-10 md:py-10">
          <div className="max-w-sm">
            <h1 className="text-white text-xl md:text-2xl font-bold leading-tight">
              Aadhaar OTP-based e-KYC
            </h1>
            <p className="text-blue-100 text-sm md:text-base mt-1">
              Complete in 30 seconds
            </p>
            <p className="text-blue-200 text-xs md:text-sm mt-3 hidden md:block">
              Enjoy seamless payments with Amazon Pay Wallet
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 bg-white/10 md:bg-transparent rounded-full px-3 py-1.5 md:px-0 md:py-0">
              <span className="w-4 h-4 rounded-full bg-green-500 text-white text-[10px] flex items-center justify-center">
                ✓
              </span>
              <span className="text-xs md:text-sm font-semibold text-white">
                KYC Verified
              </span>
            </div>
          </div>
        </div>

        <div className="-mt-6 md:-mt-8 mx-2 md:mx-4 bg-white rounded-2xl shadow-md px-5 py-6 md:px-8 md:py-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4 md:divide-x md:divide-gray-100">
            {benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 md:justify-center md:pl-4 first:md:pl-0"
                >
                  <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-amber-500" />
                  </div>
                  <div className="text-sm text-gray-800 leading-tight">
                    <p className="font-medium">{b.title}</p>
                    <p className="text-gray-500 text-xs">{b.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-4 md:gap-6">
          <div className="bg-white rounded-2xl shadow-sm px-5 py-6 md:px-8 md:py-7">
            <h2 className="text-lg font-bold text-gray-900 mb-5">
              How to complete your KYC?
            </h2>
            <div className="space-y-6">
              {kycSteps.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                      <Icon size={24} className="text-orange-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-400 mb-0.5">
                        Step {i + 1}
                      </p>
                      <p className="font-semibold text-gray-900 text-[15px]">
                        {s.title}
                      </p>
                      <p className="text-gray-500 text-sm mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <Button
              onClick={() => navigate("/continuewithkyc")}
              className="w-full mt-7 bg-[#f6c343] hover:bg-[#e8b93a] text-gray-900 font-bold py-3.5 rounded-full transition"
            >
              Complete KYC
            </Button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm px-5 py-6 md:px-6 md:py-7">
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              Frequently asked questions
            </h2>
            <div>
              {faqs.map((f, i) => (
                <FaqItem key={i} icon={f.icon} q={f.q} a={f.a} />
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-4 hidden md:block">
              Have more questions?{" "}
              <a href="#" className="text-blue-600 font-medium">
                Read all FAQs
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WalletKycIntro;
