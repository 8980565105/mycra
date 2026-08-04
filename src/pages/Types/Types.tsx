import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { GenericTable } from "@/components/ui/adminTable";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { useBasePath } from "@/hooks/useBasePath";
import {
  fetchTypes,
  deleteType,
  bulkDeleteTypes,
  updateTypeStatus,
} from "@/features/types/typesThunk";
import { fetchUsers } from "@/features/users/usersThunk";

export default function TypesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const basePath = useBasePath();
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === "admin";

  const columns = [
    { key: "name", label: "Name", width: "w-48" },
    {
      key: "description",
      label: "Description",
      width: "w-64",
      exportValue: (item: any) => item.description || "-",
    },
    {
      key: "createdBy",
      label: "Created By",
      render: (item: any) => item.createdBy?.name || "-",
    },
  ];

  return (
    <GenericTable
      title="Types"
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
            fetchTypes({ page, limit, search, status, role, store })
          ).unwrap();
          return { data: res.types, total: res.total };
        } catch (err: any) {
          throw new Error(err || "Failed to load types");
        }
      }}
      deleteItem={async (id) => {
        try {
          await dispatch(deleteType(id)).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to delete type");
        }
      }}
      bulkDeleteItems={async (ids) => {
        try {
          await dispatch(bulkDeleteTypes(ids)).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to delete types");
        }
      }}
      onStatusToggle={async (id, newStatus) => {
        try {
          await dispatch(
            updateTypeStatus({
              id,
              status: newStatus ? "active" : "inactive",
            })
          ).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to update status");
        }
      }}
      headerActions={
        <Link to={`${basePath}/types/add`}>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Type
          </Button>
        </Link>
      }
    />
  );
}
