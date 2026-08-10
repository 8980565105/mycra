import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Sparkles, Trash2, Layers, Tag, Info } from "lucide-react";
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
import { fetchProductLabels } from "@/features/productLabels/productLabelsThunk";
import {
  createProduct,
  getProductById,
  updateProduct,
} from "@/features/products/productsThunk";
import { fetchCategories } from "@/features/categories/categoriesThunk";
import {
  fetchAttributes,
  fetchCategoryAttributes,
  fetchTypeAttributes,
} from "@/features/attributes/attributesThunk";
import { getTypeById } from "@/features/types/typesThunk";
import { fetchBrands } from "@/features/brands/brandsThunk";

export default function ProductFormPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const basePath = useBasePath();
  const { categories: mainCategories } = useSelector((state: RootState) => state.categories);
  const { categories: subCategories } = useSelector((state: RootState) => state.subcategori);
  const { types } = useSelector((state: RootState) => state.types);
  const { brands } = useSelector((state: RootState) => state.brands);
  const { attributes, categoryAttributes } = useSelector((state: RootState) => state.attributes);
  const { labels: productLabels } = useSelector((state: RootState) => state.productLabels);

  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [description, setDescription] = useState("");
  const [mainCategoryId, setMainCategoryId] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [brandId, setBrandId] = useState<string>("");
  const [typeId, setTypeId] = useState<string>("");
  const [fabricId, setFabricId] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);

  const [status, setStatus] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isTrending, setIsTrending] = useState(false);

  const [selectedTypeDetails, setSelectedTypeDetails] = useState<any>(null);
  const [selectedSpecAttrs, setSelectedSpecAttrs] = useState<{ [attrId: string]: string }>({});
  const [selectedDynAttrs, setSelectedDynAttrs] = useState<{ [attrId: string]: string[] }>({});
  const [variants, setVariants] = useState<any[]>([]);
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkOfferPrice, setBulkOfferPrice] = useState("");
  const [bulkStock, setBulkStock] = useState("");

  useEffect(() => {
    dispatch(fetchCategories({ page: 1, limit: 100, status: "active" }));
    dispatch(fetchsubCategories({ page: 1, limit: 1000, status: "active", role: "admin" }));
    dispatch(fetchTypes({ page: 1, limit: 1000, status: "active" }));
    dispatch(fetchBrands({ page: 1, limit: 1000, status: "active" }));
    dispatch(fetchAttributes({ page: 1, limit: 1000, status: "active" }));
    dispatch(fetchProductLabels({ page: 1, limit: 100, status: "active" }));
  }, [dispatch]);

  useEffect(() => {
    if (typeId) {
      dispatch(getTypeById(typeId)).then((res: any) => {
        if (res.payload) {
          setSelectedTypeDetails(res.payload.data || res.payload);
        }
      });
      dispatch(fetchTypeAttributes(typeId));
    } else if (categoryId) {
      dispatch(fetchCategoryAttributes(categoryId));
      setSelectedTypeDetails(null);
    } else {
      setSelectedTypeDetails(null);
    }
  }, [dispatch, typeId, categoryId]);

  // Selected Product Category / Type object details
  const activeTypeObject = useMemo(() => {
    if (selectedTypeDetails) return selectedTypeDetails;
    if (!typeId) return null;
    return types.find((t: any) => (t._id || t) === typeId) || null;
  }, [selectedTypeDetails, types, typeId]);

  // Brands filtered strictly by selected Type (only linked brands appear)
  const availableBrands = useMemo(() => {
    if (!activeTypeObject) return [];
    const rawTypeBrands = Array.isArray(activeTypeObject.brandIds)
      ? activeTypeObject.brandIds
      : Array.isArray(activeTypeObject.brands)
        ? activeTypeObject.brands
        : Array.isArray(activeTypeObject.brandId)
          ? activeTypeObject.brandId
          : activeTypeObject.brandId
            ? [activeTypeObject.brandId]
            : [];
    if (rawTypeBrands.length === 0) return [];
    const typeBrandIds = rawTypeBrands.map((b: any) => (typeof b === "object" ? b._id : b));
    return brands.filter((brand: any) => typeBrandIds.includes(brand._id));
  }, [activeTypeObject, brands]);

  const allAttributePool = useMemo(() => {
    const map = new Map<string, any>();
    (attributes || []).forEach((a: any) => map.set(a._id, a));
    (categoryAttributes || []).forEach((a: any) => map.set(a._id, a));
    return Array.from(map.values());
  }, [attributes, categoryAttributes]);

  const typeVariantAttrIds = useMemo(() => {
    if (!activeTypeObject || !Array.isArray(activeTypeObject.variantAttributes)) return [];
    return activeTypeObject.variantAttributes.map((a: any) => (typeof a === "object" ? a._id : a));
  }, [activeTypeObject]);

  const typeSpecAttrIds = useMemo(() => {
    if (!activeTypeObject) return [];
    const allowed = Array.isArray(activeTypeObject.allowedAttributes)
      ? activeTypeObject.allowedAttributes
      : Array.isArray(activeTypeObject.specificAttributes)
        ? activeTypeObject.specificAttributes
        : [];
    return allowed.map((a: any) => (typeof a === "object" ? a._id : a));
  }, [activeTypeObject]);

  const variantAttributesList = useMemo(() => {
    if (!typeId) return [];
    if (typeVariantAttrIds.length > 0) {
      return allAttributePool.filter((attr: any) => typeVariantAttrIds.includes(attr._id));
    }
    if (activeTypeObject && Array.isArray(activeTypeObject.variantAttributes)) {
      const popObjs = activeTypeObject.variantAttributes.filter((a: any) => typeof a === "object" && a._id);
      if (popObjs.length > 0) return popObjs;
    }
    return [];
  }, [typeId, typeVariantAttrIds, allAttributePool, activeTypeObject]);

  const specAttributesList = useMemo(() => {
    if (!typeId) return [];
    if (typeSpecAttrIds.length > 0) {
      return allAttributePool.filter((attr: any) => typeSpecAttrIds.includes(attr._id));
    }
    if (activeTypeObject) {
      const allowed = Array.isArray(activeTypeObject.allowedAttributes)
        ? activeTypeObject.allowedAttributes
        : Array.isArray(activeTypeObject.specificAttributes)
          ? activeTypeObject.specificAttributes
          : [];
      const popObjs = allowed.filter((a: any) => typeof a === "object" && a._id);
      if (popObjs.length > 0) return popObjs;
    }
    return [];
  }, [typeId, typeSpecAttrIds, allAttributePool, activeTypeObject]);

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
          setImages(p.images || []);
          setStatus(p.status === "active");
          setIsFeatured(!!p.is_featured);
          setIsBestSeller(!!p.is_best_seller);
          setIsTrending(!!p.is_trending);

          if (Array.isArray(p.variants) && p.variants.length > 0) {
            const firstV = p.variants[0];
            if (firstV.brand_id) setBrandId(firstV.brand_id._id || firstV.brand_id);
            if (firstV.type_id) setTypeId(firstV.type_id._id || firstV.type_id);
            if (firstV.fabric_id) setFabricId(firstV.fabric_id._id || firstV.fabric_id);

            const dynAttrsUnion: { [attrId: string]: Set<string> } = {};
            const loadedSpecAttrs: { [attrId: string]: string } = {};

            const mappedVariants = p.variants.map((v: any, idx: number) => {
              let dynAttrsObj: { [attrId: string]: string } = {};
              if (Array.isArray(v.attributes)) {
                v.attributes.forEach((a: any) => {
                  const attrId = typeof a.attributeId === "object" ? a.attributeId?._id : a.attributeId;
                  const valId = typeof a.valueId === "object" ? a.valueId?._id : a.valueId;
                  if (attrId && valId) {
                    dynAttrsObj[attrId] = valId;
                    if (!dynAttrsUnion[attrId]) dynAttrsUnion[attrId] = new Set();
                    dynAttrsUnion[attrId].add(valId);
                    loadedSpecAttrs[attrId] = valId;
                  }
                });
              }

              return {
                _id: v._id,
                brand_id: v.brand_id?._id || v.brand_id || "",
                fabric_id: v.fabric_id?._id || v.fabric_id || "",
                type_id: v.type_id?._id || v.type_id || "",
                color_id: v.color_id?._id || v.color_id || "",
                size_id: v.size_id?._id || v.size_id || "",
                dynamicAttributes: dynAttrsObj,
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
                variantLabel: v.variantLabel || "",
              };
            });

            setVariants(mappedVariants);
            setSelectedSpecAttrs(loadedSpecAttrs);

            const dynAttrsForState: { [attrId: string]: string[] } = {};
            Object.entries(dynAttrsUnion).forEach(([attrId, valSet]) => {
              dynAttrsForState[attrId] = Array.from(valSet);
            });
            setSelectedDynAttrs(dynAttrsForState);
          }
        }
      });
    }
  }, [dispatch, id, isEditMode]);

  const handleSingleSpecAttrChange = (attrId: string, valId: string) => {
    setSelectedSpecAttrs((prev) => ({
      ...prev,
      [attrId]: valId,
    }));
  };

  const toggleDynAttrSelection = (attrId: string, valId: string) => {
    setSelectedDynAttrs((prev) => {
      const current = prev[attrId] || [];
      if (current.includes(valId)) {
        return { ...prev, [attrId]: current.filter((v) => v !== valId) };
      } else {
        return { ...prev, [attrId]: [...current, valId] };
      }
    });
  };

  const cartesianProduct = (arrays: any[][]): any[][] => {
    return arrays.reduce<any[][]>(
      (acc, curr) => acc.flatMap((d) => curr.map((e) => [...d, e])),
      [[]]
    );
  };

  const handleGenerateVariants = () => {
    const attributeSets: { key: string; items: { id: string; name: string; attrId?: string }[] }[] = [];
    if (variantAttributesList && variantAttributesList.length > 0) {
      variantAttributesList.forEach((attr: any) => {
        const selectedForAttr = selectedDynAttrs[attr._id] || [];
        if (selectedForAttr.length > 0) {
          attributeSets.push({
            key: `dyn_${attr._id}`,
            items: selectedForAttr.map((valId) => {
              const valObj = attr.values?.find((v: any) => v._id === valId);
              return {
                id: valId,
                name: valObj ? valObj.value : "Val",
                attrId: attr._id,
              };
            }),
          });
        }
      });
    }

    if (attributeSets.length === 0) {
      return toast.error("Please select at least one Variant Attribute option to generate variants!");
    }

    const arraysToCombine = attributeSets.map((s) => s.items);
    const combinations = cartesianProduct(arraysToCombine);

    const buildSignature = (colorId: string, sizeId: string, dynAttrs: { [k: string]: string }) => {
      const dynKeys = Object.keys(dynAttrs).sort();
      const dynPart = dynKeys.map((k) => `${k}:${dynAttrs[k]}`).join("|");
      return `${colorId}__${sizeId}__${dynPart}`;
    };

    const existingBySignature = new Map<string, any>();
    variants.forEach((v) => {
      const sig = buildSignature(v.color_id || "", v.size_id || "", v.dynamicAttributes || {});
      existingBySignature.set(sig, v);
    });

    const generated = combinations.map((combo, idx) => {
      let colorItem: any = null;
      let sizeItem: any = null;
      const dynAttrs: { [attrId: string]: string } = { ...selectedSpecAttrs };
      const variantNameParts: string[] = [];

      combo.forEach((item, index) => {
        const setKey = attributeSets[index].key;
        if (setKey === "color") {
          colorItem = item;
        } else if (setKey === "size") {
          sizeItem = item;
        } else if (setKey.startsWith("dyn_")) {
          if (item.attrId) dynAttrs[item.attrId] = item.id;
        }
        variantNameParts.push(item.name);
      });

      const colorId = colorItem ? colorItem.id : "";
      const sizeId = sizeItem ? sizeItem.id : "";
      const sig = buildSignature(colorId, sizeId, dynAttrs);
      const existing = existingBySignature.get(sig);

      if (existing) {
        return {
          ...existing,
          color_name: colorItem ? colorItem.name : existing.color_name,
          size_name: sizeItem ? sizeItem.name : existing.size_name,
          dynamicAttributes: dynAttrs,
          variantLabel: variantNameParts.join(" / "),
        };
      }

      const cleanProdName = name.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5) || "PROD";
      const cleanVariantTag = variantNameParts.join("-").toUpperCase().replace(/[^A-Z0-9-]/g, "");
      const uniqueSuffix = Date.now().toString(36).slice(-5).toUpperCase();
      const generatedSku = `${cleanProdName}-${cleanVariantTag}-${uniqueSuffix}`;

      return {
        brand_id: brandId,
        fabric_id: fabricId,
        type_id: typeId,
        color_id: colorId,
        color_name: colorItem ? colorItem.name : "",
        size_id: sizeId,
        size_name: sizeItem ? sizeItem.name : "",
        dynamicAttributes: dynAttrs,
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
    updated[index][field] = value;
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
    if (variants.length === 0) return toast.error("Generate or add at least one variant");

    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      if (!v.price || v.offerprice === "" || v.stock_quantity === "" || !v.sku) {
        return toast.error(`Price, Offer Price, Stock, and SKU are required for variant ${i + 1}`);
      }
    }

    const processedVariants = variants.map((v) => {
      const dynAttrsObj = { ...selectedSpecAttrs, ...(v.dynamicAttributes || {}) };
      const formattedAttributes = Object.entries(dynAttrsObj).map(([attributeId, valueId]) => ({
        attributeId,
        valueId,
      }));

      return {
        ...v,
        brand_id: v.brand_id || brandId || undefined,
        fabric_id: v.fabric_id || fabricId || undefined,
        type_id: v.type_id || typeId || undefined,
        attributes: formattedAttributes,
      };
    });

    const payload = {
      name,
      tag,
      description,
      mainCategory_id: mainCategoryId || undefined,
      category_id: categoryId,
      type_id: typeId || undefined,
      images,
      status: status ? "active" : "inactive",
      is_featured: isFeatured,
      is_best_seller: isBestSeller,
      is_trending: isTrending,
      variants: processedVariants,
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
            Configure common details, dynamic variant attributes, and bulk pricing.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-4">
        <div className="w-[75%] space-y-6">
          {/* Step 1: Common Details */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader className="bg-slate-50/50 border-b border-gray-100">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Tag className="w-5 h-5 text-blue-600" />
                Step 1: Common Details (One Time)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Product Name *</Label>
                  <Input
                    placeholder="e.g. Men Casual Cotton T-Shirt"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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
                  <Label>2. SubCategory *</Label>
                  <Select
                    value={categoryId}
                    onValueChange={(val) => {
                      setCategoryId(val);
                      setTypeId("");
                      setSelectedSpecAttrs({});
                      setSelectedDynAttrs({});
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select SubCategory" />
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
                  <Label>3. Product Category (Product Type) *</Label>
                  <Select
                    value={typeId}
                    onValueChange={(val) => {
                      setTypeId(val);
                      setBrandId("");
                      setSelectedSpecAttrs({});
                      setSelectedDynAttrs({});
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Product Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {types
                        .filter((t: any) => {
                          if (!categoryId) return true;
                          const subId = t.subCategoryId?._id || t.subCategoryId;
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

                <div>
                  <Label>Brand *</Label>
                  <Select
                    value={brandId}
                    onValueChange={(val) => setBrandId(val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={typeId ? "Select Brand" : "Please select Product Category first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBrands.length === 0 ? (
                        <SelectItem value="__none" disabled>
                          {typeId
                            ? "No brands linked to this Product Category"
                            : "Please select Product Category first"}
                        </SelectItem>
                      ) : (
                        availableBrands.map((brand: any) => (
                          <SelectItem key={brand._id} value={brand._id}>
                            {brand.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>








              </div>

              <div>
                <Label>Description</Label>
                <TiptapEditor value={description} onChange={(val) => setDescription(val)} />
              </div>
              <div className="space-y-4">
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

              <div className="flex gap-4 text-xs">
                <label className="flex items-center gap-2">
                  <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
                  Featured
                </label>
                <label className="flex items-center gap-2">
                  <Switch checked={isBestSeller} onCheckedChange={setIsBestSeller} />
                  Best Seller
                </label>
                <label className="flex items-center gap-2">
                  <Switch checked={isTrending} onCheckedChange={setIsTrending} />
                  Trending
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Specification Attributes (Single Select) */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader className="bg-slate-50/50 border-b border-gray-100">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                Step 2: Specification Attributes (Single-Select)
              </CardTitle>
              <p className="text-xs text-gray-500 mt-1">
                Specific attributes defined in Product Category (e.g. Gender, Fabric, Warranty). Pick one option per attribute.
              </p>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              {!typeId ? (
                <div className="p-4 bg-slate-50 text-slate-600 rounded-md border border-slate-200 flex items-center gap-2 text-sm">
                  <Info className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>Please select a SubCategory & Product Category in Step 1 to view specification attributes.</span>
                </div>
              ) : specAttributesList.length === 0 ? (
                <div className="p-4 bg-slate-50 text-slate-600 rounded-md border border-slate-200 flex items-center gap-2 text-sm">
                  <Info className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>No specification attributes mapped for this Product Category.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {specAttributesList.map((attr: any) => (
                    <div key={attr._id}>
                      <Label className="text-xs font-semibold text-gray-700">{attr.name}</Label>
                      <Select
                        value={selectedSpecAttrs[attr._id] || ""}
                        onValueChange={(val) => handleSingleSpecAttrChange(attr._id, val)}
                      >
                        <SelectTrigger className="mt-1 h-9">
                          <SelectValue placeholder={`Select ${attr.name}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {attr.values?.map((valObj: any) => (
                            <SelectItem key={valObj._id} value={valObj._id}>
                              {valObj.value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 3: Variant Builder (Multi-Select Attributes) */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader className="bg-slate-50/50 border-b border-gray-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  Step 3: Variant Builder (Multi-Select Attributes)
                </CardTitle>
                <p className="text-xs text-gray-500 mt-1">
                  Select multi-options for variant attributes (e.g. Color, Size) mapped in Product Category to generate product variants.
                </p>
              </div>
              <Button
                type="button"
                onClick={handleGenerateVariants}
                className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Generate Variants
              </Button>
            </CardHeader>
            <CardContent className="space-y-6 pt-5">
              {!typeId ? (
                <div className="p-4 bg-slate-50 text-slate-600 rounded-md border border-slate-200 flex items-center gap-2 text-sm">
                  <Info className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>Please select a SubCategory & Product Category in Step 1 to view variant attributes.</span>
                </div>
              ) : variantAttributesList.length === 0 ? (
                <div className="p-4 bg-amber-50 text-amber-800 rounded-md border border-amber-200 flex items-center gap-2 text-sm">
                  <Info className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    No variant attributes found for the selected Product Category. Please assign Variant Attributes in the Product Category form.
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {variantAttributesList.map((attr: any) => {
                    const selectedForAttr = selectedDynAttrs[attr._id] || [];
                    return (
                      <div key={attr._id}>
                        <Label className="font-semibold text-gray-700">{attr.name} *</Label>
                        <div className="relative mt-1">
                          <Select
                            onValueChange={(val) => toggleDynAttrSelection(attr._id, val)}
                          >
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
                                      {isSelected && <span className="text-indigo-600 font-bold">✓</span>}
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                        {selectedForAttr.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {selectedForAttr.map((id) => {
                              const valObj = attr.values?.find((v: any) => v._id === id);
                              return (
                                <span
                                  key={id}
                                  className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full"
                                >
                                  {valObj?.value}
                                  <button
                                    type="button"
                                    onClick={() => toggleDynAttrSelection(attr._id, id)}
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
            </CardContent>
          </Card>

          {/* Step 4: Variant Pricing & Table */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader className="bg-slate-50/50 border-b border-gray-100">
              <CardTitle className="text-lg font-semibold">Step 4: Variant Pricing & Table</CardTitle>
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
                      {variants.map((v, idx) => {
                        const variantLabel =
                          v.variantLabel ||
                          [v.color_name, v.size_name].filter(Boolean).join(" / ") ||
                          `Variant #${idx + 1}`;
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-3 font-medium text-gray-900 whitespace-nowrap">
                              {variantLabel}
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
                                onChange={(e) => handleVariantChange(idx, "offerprice", e.target.value)}
                                className="w-28 h-9"
                              />
                            </td>
                            <td className="p-3">
                              <Input
                                type="number"
                                value={v.stock_quantity}
                                onChange={(e) => handleVariantChange(idx, "stock_quantity", e.target.value)}
                                className="w-24 h-9"
                              />
                            </td>
                            <td className="p-3">
                              <ImageUpload
                                value={v.images}
                                multiple
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
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-lg">
                  No variants generated yet. Select attribute options above and click <strong>Generate Variants</strong>.
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
                <Switch
                  id="status"
                  checked={status}
                  onCheckedChange={(val) => setStatus(val)}
                />
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

