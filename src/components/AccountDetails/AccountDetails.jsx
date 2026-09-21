import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "../ui/Button";
import {
  fetchOwnProfile,
  updateOwnProfile,
} from "../../features/auth/authThunk";
import toast, { Toaster } from "react-hot-toast";
import ChangePassword from "./ChangePassword";
import { ChevronDown } from "lucide-react";

function AccountDetails({ onSwitchForget }) {
  const { user, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile_number: "",
    gender: "",
    date_of_birth: "",
  });

  useEffect(() => {
    dispatch(fetchOwnProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      const dob = user.date_of_birth
        ? new Date(user.date_of_birth).toISOString().split("T")[0]
        : "";

      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "",
        mobile_number: user.mobile_number || "",
        gender: user.gender || "",
        date_of_birth: dob,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("mobile_number", formData.mobile_number);
    data.append("gender", formData.gender);
    data.append("date_of_birth", formData.date_of_birth);

    if (formData.password.trim()) {
      data.append("password", formData.password);
    }
    const res = await dispatch(updateOwnProfile(data));

    if (res.meta.requestStatus === "fulfilled") {
      toast.success("Profile updated successfully!", {
        position: "top-center",
      });
      setFormData((prev) => ({ ...prev }));
    } else {
      toast.error(res.payload || "Update failed!", { position: "top-center" });
    }
  };

  return (
    <>
      <Toaster />

      {loading && <p className="text-sm text-gray-400 mb-2">Loading...</p>}

      <div className="space-y-4 ">
        <form className="space-y-[15px] md:space-y-[28px]" onSubmit={handleSubmit}>
          <div className="flex flex-col ">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input-common"  
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-[15px] md:gap-[28px]">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="input-common"
            />
          {/* </div>

          <div className="flex flex-col"> */}
            <input
              type="text"
              name="mobile_number"
              placeholder="Enter mobile number"
              value={formData.mobile_number}
              onChange={handleChange}
              className="input-common"
            />
          </div>

          <div className="relative flex flex-col">
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="input-common w-full appearance-none pr-12"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <ChevronDown
              size={20}
              strokeWidth={1.8}
              className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-gray-500"
            />
          </div>

          <div className="flex flex-col">
            <input
              type={formData.date_of_birth ? "date" : "text"}
              placeholder="Date of Birth"
              onFocus={(e) => (e.target.type = "date")}
              onBlur={(e) => {
                if (!e.target.value) e.target.type = "text";
              }}
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              className="input-common"
            />
          </div>

          <Button type="submit" disabled={loading} variant="common">
            {loading ? "Updating..." : "Update Profile"}
          </Button>
        </form>

        <ChangePassword />
      </div>
    </>
  );
}

export default AccountDetails;
