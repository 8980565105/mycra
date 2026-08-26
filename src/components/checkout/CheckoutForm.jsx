import { ArrowLeft, Plus, Check, Edit2, Trash2, XCircleIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} from "../../features/address/addressThunk";
import Button from "../ui/Button";
import { getImageUrl } from "../utils/helper";

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

export default function CheckoutForm({
  formData,
  setFormData,
}) {
  const dispatch = useDispatch();
  const { addresses, loading } = useSelector((state) => state.address);
  const { user } = useSelector((state) => state.auth);
  const { items = [] } = useSelector((state) => state.cart);

  const getDiscountedPrice = (item) => {
    if (item.is_gift) {
      return {
        discount: 0,
        originalPrice: 0,
        discountedPrice: 0,
      };
    }
    const offerPrice = Number(item?.variant_id?.offerprice) || 0;
    const originalPrice = Number(item?.variant_id?.price) || 0;
    return {
      discount: offerPrice,
      originalPrice,
      discountedPrice: offerPrice,
    };
  };

  const getVariantInfo = (item) => {
    const variant = item?.variant_id;
    if (!variant) return null;

    let color = "";
    let size = "";

    if (Array.isArray(variant.attributes) && variant.attributes.length > 0) {
      const sizeAttr = variant.attributes.find((a) => {
        const attrObj = a.attributeId || a.attribute || {};
        const code = (attrObj.code || a.attributeCode || a.code || "").toString().toLowerCase();
        const name = (attrObj.name || a.attributeName || a.name || "").toString().toLowerCase();
        return code.includes("size") || name.includes("size") || code === "size" || name === "size";
      });
      if (sizeAttr) {
        const valObj = sizeAttr.valueId || sizeAttr.valueObj || sizeAttr.val || {};
        size = valObj.value || valObj.name || sizeAttr.value || sizeAttr.customValue || "";
      }

      const colorAttr = variant.attributes.find((a) => {
        const attrObj = a.attributeId || a.attribute || {};
        const code = (attrObj.code || a.attributeCode || a.code || "").toString().toLowerCase();
        const name = (attrObj.name || a.attributeName || a.name || "").toString().toLowerCase();
        return code.includes("color") || name.includes("color") || code === "color" || name === "color";
      });
      if (colorAttr) {
        const valObj = colorAttr.valueId || colorAttr.valueObj || colorAttr.val || {};
        color = valObj.value || valObj.name || colorAttr.value || colorAttr.customValue || "";
      }
    }

    if (!color && !size && variant.sku) {
      const parts = variant.sku.split("-");
      const p1 = parts[1] || "";
      const p2 = parts[2] || "";
      const sizes = ["xs", "s", "m", "l", "xl", "xxl", "xxxl", "3xl", "4xl", "5xl", "free size"];
      const p1IsSize = sizes.includes(p1.toLowerCase()) || (!isNaN(p1) && p1.trim() !== "");
      const p2IsSize = sizes.includes(p2.toLowerCase()) || (!isNaN(p2) && p2.trim() !== "");
      
      if (p1IsSize && !p2IsSize) {
        size = p1;
        color = p2;
      } else if (p2IsSize && !p1IsSize) {
        size = p2;
        color = p1;
      } else {
        color = p1;
        size = p2;
      }
    }

    return { color, size };
  };

  const [showDrawer, setShowDrawer] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [addressFormData, setAddressFormData] = useState(emptyForm);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);

  useEffect(() => {
    if (user) {
      dispatch(fetchAddresses());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((a) => a.is_default) || addresses[0];
      handleSelectAddress(defaultAddr);
    }
  }, [addresses, selectedAddressId]);

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
      if (!addressFormData.country) {
        setStates([]);
        return;
      }
      try {
        const res = await fetch(
          "https://countriesnow.space/api/v0.1/countries/states",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ country: addressFormData.country }),
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
  }, [addressFormData.country]);

  useEffect(() => {
    async function fetchCities() {
      if (!addressFormData.country || !addressFormData.state) {
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
              country: addressFormData.country,
              state: addressFormData.state,
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
  }, [addressFormData.state]);

  const handleSelectAddress = (addr) => {
    setSelectedAddressId(addr._id);
    setFormData((prev) => ({
      ...prev,
      firstName: addr.full_name,
      lastName: "-",
      address: [addr.house_no, addr.street, addr.landmark]
        .filter(Boolean)
        .join(", "),
      country: addr.country,
      state: addr.state,
      city: addr.city,
      pincode: addr.zip_code,
      phone: addr.phone_number,
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCountryChange = (e) => {
    setAddressFormData((prev) => ({
      ...prev,
      country: e.target.value,
      state: "",
      city: "",
    }));
    setStates([]);
    setCities([]);
  };

  const handleStateChange = (e) => {
    setAddressFormData((prev) => ({
      ...prev,
      state: e.target.value,
      city: "",
    }));
    setCities([]);
  };

  const openAddForm = () => {
    setEditingId(null);
    setAddressFormData(emptyForm);
    setStates([]);
    setCities([]);
    setShowForm(true);
  };

  const openEditForm = async (addr, e) => {
    e.stopPropagation();
    setEditingId(addr._id);
    setAddressFormData({ ...emptyForm, ...addr });
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
      dispatch(
        updateAddress({ addressId: editingId, addressData: addressFormData }),
      );
    } else {
      dispatch(addAddress(addressFormData));
    }
    setShowForm(false);
  };

  const openRemoveConfirm = (addr, e) => {
    e.stopPropagation();
    setRemoveTarget(addr);
    setShowConfirm(true);
    setActiveDropdown(null);
  };

  const confirmRemove = () => {
    dispatch(deleteAddress(removeTarget._id));
    if (selectedAddressId === removeTarget._id) {
       setSelectedAddressId(null);
    }
    setShowConfirm(false);
    setRemoveTarget(null);
  };

  const selectedAddress = addresses?.find((a) => a._id === selectedAddressId);

  return (
    <div className="flex-1">
      <div className="mb-[30px]">
        <h2 className="text-20px">Contact Information</h2>
        <span className="theme-border-block w-[59px] h-[2px] rounded-[10px] block mb-[12px]" />
        <p className="text-p text-light mb-[30px]">
          We’ll use this email to send you details and updates about your order.
        </p>

        <input
          type="email"
          placeholder="Email Address"
          className="input-common w-full"
          value={formData.email}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              email: e.target.value,
            }))
          }
        />
      </div>

      <div className="mb-[30px]">
        <h2 className="text-20px">Shipping Address</h2>
        <span className="theme-border-block w-[59px] h-[2px] rounded-[10px] block mb-[12px]" />

        <div className="border border-gray-200 rounded-[5px] p-4 flex justify-between items-start bg-white shadow-sm">
          <div>
            <h3 className="text-gray-500 text-sm mb-2">Deliver to:</h3>
            {selectedAddress ? (
              <>
                <p className="font-semibold text-sm text-black">
                  {selectedAddress.full_name}, {selectedAddress.zip_code}
                </p>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {[
                    selectedAddress.house_no,
                    selectedAddress.street,
                    selectedAddress.landmark,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                  {", "}
                  {selectedAddress.city}, {selectedAddress.state}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-500">No address selected</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowDrawer(true)}
            className="text-blue-600 font-medium text-sm border border-gray-300 rounded px-4 py-1.5 hover:bg-gray-50 transition"
          >
            Change
          </button>
        </div>
      </div>

      <div className="mb-[30px]">
        <h2 className="text-20px">Your Items</h2>
        <span className="theme-border-block w-[59px] h-[2px] rounded-[10px] block mb-[20px]" />
        
        <div className="border border-gray-200 rounded-[5px] p-4 bg-white shadow-sm space-y-4">
          <div className="pb-[10px] text-p text-gray-500 border-b">
            {items.reduce((sum, item) => sum + (item.quantity || 1), 0)} items
          </div>
          {items.map((item, index) => {
            const variant = getVariantInfo(item);
            return (
              <React.Fragment key={item._id || index}>
                <div className="flex py-[10px]">
                  <div className="relative w-[80px] md:w-[105px] h-auto flex-shrink-0">
                    <Link to={`/products/${item.product_id?._id}`}>
                      <img
                        src={
                          item.variant_id?.images?.length > 0
                            ? getImageUrl(item.variant_id.images[0])
                            : getImageUrl(item.product_id?.images?.[0])
                        }
                        alt={item.product_id?.name}
                        className="w-full h-[122px] md:h-[150px] object-cover rounded-[3px]"
                      />
                    </Link>
                    <span className="absolute top-[-10px] right-[-10px] w-[22px] h-[22px] bg-white border text-black text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
                      {item.quantity || 1}
                    </span>
                  </div>
                  <div className="flex justify-between gap-[10px] flex-1 ml-4">
                    <div>
                      <p className="text-14 text-gray-800 font-medium line-clamp-3">
                        {item.product_id?.name}
                      </p>
                      {variant && (
                        <p className="text-13 text-gray-500 mt-2 flex gap-3">
                          {variant.color && <span><span className="text-gray-400">Color:</span> {variant.color}</span>}
                          {variant.size && <span><span className="text-gray-400">Size:</span> {variant.size}</span>}
                        </p>
                      )}
                    </div>
                    <p className="text-p text-right font-medium">
                      ₹
                      {Math.round(
                        getDiscountedPrice(item).discountedPrice * item.quantity,
                      ).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
                {index < items.length - 1 && <div className="border-b border-gray-100" />}
              </React.Fragment>
            );
          })}
        </div>
      </div>


      <Link to="/cart" className="flex gap-[12px] items-center mt-[30px]">
        <ArrowLeft size={16} />
        Back to cart
      </Link>

      {/* Address Drawer */}
      {showDrawer && (
        <>
          <div className="fixed inset-0 bg-black/40 z-[9999]"
            onClick={() => {
              setShowDrawer(false);
              setActiveDropdown(null);
            }}
          />

          {/* Right Drawer */}
          <div className={`fixed top-0 right-0 h-screen w-full w-3/4 max-w-[430px] bg-white z-[9999] transform transition-transform duration-300 flex flex-col ${
              showDrawer ? "translate-x-0" : "-translate-x-full"
            }`}
          > 
            <div className="flex items-center justify-between px-5 py-4 border-b border-theme shrink-0">
              <div>
                <h2 className="text-[20px] font-semibold text-black">Select delivery address</h2>
                <p className="text-[12px] text-gray-500">Choose where we should deliver your order</p>
              </div>

              {/* Close */}
              <button className="absolute top-4 right-2 transition-colors text-light border rounded-[3px] p-[5px] border-[#D2AF9F]"
                onClick={() => {
                  setShowDrawer(false);
                  setActiveDropdown(null);
                }}
              >
                <XCircleIcon size={22} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto flex-1 bg-white">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-sm text-gray-700">
                  Saved addresses
                </span>
                <button
                  type="button"
                  onClick={openAddForm}
                  className="text-blue-600 font-medium text-sm hover:underline flex items-center gap-1"
                >
                  <Plus size={16} /> Add New
                </button>
              </div>

              <div className="space-y-4">
                {addresses?.map((addr) => (
                  <div
                    key={addr._id}
                    onClick={() => {
                      handleSelectAddress(addr);
                      setShowDrawer(false);
                      setActiveDropdown(null);
                    }}
                    className={`border rounded-[5px] p-4 cursor-pointer relative transition-all bg-white ${
                      selectedAddressId === addr._id
                        ? "border-blue-500 shadow-sm"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                            selectedAddressId === addr._id
                              ? "border-blue-500 bg-blue-500"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedAddressId === addr._id && (
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap pr-8">
                            <p className="font-semibold text-sm text-black">
                              {addr.full_name}
                            </p>
                            {selectedAddressId === addr._id && (
                              <span className="inline-block text-[10px] bg-blue-100 text-blue-700 px-2 py-[1px] font-medium rounded-sm">
                                Selected
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
                            {[addr.house_no, addr.street, addr.landmark]
                              .filter(Boolean)
                              .join(", ")}
                            <br />
                            {addr.city}, {addr.state} {addr.zip_code}
                            <br />
                            {addr.country}
                            <br />
                            <span className="font-medium">Phone:</span>{" "}
                            {addr.phone_number}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="absolute top-4 right-4">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdown(activeDropdown === addr._id ? null : addr._id);
                          }}
                          className="text-gray-400 hover:text-black tracking-widest text-lg font-bold px-2 pb-2"
                        >
                          ...
                        </button>
                        {activeDropdown === addr._id && (
                          <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-20 py-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                setActiveDropdown(null);
                                openEditForm(addr, e);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                            >
                              <Edit2 size={14} /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={(e) => openRemoveConfirm(addr, e)}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add / Edit Address Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-[5px] p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-6 border-b pb-3">
              <h3 className="text-lg font-semibold text-black">
                {editingId ? "Edit address" : "Add a new address"}
              </h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-black text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Country/Region
                </label>
                <select
                  name="country"
                  value={addressFormData.country}
                  onChange={handleCountryChange}
                  required
                  className={`w-full p-3 border border-gray-300 rounded-[5px] appearance-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition ${
                    !addressFormData.country ? "text-gray-400" : "text-black"
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
                  value={addressFormData.full_name}
                  onChange={handleAddressChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-[5px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Mobile number
                </label>
                <input
                  name="phone_number"
                  value={addressFormData.phone_number}
                  onChange={handleAddressChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-[5px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Pincode
                </label>
                <input
                  name="zip_code"
                  value={addressFormData.zip_code}
                  onChange={handleAddressChange}
                  placeholder="6 digits [0-9] PIN code"
                  className="w-full p-3 border border-gray-300 rounded-[5px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Flat, House no., Building, Company, Apartment
                </label>
                <input
                  name="house_no"
                  value={addressFormData.house_no}
                  onChange={handleAddressChange}
                  className="w-full p-3 border border-gray-300 rounded-[5px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Area, Street, Sector, Village
                </label>
                <input
                  name="street"
                  value={addressFormData.street}
                  onChange={handleAddressChange}
                  className="w-full p-3 border border-gray-300 rounded-[5px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Landmark
                </label>
                <input
                  name="landmark"
                  value={addressFormData.landmark}
                  onChange={handleAddressChange}
                  placeholder="E.g. near apollo hospital"
                  className="w-full p-3 border border-gray-300 rounded-[5px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    State
                  </label>
                  <select
                    name="state"
                    value={addressFormData.state}
                    onChange={handleStateChange}
                    disabled={!addressFormData.country || states.length === 0}
                    className={`w-full p-3 border border-gray-300 rounded-[5px] appearance-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition ${
                      !addressFormData.state ? "text-gray-400" : "text-black"
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
                    value={addressFormData.city}
                    onChange={handleAddressChange}
                    disabled={!addressFormData.state || cities.length === 0}
                    className={`w-full p-3 border border-gray-300 rounded-[5px] appearance-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition ${
                      !addressFormData.city ? "text-gray-400" : "text-black"
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

              <label className="flex items-center gap-2 text-sm cursor-pointer mt-4 text-black">
                <input
                  type="checkbox"
                  name="is_default"
                  checked={addressFormData.is_default}
                  onChange={handleAddressChange}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                Make this my default address
              </label>

              <div className="flex justify-end gap-3 pt-6 mt-4 border-t">
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

      {/* Confirm Deletion Modal */}
      {showConfirm && removeTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Confirm Deletion</h3>
              <button
                type="button"
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

            <div className="flex justify-end gap-3 pt-4 mt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowConfirm(false)}
              >
                No
              </Button>
              <Button
                type="button"
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
