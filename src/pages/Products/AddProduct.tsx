// import { useEffect, useState } from "react";
// import { Link, useNavigate, useParams } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { AppDispatch, RootState } from "@/store";
// import { Button } from "@/components/ui/button";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Switch } from "@/components/ui/switch";
// import { ArrowLeft, Sparkles, Trash2, Layers, Tag } from "lucide-react";
// import { toast } from "sonner";
// import { TiptapEditor } from "@/components/ui/TiptapEditor";
// import { ImageUpload } from "@/components/ui/ImageUpload";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { fetchsubCategories } from "@/features/subcategories/subcategoriesThunk";
// import { fetchBrands } from "@/features/brands/brandsThunk";
// import { fetchTypes } from "@/features/types/typesThunk";
// import { fetchFabrics } from "@/features/fabrics/fabricsThunk";
// import { useBasePath } from "@/hooks/useBasePath";
// import { fetchProductLabels } from "@/features/productLabels/productLabelsThunk";
// import {
//   createProduct,
//   getProductById,
//   updateProduct,
// } from "@/features/products/productsThunk";
// import { fetchColors } from "@/features/colors/colorsThunk";
// import { fetchSizes } from "@/features/sizes/sizesThunk";
// import { fetchCategories } from "@/features/categories/categoriesThunk";
// import { fetchCategoryAttributes, fetchTypeAttributes } from "@/features/attributes/attributesThunk";
// export default function ProductFormPage() {
//   const dispatch = useDispatch<AppDispatch>();
//   const navigate = useNavigate();
//   const { id } = useParams<{ id: string }>();
//   const isEditMode = Boolean(id);
//   const basePath = useBasePath();
//   const { categories: mainCategories } = useSelector((state: RootState) => state.categories);
//   const { categories: subCategories } = useSelector((state: RootState) => state.subcategori);
//   const { brands } = useSelector((state: RootState) => state.brands);
//   const { types } = useSelector((state: RootState) => state.types);
//   const { fabrics } = useSelector((state: RootState) => state.fabrics);
//   const { colors } = useSelector((state: RootState) => state.colors);
//   const { sizes } = useSelector((state: RootState) => state.sizes);
//   const { categoryAttributes } = useSelector((state: RootState) => state.attributes);
//   const { labels: productLabels } = useSelector((state: RootState) => state.productLabels);
//   const [name, setName] = useState("");
//   const [tag, setTag] = useState("");
//   const [description, setDescription] = useState("");
//   const [mainCategoryId, setMainCategoryId] = useState<string>("");
//   const [categoryId, setCategoryId] = useState<string>(""); 
//   const [brandId, setBrandId] = useState<string>("");
//   const [typeId, setTypeId] = useState<string>(""); 
//   const [fabricId, setFabricId] = useState<string>("");
//   const [images, setImages] = useState<string[]>([]);
//   const [status, setStatus] = useState(true);
//   const [selectedColors, setSelectedColors] = useState<string[]>([]);
//   const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
//   const [selectedDynAttrs, setSelectedDynAttrs] = useState<{ [attrId: string]: string[] }>({});
//   const [variants, setVariants] = useState<any[]>([]);
//   const [bulkPrice, setBulkPrice] = useState("");
//   const [bulkOfferPrice, setBulkOfferPrice] = useState("");
//   const [bulkStock, setBulkStock] = useState("");
//   useEffect(() => {
//     dispatch(fetchCategories({ page: 1, limit: 100, status: "active" }));
//     dispatch(fetchsubCategories({ page: 1, limit: 1000, status: "active", role: "admin" }));
//     dispatch(fetchBrands({ page: 1, limit: 100, status: "active" }));
//     dispatch(fetchTypes({ page: 1, limit: 1000, status: "active" }));
//     dispatch(fetchFabrics({ page: 1, limit: 100, status: "active" }));
//     dispatch(fetchColors({ page: 1, limit: 100, status: "active" }));
//     dispatch(fetchSizes({ page: 1, limit: 100, status: "active" }));
//     dispatch(fetchProductLabels({ page: 1, limit: 100, status: "active" }));
//   }, [dispatch]);
//   useEffect(() => {
//     if (typeId) {
//       dispatch(fetchTypeAttributes(typeId));
//     } else if (categoryId) {
//       dispatch(fetchCategoryAttributes(categoryId));
//     }
//   }, [dispatch, typeId, categoryId]);
//   useEffect(() => {
//     if (isEditMode && id) {
//       dispatch(getProductById(id)).then((res: any) => {
//         if (res.payload) {
//           const p = res.payload.data || res.payload;
//           setName(p.name || "");
//           setTag(p.tag || "");
//           setDescription(p.description || "");
//           const catId = p.category_id?._id || p.category_id || "";
//           setCategoryId(String(catId));
//           setImages(p.images || []);
//           setStatus(p.status === "active");
//           if (Array.isArray(p.variants) && p.variants.length > 0) {
//             const firstV = p.variants[0];
//             if (firstV.brand_id) setBrandId(firstV.brand_id._id || firstV.brand_id);
//             if (firstV.type_id) setTypeId(firstV.type_id._id || firstV.type_id);
//             if (firstV.fabric_id) setFabricId(firstV.fabric_id._id || firstV.fabric_id);
//             setVariants(
//               p.variants.map((v: any, idx: number) => ({
//                 _id: v._id,
//                 brand_id: v.brand_id?._id || v.brand_id || "",
//                 fabric_id: v.fabric_id?._id || v.fabric_id || "",
//                 type_id: v.type_id?._id || v.type_id || "",
//                 color_id: v.color_id?._id || v.color_id || "",
//                 color_name: v.color_id?.name || colors.find((c) => c._id === v.color_id)?.name || "",
//                 size_id: v.size_id?._id || v.size_id || "",
//                 size_name: v.size_id?.name || sizes.find((s) => s._id === v.size_id)?.name || "",
//                 dynamicAttributes: v.attributes || {},
//                 price: v.price || "",
//                 offerprice: v.offerprice || "",
//                 stock_quantity: v.stock_quantity ?? "0",
//                 sku: v.sku || `SKU-${Date.now()}-${idx + 1}`,
//                 status: v.status || "active",
//                 images: v.images || [],
//                 labels: Array.isArray(v.labels) ? v.labels : [],
//                 is_featured: !!v.is_featured,
//                 is_best_seller: !!v.is_best_seller,
//                 is_trending: !!v.is_trending,
//                 description: v.description || "",
//               }))
//             );
//           }
//         }
//       });
//     }
//   }, [dispatch, id, isEditMode]);
//   const toggleSelection = (list: string[], setList: (val: string[]) => void, id: string) => {
//     if (list.includes(id)) {
//       setList(list.filter((item) => item !== id));
//     } else {
//       setList([...list, id]);
//     }
//   };
//   const toggleDynAttrSelection = (attrId: string, valId: string) => {
//     setSelectedDynAttrs((prev) => {
//       const current = prev[attrId] || [];
//       if (current.includes(valId)) {
//         return { ...prev, [attrId]: current.filter((v) => v !== valId) };
//       } else {
//         return { ...prev, [attrId]: [...current, valId] };
//       }
//     });
//   };
//   const cartesianProduct = (arrays: any[][]): any[][] => {
//     return arrays.reduce<any[][]>(
//       (acc, curr) => acc.flatMap((d) => curr.map((e) => [...d, e])),
//       [[]]
//     );
//   };
//   const handleGenerateVariants = () => {
//     const attributeSets: { key: string; items: { id: string; name: string; attrId?: string }[] }[] = [];
//     if (selectedColors.length > 0) {
//       attributeSets.push({
//         key: "color",
//         items: selectedColors.map((id) => ({
//           id,
//           name: colors.find((c) => c._id === id)?.name || "Color",
//         })),
//       });
//     }
//     if (selectedSizes.length > 0) {
//       attributeSets.push({
//         key: "size",
//         items: selectedSizes.map((id) => ({
//           id,
//           name: sizes.find((s) => s._id === id)?.name || "Size",
//         })),
//       });
//     }
//     if (categoryAttributes && categoryAttributes.length > 0) {
//       categoryAttributes.forEach((attr: any) => {
//         const selectedForAttr = selectedDynAttrs[attr._id] || [];
//         if (selectedForAttr.length > 0) {
//           attributeSets.push({
//             key: `dyn_${attr._id}`,
//             items: selectedForAttr.map((valId) => {
//               const valObj = attr.values?.find((v: any) => v._id === valId);
//               return {
//                 id: valId,
//                 name: valObj ? valObj.value : "Val",
//                 attrId: attr._id,
//               };
//             }),
//           });
//         }
//       });
//     }
//     if (attributeSets.length === 0) {
//       return toast.error("Please select at least one variant attribute option!");
//     }
//     const arraysToCombine = attributeSets.map((s) => s.items);
//     const combinations = cartesianProduct(arraysToCombine);
//     const generated = combinations.map((combo, idx) => {
//       let colorItem: any = null;
//       let sizeItem: any = null;
//       const dynAttrs: { [attrId: string]: string } = {};
//       const variantNameParts: string[] = [];
//       combo.forEach((item, index) => {
//         const setKey = attributeSets[index].key;
//         if (setKey === "color") {
//           colorItem = item;
//         } else if (setKey === "size") {
//           sizeItem = item;
//         } else if (setKey.startsWith("dyn_")) {
//           if (item.attrId) dynAttrs[item.attrId] = item.id;
//         }
//         variantNameParts.push(item.name);
//       });
//       const cleanProdName = name.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5) || "PROD";
//       const cleanVariantTag = variantNameParts.join("-").toUpperCase().replace(/[^A-Z0-9-]/g, "");
//       const generatedSku = `${cleanProdName}-${cleanVariantTag}-${idx + 1}`;
//       return {
//         brand_id: brandId,
//         fabric_id: fabricId,
//         type_id: typeId,
//         color_id: colorItem ? colorItem.id : "",
//         color_name: colorItem ? colorItem.name : "",
//         size_id: sizeItem ? sizeItem.id : "",
//         size_name: sizeItem ? sizeItem.name : "",
//         dynamicAttributes: dynAttrs,
//         variantLabel: variantNameParts.join(" / "),
//         price: bulkPrice || "",
//         offerprice: bulkOfferPrice || "",
//         stock_quantity: bulkStock || "10",
//         sku: generatedSku,
//         images: [...images],
//         labels: [],
//         status: "active",
//         is_featured: false,
//         is_best_seller: false,
//         is_trending: false,
//         description: "",
//       };
//     });
//     setVariants(generated);
//     toast.success(`Successfully generated ${generated.length} variant(s)!`);
//   };
//   const handleApplyBulk = () => {
//     if (variants.length === 0) return toast.error("No variants generated yet!");
//     const updated = variants.map((v) => ({
//       ...v,
//       price: bulkPrice !== "" ? bulkPrice : v.price,
//       offerprice: bulkOfferPrice !== "" ? bulkOfferPrice : v.offerprice,
//       stock_quantity: bulkStock !== "" ? bulkStock : v.stock_quantity,
//     }));
//     setVariants(updated);
//     toast.success("Bulk settings applied to all variants!");
//   };
//   const handleVariantChange = (index: number, field: string, value: any) => {
//     const updated = [...variants];
//     updated[index][field] = value;
//     setVariants(updated);
//   };
//   const removeVariant = (index: number) => {
//     const updated = [...variants];
//     updated.splice(index, 1);
//     setVariants(updated);
//   };
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!name.trim()) return toast.error("Product Name is required");
//     if (!categoryId) return toast.error("SubCategory is required");
//     if (variants.length === 0) return toast.error("Generate or add at least one variant");

//     for (let i = 0; i < variants.length; i++) {
//       const v = variants[i];
//       if (!v.price || v.offerprice === "" || v.stock_quantity === "" || !v.sku) {
//         return toast.error(`Price, Offer Price, Stock, and SKU are required for variant ${i + 1}`);
//       }
//     }

//     const processedVariants = variants.map((v) => ({
//       ...v,
//       brand_id: v.brand_id || brandId || undefined,
//       fabric_id: v.fabric_id || fabricId || undefined,
//       type_id: v.type_id || typeId || undefined,
//     }));

//     const payload = {
//       name,
//       tag,
//       description,
//       mainCategory_id: mainCategoryId || undefined,
//       category_id: categoryId,
//       type_id: typeId || undefined,
//       images,
//       status: status ? "active" : "inactive",
//       variants: processedVariants,
//     };

//     try {
//       let result;
//       if (isEditMode && id) {
//         result = await dispatch(updateProduct({ id, data: payload }));
//       } else {
//         result = await dispatch(createProduct(payload));
//       }

//       if (createProduct.fulfilled.match(result) || updateProduct.fulfilled.match(result)) {
//         toast.success(isEditMode ? "Product updated successfully!" : "Product created successfully!");
//         navigate(`${basePath}/products`);
//       } else {
//         toast.error((result.payload as string) || "Something went wrong");
//       }
//     } catch (err) {
//       toast.error("Server Error");
//     }
//   };
//   return (
//     <div className="p-6 mx-auto space-y-6">
//       <div className="flex items-center gap-4">
//         <Link to={`${basePath}/products`}>
//           <Button variant="ghost" size="icon">
//             <ArrowLeft className="h-4 w-4" />
//           </Button>
//         </Link>
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">
//             {isEditMode ? "Edit Product" : "Add New Product"}
//           </h1>
//           <p className="text-gray-500 mt-1">
//             Configure common details, dynamic variant attributes, and bulk pricing.
//           </p>
//         </div>
//       </div>
//       <form onSubmit={handleSubmit} className=" flex gap-4">
//         <div className="w-[75%] space-y-6">
//           <Card className="shadow-sm border border-gray-200">
//             <CardHeader className="bg-slate-50/50 border-b border-gray-100">
//               <CardTitle className="text-lg font-semibold flex items-center gap-2">
//                 <Tag className="w-5 h-5 text-blue-600" />
//                 Step 1: Common Details (One Time)
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-5 pt-5">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <Label>Product Name *</Label>
//                   <Input
//                     placeholder="e.g. Men Casual Cotton T-Shirt"
//                     value={name}
//                     onChange={(e) => setName(e.target.value)}
//                   />
//                 </div>
//                 <div>
//                   <Label>Tag</Label>
//                   <Input
//                     placeholder="e.g. Summer Collection"
//                     value={tag}
//                     onChange={(e) => setTag(e.target.value)}
//                   />
//                 </div>
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div>
//                   <Label>1. Main Category *</Label>
//                   <Select
//                     value={mainCategoryId}
//                     onValueChange={(val) => {
//                       setMainCategoryId(val);
//                       setCategoryId("");
//                       setTypeId("");
//                     }}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select Main Category (e.g. Fashion)" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {mainCategories.map((cat: any) => (
//                         <SelectItem key={cat._id} value={cat._id}>
//                           {cat.name}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div>
//                   <Label>2. SubCategory *</Label>
//                   <Select
//                     value={categoryId}
//                     onValueChange={(val) => {
//                       setCategoryId(val);
//                       setTypeId("");
//                     }}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select SubCategory (e.g. Men's Wear)" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {subCategories
//                         .filter((sub: any) => {
//                           if (!mainCategoryId) return true;
//                           const pId = sub.parent_id?._id || sub.parent_id;
//                           return pId === mainCategoryId;
//                         })
//                         .map((sub: any) => (
//                           <SelectItem key={sub._id} value={sub._id}>
//                             {sub.name}
//                           </SelectItem>
//                         ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div>
//                   <Label>3. Product Category (Product Type) *</Label>
//                   <Select
//                     value={typeId}
//                     onValueChange={(val) => setTypeId(val)}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select Product Category (e.g. T-Shirt, Jeans)" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {types
//                         .filter((t: any) => {
//                           if (!categoryId) return true;
//                           const subId = t.subCategoryId?._id || t.subCategoryId;
//                           return subId === categoryId;
//                         })
//                         .map((t: any) => (
//                           <SelectItem key={t._id} value={t._id}>
//                             {t.name}
//                           </SelectItem>
//                         ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <Label>Brand</Label>
//                   <Select value={brandId} onValueChange={(val) => setBrandId(val)}>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select Brand" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {brands.map((b) => (
//                         <SelectItem key={b._id} value={b._id}>
//                           {b.name}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div>
//                   <Label>Fabric / Material</Label>
//                   <Select value={fabricId} onValueChange={(val) => setFabricId(val)}>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select Fabric" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {fabrics.map((f) => (
//                         <SelectItem key={f._id} value={f._id}>
//                           {f.name}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>
//               <div>
//                 <Label>Description</Label>
//                 <TiptapEditor value={description} onChange={(val) => setDescription(val)} />
//               </div>
//               <div>
//                 <Label>Common Product Images</Label>
//                 <ImageUpload
//                   value={images}
//                   onChange={(val) => {
//                     if (Array.isArray(val)) setImages(val);
//                     else if (val) setImages([val]);
//                     else setImages([]);
//                   }}
//                   multiple
//                 />
//               </div>
//             </CardContent>
//           </Card>
//           <Card className="shadow-sm border border-gray-200">
//             <CardHeader className="bg-slate-50/50 border-b border-gray-100 flex flex-row items-center justify-between">
//               <CardTitle className="text-lg font-semibold flex items-center gap-2">
//                 <Layers className="w-5 h-5 text-indigo-600" />
//                 Step 2: Variant Builder (Multi-Select Attributes)
//               </CardTitle>
//               <Button
//                 type="button"
//                 onClick={handleGenerateVariants}
//                 className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
//               >
//                 <Sparkles className="w-4 h-4" />
//                 Generate Variants
//               </Button>
//             </CardHeader>
//             <CardContent className="space-y-6 pt-5">
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div>
//                   <Label className="font-semibold text-gray-700">Colors *</Label>
//                   <div className="relative mt-1">
//                     <Select onValueChange={(val) => toggleSelection(selectedColors, setSelectedColors, val)}>
//                       <SelectTrigger>
//                         <SelectValue
//                           placeholder={
//                             selectedColors.length > 0
//                               ? `${selectedColors.length} Color(s) Selected`
//                               : "Select Colors"
//                           }
//                         />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {colors.map((c) => {
//                           const isSelected = selectedColors.includes(c._id);
//                           return (
//                             <SelectItem key={c._id} value={c._id}>
//                               <div className="flex items-center justify-between w-full gap-2">
//                                 <span>{c.name}</span>
//                                 {isSelected && <span className="text-indigo-600 font-bold">✓</span>}
//                               </div>
//                             </SelectItem>
//                           );
//                         })}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   {selectedColors.length > 0 && (
//                     <div className="flex flex-wrap gap-1 mt-2">
//                       {selectedColors.map((id) => {
//                         const c = colors.find((item) => item._id === id);
//                         return (
//                           <span
//                             key={id}
//                             className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full"
//                           >
//                             {c?.name}
//                             <button
//                               type="button"
//                               onClick={() => toggleSelection(selectedColors, setSelectedColors, id)}
//                               className="hover:text-indigo-900 font-bold ml-1"
//                             >
//                               ×
//                             </button>
//                           </span>
//                         );
//                       })}
//                     </div>
//                   )}
//                 </div>
//                 <div>
//                   <Label className="font-semibold text-gray-700">Sizes *</Label>
//                   <div className="relative mt-1">
//                     <Select onValueChange={(val) => toggleSelection(selectedSizes, setSelectedSizes, val)}>
//                       <SelectTrigger>
//                         <SelectValue
//                           placeholder={
//                             selectedSizes.length > 0
//                               ? `${selectedSizes.length} Size(s) Selected`
//                               : "Select Sizes"
//                           }
//                         />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {sizes.map((s) => {
//                           const isSelected = selectedSizes.includes(s._id);
//                           return (
//                             <SelectItem key={s._id} value={s._id}>
//                               <div className="flex items-center justify-between w-full gap-2">
//                                 <span>{s.name}</span>
//                                 {isSelected && <span className="text-indigo-600 font-bold">✓</span>}
//                               </div>
//                             </SelectItem>
//                           );
//                         })}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   {selectedSizes.length > 0 && (
//                     <div className="flex flex-wrap gap-1 mt-2">
//                       {selectedSizes.map((id) => {
//                         const s = sizes.find((item) => item._id === id);
//                         return (
//                           <span
//                             key={id}
//                             className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full"
//                           >
//                             {s?.name}
//                             <button
//                               type="button"
//                               onClick={() => toggleSelection(selectedSizes, setSelectedSizes, id)}
//                               className="hover:text-indigo-900 font-bold ml-1"
//                             >
//                               ×
//                             </button>
//                           </span>
//                         );
//                       })}
//                     </div>
//                   )}
//                 </div>
//                 {categoryAttributes &&
//                   categoryAttributes.length > 0 &&
//                   categoryAttributes.map((attr: any) => {
//                     const selectedForAttr = selectedDynAttrs[attr._id] || [];
//                     return (
//                       <div key={attr._id}>
//                         <Label className="font-semibold text-gray-700">{attr.name} *</Label>
//                         <div className="relative mt-1">
//                           <Select
//                             onValueChange={(val) => toggleDynAttrSelection(attr._id, val)}
//                           >
//                             <SelectTrigger>
//                               <SelectValue
//                                 placeholder={
//                                   selectedForAttr.length > 0
//                                     ? `${selectedForAttr.length} ${attr.name}(s) Selected`
//                                     : `Select ${attr.name}`
//                                 }
//                               />
//                             </SelectTrigger>
//                             <SelectContent>
//                               {attr.values?.map((valObj: any) => {
//                                 const isSelected = selectedForAttr.includes(valObj._id);
//                                 return (
//                                   <SelectItem key={valObj._id} value={valObj._id}>
//                                     <div className="flex items-center justify-between w-full gap-2">
//                                       <span>{valObj.value}</span>
//                                       {isSelected && <span className="text-indigo-600 font-bold">✓</span>}
//                                     </div>
//                                   </SelectItem>
//                                 );
//                               })}
//                             </SelectContent>
//                           </Select>
//                         </div>
//                         {selectedForAttr.length > 0 && (
//                           <div className="flex flex-wrap gap-1 mt-2">
//                             {selectedForAttr.map((id) => {
//                               const valObj = attr.values?.find((v: any) => v._id === id);
//                               return (
//                                 <span
//                                   key={id}
//                                   className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full"
//                                 >
//                                   {valObj?.value}
//                                   <button
//                                     type="button"
//                                     onClick={() => toggleDynAttrSelection(attr._id, id)}
//                                     className="hover:text-indigo-900 font-bold ml-1"
//                                   >
//                                     ×
//                                   </button>
//                                 </span>
//                               );
//                             })}
//                           </div>
//                         )}
//                       </div>
//                     );
//                   })}
//               </div>
//             </CardContent>
//           </Card>
//           <Card className="shadow-sm border border-gray-200">
//             <CardHeader className="bg-slate-50/50 border-b border-gray-100">
//               <CardTitle className="text-lg font-semibold">Step 3: Variant Pricing & Table</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-6 pt-5">
//               <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
//                 <h4 className="text-sm font-semibold text-gray-800">Bulk Apply Defaults</h4>
//                 <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
//                   <div>
//                     <Label className="text-xs">Default Price (₹)</Label>
//                     <Input
//                       type="number"
//                       placeholder="999"
//                       value={bulkPrice}
//                       onChange={(e) => setBulkPrice(e.target.value)}
//                     />
//                   </div>
//                   <div>
//                     <Label className="text-xs">Default Offer Price (₹)</Label>
//                     <Input
//                       type="number"
//                       placeholder="899"
//                       value={bulkOfferPrice}
//                       onChange={(e) => setBulkOfferPrice(e.target.value)}
//                     />
//                   </div>
//                   <div>
//                     <Label className="text-xs">Default Stock</Label>
//                     <Input
//                       type="number"
//                       placeholder="20"
//                       value={bulkStock}
//                       onChange={(e) => setBulkStock(e.target.value)}
//                     />
//                   </div>
//                   <div className="flex items-end">
//                     <Button
//                       type="button"
//                       onClick={handleApplyBulk}
//                       className="w-full bg-slate-800 hover:bg-slate-900 text-white"
//                     >
//                       Apply To All Variants
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//               {variants.length > 0 ? (
//                 <div className="overflow-x-auto border border-gray-200 rounded-lg">
//                   <table className="w-full text-left text-sm">
//                     <thead className="bg-slate-100 border-b text-gray-700">
//                       <tr>
//                         <th className="p-3">Variant</th>
//                         <th className="p-3">SKU</th>
//                         <th className="p-3">Price (₹)</th>
//                         <th className="p-3">Offer Price (₹)</th>
//                         <th className="p-3">Stock</th>
//                         <th className="p-3">Image</th>
//                         <th className="p-3 text-center">Action</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-200">
//                       {variants.map((v, idx) => {
//                         const variantLabel =
//                           v.variantLabel ||
//                           [v.color_name, v.size_name].filter(Boolean).join(" / ") ||
//                           `Variant #${idx + 1}`;
//                         return (
//                           <tr key={idx} className="hover:bg-slate-50/50">
//                             <td className="p-3 font-medium text-gray-900 whitespace-nowrap">
//                               {variantLabel}
//                             </td>
//                             <td className="p-3">
//                               <Input
//                                 value={v.sku}
//                                 onChange={(e) => handleVariantChange(idx, "sku", e.target.value)}
//                                 className="w-36 h-9"
//                               />
//                             </td>
//                             <td className="p-3">
//                               <Input
//                                 type="number"
//                                 value={v.price}
//                                 onChange={(e) => handleVariantChange(idx, "price", e.target.value)}
//                                 className="w-28 h-9"
//                               />
//                             </td>
//                             <td className="p-3">
//                               <Input
//                                 type="number"
//                                 value={v.offerprice}
//                                 onChange={(e) => handleVariantChange(idx, "offerprice", e.target.value)}
//                                 className="w-28 h-9"
//                               />
//                             </td>
//                             <td className="p-3">
//                               <Input
//                                 type="number"
//                                 value={v.stock_quantity}
//                                 onChange={(e) => handleVariantChange(idx, "stock_quantity", e.target.value)}
//                                 className="w-24 h-9"
//                               />
//                             </td>
//                             <td className="p-3">
//                               <ImageUpload
//                                 value={v.images}
//                                 onChange={(urls) => handleVariantChange(idx, "images", urls)}
//                               />
//                             </td>
//                             <td className="p-3 text-center">
//                               <Button
//                                 type="button"
//                                 variant="ghost"
//                                 size="icon"
//                                 onClick={() => removeVariant(idx)}
//                                 className="text-red-500 hover:text-red-700 hover:bg-red-50"
//                               >
//                                 <Trash2 className="w-4 h-4" />
//                               </Button>
//                             </td>
//                           </tr>
//                         );
//                       })}
//                     </tbody>
//                   </table>
//                 </div>
//               ) : (
//                 <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-lg">
//                   No variants generated yet. Select attribute options above and click <strong>Generate Variants</strong>.
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </div>
//         <div className="w-[25%]">
//           <Card className="sticky top-6 shadow-md border border-gray-200">
//             <CardHeader>
//               <CardTitle className="text-lg font-semibold">Status</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="flex items-center justify-between">
//                 <Label htmlFor="status">Active</Label>
//                 <Switch
//                   id="status"
//                   checked={status}
//                   onCheckedChange={(val) => setStatus(val)}
//                 />
//               </div>
//               <div className="flex gap-4">
//                 <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-lg py-6">
//                   {isEditMode ? "Update Product" : "Save Product"}
//                 </Button>
//                 <Link to={`${basePath}/products`} className="flex-1">
//                   <Button type="button" variant="outline" className="w-full text-lg py-6">
//                     Cancel
//                   </Button>
//                 </Link>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </form>
//     </div>
//   );
// }


import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Sparkles, Trash2, Layers, Tag } from "lucide-react";
import { toast } from "sonner";
import { TiptapEditor } from "@/components/ui/TiptapEditor";
import { ImageUpload } from "@/components/ui/ImageUpload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchsubCategories } from "@/features/subcategories/subcategoriesThunk";
import { fetchTypes } from "@/features/types/typesThunk";
import { useBasePath } from "@/hooks/useBasePath";
import {
  createProduct,
  getProductById,
  updateProduct,
} from "@/features/products/productsThunk";
import { fetchCategories } from "@/features/categories/categoriesThunk";
import { fetchAttributes, fetchAttributeValues, fetchTypeAttributes } from "@/features/attributes/attributesThunk";

const BRAND_NAMES = ["brand"];
const FABRIC_NAMES = ["fabric", "material", "fabric/material", "fabric material"];

const isBrandAttr = (name: string) => BRAND_NAMES.includes((name || "").trim().toLowerCase());
const isFabricAttr = (name: string) => FABRIC_NAMES.includes((name || "").trim().toLowerCase());

export default function ProductFormPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const basePath = useBasePath();

  const { categories: mainCategories } = useSelector((state: RootState) => state.categories);
  const { categories: subCategories } = useSelector((state: RootState) => state.subcategori);
  const { types } = useSelector((state: RootState) => state.types);

  const { attributes, attributeValues, categoryAttributes } = useSelector(
    (state: RootState) => state.attributes
  );
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [description, setDescription] = useState("");
  const [mainCategoryId, setMainCategoryId] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [typeId, setTypeId] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);
  const [status, setStatus] = useState(true);

  const [selectedAttrValues, setSelectedAttrValues] = useState<{ [attrId: string]: string[] }>({});
  const [brandAttrValue, setBrandAttrValue] = useState<{ [attrId: string]: string }>({});
  const [fabricAttrValue, setFabricAttrValue] = useState<{ [attrId: string]: string }>({});
  // const attributeValues: { [attrId: string]: string } = {};
  const [variants, setVariants] = useState<any[]>([]);
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkOfferPrice, setBulkOfferPrice] = useState("");
  const [bulkStock, setBulkStock] = useState("");


  useEffect(() => {
    dispatch(fetchCategories({ page: 1, limit: 100, status: "active" }));
    dispatch(fetchsubCategories({ page: 1, limit: 1000, status: "active", role: "admin" }));
    dispatch(fetchTypes({ page: 1, limit: 1000, status: "active" }));
    dispatch(fetchAttributes({}));
    dispatch(fetchAttributeValues({}));

  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchAttributeValues({})).then((res) => console.log("all values:", res.payload));
  }, [dispatch]);

  useEffect(() => {
    if (typeId) {
      dispatch(fetchTypeAttributes(typeId)).then((res) => console.log("type attrs:", res.payload));
    }
  }, [dispatch, typeId]);

  // useEffect(() => {
  //   setSelectedAttrValues({});
  //   setBrandAttrValue({});
  //   setFabricAttrValue({});
  //   setVariants([]);
  //   if (typeId) {
  //     dispatch(fetchTypeAttributes(typeId));
  //   }
  // }, [dispatch, typeId]);

  useEffect(() => {
    setSelectedAttrValues({});
    setBrandAttrValue({});
    setFabricAttrValue({});
    setVariants([]);
    if (typeId) {
      dispatch(fetchTypeAttributes(typeId));
    }
  }, [dispatch, typeId]);
  useEffect(() => {
    if (isEditMode && id) {
      dispatch(getProductById(id)).then((res: any) => {
        if (res.payload) {
          const p = res.payload.data || res.payload;
          setName(p.name || "");
          setTag(p.tag || "");
          setDescription(p.description || "");
          const catId = p.category_id?._id || p.category_id || "";
          setCategoryId(String(catId));
          const tId = p.type_id?._id || p.type_id || "";
          setTypeId(String(tId));
          setImages(p.images || []);
          setStatus(p.status === "active");
          if (Array.isArray(p.variants) && p.variants.length > 0) {
            setVariants(
              p.variants.map((v: any, idx: number) => ({
                _id: v._id,
                attributeValues: v.attributeValues || v.attributes || {},
                variantLabel: v.variantLabel || "",
                price: v.price || "",
                offerprice: v.offerprice || "",
                stock_quantity: v.stock_quantity ?? "0",
                sku: v.sku || `SKU-${Date.now()}-${idx + 1}`,
                status: v.status || "active",
                images: v.images || [],
                labels: Array.isArray(v.labels) ? v.labels : [],
                is_featured: !!v.is_featured,
                is_best_seller: !!v.is_best_seller,
                is_trending: !!v.is_trending,
                description: v.description || "",
              }))
            );
          }
        }
      });
    }
  }, [dispatch, id, isEditMode]);

  const typeAttributesWithValues = useMemo(() => {
    const source = categoryAttributes && categoryAttributes.length > 0 ? categoryAttributes : [];
    return source.map((attr: any) => ({
      ...attr,
      values: (attributeValues || []).filter((v: any) => {
        const attrIdOfValue = typeof v.attributeId === "object" ? v.attributeId._id : v.attributeId;
        return attrIdOfValue === attr._id;
      }),
    }));
  }, [categoryAttributes, attributeValues]);

  const { combiningAttrs, brandAttr, fabricAttr } = useMemo(() => {
    const combining: any[] = [];
    let brand: any = null;
    let fabric: any = null;
    typeAttributesWithValues.forEach((attr: any) => {
      if (isBrandAttr(attr.name)) brand = attr;
      else if (isFabricAttr(attr.name)) fabric = attr;
      else combining.push(attr);
    });
    return { combiningAttrs: combining, brandAttr: brand, fabricAttr: fabric };
  }, [typeAttributesWithValues]);

  const toggleAttrValue = (attrId: string, valId: string) => {
    setSelectedAttrValues((prev) => {
      const current = prev[attrId] || [];
      return current.includes(valId)
        ? { ...prev, [attrId]: current.filter((v) => v !== valId) }
        : { ...prev, [attrId]: [...current, valId] };
    });
  };

  const cartesianProduct = (arrays: any[][]): any[][] =>
    arrays.reduce<any[][]>((acc, curr) => acc.flatMap((d) => curr.map((e) => [...d, e])), [[]]);
  const handleGenerateVariants = () => {
    if (!typeId) return toast.error("Please select a Product Category (Type) first");
    const attributeSets: { attrId: string; attrName: string; items: { id: string; name: string }[] }[] = [];
    combiningAttrs.forEach((attr: any) => {
      const selected = selectedAttrValues[attr._id] || [];
      if (selected.length > 0) {
        attributeSets.push({
          attrId: attr._id,
          attrName: attr.name,
          items: selected.map((valId) => {
            const valObj = attr.values?.find((v: any) => v._id === valId);
            return { id: valId, name: valObj ? valObj.value : "Val" };
          }),
        });
      }
    });

    if (attributeSets.length === 0) {
      return toast.error("Please select at least one attribute value (e.g. Color, Size)!");
    }

    const arraysToCombine = attributeSets.map((s) => s.items);
    const combinations = cartesianProduct(arraysToCombine);
    const generated = combinations.map((combo, idx) => {
      const attributeValues: { [attrId: string]: string } = {};
      const variantNameParts: string[] = [];
      combo.forEach((item, index) => {
        const attrId = attributeSets[index].attrId;
        attributeValues[attrId] = item.id;
        variantNameParts.push(item.name);
      });
      Object.entries(brandAttrValue).forEach(([attrId, valId]) => {
        if (valId) attributeValues[attrId] = valId;
      });
      Object.entries(fabricAttrValue).forEach(([attrId, valId]) => {
        if (valId) attributeValues[attrId] = valId;
      });
      const cleanProdName = name.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5) || "PROD";
      const cleanVariantTag = variantNameParts.join("-").toUpperCase().replace(/[^A-Z0-9-]/g, "");
      const generatedSku = `${cleanProdName}-${cleanVariantTag}-${idx + 1}`;
      return {
        attributeValues,
        variantLabel: variantNameParts.join(" / "),
        price: bulkPrice || "",
        offerprice: bulkOfferPrice || "",
        stock_quantity: bulkStock || "10",
        sku: generatedSku,
        images: [...images],
        labels: [],
        status: "active",
        is_featured: false,
        is_best_seller: false,
        is_trending: false,
        description: "",
      };
    });
    setVariants(generated);
    toast.success(`Successfully generated ${generated.length} variant(s)!`);
  };

  const handleApplyBulk = () => {
    if (variants.length === 0) return toast.error("No variants generated yet!");
    const updated = variants.map((v) => ({
      ...v,
      price: bulkPrice !== "" ? bulkPrice : v.price,
      offerprice: bulkOfferPrice !== "" ? bulkOfferPrice : v.offerprice,
      stock_quantity: bulkStock !== "" ? bulkStock : v.stock_quantity,
    }));
    setVariants(updated);
    toast.success("Bulk settings applied to all variants!");
  };

  const handleVariantChange = (index: number, field: string, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };
  const removeVariant = (index: number) => {
    const updated = [...variants];
    updated.splice(index, 1);
    setVariants(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Product Name is required");
    if (!categoryId) return toast.error("SubCategory is required");
    if (!typeId) return toast.error("Product Category (Type) is required");
    if (variants.length === 0) return toast.error("Generate or add at least one variant");

    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      if (!v.price || v.offerprice === "" || v.stock_quantity === "" || !v.sku) {
        return toast.error(`Price, Offer Price, Stock, and SKU are required for variant ${i + 1}`);
      }
    }

    const payload = {
      name,
      tag, // optional
      description,
      mainCategory_id: mainCategoryId || undefined,
      category_id: categoryId,
      type_id: typeId,
      images,
      status: status ? "active" : "inactive",
      variants,
    };

    try {
      let result;
      if (isEditMode && id) {
        result = await dispatch(updateProduct({ id, data: payload }));
      } else {
        result = await dispatch(createProduct(payload));
      }

      if (createProduct.fulfilled.match(result) || updateProduct.fulfilled.match(result)) {
        toast.success(isEditMode ? "Product updated successfully!" : "Product created successfully!");
        navigate(`${basePath}/products`);
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
        <Link to={`${basePath}/products`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? "Edit Product" : "Add New Product"}
          </h1>
          <p className="text-gray-500 mt-1">
            Select SubCategory → Type, and only that Type's linked attributes will appear.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-4">
        <div className="w-[75%] space-y-6">
          <Card className="shadow-sm border border-gray-200">
            <CardHeader className="bg-slate-50/50 border-b border-gray-100">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Tag className="w-5 h-5 text-blue-600" />
                Step 1: Common Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>
                    Product Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="e.g. Men Casual Cotton T-Shirt"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>Tag</Label>
                  <Input
                    placeholder="e.g. Summer Collection"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>
                    2. SubCategory <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={categoryId}
                    onValueChange={(val) => {
                      setCategoryId(val);
                      setTypeId("");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select SubCategory (e.g. Men's Wear)" />
                    </SelectTrigger>
                    <SelectContent>
                      {subCategories
                        .filter((sub: any) => {
                          if (!mainCategoryId) return true;
                          const pId = sub.parent_id?._id || sub.parent_id;
                          return pId === mainCategoryId;
                        })
                        .map((sub: any) => (
                          <SelectItem key={sub._id} value={sub._id}>
                            {sub.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>
                    3. Product Category (Type) <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={typeId}
                    onValueChange={(val) => setTypeId(val)}
                    disabled={!categoryId}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          categoryId
                            ? "Select Type (e.g. T-Shirt, Jeans)"
                            : "Select SubCategory first"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {types
                        .filter((t: any) => {
                          const subId = t.subCategoryId?._id || t.subCategoryId;
                          // subCategoryId on Type can be single id or array (back-compat)
                          if (Array.isArray(subId)) return subId.includes(categoryId);
                          return subId === categoryId;
                        })
                        .map((t: any) => (
                          <SelectItem key={t._id} value={t._id}>
                            {t.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <TiptapEditor value={description} onChange={(val) => setDescription(val)} />
              </div>
              <div>
                <Label>Common Product Images</Label>
                <ImageUpload
                  value={images}
                  onChange={(val) => {
                    if (Array.isArray(val)) setImages(val);
                    else if (val) setImages([val]);
                    else setImages([]);
                  }}
                  multiple
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-gray-200">
            <CardHeader className="bg-slate-50/50 border-b border-gray-100 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                Step 2: Variant Builder ({typeId ? "Type's Attributes" : "Select a Type first"})
              </CardTitle>
              <Button
                type="button"
                onClick={handleGenerateVariants}
                disabled={!typeId}
                className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Generate Variants
              </Button>
            </CardHeader>
            <CardContent className="space-y-6 pt-5">
              {!typeId ? (
                <p className="text-sm text-gray-500">
                  Select SubCategory → Type above. Only attributes linked to that Type
                  (e.g. Color + Numeric Size for Jeans, Color + Alpha Size for T-Shirt) will
                  show here.
                </p>
              ) : (
                <>
                  {(brandAttr || fabricAttr) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {brandAttr && (
                        <div>
                          <Label className="font-semibold text-gray-700">{brandAttr.name}</Label>
                          <Select
                            value={brandAttrValue[brandAttr._id] || ""}
                            onValueChange={(val) =>
                              setBrandAttrValue((prev) => ({ ...prev, [brandAttr._id]: val }))
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder={`Select ${brandAttr.name}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {brandAttr.values?.map((v: any) => (
                                <SelectItem key={v._id} value={v._id}>
                                  {v.value}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      {fabricAttr && (
                        <div>
                          <Label className="font-semibold text-gray-700">{fabricAttr.name}</Label>
                          <Select
                            value={fabricAttrValue[fabricAttr._id] || ""}
                            onValueChange={(val) =>
                              setFabricAttrValue((prev) => ({ ...prev, [fabricAttr._id]: val }))
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder={`Select ${fabricAttr.name}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {fabricAttr.values?.map((v: any) => (
                                <SelectItem key={v._id} value={v._id}>
                                  {v.value}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  )}

                  {combiningAttrs.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No variant-generating attributes (Color/Size) are linked to this Type yet.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {combiningAttrs.map((attr: any) => {
                        const selectedForAttr = selectedAttrValues[attr._id] || [];
                        return (
                          <div key={attr._id}>
                            <Label className="font-semibold text-gray-700">
                              {attr.name} <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative mt-1">
                              <Select onValueChange={(val) => toggleAttrValue(attr._id, val)}>
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={
                                      selectedForAttr.length > 0
                                        ? `${selectedForAttr.length} ${attr.name}(s) Selected`
                                        : `Select ${attr.name}`
                                    }
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  {attr.values?.map((valObj: any) => {
                                    const isSelected = selectedForAttr.includes(valObj._id);
                                    return (
                                      <SelectItem key={valObj._id} value={valObj._id}>
                                        <div className="flex items-center justify-between w-full gap-2">
                                          <span>{valObj.value}</span>
                                          {isSelected && (
                                            <span className="text-indigo-600 font-bold">✓</span>
                                          )}
                                        </div>
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            </div>
                            {selectedForAttr.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {selectedForAttr.map((valId) => {
                                  const valObj = attr.values?.find((v: any) => v._id === valId);
                                  return (
                                    <span
                                      key={valId}
                                      className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full"
                                    >
                                      {valObj?.value}
                                      <button
                                        type="button"
                                        onClick={() => toggleAttrValue(attr._id, valId)}
                                        className="hover:text-indigo-900 font-bold ml-1"
                                      >
                                        ×
                                      </button>
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
          <Card className="shadow-sm border border-gray-200">
            <CardHeader className="bg-slate-50/50 border-b border-gray-100">
              <CardTitle className="text-lg font-semibold">Step 3: Variant Pricing & Table</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-5">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                <h4 className="text-sm font-semibold text-gray-800">Bulk Apply Defaults</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <Label className="text-xs">Default Price (₹)</Label>
                    <Input
                      type="number"
                      placeholder="999"
                      value={bulkPrice}
                      onChange={(e) => setBulkPrice(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Default Offer Price (₹)</Label>
                    <Input
                      type="number"
                      placeholder="899"
                      value={bulkOfferPrice}
                      onChange={(e) => setBulkOfferPrice(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Default Stock</Label>
                    <Input
                      type="number"
                      placeholder="20"
                      value={bulkStock}
                      onChange={(e) => setBulkStock(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      onClick={handleApplyBulk}
                      className="w-full bg-slate-800 hover:bg-slate-900 text-white"
                    >
                      Apply To All Variants
                    </Button>
                  </div>
                </div>
              </div>
              {variants.length > 0 ? (
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100 border-b text-gray-700">
                      <tr>
                        <th className="p-3">Variant</th>
                        <th className="p-3">SKU</th>
                        <th className="p-3">Price (₹)</th>
                        <th className="p-3">Offer Price (₹)</th>
                        <th className="p-3">Stock</th>
                        <th className="p-3">Image</th>
                        <th className="p-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {variants.map((v, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-3 font-medium text-gray-900 whitespace-nowrap">
                            {v.variantLabel || `Variant #${idx + 1}`}
                          </td>
                          <td className="p-3">
                            <Input
                              value={v.sku}
                              onChange={(e) => handleVariantChange(idx, "sku", e.target.value)}
                              className="w-36 h-9"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              value={v.price}
                              onChange={(e) => handleVariantChange(idx, "price", e.target.value)}
                              className="w-28 h-9"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              value={v.offerprice}
                              onChange={(e) =>
                                handleVariantChange(idx, "offerprice", e.target.value)
                              }
                              className="w-28 h-9"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              value={v.stock_quantity}
                              onChange={(e) =>
                                handleVariantChange(idx, "stock_quantity", e.target.value)
                              }
                              className="w-24 h-9"
                            />
                          </td>
                          <td className="p-3">
                            <ImageUpload
                              value={v.images}
                              onChange={(urls) => handleVariantChange(idx, "images", urls)}
                            />
                          </td>
                          <td className="p-3 text-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeVariant(idx)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-lg">
                  No variants generated yet. Select attribute values above and click{" "}
                  <strong>Generate Variants</strong>.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="w-[25%]">
          <Card className="sticky top-6 shadow-md border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="status">Active</Label>
                <Switch id="status" checked={status} onCheckedChange={(val) => setStatus(val)} />
              </div>
              <div className="flex gap-4">
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-lg py-6">
                  {isEditMode ? "Update Product" : "Save Product"}
                </Button>
                <Link to={`${basePath}/products`} className="flex-1">
                  <Button type="button" variant="outline" className="w-full text-lg py-6">
                    Cancel
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}