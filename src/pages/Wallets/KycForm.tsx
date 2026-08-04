import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch } from "@/store";
import { validatePan, generateOtp, verifyOtp } from "@/features/wallets/walletsThunk";
import { ShieldCheck, UserCheck, KeyRound, AlertCircle, CheckCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function KycForm() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Multi-step & Status states
  const [step, setStep] = useState<1 | 2>(1);
  const [panVerified, setPanVerified] = useState(false);
  const [otpGenerated, setOtpGenerated] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [panForm, setPanForm] = useState({
    mobile: "",
    pan: "",
    nameOnPan: "",
    dob: "",
  });

  const [aadhaar, setAadhaar] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));

  // Handle PAN Validation Submit
  const handlePanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!panForm.mobile || !panForm.pan || !panForm.nameOnPan || !panForm.dob) {
      toast.error("Please fill all details");
      return;
    }

    setLoading(true);
    try {
      await dispatch(validatePan(panForm)).unwrap();
      setPanVerified(true);
      setStep(2);
      toast.success("PAN verified successfully!");
    } catch (err: any) {
      toast.error(err || "PAN details match nathi thata");
    } finally {
      setLoading(false);
    }
  };

  // Handle Generate Aadhaar OTP
  const handleGenerateOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aadhaar || aadhaar.length !== 12) {
      toast.error("Please enter a valid 12-digit Aadhaar number");
      return;
    }
    if (!termsAccepted) {
      toast.error("Please accept the terms and conditions");
      return;
    }

    setLoading(true);
    try {
      const res = await dispatch(generateOtp({ aadhaar })).unwrap();
      setOtpGenerated(true);
      // In development mode, the OTP is printed to the terminal, and we can also show a hint
      toast.success("OTP sent to your Aadhaar-registered mobile number!");
      if (res.otp) {
        toast.info(`Test OTP (Dev Mode): ${res.otp}`, { duration: 10000 });
      }
    } catch (err: any) {
      toast.error(err || "Aadhaar verification failed");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP Input Changes
  const handleOtpChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== "" && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Handle Complete KYC OTP verification
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6) {
      toast.error("Please enter 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      await dispatch(verifyOtp({ otp: enteredOtp })).unwrap();
      toast.success("KYC completed successfully!");
      setTimeout(() => {
        navigate("/wallets");
      }, 1500);
    } catch (err: any) {
      toast.error(err || "Invalid OTP, please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="max-w-lg w-full bg-slate-900/60 backdrop-blur-xl border border-indigo-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-white">
        {/* Glow Decor */}
        <div className="absolute -top-40 -right-45 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-45 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />

        {/* Step Indicator Header */}
        <div className="relative flex items-center justify-between mb-8 pb-4 border-b border-indigo-500/10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-widest">Secure KYC Journey</span>
          </div>
          <div className="flex gap-1.5 items-center">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 1 ? "bg-indigo-600 text-white" : "bg-emerald-500/20 text-emerald-400"}`}>
              {step === 1 ? "1" : "✓"}
            </span>
            <span className="w-4 h-0.5 bg-slate-700" />
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 2 ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-500"}`}>
              2
            </span>
          </div>
        </div>

        {/* SECTION 1: PAN Validation */}
        {step === 1 && (
          <div className="relative">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-400" />
                Step 1: PAN Validation
              </h2>
              <p className="text-xs text-slate-400 mt-1">Provide your details to match against registered PAN records.</p>
            </div>

            <form onSubmit={handlePanSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-450 mb-1">Mobile Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 9876543210"
                  value={panForm.mobile}
                  onChange={(e) => setPanForm({ ...panForm, mobile: e.target.value })}
                  className="w-full border border-slate-700 bg-slate-900/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-450 mb-1">PAN Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ABCDE1234F"
                  value={panForm.pan}
                  onChange={(e) => setPanForm({ ...panForm, pan: e.target.value.toUpperCase() })}
                  className="w-full border border-slate-700 bg-slate-900/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-450 mb-1">Name on PAN</label>
                <input
                  type="text"
                  required
                  placeholder="Full Name as on PAN card"
                  value={panForm.nameOnPan}
                  onChange={(e) => setPanForm({ ...panForm, nameOnPan: e.target.value })}
                  className="w-full border border-slate-700 bg-slate-900/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-450 mb-1">Date of Birth</label>
                <input
                  type="date"
                  required
                  value={panForm.dob}
                  onChange={(e) => setPanForm({ ...panForm, dob: e.target.value })}
                  className="w-full border border-slate-700 bg-slate-900/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
              >
                {loading ? "Validating PAN..." : "Confirm & Proceed"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* SECTION 2: Aadhaar Verification */}
        {step === 2 && (
          <div className="relative">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-indigo-400" />
                Step 2: Aadhaar OTP Verification
              </h2>
              <p className="text-xs text-slate-400 mt-1">Verify identity via secure 12-digit Aadhaar OTP matching.</p>
            </div>

            {!otpGenerated ? (
              <form onSubmit={handleGenerateOtp} className="space-y-5 text-left">
                <div>
                  <label className="block text-xs font-semibold text-slate-450 mb-1">Aadhaar Number</label>
                  <input
                    type="text"
                    required
                    maxLength={12}
                    placeholder="Enter 12-digit Aadhaar Number"
                    value={aadhaar}
                    onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, ""))}
                    className="w-full border border-slate-700 bg-slate-900/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition tracking-widest"
                  />
                </div>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-905 bg-slate-900/60 cursor-pointer"
                  />
                  <span className="text-xs text-slate-350 select-none group-hover:text-slate-200 transition">
                    I state that I have no objection in authenticating myself with Aadhaar based authentication system and hereby consent to verify my Aadhaar details for wallet activation.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
                >
                  {loading ? "Generating OTP..." : "Get Aadhaar OTP"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtpSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-450 mb-3 text-center">
                    Enter the 6-digit OTP sent to your registered mobile number
                  </label>
                  <div className="flex justify-center gap-2.5">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-${idx}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(e.target.value, idx)}
                        onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                        className="w-12 h-12 text-center border border-slate-750 bg-slate-900/80 rounded-xl text-lg font-bold text-white focus:outline-none focus:border-indigo-500 transition focus:ring-2 focus:ring-indigo-500/20"
                      />
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
                  >
                    {loading ? "Completing KYC..." : "Complete KYC"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setOtpGenerated(false)}
                    className="text-xs text-slate-400 hover:text-slate-200 transition"
                  >
                    Change Aadhaar Number
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
