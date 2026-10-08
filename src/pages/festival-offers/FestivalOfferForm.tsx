import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useBasePath } from "@/hooks/useBasePath";
import {
  createFestivalOffer,
  getFestivalOfferById,
  updateFestivalOffer,
} from "@/features/festival-offers/festivalOffersThunk";
import { fetchCategories } from "@/features/categories/categoriesThunk";
import { fetchsubCategories } from "@/features/subcategories/subcategoriesThunk";
import { fetchProducts } from "@/features/products/productsThunk";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BannerLinkType,
  FestivalBanner,
} from "@/features/festival-offers/festivalOffersSlice";

interface SelectOption {
  _id?: string;
  id?: string;
  name?: string;
  title?: string;
  label?: string;
  slug?: string;
  category_slug?: string;
  subcategory_slug?: string;
  product_slug?: string;
}

interface FestivalOfferPayload {
  name: string;
  description: string;
  banners: FestivalBanner[];
  start_date: string;
  end_date: string;
  display_on: "shop" | "collection" | "home";
  status: "active" | "inactive";
}

const createEmptyBanner = (): FestivalBanner => ({
  image: "",
  title: "",
  description: "",
  link_type: "none",
  link_id: "",
  link_slug: "",
  link_url: "",
});

const createSlugFallback = (value: string): string => {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const cleanSlug = (value: string): string => {
  return String(value || "")
    .trim()
    .replace(/^\/+|\/+$/g, "");
};

const getItemName = (item: any): string =>
  item?.name ||
  item?.title ||
  item?.label ||
  item?.category_name ||
  item?.subcategory_name ||
  item?.product_name ||
  "";

const getItemId = (item: any): string =>
  String(
    item?._id ||
      item?.id ||
      item?.category_id ||
      item?.subcategory_id ||
      item?.product_id ||
      ""
  );
const getItemSlug = (item: any): string => {
  if (!item) {
    return "";
  }

  return cleanSlug(
    String(
      item?.slug ||
        item?.category_slug ||
        item?.subcategory_slug ||
        item?.product_slug ||
        ""
    )
  );
};

const getFinalSlug = (item: any): string => 
  getItemSlug(item) || createSlugFallback(getItemName(item));

const formatDateForInput = (value?: string | null): string => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

export default function FestivalOfferForm() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const basePath = useBasePath();
  const categories = useSelector((state: RootState) => state.categories?.categories || []);
  const subcategories = useSelector((state: RootState) => state.subcategori?.categories || []);
  const products = useSelector((state: RootState) => state.products?.products || []);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [banners, setBanners] = useState<FestivalBanner[]>([createEmptyBanner(),]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState(true);
  const [displayOn, setDisplayOn] = useState<"shop" | "collection" | "home">("shop");
  const [loading, setLoading] = useState(false);
  const [masterDataLoading, setMasterDataLoading] = useState(true);
  const [offerLoading, setOfferLoading] = useState(false);
  useEffect(() => {
    let mounted = true;

    const loadMasterData = async () => {
      try {
        setMasterDataLoading(true);

        await Promise.all([
          dispatch(fetchCategories({})),
          dispatch(fetchsubCategories({})),
          dispatch(fetchProducts({})),
        ]);
      } catch (error) {
        console.error("Master data error:", error);

        if (mounted) {
          toast.error("Failed to load product/category data");
        }
      } finally {
        if (mounted) {
          setMasterDataLoading(false);
        }
      }
    };

    loadMasterData();

    return () => {
      mounted = false;
    };
  }, [dispatch]);

  const normalizeArray = (value: any): any[] => {
    if (Array.isArray(value)) {
      return value;
    }

    if (Array.isArray(value?.items)) {
      return value.items;
    }

    if (Array.isArray(value?.data)) {
      return value.data;
    }

    if (Array.isArray(value?.categories)) {
      return value.categories;
    }

    if (Array.isArray(value?.products)) {
      return value.products;
    }

    return [];
  };

  const categoryOptions = useMemo(() => {
    return normalizeArray(categories).filter(
      (item: any) =>
        item?.status === undefined ||
        item?.status === null ||
        item?.status === "active"
    );
  }, [categories]);

  const subcategoryOptions = useMemo(() => {
    return normalizeArray(subcategories).filter(
      (item: any) =>
        item?.status === undefined ||
        item?.status === null ||
        item?.status === "active"
    );
  }, [subcategories]);

  const productOptions = useMemo(() => {
    return normalizeArray(products).filter(
      (item: any) =>
        item?.status === undefined ||
        item?.status === null ||
        item?.status === "active"
    );
  }, [products]);

  const getTargetOptions = (linkType: BannerLinkType | null): SelectOption[] => {
    switch (linkType) {
      case "product":
        return productOptions;

      case "category":
        return categoryOptions;

      case "subcategory":
        return subcategoryOptions;

      default:
        return [];
    }
  };

  const getLinkTypeLabel = (linkType: BannerLinkType | null): string => {
    switch (linkType) {
      case "product":
        return "Product";

      case "category":
        return "Category";

      case "subcategory":
        return "Subcategory";

      case "shop":
        return "Shop";

      case "custom":
        return "Custom URL";

      default:
        return "Target";
    }
  };

  const findTargetItem = (
    linkType: BannerLinkType | null,
    linkId: string
  ): any | null => {
    if (!linkType || !linkId) {
      return null;
    }

    const options = getTargetOptions(linkType);

    return (
      options.find(
        (item: any) => getItemId(item) === String(linkId)
      ) || null
    );
  };

  const generateTargetUrl = (
    type: BannerLinkType,
    id: string,
    slug: string
  ): string => {
    switch (type) {
      case "product":
        return slug ? `/products/${encodeURIComponent(slug)}` : "";

      case "category":
        return slug ? `/shop?category=${encodeURIComponent(slug)}` : "";

      case "subcategory":
        return id ? `/shop?subcategory=${encodeURIComponent(id)}` : "";

      case "childcategory":
        return id ? `/shop?childcategory=${encodeURIComponent(id)}` : "";

      case "shop":
        return "/shop";

      case "custom":
        return slug || "";

      case "none":
      default:
        return "";
    }
  };

  const updateBanner = (
    index: number,
    changes: Partial<FestivalBanner>
  ) => {
    setBanners((previous) =>
      previous.map((banner, bannerIndex) =>
        bannerIndex === index
          ? {
              ...banner, ...changes,
            }
          : banner
      )
    );
  };

  const handleAddBanner = () => {
    setBanners((previous) => [
      ...previous,
      createEmptyBanner(),
    ]);
  };

  const handleRemoveBanner = (index: number) => {
    if (banners.length === 1) {
      toast.error("At least one banner is required");
      return;
    }

    setBanners((previous) =>
      previous.filter(
        (_, bannerIndex) => bannerIndex !== index
      )
    );
  };

  const handleBannerLinkTypeChange = (
    index: number,
    value: string
  ) => {
    if (value === "none") {
      updateBanner(index, {
        link_type: "none",
        link_id: "",
        link_slug: "",
        link_url: "",
      });

      return;
    }

    if (value === "shop") {
      updateBanner(index, {
        link_type: "shop",
        link_id: "",
        link_slug: "",
        link_url: "/shop",
      });

      return;
    }

    if (value === "custom") {
      updateBanner(index, {
        link_type: "custom",
        link_id: "",
        link_slug: "",
        link_url: "",
      });

      return;
    }

    updateBanner(index, {
      link_type: value as BannerLinkType,
      link_id: "",
      link_slug: "",
      link_url: "",
    });
  };

  const handleBannerTargetChange = (index: number, value: string) => {
    const banner = banners[index];

    if (!banner?.link_type) {
      return;
    }

    const targetOptions = getTargetOptions(
      banner.link_type
    );

    const selectedItem = targetOptions.find(
      (item: SelectOption) =>
        getItemId(item) === String(value)
    );

    if (!selectedItem) {
      updateBanner(index, {
        link_id: "",
        link_slug: "",
        link_url: "",
      });

      return;
    }

    const itemId = getItemId(selectedItem);
    const slug = getFinalSlug(selectedItem);

    const url = generateTargetUrl(
      banner.link_type,
      itemId,
      slug
    );

    updateBanner(index, {
      link_id: itemId,
      link_slug: slug,
      link_url: url,
    });
  };

  const handleBannerImageChange = (
    index: number,
    value: string | string[] | null
  ) => {
    let image = "";

    if (Array.isArray(value)) {
      image = value[0] || "";
    } else if (value) {
      image = value;
    }

    updateBanner(index, {
      image,
    });
  };

  const handleCustomUrlChange = (
    index: number,
    value: string
  ) => {
    updateBanner(index, {
      link_url: value.trim(),
    });
  };

  useEffect(() => {
    if (!isEditMode || !id) {
      return;
    }

    let mounted = true;

    const loadFestivalOffer = async () => {
      try {
        setOfferLoading(true);

        const result = await dispatch(
          getFestivalOfferById(id)
        );

        if (
          !getFestivalOfferById.fulfilled.match(result)
        ) {
          toast.error(
            String(
              result.payload ||
                "Failed to load festival offer"
            )
          );

          return;
        }

        const payload = result.payload;
        const offer = payload?.data || payload?.offer || payload;

        if (!offer) {
          toast.error(
            "Festival offer data not found"
          );

          return;
        }

        if (!mounted) {
          return;
        }

        setName(offer.name || "");
        setDescription(offer.description || "");

        const existingBanners = Array.isArray(
          offer.banners
        )
          ? offer.banners
          : [];

        const formattedBanners: FestivalBanner[] =
          existingBanners.length
            ? existingBanners.map(
                (banner: any) => ({
                  _id: banner?._id,
                  image: banner?.image || "",
                  title: banner?.title || "",
                  description: banner?.description || "",
                  link_type: banner?.link_type || "none",
                  link_id: banner?.link_id
                    ? String(banner.link_id)
                    : "",
                  link_slug: banner?.link_slug || "",
                  link_url: banner?.link_url || "",
                })
              )
            : [createEmptyBanner()];

        setBanners(formattedBanners);
        setStartDate(formatDateForInput(offer.start_date));
        setEndDate(formatDateForInput(offer.end_date));

        setStatus(
          offer.status === "active"
        );

        setDisplayOn(
          offer.display_on === "collection"
            ? "collection"
            : offer.display_on === "home"
            ? "home"
            : "shop"
        );
      } catch (error) {
        toast.error(
          "Failed to load festival offer"
        );
      } finally {
        if (mounted) {
          setOfferLoading(false);
        }
      }
    };

    loadFestivalOffer();

    return () => {
      mounted = false;
    };
  }, [dispatch, id, isEditMode]);


  useEffect(() => {
    if (
      !isEditMode ||
      masterDataLoading ||
      !banners.length
    ) {
      return;
    }

    setBanners((previous) => {
      let changed = false;

      const updated = previous.map((banner) => {
        if (
          !banner.link_type ||
          banner.link_type === "none"
        ) {
          return banner;
        }

        if (
          banner.link_type === "custom"
        ) {
          return banner;
        }

        if (banner.link_type === "shop") {
          if (banner.link_url !== "/shop") {
            changed = true;

            return {
              ...banner, link_url: "/shop",
            };
          }

          return banner;
        }

        if (!banner.link_id) {
          return banner;
        }

        const targetItem = findTargetItem(
          banner.link_type, banner.link_id
        );

        if (!targetItem) {
          return banner;
        }

        const itemId = getItemId(targetItem);
        const generatedSlug = getFinalSlug(targetItem);

        const generatedUrl = generateTargetUrl(
            banner.link_type,
            itemId,
            generatedSlug
          );

        if (
          banner.link_slug !== generatedSlug ||
          banner.link_url !== generatedUrl
        ) {
          changed = true;

          return {
            ...banner,
            link_slug: generatedSlug,
            link_url: generatedUrl,
          };
        }

        return banner;
      });

      return changed ? updated : previous;
    });
  }, [isEditMode, masterDataLoading, categoryOptions, subcategoryOptions, productOptions]);

  const validateBanners = (): boolean => {
  if (!banners.length) {
    toast.error("Please add at least one banner");
    return false;
  }

  for (let index = 0; index < banners.length; index++) {
    const banner = banners[index];
    const bannerNumber = index + 1;
    const type = banner.link_type;

    if (!banner.image?.trim()) {
      toast.error(`Please upload image for Banner ${bannerNumber}`);
      return false;
    }

    if (!banner.title?.trim()) {
      toast.error(`Please enter title for Banner ${bannerNumber}`);
      return false;
    }

    if (!type || type === "none" || type === "shop") {
      continue;
    }

    if (type === "custom") {
      if (!banner.link_slug?.trim()) {
        toast.error(`Custom URL is required for Banner ${bannerNumber}`);
        return false;
      }

      continue;
    }

    if (!banner.link_id?.trim()) {
      toast.error(
        `Please select ${getLinkTypeLabel(type)} for Banner ${bannerNumber}`
      );
      return false;
    }

    if (!banner.link_slug?.trim()) {
      toast.error(`Slug was not generated for Banner ${bannerNumber}`);
      return false;
    }
  }

  return true;
};


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    if (isEditMode && !id) {
      toast.error("Festival offer ID is missing");
      return;
    }

    if (!name.trim()) {
      toast.error("Festival offer name is required");
      return;
    }

    if (!startDate) {
      toast.error("Start date is required");
      return;
    }

    if (!endDate) {
      toast.error("End date is required");
      return;
    }

    if (
      new Date(endDate) <
      new Date(startDate)
    ) {
      toast.error("End date must be greater than or equal to start date");

      return;
    }

    if (!validateBanners()) {
      return;
    }

    const payload: FestivalOfferPayload = {
      name: name.trim(),
      description: description.trim(),
      banners: banners.map(
        (banner) => ({
          ...(banner._id
            ? { _id: banner._id }
            : {}),

          image: banner.image.trim(),
          title: banner.title.trim(),
          description: banner.description.trim(),
          link_type: banner.link_type,
          link_id: banner.link_id?.trim() || "",
          link_slug: banner.link_slug?.trim() || "",
          link_url: banner.link_url?.trim() || "",
        })
      ),
 
      start_date: startDate,
      end_date: endDate,
      display_on: displayOn,
      status: status ? "active" : "inactive",
    };

    try {
      setLoading(true);
      let result: any;
      if (isEditMode && id) {
        result = await dispatch(
          updateFestivalOffer({
            id: String(id),
            data: payload,
          })
        );

        if (
          updateFestivalOffer.fulfilled.match(
            result
          )
        ) {
          toast.success("Festival offer updated successfully!");

          navigate(`${basePath}/festival-offers`);

          return;
        }

        const errorMessage =
          typeof result.payload ===
          "string"
            ? result.payload
            : result.payload?.message ||
              result.error?.message ||
              "Failed to update festival offer";

        toast.error(
          errorMessage
        );

        return;
      }

      result = await dispatch(
        createFestivalOffer(payload)
      );

      if (
        createFestivalOffer.fulfilled.match(
          result
        )
      ) {
        toast.success("Festival offer created successfully!");

        navigate(`${basePath}/festival-offers`);

        return;
      }

      const errorMessage = typeof result.payload ===
        "string"
          ? result.payload
          : result.payload?.message ||
            result.error?.message ||
            "Failed to create festival offer";

      toast.error(errorMessage);
    } catch (error: any) {
      console.error(
        "Festival offer submit exception:",
        error
      );

      toast.error(error?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  // const pageLoading = masterDataLoading || offerLoading;


  return (
    <div className="mx-auto p-6">
      <div className="mb-6 flex items-center gap-4">
        <Link to={`${basePath}/festival-offers`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? "Edit Festival Offer" : "Add New Festival Offer"}
          </h1>

          <p className="mt-1 text-gray-500">
            {isEditMode ? "Update festival offer details." : "Create a new festival offer."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        <div className="space-y-6 lg:col-span-2">
          <Card className="border border-gray-200 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Festival Offer Information
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              <div>
                <Label htmlFor="name">
                  Festival Offer Name{" "}
                  <span className="text-red-500">*</span>
                </Label>

                <Input
                  id="name"
                  placeholder="Enter festival offer name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>

                <Textarea
                  id="description"
                  placeholder="Festival offer description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 min-h-[120px]"
                />
              </div>

              <div>
                <Label>
                  Display On{" "}
                  <span className="text-red-500">*</span>
                </Label>

                <Select
                  value={displayOn}
                  onValueChange={(value) => setDisplayOn(
                    value as
                      | "shop"
                      | "collection"
                      | "home"
                  )}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select Display Location" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="shop">Shop</SelectItem>
                    <SelectItem value="collection">Collection</SelectItem>
                    <SelectItem value="home">Home</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* BANNERS */}

          <Card className="border border-gray-200 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-semibold">
                    Festival Banners
                  </CardTitle>

                  <p className="mt-1 text-sm text-gray-500">
                    Create promotional banners with dynamic links.
                  </p>
                </div>

                {masterDataLoading && (
                  <span className="text-xs text-gray-500">
                    Loading products/categories...
                  </span>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              {banners.map(
                (banner, index) => {
                  const targetOptions = getTargetOptions(banner.link_type);
                  const selectableType = [
                    "product",
                    "category",
                    "subcategory",
                  ].includes(
                    banner.link_type || ""
                  );

                  return (
                    <div
                      key={banner._id || `banner-${index}`}
                      className="relative rounded border border-gray-200 p-4"
                    >
                      {/* REMOVE */}

                      <button
                        type="button"
                        onClick={() => handleRemoveBanner(index)}
                        className="absolute right-2 top-2 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      {/* BASIC */}

                      <div className="grid gap-4 pr-6 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label>
                            Title{" "}
                            <span className="text-red-500">*</span>
                          </Label>

                          <Input
                            value={banner.title || ""}
                            placeholder="Enter banner title"
                            onChange={(e) => updateBanner(
                              index,
                              {title: e.target.value}
                            )}
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label>
                            Description
                          </Label>

                          <Textarea
                            value={banner.description || ""}
                            placeholder="Enter banner description"
                            onChange={(e) =>
                              updateBanner(
                                index,
                                {description: e.target.value}
                              )
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>
                            Image{" "}
                            <span className="text-red-500">*</span>
                          </Label>

                          <ImageUpload
                            value={banner.image ? [banner.image] : []}
                            onChange={(value) => handleBannerImageChange(index, value)}
                            size={150}
                          />
                        </div>
                      </div>

                      {/* LINK SETTINGS */}

                      <div className="mt-5 border-t border-gray-200 pt-5">
                        <div className="mb-4">
                          <Label className="text-sm font-semibold">
                            Banner Click / Link Settings
                          </Label>

                          <p className="mt-1 text-xs text-gray-500">
                            Select where the banner should redirect.
                          </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          {/* LINK TYPE */}

                          <div className="space-y-2">
                            <Label>
                              Link Type
                            </Label>

                            <Select
                              value={banner.link_type || "none"}
                              onValueChange={(value) => handleBannerLinkTypeChange(index, value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Link Type" />
                              </SelectTrigger>

                              <SelectContent>
                                <SelectItem value="none">No Link</SelectItem>
                                <SelectItem value="product">Product</SelectItem>
                                <SelectItem value="category">Category</SelectItem>
                                <SelectItem value="subcategory">Subcategory</SelectItem>
                                <SelectItem value="shop">Shop</SelectItem>
                                <SelectItem value="custom">Custom URL</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* PRODUCT / CATEGORY / SUBCATEGORY */}

                          {selectableType && (
                            <div className="space-y-2">
                              <Label>
                                Select{" "}
                                {getLinkTypeLabel(banner.link_type)}

                                <span className="text-red-500">*</span>
                              </Label>

                              <Select
                                value={banner.link_id || undefined}
                                disabled={masterDataLoading}
                                onValueChange={(value) => handleBannerTargetChange(index, value)}
                              >
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={
                                      masterDataLoading
                                        ? "Loading..."
                                        : `Select ${getLinkTypeLabel(
                                            banner.link_type
                                          )}`
                                    }
                                  />
                                </SelectTrigger>

                                <SelectContent>
                                  {targetOptions.length > 0 ? (
                                    targetOptions.map((item: any) => {
                                        const itemId = getItemId(item);

                                        return (
                                          <SelectItem
                                            key={itemId}
                                            value={itemId}
                                          >
                                            {getItemName(item)}
                                          </SelectItem>
                                        );
                                      }
                                    )
                                  ) : (
                                    <SelectItem
                                      value="no-data"
                                      disabled
                                    >
                                      No options available
                                    </SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {/* GENERATED SLUG */}

                          {selectableType && banner.link_id && (
                              <div className="space-y-2">
                                <Label>
                                  Generated Slug
                                </Label>

                                <Input
                                  value={ banner.link_slug || ""}
                                  readOnly
                                  className="bg-gray-100"
                                />

                                <p className="text-xs text-green-600">
                                  Generated from selected{" "}
                                  {getLinkTypeLabel(
                                    banner.link_type
                                  )}
                                  .
                                </p>
                              </div>
                            )}

                          {/* GENERATED URL */}

                          {selectableType && banner.link_id && (
                            <div className="space-y-2">
                              <Label>
                                Generated URL
                              </Label>

                              <div className="flex gap-2">
                                <Input
                                  value={banner.link_url || ""}
                                  readOnly
                                  className="bg-gray-100"
                                />

                                {banner.link_url && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() =>
                                      window.open(
                                        banner.link_url,
                                        "_blank", "noopener, noreferrer"
                                      )
                                    }
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>

                              <p className="text-xs text-green-600">
                                Generated automatically.
                              </p>
                            </div>
                          )}

                          {/* SHOP */}

                          {banner.link_type === "shop" && (
                            <div className="space-y-2">
                              <Label>
                                Shop URL
                              </Label>

                              <Input
                                value="/shop"
                                readOnly
                                className="bg-gray-100"
                              />
                            </div>
                          )}

                          {/* CUSTOM */}

                          {banner.link_type === "custom" && (
                            <div className="space-y-2 md:col-span-2">
                              <Label>
                                Custom URL
                                <span className="text-red-500">*</span>
                              </Label>

                              <Input
                                value={banner.link_url || ""}
                                placeholder="https://example.com/offer"
                                onChange={(e) => handleCustomUrlChange(index, e.target.value)}
                              />
                            </div>
                          )}
                        </div>

                        {/* DESTINATION */}

                        {banner.link_type && banner.link_type !== "none" &&
                          banner.link_url && (
                            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3">
                              <p className="text-xs font-medium text-green-800">
                                Banner destination
                              </p>

                              <p className="mt-1 break-all text-xs text-green-700">
                                {banner.link_url}
                              </p>
                            </div>
                          )}
                      </div>
                    </div>
                  );
                }
              )}

              {/* ADD BANNER */}

              <div className="flex justify-center pt-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddBanner}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Add Banner
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* DURATION */}

          <Card className="border border-gray-200 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Festival Duration
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <Label htmlFor="start_date">
                    Start Date{" "}
                    <span className="text-red-500">*</span>
                  </Label>

                  <Input
                    id="start_date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="end_date">
                    End Date{" "}
                    <span className="text-red-500">*</span>
                  </Label>

                  <Input
                    id="end_date"
                    type="date"
                    min={startDate || undefined}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="sticky top-6 border border-gray-200 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Status
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="status">
                  Active
                </Label>

                <Switch
                  id="status"
                  checked={status}
                  onCheckedChange={setStatus}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading
                ? "Saving..."
                : isEditMode
                ? "Update Festival Offer"
                : "Create Festival Offer"}
            </Button>

            <Link to={`${basePath}/festival-offers`} className="flex-1">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={loading}
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