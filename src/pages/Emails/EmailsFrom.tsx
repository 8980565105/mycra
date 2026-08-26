import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useBasePath } from "@/hooks/useBasePath";
import {
    createEmails,
    fetchEmailById,
    updateEmail,
} from "@/features/Email/emailsThunk";
import { ArrowLeft } from "lucide-react";
import { useDispatch } from "react-redux";
import {
    Link,
    useNavigate,
    useParams,
} from "react-router-dom";

function EmailsForm() {
    const dispatch = useDispatch<any>();
    const navigate = useNavigate();
    const basePath = useBasePath();
    const { id } = useParams();
    const isEditMode = Boolean(id);
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isEditMode || !id) return;
        const loadEmail = async () => {
            try {
                setLoading(true);
                const res = await dispatch(
                    fetchEmailById(id),
                ).unwrap();
                const emailData =
                    res?.data || res;
                setEmail(emailData?.email || "");
            } catch (err: any) {
                console.error(
                    "Failed to load email:",
                    err,
                );
            } finally {
                setLoading(false);
            }
        };

        loadEmail();
    }, [id, isEditMode, dispatch]);

    const handleSubmit = async (
        e: React.FormEvent,
    ) => {
        e.preventDefault();
        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
            return;
        }
        try {
            setLoading(true);
            if (isEditMode && id) {
                await dispatch(
                    updateEmail({
                        id,
                        email: trimmedEmail,
                    }),
                ).unwrap();
            } else {
                await dispatch(
                    createEmails({
                        email: trimmedEmail,
                    }),
                ).unwrap();
            }
            navigate(`${basePath}/emails`);
        } catch (err: any) {
            console.error(
                "Failed to save email:",
                err,
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link
                    to={`${basePath}/emails`}
                >
                    <Button
                        variant="ghost"
                        size="icon"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isEditMode
                            ? "Edit Email"
                            : "Add New Email"}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {isEditMode
                            ? "Update email details."
                            : "Add a new email subscriber."}
                    </p>
                </div>
            </div>

            <form
                onSubmit={handleSubmit}
                className="grid lg:grid-cols-3 gap-6"
            >
                <div className="lg:col-span-2 space-y-6 bg-white rounded-lg border p-6">
                    <div className="space-y-2">
                        <label
                            htmlFor="email"
                            className="text-sm font-medium text-gray-700"
                        >
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            placeholder="Enter email address"
                            className="input-common w-full"
                            required
                        />
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="flex gap-3">
                        <Button
                            type="submit"
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                            {isEditMode ? "Update Email" : "Create Email"}
                        </Button>
                        <Link to={`${basePath}/emails`} className="flex-1">
                            <Button type="button" variant="outline" className="w-full">
                                Cancel
                            </Button>
                        </Link>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default EmailsForm;