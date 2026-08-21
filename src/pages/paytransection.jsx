import React, { useState, useEffect } from "react";
import { Check, Search, Loader2 } from "lucide-react";
import Section from "../components/ui/Section";
import Row from "../components/ui/Row";
import { useDispatch, useSelector } from "react-redux";
import { fetchTransections } from "../features/transection/transectionThunk";

const CATEGORY_OPTIONS = [
  "Amazon.in",
  "Credit Card Payment",
  "Partners",
  "Bills and Recharges",
  "Daily Transit",
  "Travel",
  "Financial Services",
];

const TYPE_OPTIONS = ["Money sent", "Money received", "Self transfer"];

const PAYMENT_MODE_OPTIONS = [
  "Amazon Pay Balance",
  "Credit/Debit Card",
  "UPI",
  "Net Banking",
  "Amazon Credit",
  "Cash on Delivery",
];

const TIME_PERIOD_OPTIONS = [
  "July 2026",
  "June 2026",
  "May 2026",
  "April 2026",
  "Older transactions",
];

const STATUS_OPTIONS = ["Success", "Pending", "Failed"];

const TABS = ["All", "Refund", "Cashback"];

export default function TransactionHistory() {
  const dispatch = useDispatch();
  const { transections, totalPages, loading, error } = useSelector(
    (state) => state.transection
  );

  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState([]);
  const [type, setType] = useState([]);
  const [paymentMode, setPaymentMode] = useState([]);
  const [timePeriod, setTimePeriod] = useState("");
  const [status, setStatus] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const params = {
      page: currentPage,
      limit: 10,
    };

    if (activeTab && activeTab !== "All") {
      params.tab = activeTab;
    }
    if (search.trim()) {
      params.search = search.trim();
    }
    if (category.length > 0) {
      params.category = category;
    }
    if (type.length > 0) {
      params.type = type;
    }
    if (paymentMode.length > 0) {
      params.paymentMode = paymentMode;
    }
    if (timePeriod) {
      params.timePeriod = timePeriod;
    }
    if (status.length > 0) {
      params.status = status;
    }

    dispatch(fetchTransections(params));
  }, [
    dispatch,
    activeTab,
    search,
    category,
    type,
    paymentMode,
    timePeriod,
    status,
    currentPage,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, search, category, type, paymentMode, timePeriod, status]);

  const toggle = (list, setList, value) => {
    setList((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const clearAllFilters = () => {
    setCategory([]);
    setType([]);
    setPaymentMode([]);
    setTimePeriod("");
    setStatus([]);
    setSearch("");
  };

  const hasFilters =
    category.length > 0 ||
    type.length > 0 ||
    paymentMode.length > 0 ||
    status.length > 0 ||
    timePeriod !== "" ||
    search !== "";

  return (
    <Section className="min-h-screen bg-gray-100 p-8 font-sans">
      <Row>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-[28px] font-bold text-gray-900">
            Your transactions
          </h1>
          <div className="relative w-72">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transactions"
              className="w-full bg-white border border-gray-300 rounded-md pl-9 pr-3 py-2 text-sm outline-none focus:border-gray-400"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-64 bg-white rounded-lg shadow-sm p-4 h-fit">
            <div className="flex justify-between">
              <h2 className="font-bold text-gray-900 mb-3">Filters</h2>
              {hasFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-color hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>
            <FilterGroup title="Category">
              {CATEGORY_OPTIONS.map((opt) => (
                <Checkbox
                  key={opt}
                  label={opt}
                  checked={category.includes(opt)}
                  onChange={() => toggle(category, setCategory, opt)}
                />
              ))}
            </FilterGroup>

            <FilterGroup title="Type">
              {TYPE_OPTIONS.map((opt) => (
                <Checkbox
                  key={opt}
                  label={opt}
                  checked={type.includes(opt)}
                  onChange={() => toggle(type, setType, opt)}
                />
              ))}
            </FilterGroup>

            <FilterGroup title="Payment mode">
              {PAYMENT_MODE_OPTIONS.map((opt) => (
                <Checkbox
                  key={opt}
                  label={opt}
                  checked={paymentMode.includes(opt)}
                  onChange={() => toggle(paymentMode, setPaymentMode, opt)}
                />
              ))}
            </FilterGroup>

            <FilterGroup title="Time period">
              {TIME_PERIOD_OPTIONS.map((opt) => (
                <Radio
                  key={opt}
                  label={opt}
                  checked={timePeriod === opt}
                  onChange={() => setTimePeriod(opt)}
                />
              ))}
            </FilterGroup>

            <FilterGroup title="Status" last>
              {STATUS_OPTIONS.map((opt) => (
                <Checkbox
                  key={opt}
                  label={opt}
                  checked={status.includes(opt)}
                  onChange={() => toggle(status, setStatus, opt)}
                />
              ))}
            </FilterGroup>
          </div>

          <div className="flex-1 bg-white rounded-lg shadow-sm p-4">
            <div className="flex gap-6 border-b border-gray-200 mb-6">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 text-sm font-medium ${
                    activeTab === tab
                      ? "text-gray-900 border-b-2 border-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 size={36} className="animate-spin text-gray-400" />
              </div>
            ) : error ? (
              <div className="text-center text-red-500 text-sm py-4">
                {error}
              </div>
            ) : transections.length === 0 ? (
              <p className="text-center text-gray-500 text-sm mt-4 py-8">
                No transactions found
              </p>
            ) : (
              <div className="space-y-4">
                <ul className="divide-y divide-gray-100">
                  {transections.map((tx) => {
                    const isReceived = tx.type === "Money received";
                    const isSelf = tx.type === "Self transfer";
                    const dateStr = new Date(tx.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <li key={tx._id} className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 text-base">
                              {tx.description || tx.category || "Transaction"}
                            </span>
                            <span
                              className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                                tx.status === "Success"
                                  ? "bg-green-100 text-green-800"
                                  : tx.status === "Failed"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {tx.status}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                            <span>{dateStr}</span>
                            <span>• Mode: {tx.paymentMode}</span>
                            <span>• Type: {tx.type}</span>
                            {tx.referenceId && (
                              <span className="font-mono text-[11px]">Ref: {tx.referenceId}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end self-stretch md:self-auto justify-between">
                          <span
                            className={`font-bold text-lg ${
                              isReceived
                                ? "text-green-600"
                                : isSelf
                                ? "text-blue-600"
                                : "text-gray-900"
                            }`}
                          >
                            {isReceived ? "+" : isSelf ? "" : "-"} ₹{tx.amount?.toFixed(2)}
                          </span>
                          <span className="text-[11px] text-gray-400 mt-1">
                            {tx.category}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 pt-6 border-t border-gray-100">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600 font-medium">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Row>
    </Section>
  );
}


function FilterGroup({ title, children, last }) {
  return (
    <div className={`mb-4 pb-4 ${last ? "" : "border-b border-gray-100"}`}>
      <h3 className="font-bold text-gray-900 text-sm mb-2">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Checkbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center cursor-pointer select-none">
      <div className="relative flex items-center">
        <div
          className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-all duration-200
            ${checked ? "bg-color border-color" : "bg-white border-gray-400"}`}
        >
          {checked && <Check size={12} className="text-white stroke-[3]" />}
        </div>

        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="absolute inset-0 w-4 h-4 opacity-0 cursor-pointer"
        />
      </div>

      <span
        className={`ml-2 text-[14px] transition-colors ${
          checked ? "text-color font-medium" : "text-gray-700"
        }`}
      >
        {label}
      </span>
    </label>
  );
}

function Radio({ label, checked, onChange }) {
  return (
    <label className="flex items-center cursor-pointer select-none">
      <div className="relative flex items-center">
        <div
          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-200 ${
            checked ? "border-color" : "border-gray-400 bg-white"
          }`}
        >
          {checked && <div className="w-2 h-2 rounded-full bg-color"></div>}
        </div>

        <input
          type="radio"
          name="timePeriod"
          checked={checked}
          onChange={onChange}
          className="absolute inset-0 w-4 h-4 opacity-0 cursor-pointer"
        />
      </div>

      <span
        className={`ml-2 text-[14px] transition-colors ${
          checked ? "text-color font-medium" : "text-gray-700"
        }`}
      >
        {label}
      </span>
    </label>
  );
}
