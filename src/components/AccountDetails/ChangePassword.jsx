import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
// import { changePassword } from "../../features/auth/authThunk";
import toast from "react-hot-toast";
import Button from "../ui/Button";
import { changePassword } from "../../features/auth/authThunk";

function ChangePassword() {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

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
      <input
        type="password"
        name="currentPassword"
        placeholder="Current Password"
        value={form.currentPassword}
        onChange={handleChange}
        required
        className="w-full border light-border rounded-md px-5 py-3 focus:outline-none focus:ring-2"
      />
      <input
        type="password"
        name="newPassword"
        placeholder="New Password"
        value={form.newPassword}
        onChange={handleChange}
        required
        className="w-full border light-border rounded-md px-5 py-3 focus:outline-none focus:ring-2"
      />
      <input
        type="password"
        name="confirmNewPassword"
        placeholder="Confirm New Password"
        value={form.confirmNewPassword}
        onChange={handleChange}
        required
        className="w-full border light-border rounded-md px-5 py-3 focus:outline-none focus:ring-2"
      />
      <Button type="submit" disabled={loading} variant="common">
        {loading ? "Updating..." : "Change Password"}
      </Button>
    </form>
  );
}

export default ChangePassword;
