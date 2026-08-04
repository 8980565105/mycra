import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import {
  fetchUsers,
  deleteUser,
  bulkDeleteUsers,
  updateUserStatus,
} from "@/features/users/usersThunk";
import { GenericTable } from "@/components/ui/adminTable";

export default function Users() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === "admin";
  const columns = [
    {
      key: "name",
      label: "Name",
      render: (item: any) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            {item.profile_picture ? (
              <img
                src={`${import.meta.env.VITE_API_URL_IMAGE}${item.profile_picture}`}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="flex items-center justify-center w-full h-full text-gray-500 font-bold">
                {item.name?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          {item.name}
        </div>
      ),
    },
    { key: "email", label: "Email" },
    ...(isAdmin
      ? [
        { key: "role", label: "Role" },
      ] : []),

    ...(isAdmin ? [
      {
        key: "createdBy",
        label: "Created By",
        render: (item: any) => item.createdBy?.name || "-",
      }
    ] : []),


  ];

  return (

    <GenericTable
      title="Users"
      columns={columns}
      rowKey="_id"
      searchEnabled
      statusToggleEnabled={isAdmin}
      editEnabled={isAdmin}
      viewEnabled={isAdmin}
      filters={[
        { label: "Active", value: "true" },
        { label: "Inactive", value: "false" },
      ]}
      fetchData={async ({ page, limit, search, status }) => {
        const boolStatus =
          status === "true" ? true : status === "false" ? false : undefined;
        try {
          const res = await dispatch(
            fetchUsers({ page, limit, search, is_active: boolStatus })
          ).unwrap();
          const usersWithStatus = res.users.map((user: any) => ({
            ...user,
            status: user.is_active ? "active" : "inactive",
          }));
          return { data: usersWithStatus, total: res.total };
        } catch (err: any) {
          console.error("fetchData error:", err);
          throw new Error(err || "Failed to load users");
        }
      }}
      deleteItem={
        isAdmin
          ? async (id) => {
            try {
              await dispatch(deleteUser(id)).unwrap();
            } catch (err: any) {
              throw new Error(err || "Failed to delete user");
            }
          }
          : undefined
      }
      bulkDeleteItems={
        isAdmin
          ? async (ids) => {
            try {
              await dispatch(bulkDeleteUsers(ids)).unwrap();
            } catch (err: any) {
              throw new Error(err || "Failed to delete users");
            }
          }
          : undefined
      }
      onStatusToggle={
        isAdmin
          ? async (id, newStatus) => {
            try {
              await dispatch(
                updateUserStatus({
                  id,
                  is_active: Boolean(newStatus),
                })
              ).unwrap();
            } catch (err: any) {
              throw new Error(err?.message || "Failed to update status");
            }
          }
          : undefined
      }
    />

  );
}

