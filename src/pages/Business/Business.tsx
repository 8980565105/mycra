import { GenericTable } from "@/components/ui/adminTable";
import { Button } from '@/components/ui/button';
import { useBasePath } from '@/hooks/useBasePath';
import { AppDispatch, RootState } from '@/store';
import { Plus } from 'lucide-react';
import { useDispatch, useSelector } from "react-redux";
import React from 'react'
import { Link } from 'react-router-dom';
import {
    bulkDeleteBusinesses,
    deleteBusiness,
    fetchBusinesses,
    updateBusinessStatus
} from "@/features/Business/businessThunk";

export default function Business() {
    const dispatch = useDispatch<AppDispatch>();
    const basePath = useBasePath();
    const { user } = useSelector((state: RootState) => state.auth);
    const isAdmin = user?.role === "admin";
    const columns = [
        { key: "name", label: "Name", width: "w-48" },
    ];
    return (
        <>
            <GenericTable
                title="Business"
                columns={columns}
                rowKey="_id"
                searchEnabled
                statusToggleEnabled
                storeFilterEnabled={isAdmin}
                filters={[
                    { label: "Active", value: "active" },
                    { label: "Inactive", value: "inactive" },
                ]}
                // filters1={isAdmin
                //     ? [
                //         { label: "Admin", value: "admin" },
                //         { label: "store", value: "store_owner" },
                //     ]
                //     : undefined
                // }
                fetchData={async ({ page, limit, search, status, role, store }) => {
                    const res = await dispatch(
                        fetchBusinesses({ page, limit, search, status, role, store })
                    ).unwrap();
                    return { data: res.businesses, total: res.total };
                }}
                deleteItem={async (id) => {
                    await dispatch(deleteBusiness(id)).unwrap();
                }}
                bulkDeleteItems={async (ids) => {
                    await dispatch(bulkDeleteBusinesses(ids)).unwrap();
                }}
                onStatusToggle={async (id, newStatus) => {
                    await dispatch(
                        updateBusinessStatus({ id, status: newStatus ? "active" : "inactive" })
                    ).unwrap();
                }}
                headerActions={
                    <Link to={`${basePath}/business/add`}>
                        <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" /> Add Business
                        </Button>
                    </Link>
                }
            />
        </>
    )
}