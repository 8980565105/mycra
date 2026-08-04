import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, UserCheck, Mail, KeyRound, CheckCircle2 } from "lucide-react";
import { AppDispatch, RootState } from "../store";
import { registerUser } from "@/features/auth/authThunk";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ui/ImageUpload";
import api from "@/services/api";
import { ROUTES } from "@/services/routes";

export default function Register() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading } = useSelector((state: RootState) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  // OTP Verification state
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    mobile_number: "",
    profile_picture: "",
    gender: "",
    date_of_birth: "",
    address: { street: "", city: "", state: "", country: "", zip_code: "" },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      setForm({ ...form, address: { ...form.address, [name.split(".")[1]]: value } });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const cleanAddress = (obj: any) => {
    const allEmpty = Object.values(obj).every((v) => v === "");
    return allEmpty ? null : obj;
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      toast.error("Full name is required");
      return false;
    }
    if (!form.email.trim()) {
      toast.error("Email address is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      toast.error("Invalid email format");
      return false;
    }
    if (!form.password.trim()) {
      toast.error("Password is required");
      return false;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    if (!form.mobile_number.trim()) {
      toast.error("Mobile number is required");
      return false;
    }
    return true;
  };

  // Step 1: Send OTP to Email
  const handleSendOtp = async () => {
    if (!validateForm()) return;
    try {
      setSendingOtp(true);
      const res = await api.post(ROUTES.auth.sendRegistrationOtp, { email: form.email });
      if (res.data.success) {
        setOtpSent(true);
        toast.success("OTP sent to your email!");
        if (res.data.data?.otp) {
          toast.info(`Dev Mode OTP: ${res.data.data.otp}`);
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp.trim() || otp.length < 6) {
      toast.error("Enter a valid 6-digit OTP");
      return;
    }
    try {
      setVerifyingOtp(true);
      const res = await api.post(ROUTES.auth.verifyRegistrationOtp, { email: form.email, otp });
      if (res.data.success) {
        setOtpVerified(true);
        toast.success("Email verified! Completing registration...");
        await completeRegistration();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Step 3: Complete Account Creation
  const completeRegistration = async () => {
    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      mobile_number: form.mobile_number || undefined,
      profile_picture: form.profile_picture || undefined,
      gender: form.gender || undefined,
      date_of_birth: form.date_of_birth || undefined,
      address: cleanAddress(form.address),
      role: "store_owner",
    };

    const result = await dispatch(registerUser(payload));

    if (registerUser.fulfilled.match(result)) {
      toast.success("Seller account registered! Proceed to onboarding.");
      navigate("/seller/onboarding");
    } else {
      toast.error((result.payload as string) || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-2xl border border-slate-100">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-2">
            <UserCheck size={28} />
          </div>
          <h2 className="text-3xl font-bold text-slate-800">Become a Seller</h2>
          <p className="text-slate-500 text-sm mt-1">
            Sign up with Email OTP verification. Store & onboarding details follow registration.
          </p>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                name="name"
                disabled={otpSent}
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                name="email"
                disabled={otpSent}
                value={form.email}
                onChange={handleChange}
                placeholder="seller@example.com"
                className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                disabled={otpSent}
                value={form.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none pr-10 disabled:bg-slate-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number *</label>
              <input
                type="text"
                name="mobile_number"
                disabled={otpSent}
                value={form.mobile_number}
                onChange={handleChange}
                placeholder="+91 9876543210"
                className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
              <select
                name="gender"
                disabled={otpSent}
                value={form.gender}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-100"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                name="date_of_birth"
                disabled={otpSent}
                value={form.date_of_birth}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-100"
              />
            </div>
          </div>

          {!otpSent && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Profile Picture</label>
              <ImageUpload
                value={form.profile_picture}
                onChange={(url: string | null) => setForm({ ...form, profile_picture: url || "" })}
                multiple={false}
              />
            </div>
          )}

          {/* OTP Verification Input Box */}
          {otpSent && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-blue-900 font-semibold text-sm">
                <KeyRound size={18} className="text-blue-600" /> Enter 6-digit OTP sent to {form.email}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full border rounded-lg px-4 py-2 text-center text-lg font-mono tracking-widest focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                />
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={verifyingOtp || loading}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition disabled:opacity-60 whitespace-nowrap"
                >
                  {verifyingOtp || loading ? "Verifying..." : "Verify & Signup"}
                </button>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>Didn't receive email? Check spam folder</span>
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Edit Email / Details
                </button>
              </div>
            </div>
          )}

          {!otpSent && (
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={sendingOtp}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-60 text-base shadow flex items-center justify-center gap-2"
            >
              <Mail size={18} /> {sendingOtp ? "Sending OTP..." : "Send Email Verification OTP"}
            </button>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already registered?{" "}
          <a href="/login" className="text-blue-600 hover:underline font-medium">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}