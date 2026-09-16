// import React, { useState } from "react";
// import { useDispatch } from "react-redux";
// import { AppDispatch } from "@/store";
// import { GenericTable } from "@/components/ui/adminTable";
// import { adminAdjustBalance, adminVerifyKyc, fetchAllWallets, adminSetKycData } from "@/features/wallets/walletsThunk";


// export default function UserWallets() {
//     const dispatch = useDispatch<AppDispatch>();
//     const [selectedUser, setSelectedUser] = useState<any>(null);
//     const [showModal, setShowModal] = useState(false);
//     const [kycForm, setKycForm] = useState({
//         mobile: "",
//         pan: "",
//         nameOnPan: "",
//         dob: "",
//         aadhaar: ""
//     });

//     const columns = [
        // {
        //     key: "user",
        //     label: "User",
        //     render: (item: any) => (
        //         <div>
        //             <div className="font-medium">{item.user?.name}</div>
        //             <div className="text-xs text-gray-400">{item.user?.email}</div>
        //         </div>
        //     ),
        // },
        // {
        //     key: "balance",
        //     label: "Balance",
        //     render: (item: any) => `₹${item.balance ?? 0}`,
        // },
        // {
        //     key: "giftCardBalance",
        //     label: "Gift Card",
        //     render: (item: any) => `₹${item.giftCardBalance ?? 0}`,
        // },
        // {
        //     key: "voucherBalance",
        //     label: "Voucher",
        //     render: (item: any) => `₹${item.voucherBalance ?? 0}`,
        // },
        // {
        //     key: "totalBalance",
        //     label: "Total",
        //     render: (item: any) => `₹${item.totalBalance ?? 0}`,
        // },
        // {
        //     key: "isKycVerified",
        //     label: "KYC",
        //     render: (item: any) =>
        //         item.isKycVerified ? (
        //             <span className="text-green-600 text-xs font-medium">Verified</span>
        //         ) : (
        //             <div className="flex flex-col gap-1 items-start">
        //                 <span className="text-orange-500 text-xs font-medium">Pending</span>
        //                 <button
        //                     onClick={async (e) => {
        //                         e.stopPropagation();
        //                         await dispatch(adminVerifyKyc(item.user._id));
        //                     }}
        //                     className="text-blue-500 text-[10px] underline"
        //                 >
        //                     Verify KYC (Bypass)
        //                 </button>
        //             </div>
        //         ),
        // },
//         {
//             key: "actions",
//             label: "Adjust",
//             render: (item: any) => (
//                 <div className="flex flex-col gap-1 items-start">
                    // <button
                    //     onClick={async (e) => {
                    //         e.stopPropagation();
                    //         const amountStr = prompt("Enter amount:");
                    //         if (!amountStr) return;
                    //         const amount = Number(amountStr);
                    //         if (!amount || amount <= 0) return alert("Invalid amount");
                    //         const type = confirm("OK = Credit, Cancel = Debit") ? "credit" : "debit";
                    //         const reason = prompt("Reason (optional):") || "";
                    //         try {
                    //             await dispatch(
                    //                 adminAdjustBalance({ userId: item.user._id, amount, type, reason })
                    //             ).unwrap();
                    //             alert("Balance updated");
                    //         } catch (err: any) {
                    //             alert(err || "Failed to adjust balance");
                    //         }
                    //     }}
                    //     className="text-blue-600 text-xs underline"
                    // >
                    //     Adjust Balance
                    // </button>
                    // <button
                    //     onClick={(e) => {
                    //         e.stopPropagation();
                    //         setSelectedUser(item.user);
                    //         setKycForm({
                    //             mobile: item.user?.phone || "",
                    //             pan: "",
                    //             nameOnPan: item.user?.name || "",
                    //             dob: "",
                    //             aadhaar: ""
                    //         });
                    //         setShowModal(true);
                    //     }}
                    //     className="text-purple-600 text-xs underline mt-1"
                    // >
                    //     Set KYC Data
                    // </button>
//                 </div>
//             ),
//         },
//     ];

//     return (
//         <div className="relative">
            // <GenericTable
            //     title="User Wallets"
            //     columns={columns}
            //     rowKey="_id"
            //     searchEnabled
            //     filters={[
            //         { label: "KYC Verified", value: "true" },
            //         { label: "KYC Pending", value: "false" },
            //     ]}
            //     fetchData={async ({ page, limit, search, status }) => {
            //         try {
            //             const res = await dispatch(
            //                 fetchAllWallets({ page, limit, search })
            //             ).unwrap();

            //             let wallets = res.wallets;
            //             if (status === "true") wallets = wallets.filter((w: any) => w.isKycVerified);
            //             if (status === "false") wallets = wallets.filter((w: any) => !w.isKycVerified);

            //             return { data: wallets, total: res.total };
            //         } catch (err: any) {
            //             console.error("fetchData error:", err);
            //             throw new Error(err || "Failed to load wallets");
            //         }
            //     }}
            // />

            // {showModal && selectedUser && (
            //     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            //         <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative text-left">
            //             <h3 className="text-lg font-bold mb-4 text-gray-900">Set KYC Data for {selectedUser.name}</h3>
            //             <form onSubmit={async (e) => {
            //                 e.preventDefault();
            //                 try {
            //                     await dispatch(adminSetKycData({
            //                         userId: selectedUser._id,
            //                         ...kycForm
            //                     })).unwrap();
            //                     alert("KYC data set successfully!");
            //                     setShowModal(false);
            //                 } catch (err: any) {
            //                     alert(err || "Failed to set KYC data");
            //                 }
            //             }} className="space-y-4">
            //                 <div>
            //                     <label className="block text-xs font-semibold text-gray-600 mb-1">Mobile Number</label>
            //                     <input
            //                         type="text"
            //                         required
            //                         value={kycForm.mobile}
            //                         onChange={(e) => setKycForm({...kycForm, mobile: e.target.value})}
            //                         className="w-full border rounded px-3 py-2 text-sm text-gray-900 bg-white"
            //                     />
            //                 </div>
            //                 <div>
            //                     <label className="block text-xs font-semibold text-gray-600 mb-1">PAN Number</label>
            //                     <input
            //                         type="text"
            //                         required
            //                         value={kycForm.pan}
            //                         onChange={(e) => setKycForm({...kycForm, pan: e.target.value.toUpperCase()})}
            //                         className="w-full border rounded px-3 py-2 text-sm text-gray-900 bg-white uppercase"
            //                     />
            //                 </div>
            //                 <div>
            //                     <label className="block text-xs font-semibold text-gray-600 mb-1">Name on PAN</label>
            //                     <input
            //                         type="text"
            //                         required
            //                         value={kycForm.nameOnPan}
            //                         onChange={(e) => setKycForm({...kycForm, nameOnPan: e.target.value})}
            //                         className="w-full border rounded px-3 py-2 text-sm text-gray-900 bg-white"
            //                     />
            //                 </div>
            //                 <div>
            //                     <label className="block text-xs font-semibold text-gray-600 mb-1">Date of Birth</label>
            //                     <input
            //                         type="date"
            //                         required
            //                         value={kycForm.dob}
            //                         onChange={(e) => setKycForm({...kycForm, dob: e.target.value})}
            //                         className="w-full border rounded px-3 py-2 text-sm text-gray-900 bg-white"
            //                     />
            //                 </div>
            //                 <div>
            //                     <label className="block text-xs font-semibold text-gray-600 mb-1">Aadhaar Number</label>
            //                     <input
            //                         type="text"
            //                         required
            //                         maxLength={12}
            //                         value={kycForm.aadhaar}
            //                         onChange={(e) => setKycForm({...kycForm, aadhaar: e.target.value.replace(/\D/g, "")})}
            //                         className="w-full border rounded px-3 py-2 text-sm text-gray-900 bg-white"
            //                     />
            //                 </div>
            //                 <div className="flex justify-end gap-2 pt-2">
            //                     <button
            //                         type="button"
            //                         onClick={() => setShowModal(false)}
            //                         className="px-4 py-2 border rounded text-xs font-semibold hover:bg-gray-50 text-gray-700 bg-white"
            //                     >
            //                         Cancel
            //                     </button>
            //                     <button
            //                         type="submit"
            //                         className="px-4 py-2 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700"
            //                     >
            //                         Save
            //                     </button>
            //                 </div>
            //             </form>
            //         </div>
            //     </div>
            // )}
//         </div>
//     );
// }
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { GenericTable } from "@/components/ui/adminTable";
import { adminAdjustBalance, adminVerifyKyc, fetchAllWallets, adminSetKycData } from "@/features/wallets/walletsThunk";

import { adminCreateGiftCard, adminGetAllGiftCards } from "@/features/giftCards/giftCardThunk";

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
                        className="text-purple-600 text-xs underline mt-1"
                    >
                        Set KYC Data
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();

                        setSelectedUser(
                          item.user
                        );

                        setGiftCardForm({
                          amount: "",
                          expiresAt: "",
                          recipientName: item.user?.name || "",
                          recipientEmail: item.user?.email || "",
                        });

                        setShowGiftCardModal(true);
                      }}
                      className="text-green-600 text-xs underline font-medium"
                    >
                      Add Gift Card
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
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Create Gift Card
                    </h3>

                    <p className="text-xs text-gray-500 mt-1">
                      For{" "}{selectedUser.name}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {setShowGiftCardModal(false);
                      setSelectedUser(null);
                    }}
                    className="text-gray-400 hover:text-gray-700 text-xl"
                  >
                    ×
                  </button>

                </div>

                <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-3">
                  <p className="text-xs text-green-700">
                    Gift Card Number and PIN  will be automatically generated by the backend.
                  </p>
                </div>
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
                      User
                    </label>

                    <input
                      type="text"
                      value={ selectedUser.name || "" }
                      disabled
                      className="w-full border rounded px-3 py-2 text-sm text-gray-700 bg-gray-100"
                    />
                  </div>
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
                      className="px-4 py-2 bg-green-600 text-white rounded text-xs font-semibold hover:bg-green-700 disabled:opacity-50"
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
      </div>
    );
}