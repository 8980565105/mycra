import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { GenericTable } from "@/components/ui/adminTable";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { useBasePath } from "@/hooks/useBasePath";
import { useEffect, useState } from "react";
import {
  bulkDeleteCategories,
  deleteCategory,
  fetchCategories,
  updateCategoryStatus,
} from "@/features/categories/categoriesThunk";
import { fetchUsers } from "@/features/users/usersThunk";

export default function CategoriesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const basePath = useBasePath();
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === "admin";

  const [creatorsMap, setCreatorsMap] = useState<Record<string, string>>({});

  const columns = [
    {
      key: "image_url",
      label: "Image",
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
    },
    { key: "name", label: "Name", width: "w-48" },
    ...(isAdmin ? [{
      key: "createdBy",
      label: "Created By",
      render: (item: any) => item.createdBy?.name || "-",
    }] : []),

  ];

  return (
    <GenericTable
      title="Categories"
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
            fetchCategories({ page, limit, search, status, role, store })
          ).unwrap();
          return { data: res.categories, total: res.total };
        } catch (err: any) {
          throw new Error(err || "Failed to load categories");
        }
      }}
      deleteItem={async (id) => {
        try {
          await dispatch(deleteCategory(id)).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to delete category");
        }
      }}
      bulkDeleteItems={async (ids) => {
        try {
          await dispatch(bulkDeleteCategories(ids)).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to delete categories");
        }
      }}
      onStatusToggle={async (id, newStatus) => {
        try {
          await dispatch(
            updateCategoryStatus({
              id,
              status: newStatus ? "active" : "inactive",
            })
          ).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to update status");
        }
      }}
      headerActions={
        <Link to={`${basePath}/categories/add`}>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Category
          </Button>
        </Link>
      }
    />
  );
}