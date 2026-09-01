import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { useBasePath } from "@/hooks/useBasePath";
import { TiptapEditor } from "@/components/ui/TiptapEditor";
import { createPolicyPage, getPolicyPageById, updatePolicyPage } from "@/features/Policypages/policypagesThunk";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


function slugify(text: string = "") {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

export default function PolicyPageFormPage() {
    const dispatch = useDispatch<any>();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditMode = Boolean(id);
    const basePath = useBasePath();
    const [pageName, setPageName] = useState("");
    const [slug, setSlug] = useState("");
    const [slugTouched, setSlugTouched] = useState(false);
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("active");
    const [order, setOrder] = useState<number | "">("");
    const [metaTitle, setMetaTitle] = useState("");
    const [metaDescription, setMetaDescription] = useState("");
    const [metaKeyphrase, setMetaKeyphrase] = useState("");
    const [seoImage, setSeoImage] = useState("");
    useEffect(() => {
        if (isEditMode && id) {
            dispatch(getPolicyPageById(id)).then((res: any) => {
                if (res.payload) {
                    const page = res.payload;
                    setPageName(page.page_name || "");
                    setSlug(page.slug || "");
                    setSlugTouched(true);
                    setDescription(page.description || "");
                    setMetaTitle(page.meta_title || "");
                    setMetaDescription(page.meta_description || "");
                    setMetaKeyphrase(page.meta_keyphrase || "");
                    setSeoImage(page.seo_image || "");
                    setStatus(page.status || "active");
                    setOrder(page.order || 1);
                }
            });
        }
    }, [dispatch, id, isEditMode]);
    const handlePageNameChange = (val: string) => {
        setPageName(val);
        setSlug(slugify(val));
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pageName.trim()) return toast.error("Please enter page name");
        const payload: any = {
            page_name: pageName,
            slug: slug || slugify(pageName),
            description,
            meta_title: metaTitle,
            meta_description: metaDescription,
            meta_keyphrase: metaKeyphrase,
            seo_image: seoImage,
            status,
            order,
        };

        try {
            let result;
            if (isEditMode && id) {
                result = await dispatch(updatePolicyPage({ id, data: payload }));
            } else {
                result = await dispatch(createPolicyPage(payload));
            }
            if (
                createPolicyPage.fulfilled.match(result) ||
                updatePolicyPage.fulfilled.match(result)
            ) {
                toast.success(
                    isEditMode
                        ? "Policy page updated successfully!"
                        : "Policy page created successfully!"
                );
                navigate(`${basePath}/policypages`);
            } else {
                toast.error((result.payload as string) || "Something went wrong");
            }
        } catch {
            toast.error("Server Error");
        }
    };
    return (
        <div className="p-6 mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link to={`${basePath}/policypages`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isEditMode ? "Edit Policy Page" : "Add New Policy Page"}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {isEditMode
                            ? "Update policy page content and SEO."
                            : "Create a new policy page like Privacy Policy, Return Policy, or Terms & Conditions."}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="shadow-md border border-gray-200">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Page Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div>
                                <Label>Page Name *</Label>
                                <Select value={pageName} onValueChange={handlePageNameChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Policy Page" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Return Policy">Return Policy</SelectItem>
                                        <SelectItem value="Terms and Conditions">Terms and Conditions</SelectItem>
                                        <SelectItem value="Privacy Policy">Privacy Policy</SelectItem>
                                        <SelectItem value="Shipping and Delivery Policy">Shipping & Delivery Policy</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Slug</Label>
                                <Input
                                    value={slug}
                                    placeholder="e.g. privacy-policy"
                                    onChange={(e) => {
                                        setSlugTouched(true);
                                        setSlug(slugify(e.target.value));
                                    }}
                                />
                            </div>
                            <div>
                                <Label>Description</Label>
                                <TiptapEditor
                                    value={description}
                                    onChange={(val) => setDescription(val)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-md border border-gray-200">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">SEO Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div>
                                <Label>Meta Title</Label>
                                <Input
                                    value={metaTitle}
                                    onChange={(e) => setMetaTitle(e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>Meta Description</Label>
                                <Textarea
                                    value={metaDescription}
                                    onChange={(e) => setMetaDescription(e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>Meta Keyphrase</Label>
                                <Input
                                    value={metaKeyphrase}
                                    onChange={(e) => setMetaKeyphrase(e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>SEO Image</Label>
                                <ImageUpload
                                    value={seoImage}
                                    onChange={(url) => setSeoImage(url as string)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6 relative">
                    <Card className="sticky top-6 shadow-md border border-gray-200">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="status">Active</Label>
                                <Switch
                                    id="status"
                                    checked={status === "active"}
                                    onCheckedChange={(val) => setStatus(val ? "active" : "inactive")}
                                />
                            </div>
                            <div>
                                <Label>Order</Label>
                                <Input
                                    type="number"
                                    value={order === "" ? "" : order}
                                    onChange={(e) =>
                                        setOrder(e.target.value === "" ? "" : Number(e.target.value))
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex gap-3 sticky top-[250px]">
                        <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                            {isEditMode ? "Update Policy Page" : "Create Policy Page"}
                        </Button>
                        <Link to={`${basePath}/policypages`} className="flex-1">
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

