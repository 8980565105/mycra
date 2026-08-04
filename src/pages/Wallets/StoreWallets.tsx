// import React from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { AppDispatch, RootState } from "@/store";
// import { GenericTable } from "@/components/ui/adminTable";
// import { fetchAllWallets } from "@/features/wallets/walletsThunk";



// export default function StoreWallets() {
//     const dispatch = useDispatch<AppDispatch>();
//     const { user } = useSelector((state: RootState) => state.auth);
//     const isAdmin = user?.role === "admin";
//     const columns = [
//         {
//             key: "name",
//             label: "Name",
//             render: (item: any) => (
//                 <div className="flex items-center gap-2">
//                     <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
//                         {item.profile_picture ? (
//                             <img
//                                 src={`${import.meta.env.VITE_API_URL_IMAGE}${item.profile_picture}`}
//                                 alt={item.name}
//                                 className="w-full h-full object-cover"
//                             />
//                         ) : (
//                             <span className="flex items-center justify-center w-full h-full text-gray-500 font-bold">
//                                 {item.name?.charAt(0).toUpperCase()}
//                             </span>
//                         )}
//                     </div>
//                     {item.name}
//                 </div>
//             ),
//         },
//         { key: "email", label: "Email" },
//         ...(isAdmin
//             ? [
//                 { key: "role", label: "Role" },
//             ] : []),

//         ...(isAdmin ? [
//             {
//                 key: "createdBy",
//                 label: "Created By",
//                 render: (item: any) => item.createdBy?.name || "-",
//             }
//         ] : []),
//     ];
//     return (
//         <GenericTable
//             title="User Wallets"
//             columns={columns}
//             rowKey="_id"
//             searchEnabled
//             filters={[
//                 { label: "KYC Verified", value: "true" },
//                 { label: "KYC Pending", value: "false" },
//             ]}
//             fetchData={async ({ page, limit, search, status }) => {
//                 try {
//                     const res = await dispatch(
//                         fetchAllWallets({ page, limit, search })
//                     ).unwrap();

//                     let wallets = res.wallets;
//                     if (status === "true") wallets = wallets.filter((w: any) => w.isKycVerified);
//                     if (status === "false") wallets = wallets.filter((w: any) => !w.isKycVerified);

//                     return { data: wallets, total: res.total };
//                 } catch (err: any) {
//                     console.error("fetchData error:", err);
//                     throw new Error(err || "Failed to load wallets");
//                 }
//             }}
//         />

//     );
// }
