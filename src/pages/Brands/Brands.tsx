import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { GenericTable } from "@/components/ui/adminTable";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { useBasePath } from "@/hooks/useBasePath";
import {
  bulkDeleteBrands,
  deleteBrand,
  fetchBrands,
  updateBrandStatus,
} from "@/features/brands/brandsThunk";
import { fetchUsers } from "@/features/users/usersThunk";

export default function BrandsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const basePath = useBasePath();
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === "admin";

  const columns = [
    {
      key: "image_url",
      label: "Logo",
      render: (item: any) =>
        item.image_url ? (
          <img
            src={`${import.meta.env.VITE_API_URL_IMAGE}${item.image_url}`}
            alt={item.name}
            className="h-10 w-10 rounded-md object-cover border"
          />
        ) : (
          <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-xs border border-dashed">
            —
          </div>
        ),
      width: "w-20",
      exportValue: (item: any) =>
        item.image_url
          ? `${import.meta.env.VITE_API_URL_IMAGE}${item.image_url}`
          : "-",
    },
    { key: "name", label: "Name", width: "w-48" },
    {
      key: "createdBy",
      label: "Created By",
      render: (item: any) => item.createdBy?.name || "-",
    },
  ];

  return (
    <GenericTable
      title="Brands"
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
            fetchBrands({ page, limit, search, status, role, store })
          ).unwrap();
          return { data: res.brands, total: res.total };
        } catch (err: any) {
          throw new Error(err || "Failed to load brands");
        }
      }}
      deleteItem={async (id) => {
        try {
          await dispatch(deleteBrand(id)).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to delete brand");
        }
      }}
      bulkDeleteItems={async (ids) => {
        try {
          await dispatch(bulkDeleteBrands(ids)).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to delete brands");
        }
      }}
      onStatusToggle={async (id, newStatus) => {
        try {
          await dispatch(
            updateBrandStatus({
              id,
              status: newStatus ? "active" : "inactive",
            })
          ).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to update status");
        }
      }}
      headerActions={
        <Link to={`${basePath}/brands/add`}>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Brand
          </Button>
        </Link>
      }
    />
  );
}
