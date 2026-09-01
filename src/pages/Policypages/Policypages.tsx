"use client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { GenericTable } from "@/components/ui/adminTable";
import { useBasePath } from "@/hooks/useBasePath";
import { bulkDeletePolicyPages, deletePolicyPage, fetchPolicyPages, updatePolicyPageStatus } from "@/features/Policypages/policypagesThunk";
export default function PolicyPages() {
    const dispatch = useDispatch<AppDispatch>();
    const basePath = useBasePath();
    const columns = [
        { key: "page_name", label: "Page Name" },
        { key: "slug", label: "Slug" },
        {
            key: "description",
            label: "Description",
            render: (item: any) =>
                item.description?.length > 80
                    ? item.description.replace(/<[^>]+>/g, "").substring(0, 80) + "..."
                    : (item.description || "-").replace(/<[^>]+>/g, ""),
        },
        {
            key: "createdAt",
            label: "Created At",
            render: (item: any) =>
                item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-",
        },
    ];
    return (
        <GenericTable
            title="PolicyPages"
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
                        fetchPolicyPages({ page, limit, search, status })
                    ).unwrap();
                    return { data: res.policyPages, total: res.total };
                } catch (err: any) {
                    console.error("Failed to fetch policy pages:", err);
                    throw new Error(err?.message || "Failed to fetch policy pages");
                }
            }}
            deleteItem={async (id) => {
                try {
                    await dispatch(deletePolicyPage(id)).unwrap();
                } catch (err: any) {
                    throw new Error(err?.message || "Failed to delete policy page");
                }
            }}
            bulkDeleteItems={async (ids) => {
                try {
                    await dispatch(bulkDeletePolicyPages(ids)).unwrap();
                } catch (err: any) {
                    throw new Error(err?.message || "Failed to delete policy pages");
                }
            }}
            onStatusToggle={async (id, newStatus) => {
                try {
                    await dispatch(
                        updatePolicyPageStatus({
                            id,
                            status: newStatus ? "active" : "inactive",
                        })
                    ).unwrap();
                } catch (err: any) {
                    throw new Error(err?.message || "Failed to update policy page status");
                }
            }}
            headerActions={
                <Link to={`${basePath}/policypages/add`}>
                    <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" /> Add Policy Page
                    </Button>
                </Link>
            }
        />
    );
}