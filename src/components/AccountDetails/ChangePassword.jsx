import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import Button from "../ui/Button";
import { changePassword } from "../../features/auth/authThunk";
import { Eye, EyeOff } from "lucide-react";

function ChangePassword() {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    currentPassword: false, newPassword: false, confirmNewPassword: false,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmNewPassword) {
      toast.error("New password and confirm password do not match!", {
        position: "top-center",
      });
      return;
    }

    const res = await dispatch(changePassword(form));

    if (res.meta.requestStatus === "fulfilled") {
      toast.success("Password changed successfully!", {
        position: "top-center",
      });
      setForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    } else {
      toast.error(res.payload || "Password change failed!", {
        position: "top-center",
      });
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {/* Current Password */}
      <div className="relative">
        <input
          type={showPassword.currentPassword ? "text" : "password"}
          name="currentPassword"
          placeholder="Current Password"
          value={form.currentPassword}
          onChange={handleChange}
          required
          className="input-common"
        />
        <button
          type="button"
          onClick={() => togglePasswordVisibility("currentPassword")}
          className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          aria-label={
            showPassword.currentPassword ? "Hide current password" : "Show current password"
          }
        >
          {showPassword.currentPassword ? (
            <EyeOff size={20} strokeWidth={1.8} />
          ) : (
            <Eye size={20} strokeWidth={1.8} />
          )}
        </button>
      </div>

      {/* New Password */}
      <div className="relative">
        <input
          type={showPassword.newPassword ? "text" : "password"}
          name="newPassword"
          placeholder="New Password"
          value={form.newPassword}
          onChange={handleChange}
          required
          className="input-common w-full pr-12"
        />
        <button
          type="button"
          onClick={() => togglePasswordVisibility("newPassword")}
          className="absolute right-5 top-1/2 flex -translate-y-1/2 items-center justify-center text-gray-500 hover:text-gray-700"
          aria-label={
            showPassword.newPassword ? "Hide new password" : "Show new password"
          }
        >
          {showPassword.newPassword ? (
            <EyeOff size={20} strokeWidth={1.8} />
          ) : (
            <Eye size={20} strokeWidth={1.8} />
          )}
        </button>
      </div>

      <div className="relative">
        <input
          type={showPassword.confirmNewPassword ? "text" : "password"}
          name="confirmNewPassword"
          placeholder="Confirm New Password"
          value={form.confirmNewPassword}
          onChange={handleChange}
          required
          className="input-common"
        />
        <button
          type="button"
          onClick={() =>
            togglePasswordVisibility("confirmNewPassword")
          }
          className="absolute right-5 top-1/2 flex -translate-y-1/2 items-center justify-center text-gray-500 hover:text-gray-700"
          aria-label={
            showPassword.confirmNewPassword ? "Hide confirm password" : "Show confirm password"
          }
        >
          {showPassword.confirmNewPassword ? (
            <EyeOff size={20} strokeWidth={1.8} />
          ) : (
            <Eye size={20} strokeWidth={1.8} />
          )}
        </button>
      </div>
      <Button type="submit" disabled={loading} variant="common">
        {loading ? "Updating..." : "Change Password"}
      </Button>
    </form>
  );
}

export default ChangePassword;