import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { GenericTable } from "@/components/ui/adminTable";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import {
  fetchFabrics,
  deleteFabric,
  bulkDeleteFabrics,
  updateFabricStatus,
} from "@/features/fabrics/fabricsThunk";
import { useBasePath } from "@/hooks/useBasePath";
import { fetchUsers } from "@/features/users/usersThunk";
export default function FabricsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const basePath = useBasePath();
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === "admin";

  const columns = [
    {
      key: "image_url",
      label: "Image",
      width: "w-20",
      render: (item: any) =>
        item.image_url ? (
          <img
            src={`${import.meta.env.VITE_API_URL_IMAGE}${item.image_url}`}
            alt={item.name}
            className="h-10 w-10 rounded-md object-cover border border-gray-200"
          />
        ) : (
          <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-xs border border-dashed border-gray-300">
            —
          </div>
        ),
      exportValue: (item: any) => item.name,
    },
    { key: "name", label: "Name", width: "w-48", exportValue: (item: any) => item.name },
    {
      key: "createdBy",
      label: "Created By",
      render: (item: any) => item.createdBy?.name || "-",
    },
  ];

  return (
    <GenericTable
      title="Fabrics"
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
            fetchFabrics({ page, limit, search, status, role, store })
          ).unwrap();
          return { data: res.fabrics, total: res.total };
        } catch (err: any) {
          throw new Error(err || "Failed to load fabrics");
        }
      }}
      deleteItem={async (id) => {
        try {
          await dispatch(deleteFabric(id)).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to delete fabric");
        }
      }}
      bulkDeleteItems={async (ids) => {
        try {
          await dispatch(bulkDeleteFabrics(ids)).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to delete fabrics");
        }
      }}
      onStatusToggle={async (id, newStatus) => {
        try {
          await dispatch(
            updateFabricStatus({
              id,
              status: newStatus ? "active" : "inactive",
            })
          ).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to update status");
        }
      }}
      headerActions={
        <Link to={`${basePath}/fabrics/add`}>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Fabric
          </Button>
        </Link>
      }
    />
  );
}
