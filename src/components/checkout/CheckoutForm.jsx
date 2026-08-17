import { ArrowLeft, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
export default function CheckoutForm({
  formData,
  setFormData,
  paymentMethod,
  setPaymentMethod,
}) {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [cities, setCities] = useState([]);

  useEffect(() => {
    async function fetchCountries() {
      try {
        const res = await fetch(
          "https://countriesnow.space/api/v0.1/countries/positions",
        );
        const json = await res.json();
        if (json?.data) {
          setCountries(json.data.map((country) => country.name));
        }
      } catch (error) {
        console.error("Error loading countries:", error);
      }
    }
    fetchCountries();
  }, []);

  useEffect(() => {
    async function fetchStates() {
      if (!formData.country) {
        setStates([]);
        return;
      }
      try {
        const response = await fetch(
          "https://countriesnow.space/api/v0.1/countries/states",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              country: formData.country,
            }),
          },
        );
        const data = await response.json();
        setStates(data?.data?.states || []);
      } catch (error) {
        console.error("Error loading states:", error);
        setStates([]);
      }
    }
    fetchStates();
  }, [formData.country]);

  useEffect(() => {
    async function fetchCities() {
      if (!selectedState || !formData.country) {
        setCities([]);
        return;
      }
      try {
        const response = await fetch(
          "https://countriesnow.space/api/v0.1/countries/state/cities",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              country: formData.country,
              state: selectedState,
            }),
          },
        );
        const json = await response.json();
        setCities(json?.data || []);
      } catch (error) {
        console.error("Error loading cities:", error);
        setCities([]);
      }
    }
    fetchCities();
  }, [selectedState, formData.country]);

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
          className="input-common"
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
        <h2 className="text-20px">Billing Details</h2>

        <span className="theme-border-block w-[59px] h-[2px] rounded-[10px] block mb-[12px]" />

        <p className="text-p text-light mb-[30px]">
          Enter the address where you want your order delivered.
        </p>

        <div className="space-y-[10px] md:space-y-[28px] mb-[30px]">
          <select
            className={`input-common w-full appearance-none ${
              !formData.country ? "text-[#BCBCBC]" : "text-black"
            }`}
            value={formData.country || ""}
            onChange={(e) => {
              const country = e.target.value;

              setFormData((prev) => ({
                ...prev,
                country,
                state: "",
                city: "",
              }));

              setSelectedState("");
              setCities([]);
            }}
          >
            <option value="" disabled>
              Select Country
            </option>

            {countries.map((countryName, index) => (
              <option key={index} value={countryName} className="text-black">
                {countryName}
              </option>
            ))}
          </select>

          <div className="block sm:flex gap-[10px] md:gap-[27px]">
            <input
              type="text"
              placeholder="First Name"
              className="input-common mb-[10px] sm:mb-0"
              value={formData.firstName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  firstName: e.target.value,
                }))
              }
            />

            <input
              type="text"
              placeholder="Last Name"
              className="input-common"
              value={formData.lastName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  lastName: e.target.value,
                }))
              }
            />
          </div>

          <input
            type="text"
            placeholder="Address"
            className="input-common"
            value={formData.address}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                address: e.target.value,
              }))
            }
          />
        </div>
        <div className="flex items-center mb-[30px] gap-[12px]">
          <Plus size={16} />

          <p className="text-p text-light">Add State, City And etc...</p>
        </div>
        <div className="space-y-[10px] md:space-y-[28px] mb-[30px]">
          <div className="block sm:flex gap-[10px] md:gap-[27px]">
            <select
              className={`input-common mb-[10px] w-full appearance-none sm:mb-0 ${
                !formData.state ? "text-[#BCBCBC]" : "text-black"
              }`}
              value={formData.state || ""}
              onChange={(e) => {
                const state = e.target.value;

                setSelectedState(state);

                setFormData((prev) => ({
                  ...prev,
                  state,
                  city: "",
                }));
              }}
              disabled={!formData.country}
            >
              <option value="" disabled>
                Select State
              </option>

              {states.map((state, index) => (
                <option key={index} value={state.name} className="text-black">
                  {state.name}
                </option>
              ))}
            </select>
            <select
              className={`input-common w-full appearance-none ${
                !formData.city ? "text-[#BCBCBC]" : "text-black"
              }`}
              value={formData.city || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  city: e.target.value,
                }))
              }
              disabled={!selectedState || cities.length === 0}
            >
              <option value="">Select City</option>
              {cities.map((cityName, index) => (
                <option key={index} value={cityName} className="text-black">
                  {cityName}
                </option>
              ))}
            </select>
          </div>
          <div className="block sm:flex gap-[10px] md:gap-[27px]">
            <input
              type="text"
              placeholder="Pin Code"
              className="input-common mb-[10px] sm:mb-0"
              value={formData.pincode}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  pincode: e.target.value,
                }))
              }
            />
            <input
              type="text"
              placeholder="Phone (Optional)"
              className="input-common"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  phone: e.target.value,
                }))
              }
            />
          </div>
        </div>

        <div className="flex items-center">
          <input type="checkbox" className="mr-2" />

          <label className="text-p text-light">
            Use same address for billing
          </label>
        </div>
      </div>
      <Link to="/cart" className="flex gap-[12px] items-center mt-[30px]">
        <ArrowLeft size={16} />
        Back to cart
      </Link>
    </div>
  );
}
