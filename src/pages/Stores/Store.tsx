import React from "react";
import { useDispatch } from "react-redux";
import { GenericTable } from "@/components/ui/adminTable";
import { AppDispatch } from "@/store";
import {
  fetchStores,
  deleteStore,
  bulkDeleteStores,
  updateStore,
} from "@/features/stores/storesThunk";
import { StatsCard } from "../../components/ui/StatsCard";

export default function Stores() {
  const dispatch = useDispatch<AppDispatch>();
  const columns = [
    {
      key: "name",
      label: "Name",
    },
    {
      key: "email",
      label: "Email",
    },
    {
      key: "phone",
      label: "Phone",
      render: (item: any) => item.phone || "-",
    },
   
    {
      key: "createdAt",
      label: "Created At",
      render: (item: any) =>
        item.createdAt
          ? new Date(item.createdAt).toLocaleDateString()
          : "-",
    },
  ];
  return (
    <GenericTable
      title="Stores"
      columns={columns}
      rowKey="_id"
      searchEnabled
      statusToggleEnabled
      editEnabled
      viewEnabled={true}
      filters={[
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ]}
      fetchData={async ({ page, limit, search, status }) => {
        try {
          const res = await dispatch(
            fetchStores({
              page,
              limit,
              search,
              status,
            })
          ).unwrap();
          const formatted = res.stores.map((store: any) => ({
            ...store,
            status: store.status || "inactive",
          }));
          return {
            data: formatted,
            total: res.total,
          };
        } catch (err: any) {
          throw new Error(err || "Failed to fetch stores");
        }
      }}
      deleteItem={async (id) => {
        try {
          await dispatch(deleteStore(id)).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to delete store");
        }
      }}
      bulkDeleteItems={async (ids) => {
        try {
          await dispatch(bulkDeleteStores(ids)).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to delete stores");
        }
      }}
      onStatusToggle={async (id, newStatus) => {
        try {
          await dispatch(
            updateStore({
              id,
              data: { status: newStatus ? "active" : "inactive" },
            })
          ).unwrap();
        } catch (err: any) {
          throw new Error(err?.message || "Failed to update status");
        }
      }}
    />
  );
}