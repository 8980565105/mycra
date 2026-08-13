import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { GenericTable } from "@/components/ui/adminTable";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { useBasePath } from "@/hooks/useBasePath";
import {
  fetchCoupons,
  deleteCoupon,
  bulkDeleteCoupons,
  updateCouponStatus,
} from "@/features/coupons/couponsThunk";

export default function CouponsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const basePath = useBasePath();
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === "admin";
  const columns = [
    { key: "name", label: "Name", },
    { key: "code", label: "Code", },
    {
      key: "store",
      label: "Store",
      render: (item: any) => {
        if (item.is_global || (!item.storeId && (!item.storeIds || item.storeIds.length === 0))) {
          return "Global (All Stores)";
        }
        if (item.storeIds && item.storeIds.length > 0) {
          return item.storeIds
            .map((s: any) => (typeof s === "object" ? s.name || s.store_name : s))
            .filter(Boolean)
            .join(", ");
        }
        return item.storeId?.name || item.storeId?.store_name || "Global (All Stores)";
      },
    },
    {
      key: "discount_type",
      label: "Discount Type",
    },
    {
      key: "discount_value",
      label: "Value",

      render: (item: any) =>
        item.discount_type === "percentage"
          ? `${item.discount_value}%`
          : item.discount_value,
    },
    {
      key: "min_purchase_amount",
      label: "Min Purchase",

      render: (item: any) => item.min_purchase_amount ?? 0,
    },
    {
      key: "max_discount_amount",
      label: "Max Discount",

      render: (item: any) => item.max_discount_amount ?? "-",
    },
    {
      key: "start_date",
      label: "Start Date",

      render: (item: any) =>
        item.start_date
          ? new Date(item.start_date).toLocaleDateString()
          : "-",
    },
    {
      key: "end_date",
      label: "End Date",

      render: (item: any) =>
        item.end_date ? new Date(item.end_date).toLocaleDateString() : "-",
    },
  ];

  return (
    <GenericTable
      title="Coupons"
      columns={columns}
      rowKey="_id"
      searchEnabled
      statusToggleEnabled
      storeFilterEnabled={isAdmin}
      filters={[
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ]}
      filters1={isAdmin
        ? [
          { label: "Admin", value: "admin" },
          { label: "store", value: "store_owner" },
        ]
        : undefined
      }
      fetchData={async ({ page, limit, search, status }) => {
        try {
          const res = await dispatch(
            fetchCoupons({ page, limit, search, status })
          ).unwrap();
          return { data: res.coupons, total: res.total };
        } catch (err: any) {
          throw new Error(err || "Failed to load coupons");
        }
      }}
      deleteItem={async (id) => {
        try {
          await dispatch(deleteCoupon(id)).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to delete coupon");
        }
      }}
      bulkDeleteItems={async (ids) => {
        try {
          await dispatch(bulkDeleteCoupons(ids)).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to delete coupons");
        }
      }}
      onStatusToggle={async (id, newStatus) => {
        try {
          await dispatch(
            updateCouponStatus({
              id,
              status: newStatus ? "active" : "inactive",
            })
          ).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to update status");
        }
      }}
      headerActions={
        <Link to={`${basePath}/coupons/add`}>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Coupon
          </Button>
        </Link>
      }
    />
  );
}
