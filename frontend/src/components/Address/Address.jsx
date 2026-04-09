import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMyAddress,
  updateMyAddress,
  updateUserAddressById,
} from "../../features/address/addressThunk";
import { clearAddressStatus } from "../../features/address/addressSlice";
function Address({ userId = null }) {
  const dispatch = useDispatch();
  const { address, loading, error, successMessage } = useSelector(
    (state) => state.address,
  );

  const [formData, setFormData] = useState({
    street: "",
    city: "",
    state: "",
    country: "",
    zip_code: "",
  });

  useEffect(() => {
    dispatch(fetchMyAddress());
  }, [dispatch, userId]);

  useEffect(() => {
    if (address) {
      setFormData({
        street: address.street || "",
        city: address.city || "",
        state: address.state || "",
        country: address.country || "",
        zip_code: address.zip_code || "",
      });
    }
  }, [address]);

  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => dispatch(clearAddressStatus()), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (userId) {
      dispatch(updateUserAddressById({ id: userId, addressData: formData }));
    } else {
      dispatch(updateMyAddress(formData));
    }
  };

  return (
    <div>
      {/* <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {userId ? "Edit User Address" : "My Profile Address"}
      </h2> */}

      {successMessage && (
        <div className="mb-4 px-4 py-3 bg-green-100 border border-green-400 text-green-700 rounded-md text-sm font-medium">
          ✅ {successMessage}
        </div>
      )}

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm font-medium">
          ❌ {error}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Street Address
              </label>
              <input
                name="street"
                value={formData.street}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="123 Street Name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                City
              </label>
              <input
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Surat"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                State
              </label>
              <input
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Gujarat"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Country
              </label>
              <input
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="India"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Zip Code
              </label>
              <input
                type="text"
                name="zip_code"
                value={formData.zip_code}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="395001"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors shadow-lg"
            >
              {loading ? "Processing..." : "Save Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Address;
