import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { GenericTable } from "@/components/ui/adminTable";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { useBasePath } from "@/hooks/useBasePath";
import {
  fetchChildCategories,
  deleteChildCategory,
  updateChildCategoryStatus,
  bulkDeletechildCategories,
} from "@/features/childCategories/childCategoriesThunk";

export default function ChildCategoriesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const basePath = useBasePath();
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === "admin";

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
    {
      key: "subCategory",
      label: "SubCategory (Level 2)",
      render: (item: any) => item.subCategory?.name || item.subCategoryId?.name || "-",
      width: "w-48",
    },
    {
      key: "mainCategory",
      label: "Main Category (Level 1)",
      render: (item: any) => item.mainCategory?.name || item.subCategory?.parent_id?.name || item.subCategoryId?.parent_id?.name || "-",
      width: "w-48",
    },
    ...(isAdmin ? [{
      key: "createdBy",
      label: "Created By",
      render: (item: any) => item.createdBy?.name || "-",
    }] : []),
  ];

  return (
    <GenericTable
      title="Child Categories"
      columns={columns}
      rowKey="_id"
      searchEnabled
      statusToggleEnabled
      filters={[
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ]}
      fetchData={async ({ page, limit, search, status }) => {
        try {
          const res = await dispatch(
            fetchChildCategories({ page, limit, search, status })
          ).unwrap();
          return { data: res.data, total: res.pagination?.total || 0 };
        } catch (err: any) {
          throw new Error(err || "Failed to load Level 3 categories");
        }
      }}
      deleteItem={async (id) => {
        try {
          await dispatch(deleteChildCategory(id)).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to delete Level 3 category");
        }
      }}
      bulkDeleteItems={async (ids) => {
        try {
          await dispatch(bulkDeletechildCategories(ids)).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to delete categories");
        }
      }}
      onStatusToggle={async (id, newStatus) => {
        try {
          await dispatch(
            updateChildCategoryStatus({
              id,
              status: newStatus ? "active" : "inactive",
            })
          ).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to update status");
        }
      }}
      headerActions={
        <Link to={`${basePath}/child-categories/add`}>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Child Category
          </Button>
        </Link>
      }
    />
  );
}