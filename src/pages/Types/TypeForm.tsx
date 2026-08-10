import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useBasePath } from "@/hooks/useBasePath";
import { createType, getTypeById, updateType } from "@/features/types/typesThunk";
import { fetchsubCategories } from "@/features/subcategories/subcategoriesThunk";
import { fetchAllChildCategories } from "@/features/childCategories/childCategoriesThunk";
import { fetchAttributes } from "@/features/attributes/attributesThunk";
import { fetchBrands } from "@/features/brands/brandsThunk";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TypeFormPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const basePath = useBasePath();
  const { categories: subCategories } = useSelector((state: RootState) => state.subcategori);
  const { allChildCategories } = useSelector((state: RootState) => state.childCategories);
  const { attributes } = useSelector((state: RootState) => state.attributes);
  const { brands } = useSelector((state: RootState) => state.brands);
  const [subCategoryId, setSubCategoryId] = useState<string>("");
  const [childCategoryId, setChildCategoryId] = useState<string>("");
  const [specificationAttributes, setSpecificationAttributes] = useState<string[]>([]);
  const [variantAttributes, setVariantAttributes] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(true);

  useEffect(() => {
    dispatch(fetchsubCategories({ page: 1, limit: 1000, status: "active" }));
    dispatch(fetchAllChildCategories(undefined));
    dispatch(fetchAttributes({ page: 1, limit: 1000, status: "active" }));
    dispatch(fetchBrands({ page: 1, limit: 1000, status: "active" }));
  }, [dispatch]);

  useEffect(() => {
    if (isEditMode && id) {
      dispatch(getTypeById(id)).then((res: any) => {
        if (res.payload) {
          const type = res.payload.data || res.payload;
          setName(type.name || "");
          setDescription(type.description || "");
          setStatus(type.status === "active");

          const rawSub = Array.isArray(type.subCategoryId)
            ? type.subCategoryId[0]
            : type.subCategoryId;
          const subId = typeof rawSub === "object" ? rawSub?._id : rawSub;
          setSubCategoryId(subId || "");

          const rawChild = Array.isArray(type.childCategoryId)
            ? type.childCategoryId[0]
            : type.childCategoryId;
          const childId = typeof rawChild === "object" ? rawChild?._id : rawChild;
          setChildCategoryId(childId || "");

          const allowed = Array.isArray(type.allowedAttributes)
            ? type.allowedAttributes.map((a: any) => (typeof a === "object" ? a._id : a))
            : Array.isArray(type.specificAttributes)
              ? type.specificAttributes.map((a: any) => (typeof a === "object" ? a._id : a))
              : [];
          setSpecificationAttributes(allowed);

          const variants = Array.isArray(type.variantAttributes)
            ? type.variantAttributes.map((a: any) => (typeof a === "object" ? a._id : a))
            : [];
          setVariantAttributes(variants);

          const rawBrands = Array.isArray(type.brandIds)
            ? type.brandIds
            : Array.isArray(type.brands)
              ? type.brands
              : Array.isArray(type.brandId)
                ? type.brandId
                : type.brandId
                  ? [type.brandId]
                  : [];
          const bIds = rawBrands.map((b: any) => (typeof b === "object" ? b._id : b));
          setSelectedBrands(bIds);
        }
      });
    }
  }, [dispatch, id, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Product Category Name is required");
      return;
    }
    if (!subCategoryId) {
      toast.error("Please select a SubCategory");
      return;
    }
    if (specificationAttributes.length === 0 && variantAttributes.length === 0) {
      toast.error("Please select at least one Specification or Variant Attribute");
      return;
    }

    const payload = {
      name,
      description,
      status: status ? "active" : "inactive",
      subCategoryId: subCategoryId,
      childCategoryId: childCategoryId ? [childCategoryId] : [],
      allowedAttributes: specificationAttributes,
      variantAttributes: variantAttributes,
      brandIds: selectedBrands,
      brands: selectedBrands,
      brandId: selectedBrands,
    };

    try {
      let result;
      if (isEditMode && id) {
        result = await dispatch(updateType({ id, data: payload }));
      } else {
        result = await dispatch(createType(payload));
      }

      if (createType.fulfilled.match(result) || updateType.fulfilled.match(result)) {
        toast.success(
          isEditMode
            ? "Product Category updated successfully!"
            : "Product Category created successfully!"
        );
        navigate(`${basePath}/types`);
      } else {
        toast.error((result.payload as string) || "Something went wrong");
      }
    } catch (err) {
      toast.error("Server Error");
    }
  };

  return (
    <div className="p-6 mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to={`${basePath}/types`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? "Edit Product Category" : "Add New Product Category"}
          </h1>
          <p className="text-gray-500 mt-1">
            {isEditMode
              ? "Update Product Category & Mapped Attributes."
              : "Create a Product Category and link to SubCategory & Attributes."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-md border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label htmlFor="name">
                  Product Category Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. T-Shirt, Jeans, Mobiles..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="subcategory">
                  Link SubCategory (Level 2) <span className="text-red-500">*</span>
                </Label>
                <Select value={subCategoryId} onValueChange={(val) => {
                  setSubCategoryId(val);
                  setChildCategoryId("");
                }}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select SubCategory (e.g. Men's Wear)" />
                  </SelectTrigger>
                  <SelectContent>
                    {subCategories.length === 0 ? (
                      <SelectItem value="__loading" disabled>
                        Loading subcategories...
                      </SelectItem>
                    ) : (
                      subCategories.map((sub: any) => (
                        <SelectItem key={sub._id} value={sub._id}>
                          {sub.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="childcategory">
                  Link Child Category (Level 3)
                </Label>
                <Select value={childCategoryId} onValueChange={(val) => setChildCategoryId(val)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select Child Category (e.g. Top Wear)" />
                  </SelectTrigger>
                  <SelectContent>
                    {allChildCategories
                      .filter((c: any) => !subCategoryId || (typeof c.subCategoryId === "object" ? c.subCategoryId?._id === subCategoryId : c.subCategoryId === subCategoryId))
                      .map((child: any) => (
                        <SelectItem key={child._id} value={child._id}>
                          {child.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-1.5 block font-medium">Link Brands</Label>
                {brands.length === 0 ? (
                  <p className="text-sm text-gray-500">Loading brands or no active brands found.</p>
                ) : (
                  <MultiSelect
                    options={brands.map((brand: any) => ({
                      value: brand._id,
                      label: brand.name,
                    }))}
                    selected={selectedBrands}
                    onChange={setSelectedBrands}
                    placeholder="Select Brands"
                  />
                )}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center justify-between">
                <span>
                  Attribute Mapping <span className="text-red-500">*</span>
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className=" grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1.5 block font-medium">Specification Attributes</Label>

                {attributes.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No global attributes found. Please create Attributes first.
                  </p>
                ) : (
                  <MultiSelect
                    options={attributes.map((attr: any) => ({
                      value: attr._id,
                      label: attr.name,
                      subLabel: attr.inputType || "select",
                    }))}
                    selected={specificationAttributes}
                    onChange={setSpecificationAttributes}
                    placeholder="Select specification attributes (Brand, Fabric, Material...)"
                  />
                )}
              </div>

              <div>
                <Label className="mb-1.5 block font-medium">Variant Attributes</Label>
                {attributes.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No global attributes found. Please create Attributes first.
                  </p>
                ) : (
                  <MultiSelect
                    options={attributes.map((attr: any) => ({
                      value: attr._id,
                      label: attr.name,
                      subLabel: attr.inputType || "select",
                    }))}
                    selected={variantAttributes}
                    onChange={setVariantAttributes}
                    placeholder="Select variant attributes (Color, Size...)"
                  />
                )}
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
                <Label htmlFor="status">Active</Label>
                <Switch id="status" checked={status} onCheckedChange={(val) => setStatus(val)} />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={!subCategoryId}
            >
              {isEditMode ? "Update Category" : "Save Category"}
            </Button>
            <Link to={`${basePath}/types`} className="flex-1">
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