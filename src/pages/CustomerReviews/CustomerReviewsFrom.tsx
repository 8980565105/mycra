import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Star, Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useBasePath } from "@/hooks/useBasePath";
import {
    createCustomerReview,
    updateCustomerReview,
    getCustomerReviewById,
} from "@/features/customerReviews/customerReviewsThunk";
import api from "@/services/api";
import { ROUTES } from "@/services/routes";

interface ProductOption {
    _id: string;
    name: string;
}

interface UserOption {
    _id: string;
    name: string;
    email?: string;
}

export default function CustomerReviewsFrom() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditMode = Boolean(id);
    const basePath = useBasePath();
    const [productId, setProductId] = useState<string>("");
    const [userId, setUserId] = useState<string>("");
    const [rating, setRating] = useState<number>(5);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [title, setTitle] = useState<string>("");
    const [comment, setComment] = useState<string>("");
    const [isApproved, setIsApproved] = useState<boolean>(true);
    const [reviewDate, setReviewDate] = useState<string>("");
    const [products, setProducts] = useState<ProductOption[]>([]);
    const [users, setUsers] = useState<UserOption[]>([]);
    const [loadingProducts, setLoadingProducts] = useState<boolean>(false);
    const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [fetchingDetail, setFetchingDetail] = useState<boolean>(false);

    useEffect(() => {
        const loadProducts = async () => {
            setLoadingProducts(true);
            try {
                const res = await api.get(ROUTES.products.getAll, {
                    params: { page: 1, limit: 200, status: "active" },
                });
                if (res.data?.success && res.data?.data?.products) {
                    setProducts(res.data.data.products);
                } else if (Array.isArray(res.data?.data)) {
                    setProducts(res.data.data);
                }
            } catch (error) {
                console.error("Failed to load products:", error);
            } finally {
                setLoadingProducts(false);
            }
        };

        const loadUsers = async () => {
            setLoadingUsers(true);
            try {
                const res = await api.get(ROUTES.users.getAll, {
                    params: { page: 1, limit: 200 },
                });
                if (res.data?.success && res.data?.data?.users) {
                    setUsers(res.data.data.users);
                } else if (Array.isArray(res.data?.data)) {
                    setUsers(res.data.data);
                }
            } catch (error) {
                console.error("Failed to load users:", error);
            } finally {
                setLoadingUsers(false);
            }
        };

        loadProducts();
        loadUsers();
    }, []);

    useEffect(() => {
        if (isEditMode && id) {
            setFetchingDetail(true);
            dispatch(getCustomerReviewById(id))
                .unwrap()
                .then((data: any) => {
                    if (data) {
                        setProductId(data.product_id?._id || data.product_id || "");
                        setUserId(data.user_id?._id || data.user_id || "");
                        setRating(Number(data.rating) || 5);
                        setTitle(data.title || "");
                        setComment(data.comment || "");
                        setIsApproved(data.is_approved ?? true);
                        if (data.createdAt) {
                            const d = new Date(data.createdAt);
                            const pad = (n: number) => (n < 10 ? `0${n}` : n);
                            const formattedDate = `${d.getFullYear()}-${pad(
                                d.getMonth() + 1
                            )}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
                                d.getMinutes()
                            )}`;
                            setReviewDate(formattedDate);
                        }
                    }
                })
                .catch((err: any) => {
                    toast.error(err || "Failed to load review details");
                })
                .finally(() => {
                    setFetchingDetail(false);
                });
        }
    }, [dispatch, id, isEditMode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!productId) {
            toast.error("Please select a product");
            return;
        }
        if (!userId) {
            toast.error("Please select a user");
            return;
        }
        if (!title.trim()) {
            toast.error("Please enter a review title");
            return;
        }
        if (!rating || rating < 1 || rating > 5) {
            toast.error("Please select a rating between 1 and 5");
            return;
        }
        setSubmitting(true);
        const payload: any = {
            product_id: productId,
            user_id: userId,
            rating,
            title: title.trim(),
            comment: comment.trim(),
            is_approved: isApproved,
        };

        if (reviewDate) {
            payload.createdAt = new Date(reviewDate).toISOString();
        }

        try {
            if (isEditMode && id) {
                await dispatch(
                    updateCustomerReview({
                        id,
                        data: payload,
                    })
                ).unwrap();
                toast.success("Customer review updated successfully!");
            } else {
                await dispatch(createCustomerReview(payload)).unwrap();
                toast.success("Customer review added successfully!");
            }

            navigate(`${basePath}/customer-reviews`);
        } catch (err: any) {
            toast.error(err || "Something went wrong while saving review");
        } finally {
            setSubmitting(false);
        }
    };

    if (fetchingDetail) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
                <Link to={`${basePath}/customer-reviews`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isEditMode ? "Edit Customer Review" : "Add New Customer Review"}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {isEditMode
                            ? "Update review rating, product, date, or description."
                            : "Create a customer review for a selected product."}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="shadow-md border border-gray-200">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">
                                Review Information
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-5">
                            <div>
                                <Label htmlFor="product">
                                    Select Product <span className="text-red-500">*</span>
                                </Label>
                                <div className="mt-1">
                                    <Select
                                        value={productId}
                                        onValueChange={(value) => setProductId(value)}
                                        disabled={loadingProducts}
                                    >
                                        <SelectTrigger id="product">
                                            <SelectValue
                                                placeholder={
                                                    loadingProducts
                                                        ? "Loading products..."
                                                        : "Select a product"
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {products.length === 0 ? (
                                                <SelectItem value="none" disabled>
                                                    No products found
                                                </SelectItem>
                                            ) : (
                                                products.map((prod) => (
                                                    <SelectItem key={prod._id} value={prod._id}>
                                                        {prod.name}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="user">
                                    Select User <span className="text-red-500">*</span>
                                </Label>
                                <div className="mt-1">
                                    <Select
                                        value={userId}
                                        onValueChange={(value) => setUserId(value)}
                                        disabled={loadingUsers}
                                    >
                                        <SelectTrigger id="user">
                                            <SelectValue
                                                placeholder={
                                                    loadingUsers
                                                        ? "Loading users..."
                                                        : "Select a user"
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {users.length === 0 ? (
                                                <SelectItem value="none" disabled>
                                                    No users found
                                                </SelectItem>
                                            ) : (
                                                users.map((usr) => (
                                                    <SelectItem key={usr._id} value={usr._id}>
                                                        {usr.name} {usr.email ? `(${usr.email})` : ""}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>
                                        Rating <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => {
                                                const active = (hoverRating || rating) >= star;
                                                return (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        className="p-1 rounded transition-transform hover:scale-110 focus:outline-none"
                                                        onMouseEnter={() => setHoverRating(star)}
                                                        onMouseLeave={() => setHoverRating(0)}
                                                        onClick={() => setRating(star)}
                                                    >
                                                        <Star
                                                            className={`h-7 w-7 ${active
                                                                ? "fill-amber-400 text-amber-400"
                                                                : "text-gray-300"
                                                                }`}
                                                        />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <span className="text-sm font-semibold text-gray-700 ml-2">
                                            {rating} / 5 Star{rating > 1 ? "s" : ""}
                                        </span>
                                    </div>
                                </div>


                                <div>
                                    <Label htmlFor="reviewDate" className="flex items-center gap-1.5">
                                        <Calendar className="h-4 w-4 text-gray-500" />
                                        Review Date (Optional)
                                    </Label>
                                    <Input
                                        id="reviewDate"
                                        type="datetime-local"
                                        value={reviewDate}
                                        onChange={(e) => setReviewDate(e.target.value)}
                                        className="mt-1"
                                    />

                                </div>
                            </div>

                            <div>
                                <Label htmlFor="title">
                                    Review Title <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="title"
                                    placeholder="e.g. Excellent Product Quality & Fast Delivery"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="comment">Description / Comment</Label>
                                <Textarea
                                    id="comment"
                                    placeholder="Enter detailed customer feedback or review description..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="mt-1 min-h-[130px]"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="sticky top-6 shadow-md border border-gray-200">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="is_approved" className="font-medium">
                                        Approved
                                    </Label>
                                </div>
                                <Switch
                                    id="is_approved"
                                    checked={isApproved}
                                    onCheckedChange={(val) => setIsApproved(val)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex gap-3">
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditMode ? "Update Review" : "Save Review"}
                        </Button>
                        <Link to={`${basePath}/customer-reviews`} className="flex-1">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={submitting}
                                className="w-full"
                            >
                                Cancel
                            </Button>
                        </Link>
                    </div>
                </div>
            </form>
        </div>
    );
}
