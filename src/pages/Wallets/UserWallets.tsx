import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { GenericTable } from "@/components/ui/adminTable";
import { adminAdjustBalance, adminVerifyKyc, fetchAllWallets, adminSetKycData, adminAddVoucher, adminUpdateVoucher } from "@/features/wallets/walletsThunk";

import { adminCreateGiftCard, adminGetAllGiftCards } from "@/features/giftCards/giftCardThunk";
import { Switch } from "@/components/ui/switch";

export default function UserWallets() {
    const dispatch = useDispatch<AppDispatch>();
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const { giftCards } = useSelector((state: RootState) => state.giftCards);
    useEffect(() => {
      dispatch(adminGetAllGiftCards())
        .unwrap()
        .then((res) => {
          console.log("ALL GIFT CARDS API RESPONSE:", res);
          console.log("ALL GIFT CARDS:", res.giftCards);
        })
        .catch((err) => {
          console.error("ALL GIFT CARDS ERROR:", err);
        });
    }, [dispatch]);
    const [showGiftCardModal, setShowGiftCardModal] = useState(false);
    const [showGiftCardSuccess, setShowGiftCardSuccess] = useState(false);
    const [giftCardLoading, setGiftCardLoading] = useState(false);
    const [createdGiftCard, setCreatedGiftCard] = useState<any>(null);
    const [showVoucherModal, setShowVoucherModal] = useState(false);
    const [voucherLoading, setVoucherLoading] = useState(false);
    const [isEditingVoucher, setIsEditingVoucher] = useState(false);
    const [voucherForm, setVoucherForm] = useState({
      amount: "", status: true, expiresAt: "",
    });
    const [kycForm, setKycForm] = useState({
        mobile: "",
        pan: "",
        nameOnPan: "",
        dob: "",
        aadhaar: ""
    });
    const [giftCardForm, setGiftCardForm] = useState({
      amount: "",
      expiresAt: "",
      recipientName: "",
      recipientEmail: "",
    });

    const formatVoucherDate = (date: any) => {
      if (!date) return "";

      const parsedDate = new Date(date);

      if (Number.isNaN(parsedDate.getTime())) {
        return "";
      }

      const year = parsedDate.getFullYear();
      const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
      const day = String(parsedDate.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    };
    const columns = [
        {
            key: "user",
            label: "User",
            render: (item: any) => (
                <div>
                    <div className="font-medium">{item.user?.name}</div>
                    <div className="text-xs text-gray-400">{item.user?.email}</div>
                </div>
            ),
        },
        {
            key: "balance",
            label: "Balance",
            render: (item: any) => `₹${item.balance ?? 0}`,
        },
        {
          key: "giftCards",
          label: "Gift Cards Number",
          render: (item: any) => {
            const currentUserId = item.user?._id;
            const userGiftCards = giftCards.filter((card: any) => {
              const assignedUserId = typeof card.assignedTo === "object" ? card.assignedTo?._id : card.assignedTo;

              return ( String(assignedUserId) === String(currentUserId) );
            });
            if (userGiftCards.length === 0) {
              return (
                <span className="text-xs text-gray-400">
                  No Gift Card
                </span>
              );
            }

            return (
              <div className="flex flex-col gap-2">
                {userGiftCards.map((card: any) => {
                  const cardNumber = card.cardNumber || "";
                  const status = card.status || "Active";

                  return (
                    <div
                      key={ card._id || card.cardNumber }
                      className="rounded-lg border border-gray-200 bg-gray-50 p-1"
                    >
                      <div className="text-xs font-bold text-gray-900 break-all">
                        {cardNumber || "N/A"}
                      </div>

                      <div
                        className={`text-[10px] font-semibold mt-1 ${
                          status.toLowerCase() === "active" ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {status}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          },
        },
        {
            key: "giftCardBalance",
            label: "Gift Card",
            render: (item: any) => `₹${item.giftCardBalance ?? 0}`,
        },
        {
            key: "voucherBalance",
            label: "Voucher",
            render: (item: any) => `₹${item.voucherBalance ?? 0}`,
        },
        {
            key: "totalBalance",
            label: "Total",
            render: (item: any) => `₹${item.totalBalance ?? 0}`,
        },
        {
            key: "isKycVerified",
            label: "KYC",
            render: (item: any) =>
                item.isKycVerified ? (
                    <span className="text-green-600 text-xs font-medium">Verified</span>
                ) : (
                    <div className="flex flex-col gap-1 items-start">
                        <span className="text-orange-500 text-xs font-medium">Pending</span>
                        <button
                            onClick={async (e) => {
                                e.stopPropagation();
                                await dispatch(adminVerifyKyc(item.user._id));
                            }}
                            className="text-blue-500 text-[10px] underline"
                        >
                            Verify KYC (Bypass)
                        </button>
                    </div>
                ),
        },
        {
            key: "actions",
            label: "Adjust",
            render: (item: any) => (
                <div className="flex flex-col gap-2 items-start">
                    <button
                        onClick={async (e) => {
                            e.stopPropagation();
                            const amountStr = prompt("Enter amount:");
                            if (!amountStr) return;
                            const amount = Number(amountStr);
                            if (!amount || amount <= 0) return alert("Invalid amount");
                            const type = confirm("OK = Credit, Cancel = Debit") ? "credit" : "debit";
                            const reason = prompt("Reason (optional):") || "";
                            try {
                                await dispatch(
                                    adminAdjustBalance({ userId: item.user._id, amount, type, reason })
                                ).unwrap();
                                alert("Balance updated");
                            } catch (err: any) {
                                alert(err || "Failed to adjust balance");
                            }
                        }}
                        className="text-blue-600 text-xs underline"
                    >
                        Adjust Balance
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(item.user);
                            setKycForm({
                                mobile: item.user?.phone || "",
                                pan: "",
                                nameOnPan: item.user?.name || "",
                                dob: "",
                                aadhaar: ""
                            });
                            setShowModal(true);
                        }}
                        className="text-purple-600 text-xs underline"
                    >
                        Set KYC Data
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedUser(item.user);
                        setGiftCardForm({
                          amount: "",
                          expiresAt: "",
                          recipientName: item.user?.name || "",
                          recipientEmail: item.user?.email || "",
                        });

                        setShowGiftCardModal(true);
                      }}
                      className="text-green-600 text-xs underline"
                    >
                      Add Gift Card
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const voucherBalance = Number(item.voucherBalance || 0);
                        setSelectedUser({
                          ...item.user,
                          voucherBalance,
                          voucherStatus:
                            typeof item.voucherStatus === "boolean"
                              ? item.voucherStatus
                              : true,
                          expiresAt: item.expiresAt || null,
                        });

                        if (voucherBalance > 0) {
                          setIsEditingVoucher(true);
                          setVoucherForm({
                            amount: String(voucherBalance),
                            status: typeof item.voucherStatus === "boolean" ? item.voucherStatus : true,
                            expiresAt: formatVoucherDate(item.expiresAt),
                          });
                        } else {
                          setIsEditingVoucher(false);
                          setVoucherForm({ amount: "", status: true, expiresAt: "" });
                        }
                        setShowVoucherModal(true);
                      }}
                      className={`text-xs underline font-medium ${
                        Number(item.voucherBalance || 0) > 0
                          ? "text-blue-600 hover:text-blue-800"
                          : "text-orange-600 hover:text-orange-700"
                      }`}
                    >
                      {Number(item.voucherBalance || 0) > 0
                        ? "Edit Voucher"
                        : "Add Voucher"}
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="relative">
            <GenericTable
                title="User Wallets"
                columns={columns}
                rowKey="_id"
                searchEnabled
                filters={[
                    { label: "KYC Verified", value: "true" },
                    { label: "KYC Pending", value: "false" },
                ]}
                fetchData={async ({ page, limit, search, status }) => {
                    try {
                        const res = await dispatch(
                            fetchAllWallets({ page, limit, search })
                        ).unwrap();

                        let wallets = res.wallets;
                        if (status === "true") wallets = wallets.filter((w: any) => w.isKycVerified);
                        if (status === "false") wallets = wallets.filter((w: any) => !w.isKycVerified);

                        return { data: wallets, total: res.total };
                    } catch (err: any) {
                        console.error("fetchData error:", err);
                        throw new Error(err || "Failed to load wallets");
                    }
                }}
            />

            {showModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative text-left">
                        <h3 className="text-lg font-bold mb-4 text-gray-900">Set KYC Data for {selectedUser.name}</h3>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            try {
                                await dispatch(adminSetKycData({
                                    userId: selectedUser._id,
                                    ...kycForm
                                })).unwrap();
                                alert("KYC data set successfully!");
                                setShowModal(false);
                            } catch (err: any) {
                                alert(err || "Failed to set KYC data");
                            }
                        }} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Mobile Number</label>
                                <input
                                    type="text"
                                    required
                                    value={kycForm.mobile}
                                    onChange={(e) => setKycForm({...kycForm, mobile: e.target.value})}
                                    className="w-full border rounded px-3 py-2 text-sm text-gray-900 bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">PAN Number</label>
                                <input
                                    type="text"
                                    required
                                    value={kycForm.pan}
                                    onChange={(e) => setKycForm({...kycForm, pan: e.target.value.toUpperCase()})}
                                    className="w-full border rounded px-3 py-2 text-sm text-gray-900 bg-white uppercase"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Name on PAN</label>
                                <input
                                    type="text"
                                    required
                                    value={kycForm.nameOnPan}
                                    onChange={(e) => setKycForm({...kycForm, nameOnPan: e.target.value})}
                                    className="w-full border rounded px-3 py-2 text-sm text-gray-900 bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Date of Birth</label>
                                <input
                                    type="date"
                                    required
                                    value={kycForm.dob}
                                    onChange={(e) => setKycForm({...kycForm, dob: e.target.value})}
                                    className="w-full border rounded px-3 py-2 text-sm text-gray-900 bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Aadhaar Number</label>
                                <input
                                    type="text"
                                    required
                                    maxLength={12}
                                    value={kycForm.aadhaar}
                                    onChange={(e) => setKycForm({...kycForm, aadhaar: e.target.value.replace(/\D/g, "")})}
                                    className="w-full border rounded px-3 py-2 text-sm text-gray-900 bg-white"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border rounded text-xs font-semibold hover:bg-gray-50 text-gray-700 bg-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

          {showGiftCardModal &&
            selectedUser && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">

              <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative text-left">
                    <h3 className="text-lg font-bold mb-4 text-gray-900">
                      Create Gift Card For{" "}{selectedUser.name}
                    </h3>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();

                    if (!selectedUser?._id) {
                      alert("User not selected");
                      return;
                    }

                    const amount = Number(
                        giftCardForm.amount
                      );

                    if ( !amount || amount <= 0 ) {
                      alert( "Please enter a valid amount" );
                      return;
                    }

                    try { setGiftCardLoading(true);

                      const result = await dispatch(adminCreateGiftCard({
                          amount,
                          userId: selectedUser._id,
                          recipientName: giftCardForm.recipientName.trim(),
                          recipientEmail: giftCardForm.recipientEmail.trim(),
                          expiresAt: giftCardForm.expiresAt || "",
                        })
                      ).unwrap();

                      console.log( "Created gift card:", result );
                      setCreatedGiftCard( result.giftCard );
                      setShowGiftCardModal(false);
                      setShowGiftCardSuccess(true);
                      setGiftCardForm({
                        amount: "",
                        expiresAt: "",
                        recipientName: "",
                        recipientEmail: "",
                      });
                      dispatch(
                        fetchAllWallets({
                          page: 1,
                          limit: 10,
                          search: "",
                        })
                      ).unwrap();
                    } catch (err: any) {
                      console.error( "Gift card creation error:", err );
                      alert( err || "Failed to create gift card" );
                    } finally {
                      setGiftCardLoading(false);
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Gift Card Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                        ₹
                      </span>

                      <input
                        type="number"
                        min="1"
                        step="1"
                        required
                        value={
                          giftCardForm.amount
                        }
                        onChange={(e) => setGiftCardForm({
                            ...giftCardForm,
                            amount: e.target.value,
                          })
                        }
                        placeholder="Enter amount"
                        className="w-full border rounded px-3 pl-8 py-2 text-sm text-gray-900 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Recipient Name
                    </label>
                    <input
                      type="text"
                      value={giftCardForm.recipientName}
                      onChange={(e) =>
                        setGiftCardForm({
                          ...giftCardForm,
                          recipientName: e.target.value,
                        })
                      }
                      className="w-full border rounded px-3 py-2 text-sm text-gray-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Recipient Email
                    </label>

                    <input
                      type="email"
                      value={giftCardForm.recipientEmail}
                      onChange={(e) =>
                        setGiftCardForm({
                          ...giftCardForm,
                          recipientEmail: e.target.value,
                        })
                      }
                      className="w-full border rounded px-3 py-2 text-sm text-gray-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Expiry Date
                    </label>

                    <input
                      type="date"
                      value={
                        giftCardForm.expiresAt
                      }
                      onChange={(e) =>
                        setGiftCardForm({
                          ...giftCardForm,
                          expiresAt: e.target.value,
                        })
                      }
                      className="w-full border rounded px-3 py-2 text-sm text-gray-900 bg-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3">

                    <button
                      type="button"
                      disabled={giftCardLoading}
                      onClick={() => {setShowGiftCardModal(false);
                        setSelectedUser(null);
                      }}
                      className="px-4 py-2 border rounded text-xs font-semibold hover:bg-gray-50 text-gray-700 bg-white"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={giftCardLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700"
                    >
                      {giftCardLoading ? "Creating..." : "Create Gift Card"}
                    </button>

                  </div>
                </form>
              </div>
            </div>
          )}
          {showGiftCardSuccess &&
            createdGiftCard && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">

              <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">

                <h3 className="text-lg font-bold text-green-600 mb-4">
                  Gift Card Created Successfully
                </h3>
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Gift Card Number
                  </label>

                  <div className="flex gap-2">

                    <input
                      type="text"
                      readOnly
                      value={createdGiftCard.cardNumber || ""}
                      className="flex-1 border rounded px-3 py-2 text-sm bg-gray-50 text-gray-900"
                    />

                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(createdGiftCard.cardNumber || "")
                      }
                      className="px-3 py-2 bg-blue-600 text-white rounded text-xs"
                    >
                      Copy
                    </button>

                  </div>
                </div>

                <div className="mb-4">

                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Gift Card PIN
                  </label>

                  <div className="flex gap-2">

                    <input
                      type="text"
                      readOnly
                      value={createdGiftCard.pin || "" }
                      className="flex-1 border rounded px-3 py-2 text-sm bg-gray-50 text-gray-900"
                    />

                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText( createdGiftCard.pin || "" ) }
                      className="px-3 py-2 bg-blue-600 text-white rounded text-xs"
                    >
                      Copy
                    </button>

                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Amount
                  </label>
                  <div className="text-lg font-bold text-gray-900">
                    ₹ {Number( createdGiftCard.originalAmount || 0 ).toLocaleString("en-IN")}
                  </div>
                </div>

                <div className="mb-5">
                  <span className="text-xs text-gray-500">
                    Status:
                  </span>
                  <span className="ml-2 text-xs font-semibold text-green-600">
                    {createdGiftCard.status}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowGiftCardSuccess(false);
                    setCreatedGiftCard(null);
                    setSelectedUser(null);
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded font-semibold text-sm"
                >
                  Done
                </button>

              </div>
            </div>
          )}
          {showVoucherModal && selectedUser && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[80] p-4"
              onClick={(e) => { e.stopPropagation(); }}
            >
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative text-left"
                onClick={(e) => { e.stopPropagation(); }}
              >
                <h3 className="text-lg font-bold mb-4 text-gray-900">
                  {isEditingVoucher ? "Edit Voucher for" : "Add Voucher for"}{" "} {selectedUser.name || "User"}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Voucher Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        required
                        value={voucherForm.amount}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "") {
                            setVoucherForm({ ...voucherForm, amount: "" });
                            return;
                          }
                          const numericValue = Number(value);
                          if (numericValue < 0) {
                            return;
                          }
                          setVoucherForm({ ...voucherForm, amount: value });
                        }}
                        placeholder="Enter voucher amount"
                        className="w-full border rounded px-3 py-2 pl-8 text-sm text-gray-900 bg-white"
                      />
                    </div>

                    {voucherForm.amount &&
                      Number(voucherForm.amount) > 0 && (
                        <p className="text-[11px] text-gray-500 mt-1">
                          {isEditingVoucher
                            ? `Updated voucher balance will be ₹${Number(
                                voucherForm.amount
                              ).toLocaleString("en-IN")}`
                            : `New voucher balance will be ₹${(
                                Number(
                                  selectedUser?.voucherBalance || 0
                                ) +
                                Number(voucherForm.amount || 0)
                              ).toLocaleString("en-IN")}`}
                        </p>
                      )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Voucher Status
                    </label>
                      <Switch
                        id="voucher-status"
                        checked={voucherForm.status}
                        onCheckedChange={(val) => {
                          setVoucherForm({ ...voucherForm, status: val });
                        }}
                      />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Voucher Expiry Date
                    </label>

                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split("T")[0]}
                      value={voucherForm.expiresAt}
                      onChange={(e) => {
                        setVoucherForm({
                          ...voucherForm,
                          expiresAt: e.target.value,
                        });
                      }}
                      className="w-full border rounded px-3 py-2 text-sm text-gray-900 bg-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-gray-100">
                  <button
                    type="button"
                    disabled={voucherLoading}
                    onClick={() => {
                      setShowVoucherModal(false);
                      setVoucherForm({ amount: "", status: true, expiresAt: "" });
                      setIsEditingVoucher(false);
                      setSelectedUser(null);
                    }}
                    className="px-4 py-2 border rounded text-xs font-semibold hover:bg-gray-50 text-gray-700 bg-white"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={
                      voucherLoading ||
                      !voucherForm.amount ||
                      Number(voucherForm.amount) <= 0 ||
                      !voucherForm.expiresAt
                    }
                    onClick={async () => {
                      if (!selectedUser?._id) {
                        alert("User not selected");
                        return;
                      }

                      const amount = Number(
                        voucherForm.amount
                      );

                      if (!amount || amount <= 0) {
                        return;
                      }
                      if (!voucherForm.expiresAt) {
                        return;
                      }

                      try {
                        setVoucherLoading(true);

                        if (isEditingVoucher) {

                          await dispatch(
                            adminUpdateVoucher({
                              userId: selectedUser._id,
                              amount,
                              status: voucherForm.status,
                              expiresAt: voucherForm.expiresAt,
                            })
                          ).unwrap();
                        } else {

                          await dispatch(
                            adminAddVoucher({
                              userId: selectedUser._id,
                              amount,
                              status: voucherForm.status,
                              expiresAt: voucherForm.expiresAt,
                            })
                          ).unwrap();

                          alert(
                            "Voucher added successfully"
                          );
                        }
                        setShowVoucherModal(false);
                        setVoucherForm({ amount: "", status: true, expiresAt: "" });
                        setIsEditingVoucher(false);
                        setSelectedUser(null);

                        await dispatch(
                          fetchAllWallets({ page: 1, limit: 10, search: "" })
                        ).unwrap();

                      } catch (error: any) {
                        console.error("VOUCHER ERROR:", error);
                      } finally {
                        setVoucherLoading(false);
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {voucherLoading ? isEditingVoucher
                        ? "Updating..."
                        : "Adding..."
                      : isEditingVoucher
                      ? "Update Voucher"
                      : "Add Voucher"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
    );
}