import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { GenericTable } from "@/components/ui/adminTable";
import { adminAdjustBalance, adminVerifyKyc, fetchAllWallets, adminSetKycData } from "@/features/wallets/walletsThunk";


export default function UserWallets() {
    const dispatch = useDispatch<AppDispatch>();
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [kycForm, setKycForm] = useState({
        mobile: "",
        pan: "",
        nameOnPan: "",
        dob: "",
        aadhaar: ""
    });

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
                <div className="flex flex-col gap-1 items-start">
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
                        className="text-purple-600 text-xs underline mt-1"
                    >
                        Set KYC Data
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
        </div>
    );
}