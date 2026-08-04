// import { useEffect, useState } from "react";
// import { Link, useNavigate, useParams } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { AppDispatch, RootState } from "@/store";
// import { Button } from "@/components/ui/button";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Switch } from "@/components/ui/switch";
// import { ArrowLeft, Check } from "lucide-react";
// import { toast } from "sonner";
// import { useBasePath } from "@/hooks/useBasePath";
// import { createType, getTypeById, updateType } from "@/features/types/typesThunk";
// import { fetchsubCategories } from "@/features/subcategories/subcategoriesThunk";
// import { fetchAttributes } from "@/features/attributes/attributesThunk";
// import { Checkbox } from "@/components/ui/checkbox";
// import { MultiSelect } from "@/components/ui/multi-select";

// export default function TypeFormPage() {
//   const dispatch = useDispatch<AppDispatch>();
//   const navigate = useNavigate();
//   const { id } = useParams<{ id: string }>();
//   const isEditMode = Boolean(id);
//   const basePath = useBasePath();
//   const { categories: subCategories } = useSelector((state: RootState) => state.subcategori);
//   const { attributes } = useSelector((state: RootState) => state.attributes);
//   const [subCategoryIds, setSubCategoryIds] = useState<string[]>([]);
//   const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
//   const [name, setName] = useState("");
//   const [description, setDescription] = useState("");
//   const [status, setStatus] = useState(true);
//   const [subCategoryId, setSubCategoryId] = useState("");
//   useEffect(() => {
//     dispatch(fetchsubCategories({ page: 1, limit: 1000, status: "active" }));
//     dispatch(fetchAttributes({ page: 1, limit: 1000, status: "active" }));
//   }, [dispatch]);
//   useEffect(() => {
//     if (isEditMode && id) {
//       dispatch(getTypeById(id)).then((res: any) => {
//         if (res.payload) {
//           const type = res.payload;
//           setName(type.name || "");
//           setDescription(type.description || "");
//           setStatus(type.status === "active");
//           const subIds = Array.isArray(type.subCategoryId)
//             ? type.subCategoryId.map((s: any) => (typeof s === "object" ? s._id : s))
//             : type.subCategoryId
//               ? [typeof type.subCategoryId === "object" ? type.subCategoryId._id : type.subCategoryId]
//               : [];
//           setSubCategoryIds(subIds);
//           const allowed = Array.isArray(type.allowedAttributes)
//             ? type.allowedAttributes.map((a: any) => (typeof a === "object" ? a._id : a))
//             : [];
//           setSelectedAttributes(allowed);
//         }
//       });
//     }
//   }, [dispatch, id, isEditMode]);
//   const toggleAttribute = (attrId: string) => {
//     setSelectedAttributes((prev) =>
//       prev.includes(attrId) ? prev.filter((i) => i !== attrId) : [...prev, attrId]
//     );
//   };
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     const payload = {
//       name,
//       description,
//       status: status ? "active" : "inactive",
//       subCategoryId: subCategoryIds,
//       allowedAttributes: selectedAttributes,
//     };

//     try {
//       let result;
//       if (isEditMode && id) {
//         result = await dispatch(updateType({ id, data: payload }));
//       } else {
//         result = await dispatch(createType(payload));
//       }

//       if (createType.fulfilled.match(result) || updateType.fulfilled.match(result)) {
//         toast.success(isEditMode ? "Product Category updated successfully!" : "Product Category created successfully!");
//         navigate(`${basePath}/types`);
//       } else {
//         toast.error((result.payload as string) || "Something went wrong");
//       }
//     } catch (err) {
//       toast.error("Server Error");
//     }
//   };
//   return (
//     <div className="p-6 mx-auto">
//       <div className="flex items-center gap-4 mb-6">
//         <Link to={`${basePath}/types`}>
//           <Button variant="ghost" size="icon">
//             <ArrowLeft className="h-4 w-4" />
//           </Button>
//         </Link>
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">
//             {isEditMode ? "Edit Product Category" : "Add New Product Category"}
//           </h1>
//           <p className="text-gray-500 mt-1">
//             {isEditMode ? "Update Product Category & Mapped Attributes." : "Create a Product Category and link to SubCategory & Attributes."}
//           </p>
//         </div>
//       </div>
//       <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
//         <div className="lg:col-span-2 space-y-6">
//           <Card className="shadow-md border border-gray-200">
//             <CardHeader>
//               <CardTitle className="text-lg font-semibold">Basic Information</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-5">
//               <div>
//                 <Label htmlFor="name">Product Category Name <span className="text-red-500">*</span></Label>
//                 <Input
//                   id="name"
//                   placeholder="e.g. T-Shirt, Jeans, Mobiles..."
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                   required
//                   className="mt-1"
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="subcategory">Link SubCategory <span className="text-red-500">*</span></Label>
//                 <MultiSelect
//                   options={subCategories.map((sub: any) => ({
//                     value: sub._id,
//                     label: sub.name,
//                     subLabel: sub.parent_id?.name || "",
//                   }))}
//                   selected={subCategoryIds}
//                   onChange={setSubCategoryIds}
//                   placeholder="Select SubCategory (e.g. Men's Wear)"
//                   className="mt-1"
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="description">Description</Label>
//                 <Textarea
//                   id="description"
//                   placeholder="Description..."
//                   value={description}
//                   onChange={(e) => setDescription(e.target.value)}
//                   className="mt-1 min-h-[100px]"
//                 />
//               </div>
//             </CardContent>
//           </Card>
//           <Card className="shadow-md border border-gray-200">
//             <CardHeader>
//               <CardTitle className="text-lg font-semibold flex items-center justify-between">
//                 <span>Attribute Mapping</span>
//               </CardTitle>
//             </CardHeader>

//             <CardContent>
//               {attributes.length === 0 ? (
//                 <p className="text-sm text-gray-500">No global attributes found. Please create Attributes first.</p>
//               ) : (
//                 <MultiSelect
//                   options={attributes.map((attr: any) => ({
//                     value: attr._id,
//                     label: attr.name,
//                     subLabel: attr.inputType || "select",
//                   }))}
//                   selected={selectedAttributes}
//                   onChange={setSelectedAttributes}
//                   placeholder="Select attributes for this category"
//                 />
//               )}
//             </CardContent>

//           </Card>
//         </div>

//         <div className="space-y-6">
//           <Card className="sticky top-6 shadow-md border border-gray-200">
//             <CardHeader>
//               <CardTitle className="text-lg font-semibold">Status</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="flex items-center justify-between">
//                 <Label htmlFor="status">Active</Label>
//                 <Switch
//                   id="status"
//                   checked={status}
//                   onCheckedChange={(val) => setStatus(val)}
//                 />
//               </div>
//             </CardContent>
//           </Card>

//           <div className="flex gap-3">
//             <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
//               {isEditMode ? "Update Category" : "Save Category"}
//             </Button>
//             <Link to={`${basePath}/types`} className="flex-1">
//               <Button type="button" variant="outline" className="w-full">
//                 Cancel
//               </Button>
//             </Link>
//           </div>
//         </div>
//       </form>
//     </div>
//   );
// }

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
import { fetchAttributes } from "@/features/attributes/attributesThunk";
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
  const { attributes } = useSelector((state: RootState) => state.attributes);
  const [subCategoryId, setSubCategoryId] = useState<string>("");
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(true);

  useEffect(() => {
    dispatch(fetchsubCategories({ page: 1, limit: 1000, status: "active" }));
    dispatch(fetchAttributes({ page: 1, limit: 1000, status: "active" }));
  }, [dispatch]);

  useEffect(() => {
    if (isEditMode && id) {
      dispatch(getTypeById(id)).then((res: any) => {
        if (res.payload) {
          const type = res.payload;
          setName(type.name || "");
          setDescription(type.description || "");
          setStatus(type.status === "active");

          const rawSub = Array.isArray(type.subCategoryId)
            ? type.subCategoryId[0]
            : type.subCategoryId;
          const subId = typeof rawSub === "object" ? rawSub?._id : rawSub;
          setSubCategoryId(subId || "");

          const allowed = Array.isArray(type.allowedAttributes)
            ? type.allowedAttributes.map((a: any) => (typeof a === "object" ? a._id : a))
            : [];
          setSelectedAttributes(allowed);
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
    if (selectedAttributes.length === 0) {
      toast.error("Please select at least one Attribute (Color, Size, Brand, Fabric...)");
      return;
    }

    const payload = {
      name,
      description,
      status: status ? "active" : "inactive",
      subCategoryId: subCategoryId,
      allowedAttributes: selectedAttributes,
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
                  Link SubCategory <span className="text-red-500">*</span>
                </Label>
                <Select value={subCategoryId} onValueChange={(val) => setSubCategoryId(val)}>
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
            <CardContent>
              {attributes.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No global attributes found. Please create Attributes first (e.g. Color,
                  Numeric Size, Alpha Size, Brand, Fabric/Material).
                </p>
              ) : (
                <MultiSelect
                  options={attributes.map((attr: any) => ({
                    value: attr._id,
                    label: attr.name,
                    subLabel: attr.inputType || "select",
                  }))}
                  selected={selectedAttributes}
                  onChange={setSelectedAttributes}
                  placeholder="Select attributes for this category (Color, Size, Brand, Fabric...)"
                />
              )}
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