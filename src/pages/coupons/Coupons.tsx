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
import { fetchUsers } from "@/features/users/usersThunk";

export default function CouponsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const basePath = useBasePath();
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === "admin";


  const columns = [
    { key: "name", label: "Name", width: "w-40" },
    { key: "code", label: "Code", width: "w-28" },
    {
      key: "discount_type",
      label: "Type",
    },
    {
      key: "createdBy",
      label: "Created By",
      render: (item: any) => item.createdByUser?.name || "-",
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

      fetchStores={async () => {
        const res = await dispatch(
          fetchUsers({
            role: "store_owner",
            page: 1,
            limit: 1000,
          })
        ).unwrap();
        return res.users.map((u: any) => ({
          label: u.storeName || u.name,
          value: u._id
        }));
      }}

      fetchData={async ({ page, limit, search, status, role, store }) => {
        try {
          const res = await dispatch(
            fetchCoupons({ page, limit, search, status, role, store })
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
