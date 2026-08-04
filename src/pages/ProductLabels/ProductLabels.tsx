import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { GenericTable } from "@/components/ui/adminTable";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import {
  fetchProductLabels,
  deleteProductLabel,
  bulkDeleteProductLabels,
  updateProductLabelStatus,
} from "@/features/productLabels/productLabelsThunk";
import { useBasePath } from "@/hooks/useBasePath";
import { fetchUsers } from "@/features/users/usersThunk";
export default function ProductLabelsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const basePath = useBasePath();
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === "admin";




  const columns = [
    { key: "name", label: "Name", width: "w-48" },
    { key: "color", label: "Color", width: "w-32" },
    {
      key: "createdBy",
      label: "Created By",
      render: (item: any) => item.createdBy?.name || "-",
    },
  ];

  return (
    <GenericTable
      title="Product-Labels"
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
            fetchProductLabels({ page, limit, search, status, role, store })
          ).unwrap();
          return { data: res.labels, total: res.total };
        } catch (err: any) {
          throw new Error(err || "Failed to load product labels");
        }
      }}
      deleteItem={async (id) => {
        try {
          await dispatch(deleteProductLabel(id)).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to delete label");
        }
      }}
      bulkDeleteItems={async (ids) => {
        try {
          await dispatch(bulkDeleteProductLabels(ids)).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to delete labels");
        }
      }}
      onStatusToggle={async (id, newStatus) => {
        try {
          await dispatch(
            updateProductLabelStatus({
              id,
              status: newStatus ? "active" : "inactive",
            })
          ).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to update status");
        }
      }}
      headerActions={
        <Link to={`${basePath}/product-labels/add`}>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Label
          </Button>
        </Link>
      }
    />
  );
}
