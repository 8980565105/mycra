import {
  ChevronDown,
  ChevronUp,
  CircleAlertIcon,
  CheckCircle2,
} from "lucide-react";
import React, { useState } from "react";
import Button from "../ui/Button";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { validatePan, generateOtp, verifyOtp } from "../../features/wallet/walletThunk";

export default function KycForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [open, setOpen] = useState({
    pan: true,
    aadhaar: false,
  });
  const [mobile, setMobile] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [panName, setPanName] = useState("");
  const [dob, setDob] = useState("");
  const [panConfirmed, setPanConfirmed] = useState(false);
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [aadhaarChecked, setAadhaarChecked] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [kycComplete, setKycComplete] = useState(false);

  // Error and Loading states
  const [panError, setPanError] = useState("");
  const [aadhaarError, setAadhaarError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [loadingState, setLoadingState] = useState({ pan: false, aadhaar: false });

  // Basic UI formatting validation checks
  const isMobileValid = mobile.trim().length === 10;
  const isPanValid = panNumber.trim().length === 10;
  const isNameValid = panName.trim().length >= 3;
  const showPanError = panNumber.length > 0 && !isPanValid;
  const showNameError = panName.length > 0 && !isNameValid;
  const isPanSectionComplete =
    isMobileValid && isPanValid && isNameValid && dob;

  const isAadhaarValid = aadhaarNumber.trim().length === 12;
  const showAadhaarError = aadhaarNumber.length > 0 && !isAadhaarValid;
  const canGetOtp = isAadhaarValid && aadhaarChecked && panConfirmed;
  const otpValue = otp.join("");
  const isOtpComplete = otpValue.length === 6;

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleGetOtp = async () => {
    setLoadingState((prev) => ({ ...prev, aadhaar: true }));
    setAadhaarError("");
    setOtpError("");
    try {
      const result = await dispatch(generateOtp({ aadhaar: aadhaarNumber })).unwrap();
      setOtpSent(true);
      setOtp(Array(6).fill(""));
      if (result?.otp) {
        alert(`🔑 Test OTP (Console ma pan print thayo che): ${result.otp}`);
      }
    } catch (err) {
      setAadhaarError(err || "Aadhaar verification failed");
    } finally {
      setLoadingState((prev) => ({ ...prev, aadhaar: false }));
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-3xl font-bold mb-8 text-gray-900">Aadhaar OTP based e-KYC</h2>
      
      {/* SECTION 1: PAN Validation */}
      <div className="border rounded-xl mb-6 overflow-hidden">
        <div
          onClick={() => setOpen({ ...open, pan: !open.pan })}
          className="flex items-center justify-between px-6 py-4 bg-gray-50 cursor-pointer"
        >
          <h3 className="text-xl font-semibold text-gray-800">1. PAN Validation</h3>
          {open.pan ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
        {open.pan && (
          <div className="p-6 space-y-5">
            <div>
              <label className="block mb-2 font-medium text-gray-700">Mobile Number</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={10}
                value={mobile}
                onChange={(e) => {
                  setMobile(e.target.value.replace(/\D/g, ""));
                  setPanConfirmed(false);
                  setPanError("");
                }}
                placeholder="Enter 10 digit mobile number"
                className="w-full border rounded-lg px-4 py-3 bg-white text-gray-900"
              />
              {!isMobileValid && mobile.length > 0 && (
                <div className="text-red-500 flex items-start mt-1 gap-1 text-[14px]">
                  <CircleAlertIcon className="h-[20px] w-[20px] shrink-0" />
                  <span>Please enter a valid 10 digit mobile number.</span>
                </div>
              )}
            </div>
            <div>
              <label className="block mb-2 font-medium text-gray-700">PAN Card Number</label>
              <input
                type="text"
                maxLength={10}
                value={panNumber}
                onChange={(e) => {
                  setPanNumber(e.target.value.toUpperCase());
                  setPanConfirmed(false);
                  setPanError("");
                }}
                placeholder="ABCDE1234F"
                className="w-full border rounded-lg px-4 py-3 uppercase bg-white text-gray-900"
              />
              {showPanError && (
                <div className="text-red-500 flex items-start mt-1 gap-1 text-[14px]">
                  <CircleAlertIcon className="h-[20px] w-[20px] shrink-0" />
                  <span>Pan card number is not valid. Must be 10 characters.</span>
                </div>
              )}
            </div>
            <div>
              <label className="block mb-2 font-medium text-gray-700">Name on PAN Card</label>
              <input
                type="text"
                value={panName}
                onChange={(e) => {
                  setPanName(e.target.value);
                  setPanConfirmed(false);
                  setPanError("");
                }}
                placeholder="Enter PAN Holder Name"
                className="w-full border rounded-lg px-4 py-3 bg-white text-gray-900"
              />
              {showNameError && (
                <div className="text-red-500 flex items-start mt-1 gap-1 text-[14px]">
                  <CircleAlertIcon className="h-[20px] w-[20px] shrink-0" />
                  <span>Name must be at least 3 characters.</span>
                </div>
              )}
            </div>
            <div>
              <label className="block mb-2 font-medium text-gray-700 font-sans">
                Date of Birth (DD/MM/YYYY)
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => {
                  setDob(e.target.value);
                  setPanConfirmed(false);
                  setPanError("");
                }}
                className="w-full border rounded-lg px-4 py-3 bg-white text-gray-900"
              />
            </div>

            {panError && (
              <div className="text-red-500 flex items-start mt-1 gap-1 text-[14px]">
                <CircleAlertIcon className="h-[20px] w-[20px] shrink-0" />
                <span>{panError}</span>
              </div>
            )}

            {panConfirmed && (
              <div className="text-green-600 flex items-start mt-1 gap-1 text-[14px]">
                <CheckCircle2 className="h-[20px] w-[20px] shrink-0" />
                <span>PAN details validated successfully.</span>
              </div>
            )}

            <div>
              <Button
                variant="common"
                disabled={!isPanSectionComplete || loadingState.pan}
                onClick={async () => {
                  if (isPanSectionComplete) {
                    setLoadingState((prev) => ({ ...prev, pan: true }));
                    setPanError("");
                    try {
                      await dispatch(validatePan({ mobile, pan: panNumber, nameOnPan: panName, dob })).unwrap();
                      setPanConfirmed(true);
                      setOpen({ pan: false, aadhaar: true });
                    } catch (err) {
                      let errMsg = "PAN details match nathi thata";
                      if (err && typeof err === "object") {
                        if (err.message) errMsg = err.message;
                        if (err.details) {
                          const mismatches = [];
                          if (!err.details.mobile) mismatches.push("Mobile");
                          if (!err.details.pan) mismatches.push("PAN");
                          if (!err.details.nameOnPan) mismatches.push("Name");
                          if (!err.details.dob) mismatches.push("DOB");
                          if (mismatches.length > 0) {
                            errMsg += ` (Mismatch: ${mismatches.join(", ")})`;
                          }
                        }
                      } else if (typeof err === "string") {
                        errMsg = err;
                      }
                      setPanError(errMsg);
                    } finally {
                      setLoadingState((prev) => ({ ...prev, pan: false }));
                    }
                  }
                }}
              >
                {loadingState.pan ? "Verifying..." : "Confirm"}
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="border rounded-xl overflow-hidden">
        <div
          onClick={() => setOpen({ ...open, aadhaar: !open.aadhaar })}
          className="flex items-center justify-between px-6 py-4 bg-gray-50 cursor-pointer"
        >
          <h3 className="text-xl font-semibold text-gray-800">2. Aadhaar Verification</h3>
          {open.aadhaar ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
        {open.aadhaar && (
          <div className="p-6 space-y-5">
            {!panConfirmed && (
              <div className="text-red-500 flex items-start mt-1 gap-1 text-[14px]">
                <CircleAlertIcon className="h-[20px] w-[20px] shrink-0" />
                <span>
                  Please complete PAN verification before proceeding to Aadhaar verification.
                </span>
              </div>
            )}
            <div>
              <label className="block mb-2 font-medium text-gray-700">Aadhaar Number</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={12}
                value={aadhaarNumber}
                onChange={(e) => {
                  setAadhaarNumber(e.target.value.replace(/\D/g, ""));
                  setAadhaarError("");
                }}
                placeholder="XXXX XXXX XXXX"
                className="w-full border rounded-lg px-4 py-3 bg-white text-gray-900"
              />
              {showAadhaarError && (
                <div className="text-red-500 flex items-start mt-1 gap-1 text-[14px]">
                  <CircleAlertIcon className="h-[20px] w-[20px] shrink-0" />
                  <span>Please enter a valid 12 digit Aadhaar number.</span>
                </div>
              )}
              {aadhaarError && (
                <div className="text-red-500 flex items-start mt-1 gap-1 text-[14px]">
                  <CircleAlertIcon className="h-[20px] w-[20px] shrink-0" />
                  <span>{aadhaarError}</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                className="mt-1"
                checked={aadhaarChecked}
                onChange={(e) => setAadhaarChecked(e.target.checked)}
              />
              <span className="text-sm text-gray-600">
                I agree to the Mycra Pay Wallet terms & conditions, and authorize Mycra Pay to
                authenticate my Aadhaar details through OTP e-KYC service and store my number, DOB,
                gender, photo & address as received from UIDAI for KYC of my Mycra Pay Wallet.
              </span>
            </div>
            <div>
              <Button
                variant="common"
                disabled={!canGetOtp || loadingState.aadhaar}
                onClick={handleGetOtp}
              >
                {loadingState.aadhaar ? "Requesting OTP..." : "Get Aadhaar OTP"}
              </Button>
            </div>
            
            {otpSent && (
              <div className="space-y-4 pt-4 border-t">
                <label className="block font-medium text-gray-700">Enter 6-Digit OTP</label>
                <div className="flex gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      value={digit}
                      onChange={(e) => {
                        handleOtpChange(index, e.target.value);
                        setOtpError("");
                      }}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      maxLength={1}
                      inputMode="numeric"
                      className="w-12 h-12 border rounded-lg text-center text-xl text-gray-900 bg-white"
                    />
                  ))}
                </div>
                {otpError && (
                  <div className="text-red-500 flex items-start mt-1 gap-1 text-[14px]">
                    <CircleAlertIcon className="h-[20px] w-[20px] shrink-0" />
                    <span>{otpError}</span>
                  </div>
                )}
                
                <Button
                  variant="common"
                  disabled={!isOtpComplete || submitting}
                  onClick={async () => {
                    setSubmitting(true);
                    setOtpError("");
                    try {
                      await dispatch(verifyOtp({ otp: otpValue })).unwrap();
                      setKycComplete(true);
                      setTimeout(() => navigate("/my-account/wallets"), 1500);
                    } catch (err) {
                      setOtpError(err || "Invalid OTP. Please try again.");
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                >
                  {submitting ? "Completing KYC..." : "Complete KYC"}
                </Button>
              </div>
            )}

            {kycComplete && (
              <div className="text-green-600 flex items-start mt-2 gap-1 text-[14px]">
                <CheckCircle2 className="h-[20px] w-[20px] shrink-0" />
                <span>KYC completed successfully! Redirecting...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
