import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { GenericTable } from "@/components/ui/adminTable";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { useBasePath } from "@/hooks/useBasePath";
import {
  fetchSizes,
  deleteSize,
  bulkDeleteSizes,
  updateSizeStatus,
} from "@/features/sizes/sizesThunk";
import { fetchUsers } from "@/features/users/usersThunk";

export default function SizesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const basePath = useBasePath();

  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === "admin";




  const columns = [
    { key: "name", label: "Name", width: "w-48" },
    { key: "measurement", label: "Measurement", width: "w-32" },
    {
      key: "createdBy",
      label: "Created By",
      render: (item: any) => item.createdBy?.name || "-",
    },
  ];

  return (
    <GenericTable
      title="Sizes"
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
        const res = await dispatch(
          fetchSizes({ page, limit, search, status, role, store })
        ).unwrap();
        return { data: res.sizes, total: res.total };
      }}
      deleteItem={async (id) => {
        await dispatch(deleteSize(id)).unwrap();
      }}
      bulkDeleteItems={async (ids) => {
        await dispatch(bulkDeleteSizes(ids)).unwrap();
      }}
      onStatusToggle={async (id, newStatus) => {
        await dispatch(
          updateSizeStatus({ id, status: newStatus ? "active" : "inactive" })
        ).unwrap();
      }}
      headerActions={
        <Link to={`${basePath}/sizes/add`}>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Size
          </Button>
        </Link>
      }
    />
  );
}
