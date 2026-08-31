import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../../features/address/addressThunk";
import { clearAddressStatus } from "../../features/address/addressSlice";
import Button from "../ui/Button";
import toast, { Toaster } from "react-hot-toast";

const emptyForm = {
  full_name: "",
  phone_number: "",
  house_no: "",
  street: "",
  landmark: "",
  city: "",
  state: "",
  country: "",
  zip_code: "",
  is_default: false,
};

function Address() {
  const dispatch = useDispatch();
  const { addresses, loading, error, successMessage } = useSelector(
    (state) => state.address,
  );
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [showInstructions, setShowInstructions] = useState(false);
  const [instructionsTarget, setInstructionsTarget] = useState(null);
  const [addressType, setAddressType] = useState("Home");
  const [instructionText, setInstructionText] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);
  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearAddressStatus());
    }
    if (error) {
      toast.error(error);
      dispatch(clearAddressStatus());
    }
  }, [successMessage, error, dispatch]);
  useEffect(() => {
    if (!showForm) return;
    async function fetchCountries() {
      try {
        const res = await fetch(
          "https://countriesnow.space/api/v0.1/countries/positions",
        );
        const json = await res.json();
        if (json?.data) setCountries(json.data.map((c) => c.name));
      } catch (err) {
        console.error("Error loading countries:", err);
      }
    }
    fetchCountries();
  }, [showForm]);

  useEffect(() => {
    async function fetchStates() {
      if (!formData.country) {
        setStates([]);
        return;
      }
      try {
        const res = await fetch(
          "https://countriesnow.space/api/v0.1/countries/states",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ country: formData.country }),
          },
        );
        const json = await res.json();
        setStates(json?.data?.states || []);
      } catch (err) {
        console.error("Error loading states:", err);
        setStates([]);
      }
    }
    fetchStates();
  }, [formData.country]);

  useEffect(() => {
    async function fetchCities() {
      if (!formData.country || !formData.state) {
        setCities([]);
        return;
      }
      try {
        const res = await fetch(
          "https://countriesnow.space/api/v0.1/countries/state/cities",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              country: formData.country,
              state: formData.state,
            }),
          },
        );
        const json = await res.json();
        setCities(json?.data || []);
      } catch (err) {
        console.error("Error loading cities:", err);
        setCities([]);
      }
    }
    fetchCities();
  }, [formData.state]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCountryChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      country: e.target.value,
      state: "",
      city: "",
    }));
    setStates([]);
    setCities([]);
  };

  const handleStateChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      state: e.target.value,
      city: "",
    }));
    setCities([]);
  };

  const openAddForm = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setStates([]);
    setCities([]);
    setShowForm(true);
  };

  const openEditForm = async (addr) => {
    setEditingId(addr._id);
    setFormData({ ...emptyForm, ...addr });
    setShowForm(true);

    if (addr.country) {
      try {
        const res = await fetch(
          "https://countriesnow.space/api/v0.1/countries/states",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ country: addr.country }),
          },
        );
        const json = await res.json();
        setStates(json?.data?.states || []);
      } catch (err) {
        console.error("Error loading states:", err);
      }
    }
    if (addr.country && addr.state) {
      try {
        const res = await fetch(
          "https://countriesnow.space/api/v0.1/countries/state/cities",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ country: addr.country, state: addr.state }),
          },
        );
        const json = await res.json();
        setCities(json?.data || []);
      } catch (err) {
        console.error("Error loading cities:", err);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      dispatch(updateAddress({ addressId: editingId, addressData: formData }));
    } else {
      dispatch(addAddress(formData));
    }
    setShowForm(false);
  };

  const openInstructions = (addr) => {
    setInstructionsTarget(addr._id);
    setAddressType(addr.address_type || "Home");
    setInstructionText(addr.delivery_instruction || "");
    setShowInstructions(true);
  };

  const saveInstructions = () => {
    dispatch(
      updateAddress({
        addressId: instructionsTarget,
        addressData: {
          address_type: addressType,
          delivery_instruction: instructionText,
        },
      }),
    );
    setShowInstructions(false);
  };

  const openRemoveConfirm = (addr) => {
    setRemoveTarget(addr);
    setShowConfirm(true);
  };

  const confirmRemove = () => {
    dispatch(deleteAddress(removeTarget._id));
    setShowConfirm(false);
    setRemoveTarget(null);
  };

  const handleSetDefault = (addressId) => {
    dispatch(setDefaultAddress(addressId));
  };

  return (
    <div>
      <Toaster />
      <h2 className="text-xl font-semibold mb-4">Your Addresses</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          onClick={openAddForm}
          className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg h-48 text-gray-500 hover:border-gray-400 hover:text-gray-700 transition"
        >
          <span className="text-3xl mb-2">+</span>
          <span className="font-medium">Add address</span>
        </button>

        {addresses?.map((addr) => (
          <div
            key={addr._id}
            className="border border-gray-200 rounded-lg p-4 shadow-sm relative"
          >
            {addr.is_default && (
              <span className="absolute top-2 right-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                Default
              </span>
            )}
            <p className="font-semibold">{addr.full_name}</p>
            <p className="text-sm text-gray-600">
              {[addr.house_no, addr.street, addr.landmark]
                .filter(Boolean)
                .join(", ")}
            </p>
            <p className="text-sm text-gray-600">
              {addr.city}, {addr.state} {addr.zip_code}
            </p>
            <p className="text-sm text-gray-600">{addr.country}</p>
            <p className="text-sm text-gray-600 mt-1">
              Phone number: {addr.phone_number}
            </p>

            <button
              onClick={() => openInstructions(addr)}
              className="text-sm text-blue-600 mt-1 block"
            >
              {addr.delivery_instruction
                ? "Edit delivery instructions"
                : "Add delivery instructions"}
            </button>

            <div className="mt-3 flex gap-3 text-sm text-blue-600">
              <button onClick={() => openEditForm(addr)}>Edit</button>
              <span className="text-gray-300">|</span>
              <button onClick={() => openRemoveConfirm(addr)}>Remove</button>
              {!addr.is_default && (
                <>
                  <span className="text-gray-300">|</span>
                  <button onClick={() => handleSetDefault(addr._id)}>
                    Set as Default
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingId ? "Edit your address" : "Add a new address"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Country/Region
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleCountryChange}
                  required
                  className={`w-full p-3 border border-gray-300 rounded-md appearance-none ${
                    !formData.country ? "text-gray-400" : "text-black"
                  }`}
                >
                  <option value="" disabled>
                    Select Country
                  </option>
                  {countries.map((countryName, idx) => (
                    <option key={idx} value={countryName}>
                      {countryName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Full name (First and Last name)
                </label>
                <input
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Mobile number
                </label>
                <input
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Pincode
                </label>
                <input
                  name="zip_code"
                  value={formData.zip_code}
                  onChange={handleChange}
                  placeholder="6 digits [0-9] PIN code"
                  className="w-full p-3 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Flat, House no., Building, Company, Apartment
                </label>
                <input
                  name="house_no"
                  value={formData.house_no}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Area, Street, Sector, Village
                </label>
                <input
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Landmark
                </label>
                <input
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleChange}
                  placeholder="E.g. near apollo hospital"
                  className="w-full p-3 border border-gray-300 rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    State
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleStateChange}
                    disabled={!formData.country || states.length === 0}
                    className={`w-full p-3 border border-gray-300 rounded-md appearance-none ${
                      !formData.state ? "text-gray-400" : "text-black"
                    }`}
                  >
                    <option value="">Select State</option>
                    {states.map((s, idx) => (
                      <option key={idx} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Town/City
                  </label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    disabled={!formData.state || cities.length === 0}
                    className={`w-full p-3 border border-gray-300 rounded-md appearance-none ${
                      !formData.city ? "text-gray-400" : "text-black"
                    }`}
                  >
                    <option value="">Select City</option>
                    {cities.map((cityName, idx) => (
                      <option key={idx} value={cityName}>
                        {cityName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="is_default"
                  checked={formData.is_default}
                  onChange={handleChange}
                />
                Make this my default address
              </label>

              <div className="flex justify-center sm:justify-end flex-wrap gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="common" disabled={loading}>
                  {loading
                    ? "Saving..."
                    : editingId
                      ? "Update address"
                      : "Add address"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showInstructions && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Add delivery instructions
              </h3>
              <button
                onClick={() => setShowInstructions(false)}
                className="text-gray-500 hover:text-gray-700 text-xl leading-none"
              >
                &times;
              </button>
            </div>

            <p className="text-sm font-semibold mb-2">Address Type</p>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {["Home", "Apartment", "Business", "Other"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setAddressType(type)}
                  className={`text-sm py-2 rounded-md border ${
                    addressType === type
                      ? "border-blue-600 text-blue-600 font-medium"
                      : "border-gray-300 text-gray-700"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Delivery instructions
            </label>
            <textarea
              value={instructionText}
              onChange={(e) => setInstructionText(e.target.value)}
              rows={4}
              placeholder="Provide details such as building description, a nearby landmark, or other navigation instructions."
              className="w-full p-3 border border-gray-300 rounded-md resize-none"
            />

            <div className="flex justify-end pt-4">
              <Button
                variant="common"
                onClick={saveInstructions}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save instructions"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showConfirm && removeTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Confirm Deletion</h3>
              <button
                onClick={() => setShowConfirm(false)}
                className="text-gray-500 hover:text-gray-700 text-xl leading-none"
              >
                &times;
              </button>
            </div>

            <p className="font-semibold">{removeTarget.full_name}</p>
            <p className="text-sm text-gray-600">
              {[
                removeTarget.house_no,
                removeTarget.street,
                removeTarget.landmark,
              ]
                .filter(Boolean)
                .join(", ")}
            </p>
            <p className="text-sm text-gray-600">
              {removeTarget.city}, {removeTarget.state} {removeTarget.zip_code}
            </p>
            <p className="text-sm text-gray-600">{removeTarget.country}</p>
            <p className="text-sm text-gray-600 mb-3">
              Phone number: {removeTarget.phone_number}
            </p>

            <p className="text-xs text-gray-500 border-t pt-3">
              <strong>Please note:</strong> Deleting this address will not
              delete any pending orders being shipped to this address. To ensure
              uninterrupted fulfillment of future orders, please update any
              wishlists, subscribe and save settings, and periodical
              subscriptions using this address.
            </p>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowConfirm(false)}
              >
                No
              </Button>
              <Button
                variant="common"
                onClick={confirmRemove}
                disabled={loading}
              >
                {loading ? "Removing..." : "Yes"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Address;
