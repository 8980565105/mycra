import { GenericTable } from "@/components/ui/adminTable";
import { Button } from "@/components/ui/button";
import {
    fetchEmails,
    deleteEmail,
    bulkDeleteEmails,
} from "@/features/Email/emailsThunk";
import { useBasePath } from "@/hooks/useBasePath";
import { Plus } from "lucide-react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";

function Emails() {
    const dispatch = useDispatch<any>();
    const basePath = useBasePath();
    const columns = [
        {
            key: "email",
            label: "Email",

            render: (row: any) => (
                <span className="font-medium text-gray-800">
                    {row.email}
                </span>
            ),
        },
        {
            key: "createdAt",
            label: "Subscribed At",

            render: (row: any) => {
                if (!row.createdAt) return "-";

                return new Date(
                    row.createdAt,
                ).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                });
            },
        },
    ];

    return (
        <GenericTable
            title="Emails"
            columns={columns}
            rowKey="_id"
            searchEnabled

            fetchData={async ({
                page,
                limit,
                search,
            }) => {
                try {
                    const res = await dispatch(
                        fetchEmails({
                            page,
                            limit,
                            search,
                        }),
                    ).unwrap();

                    return {
                        data: res?.data?.emails || [],
                        total: res?.data?.total || 0,
                    };
                } catch (err: any) {
                    throw new Error(
                        err || "Failed to load emails",
                    );
                }
            }}

            deleteItem={async (id) => {
                try {
                    await dispatch(
                        deleteEmail(id),
                    ).unwrap();
                } catch (err: any) {
                    throw new Error(
                        err || "Failed to delete email",
                    );
                }
            }}

            bulkDeleteItems={async (ids) => {
                try {
                    await dispatch(
                        bulkDeleteEmails(ids),
                    ).unwrap();
                } catch (err: any) {
                    throw new Error(
                        err || "Failed to delete emails",
                    );
                }
            }}

            headerActions={
                <Link to={`${basePath}/emails/add`}>
                    <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add Email
                    </Button>
                </Link>
            }
        />
    );
}

export default Emails;