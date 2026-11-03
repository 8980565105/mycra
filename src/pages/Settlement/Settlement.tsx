import { GenericTable } from '@/components/ui/adminTable';
import { Button } from '@/components/ui/button';
import { useDispatch, useSelector } from "react-redux";
import React, { useState } from 'react'
import { AppDispatch, RootState } from '@/store';
import {
    fetchSettlements,
    withdrawSettlement,
    markSettlementPaid,
    deleteSettlement,
    bulkDeleteSettlements
} from '@/features/settlements/settlementsThunk';
import { toast } from 'sonner';
import { bulkDeleteCategories } from '@/features/categories/categoriesThunk';

const formatINR = (value: unknown) => {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
};

function Settlement() {
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.auth);
    const isAdmin = user?.role === "admin";
    const [isLoading, setIsLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const handleWithdraw = async (id: string) => {
        if (!window.confirm("Are you sure you want to withdraw this settlement?")) return;
        setIsLoading(true);
        try {
            await dispatch(withdrawSettlement(id)).unwrap();
            toast.success("Withdrawal requested successfully");
            setRefreshKey(prev => prev + 1);
        } catch (err: any) {
            toast.error(err || "Failed to withdraw");
        } finally {
            setIsLoading(false);
        }
    };
    const handleMarkAsPaid = async (id: string) => {
        const reference = window.prompt("Enter Payout Reference (e.g. TXN ID):");
        if (!reference) return;
        setIsLoading(true);
        try {
            await dispatch(markSettlementPaid({ id, payout_reference: reference })).unwrap();
            toast.success("Marked as paid successfully");
            setRefreshKey(prev => prev + 1);
        } catch (err: any) {
            toast.error(err || "Failed to mark as paid");
        } finally {
            setIsLoading(false);
        }
    };
    const columns = [
        {
            key: "_id",
            label: "Settlement ID",
            width: "w-48",
            render: (item: any) => (
                <span className="font-mono text-sm">
                    {item._id || "-"}
                </span>
            ),
        },
        {
            key: "transaction_id",
            label: "Transaction ID",
            width: "w-48",
        },
        ...(isAdmin
            ? [
                {
                    key: "store_owner_id.name",
                    label: "Store Owner",
                    width: "w-40",
                    render: (item: any) =>
                        item.store_owner_id?.name || "-",
                },
            ]
            : []),
        // {
        //     key: "product_value",
        //     label: "Product Value",
        //     width: "w-32",
        //     render: (item: any) =>
        //         `₹${Number(item.product_value || 0).toFixed(2)}`,
        // },
        // {
        //     key: "platform_fee",
        //     label: "Platform Fee",
        //     width: "w-32",
        //     render: (item: any) =>
        //         `₹${Number(item.platform_fee || 0).toFixed(2)}`,
        // },
        // {
        //     key: "settlement_amount",
        //     label: "Settlement",
        //     width: "w-32",
        //     render: (item: any) =>
        //         `₹${Number(item.settlement_amount || 0).toFixed(2)}`,
        // },
        {
            key: "gross_amount",
            label: "Product Value",
            render: (item: any) => formatINR(item.gross_amount),
        },
        {
            key: "commission_amount",
            label: "Platform Fee",
            render: (item: any) => formatINR(item.commission_amount),
        },
        {
            key: "net_amount",
            label: "Settlement",
            render: (item: any) => (
                <span className="font-semibold text-green-600">
                {formatINR(item.net_amount)}
                </span>
            ),
        },
        {
            key: "available_at",
            label: "Available After",
            width: "w-40",
            render: (item: any) =>
                item.available_at
                    ? new Date(item.available_at).toLocaleDateString()
                    : "-",
        },
        {
            key: "status",
            label: "Status",
            width: "w-32",
            render: (item: any) => {
                const status = item.status || "pending";
                const classes =
                    status === "paid"
                        ? "bg-green-100 text-green-800"
                        : status === "available"
                            ? "bg-blue-100 text-blue-800"
                            : status === "processing"
                                ? "bg-yellow-100 text-yellow-800"
                                : status === "failed"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800";

                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${classes}`}>
                        {status.toUpperCase()}
                    </span>
                );
            }
        },
        {
            key: "actions",
            label: "Actions",
            width: "w-40",
            render: (item: any) => {
                if (!isAdmin && item.status === "available") {
                    return (
                        <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleWithdraw(item._id)}
                            disabled={isLoading}
                        >
                            Withdraw
                        </Button>
                    );
                }

                if (isAdmin && item.status === "processing") {
                    return (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkAsPaid(item._id)}
                            disabled={isLoading}
                        >
                            Mark as Paid
                        </Button>
                    );
                }
                return null;
            }
        }
    ];

    return (
        <div key={refreshKey}>
            <GenericTable
                title="Settlement"
                columns={columns}
                rowKey="_id"
                searchEnabled
                statusToggleEnabled
                storeFilterEnabled={isAdmin}
                filters={[
                    { label: "Pending", value: "pending" },
                    { label: "Available", value: "available" },
                    { label: "Processing", value: "processing" },
                    { label: "Paid", value: "paid" },
                    { label: "Failed", value: "failed" },
                ]}
                filters1={isAdmin
                    ? [
                        { label: "Admin", value: "admin" },
                        { label: "store", value: "store_owner" },
                    ]
                    : undefined
                }
                fetchData={async ({ page, limit, search, status, role }) => {
                    try {
                        const res = await dispatch(
                        fetchSettlements({ page, limit, search, status, role })
                        ).unwrap();
                        return { data: res.settlements, total: res.total };
                    } catch (err: any) {
                        throw new Error(err || "Failed to load settlements");
                    }
                }}
                deleteItem={async (id) => {
                    try {
                        await dispatch(deleteSettlement(id)).unwrap();
                    } catch (err: any) {
                        throw new Error(err || "Failed to delete settlement");
                    }
                }}
                bulkDeleteItems={async (ids) => {
                    try {
                        await dispatch(bulkDeleteSettlements(ids)).unwrap();
                    } catch (err: any) {
                        throw new Error(err || "Failed to delete settlements");
                    }
                }}
            />
        </div>
    )
}

export default Settlement;
