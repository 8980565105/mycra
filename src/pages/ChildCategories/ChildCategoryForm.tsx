import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useBasePath } from "@/hooks/useBasePath";
import { fetchsubCategories } from "@/features/subcategories/subcategoriesThunk";
import {
  createChildCategory,
  updateChildCategory,
} from "@/features/childCategories/childCategoriesThunk";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/services/api";
import { ImageUpload } from "@/components/ui/ImageUpload";

export default function ChildCategoryFormPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const basePath = useBasePath();
  const { categories: subCategories } = useSelector((state: RootState) => state.subcategori);

  const [name, setName] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [status, setStatus] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);


  useEffect(() => {
    dispatch(fetchsubCategories({ page: 1, limit: 1000, status: "active" }));
  }, [dispatch]);

  useEffect(() => {
    if (isEditMode && id) {
      api.get(`/child-categories/${id}`).then((res) => {
        if (res.data && res.data.data) {
          const item = res.data.data;
          setName(item.name || "");
          const subId = typeof item.subCategoryId === "object" ? item.subCategoryId?._id : item.subCategoryId;
          setSubCategoryId(subId || "");
          setStatus(item.status === "active");
          setImageUrl(item.image_url || null);   // ✅ add
        }
      });
    }
  }, [id, isEditMode]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return toast.error("Name is required");
    if (!subCategoryId) return toast.error("SubCategory (Level 2) is required");

    const payload = {
      name,
      subCategoryId,
      status: status ? "active" : "inactive",
      image_url: imageUrl,
    };

    try {
      let result;
      if (isEditMode && id) {
        result = await dispatch(updateChildCategory({ id, data: payload }));
      } else {
        result = await dispatch(createChildCategory(payload));
      }

      if (createChildCategory.fulfilled.match(result) || updateChildCategory.fulfilled.match(result)) {
        toast.success(isEditMode ? "Child Category updated!" : "Child Category created!");
        navigate(`${basePath}/child-categories`);
      } else {
        toast.error((result.payload as string) || "Something went wrong");
      }
    } catch (err) {
      toast.error("Server Error");
    }
  };
  return (
    <div className="p-6 mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to={`${basePath}/child-categories`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? "Edit Child Category (Level 3)" : "Add Child Category (Level 3)"}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-4">
        <Card className="w-[75%]">
          <CardHeader>
            <CardTitle>Child Category Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Top Wear, Bottom Wear"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Select SubCategory (Level 2) *</Label>
                <Select value={subCategoryId} onValueChange={setSubCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose SubCategory..." />
                  </SelectTrigger>
                  <SelectContent>
                    {subCategories?.map((sub: any) => (
                      <SelectItem key={sub._id} value={sub._id}>
                        {sub.name} {sub.parent_id?.name ? `(${sub.parent_id.name})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Child Category Image</Label>
                <div className="mt-1">
                  <ImageUpload
                    value={imageUrl}
                    onChange={(url) => setImageUrl(url as string | null)}
                    size={150}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="w-[25%]">
          <Card className="sticky top-6 shadow-md border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="status">Active</Label>
                <Switch
                  id="status"
                  checked={status}
                  onCheckedChange={(val) => setStatus(val)}
                />
              </div>
              <div className="flex gap-4">
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-lg py-6">
                  {isEditMode ? "Update Level 3" : "Save Level 3"}
                </Button>
                <Link to={`${basePath}/child-categories`} className="flex-1">
                  <Button type="button" variant="outline" className="w-full text-lg py-6">
                    Cancel
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </form >

    </div >
  );
}
