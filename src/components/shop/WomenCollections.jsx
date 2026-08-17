import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, X, Plus, Minus } from "lucide-react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import CheckedIcon from "../icons/checked";
import MobileFilterBar from "./MobileFilterBar";
import ProductGrid from "./ProductGrid";
import TrandingCard from "./TrandingCard";
import SortByPage from "./SortByPage";
import MobileFilterModal from "./MobileFilterModal";
import DesktopFilters from "./DesktopFilters";
import OriginalSortByIcon from "../icons/SortByIcon";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../../features/products/productsThunk";
import Row from "../ui/Row";
import Section from "../ui/Section";
import LoginForm from "../../pages/Login";
import { fetchtypes } from "../../features/types/typeThunk";
import { fetchProductLabels } from "../../features/productLabels/productlabelsThunk";
import { fetchTypeAttributes, fetchAttributes } from "../../features/attribut/attributThunk";
import { clearTypeAttributes } from "../../features/attribut/attributSlice";
import { filterProductsByAttributes } from "../utils/attribut";

const SortByIcon = (props) => (
  <OriginalSortByIcon {...props} className="h-4 w-4 md:text-gray-500" />
);
const CustomChevronDown = (props) => <ChevronDown {...props} />;

const DesktopSortBar = ({ sortBy, setSortBy }) => (
  <div className="flex items-center gap-2 cursor-pointer rounded px-3 py-2">
    <SortByIcon />
    <span className="text-[16px] font-medium text-[#989696] font-sans">
      Sort By
    </span>
    <div className="relative">
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="appearance-none bg-white text-black py-2 pl-3 pr-10 rounded-[3px] box-shadow focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] text-[16px] transition duration-150 ease-in-out"
      >
        <option value="popularity">Popularity</option>
        <option value="latest">Latest</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="rating">Average Rating</option>
        <option value="discounts">Discounts</option>
      </select>
      <CustomChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black pointer-events-none" />
    </div>
  </div>
);

const FilterItemCheckbox = ({ name, count, isChecked, onChange }) => (
  <label className="flex items-center justify-between cursor-pointer p-1 rounded">
    <div className="flex items-center relative">
      <div
        className={`w-[15px] h-[15px] rounded border flex items-center justify-center
          ${isChecked ? "bg-color border-color" : "bg-white border-gray-400"}`}
      >
        {isChecked ? <CheckedIcon className="w-3 h-3 text-white" /> : null}
      </div>
      <input
        type="checkbox"
        name={name}
        checked={isChecked}
        onChange={() => onChange(name)}
        aria-checked={isChecked}
        className="absolute top-0 left-0 w-[15px] h-[15px] opacity-0 cursor-pointer z-10"
      />
      <span className="ml-3 text-[14px] font-inter text-[rgba(0,0,0,0.7)]">
        {name}
      </span>
    </div>
    {count !== undefined && (
      <span className="text-[14px] font-regular font-inter text-[#989696]">
        {count}
      </span>
    )}
  </label>
);
const SizeFilterItem = ({ name, isChecked, onChange }) => (
  <label className="flex items-center cursor-pointer p-1 rounded w-1/2 relative">
    <div
      className={`w-[15px] h-[15px] rounded border flex items-center justify-center
        ${isChecked ? "bg-color border-color" : "bg-white border-gray-400"}`}
    >
      {isChecked && <CheckedIcon className="w-3 h-3 pointer-events-none" />}
    </div>
    <input
      type="checkbox"
      name={name}
      checked={isChecked}
      onChange={onChange}
      className="absolute w-[15px] h-[15px] opacity-0 cursor-pointer"
    />
    <span className="ml-3 text-[14px] text-[rgba(0,0,0,0.7)] font-regular">
      {name}
    </span>
  </label>
);

const ColorFilterItem = ({ name, hex, isChecked, onChange, border }) => {
  const dropShadowStyle = `drop-shadow(0px 0px 4px rgba(0, 0, 0, 0.25))`;
  return (
    <div
      className="flex flex-col items-center p-1 cursor-pointer w-1/6"
      onClick={() => onChange(name)}
    >
      <div
        className={`w-[22px] h-[22px] rounded-full transition-all duration-150
          ${border ? "border border-gray-300" : ""}
          ${isChecked ? "ring-2 ring-pink-500 ring-offset-2" : ""}`}
        style={{ backgroundColor: hex, filter: dropShadowStyle }}
      />
      <span className="text-[10px] text-[#989696] font-regular mt-1">
        {name}
      </span>
    </div>
  );
};

const CollapsibleFilter = ({
  title,
  onReset,
  isOpen = false,
  onToggle = () => { },
  children,
  onCancelClick,
  onApplyClick,
  showButtons = true,
}) => {
  return (
    <div className="px-[10px] py-[0px] lg:px-[15px] lg:py-[10px] border-gray-200">
      <div
        className={`flex items-center justify-between cursor-pointer rounded-[10px] px-4 py-3 transition-all duration-300
          ${isOpen ? "bg-[var(--primary-color)] border-transparent" : "bg-transparent border-white shadow-[0_0_4px_rgba(0,0,0,0.3)]"}`}
        onClick={onToggle}
      >
        <h3
          className={`font-medium font-inter text-[14px] ${isOpen ? "text-white" : "text-theme"}`}
        >
          {title}
        </h3>
        <div className="flex items-center space-x-2">
          {isOpen ? (
            <Minus className="w-4 h-4 text-white bg-color" />
          ) : (
            <Plus className="w-4 h-4 text-white bg-color" />
          )}
        </div>
      </div>
      {isOpen && (
        <div className="space-y-1 py-2">
          {children}
          {showButtons && (
            <div className="flex gap-4 py-[20px] border-b border-[#BCBCBC]">
              <button
                onClick={onCancelClick || onToggle}
                className="w-[100px] h-[40px] text-[18px] font-regular font-inter text-black/70 border border-[#989696] rounded-[3px] transition"
              >
                Cancel
              </button>
              <button
                onClick={onApplyClick || onReset}
                className="w-[100px] h-[40px] text-[18px] font-regular font-inter text-white bg-color rounded-[3px] transition shadow-md hidden lg:flex items-center justify-center"
              >
                Reset
              </button>
              <button
                onClick={onApplyClick || onReset}
                className="w-[100px] h-[40px] text-[18px] font-regular font-inter text-white bg-color rounded-[3px] transition shadow-md flex lg:hidden items-center justify-center"
              >
                Filter
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const getProductEffectivePrice = (p) => {
  if (!p) return 0;
  
  if (Array.isArray(p.variants) && p.variants.length > 0) {
    const variantPrices = p.variants
      .map((v) => {
        const originalPrice = Number(v?.price) || 0;
        const offerPrice =
          v?.offerprice !== undefined && v?.offerprice !== null
            ? Number(v.offerprice)
            : 0;
        const sellingPrice = Number(v?.selling_price) || 0;

        if (offerPrice > 0 && (originalPrice === 0 || offerPrice < originalPrice)) return offerPrice;
        if (sellingPrice > 0) return sellingPrice;
        if (originalPrice > 0) return originalPrice;
        return 0;
      })
      .filter((pr) => pr > 0);

    if (variantPrices.length > 0) {
      return Math.min(...variantPrices);
    }
  }

  const pOffer = Number(p.offerprice) || 0;
  const pSelling = Number(p.selling_price) || 0;
  const pPrice = Number(p.price) || 0;

  if (pOffer > 0 && (pPrice === 0 || pOffer < pPrice)) return pOffer;
  if (pSelling > 0) return pSelling;
  if (pPrice > 0) return pPrice;

  return 0;
};

const PriceRangeFilter = ({
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
  displayMin = 0,
  displayMax = 5000,
  isMobile = false,
  isOpen,
  onToggle,
  onReset,
}) => {
  const MIN_BOUND = displayMin !== undefined ? displayMin : 0;
  const MAX_BOUND = Math.max(displayMax || 5000, maxPrice || 5000, 1000);

  const currentMin = minPrice !== undefined && minPrice !== null ? minPrice : MIN_BOUND;
  const currentMax = maxPrice !== undefined && maxPrice !== null ? maxPrice : MAX_BOUND;

  const [localMin, setLocalMin] = useState(currentMin);
  const [localMax, setLocalMax] = useState(currentMax);

  useEffect(() => {
    setLocalMin(currentMin);
  }, [currentMin]);

  useEffect(() => {
    setLocalMax(currentMax);
  }, [currentMax]);

  const handleMinSliderChange = (e) => {
    const val = Math.min(Number(e.target.value), localMax);
    setLocalMin(val);
    setMinPrice(val);
  };

  const handleMaxSliderChange = (e) => {
    const val = Math.max(Number(e.target.value), localMin);
    setLocalMax(val);
    setMaxPrice(val);
  };

  const handleMinInputChange = (e) => {
    const val = e.target.value === "" ? "" : Number(e.target.value);
    setLocalMin(val);
    if (val !== "" && !isNaN(val)) {
      const clamped = Math.max(MIN_BOUND, Math.min(val, localMax));
      setMinPrice(clamped);
    }
  };

  const handleMaxInputChange = (e) => {
    const val = e.target.value === "" ? "" : Number(e.target.value);
    setLocalMax(val);
    if (val !== "" && !isNaN(val)) {
      const clamped = Math.max(localMin, val);
      setMaxPrice(clamped);
    }
  };

  const handleResetClick = () => {
    if (onReset) {
      onReset();
    } else {
      setLocalMin(MIN_BOUND);
      setLocalMax(MAX_BOUND);
      setMinPrice(MIN_BOUND);
      setMaxPrice(MAX_BOUND);
    }
  };

  const range = Math.max(1, MAX_BOUND - MIN_BOUND);
  const minPercent = Math.max(0, Math.min(100, ((localMin - MIN_BOUND) / range) * 100));
  const maxPercent = Math.max(0, Math.min(100, ((localMax - MIN_BOUND) / range) * 100));

  return (
    <CollapsibleFilter
      title="Price"
      isOpen={isOpen}
      onToggle={onToggle}
      isSelected={localMin > MIN_BOUND || localMax < MAX_BOUND}
      onReset={handleResetClick}
      showButtons={true}
    >
      <div className="space-y-5 px-3 py-4">
        <div className="relative select-none my-4 h-[30px]">
          <div className="absolute top-1/2 left-0 right-0 h-1.5 -translate-y-1/2 bg-gray-200 rounded-full" />
          <div
            className="absolute top-1/2 h-1.5 -translate-y-1/2 bg-color rounded-full"
            style={{
              left: `${minPercent}%`,
              width: `${Math.max(0, maxPercent - minPercent)}%`,
            }}
          />
          <div
            className="absolute top-1/2 w-5 h-5 -translate-y-1/2 bg-color rounded-full flex items-center justify-center shadow-md pointer-events-none z-10"
            style={{ left: `calc(${minPercent}% - 10px)` }}
          >
            <div className="w-2 h-2 rounded-full bg-white" />
          </div>
          <div
            className="absolute top-1/2 w-5 h-5 -translate-y-1/2 bg-color rounded-full flex items-center justify-center shadow-md pointer-events-none z-10"
            style={{ left: `calc(${maxPercent}% - 10px)` }}
          >
            <div className="w-2 h-2 rounded-full bg-white" />
          </div>
          <input
            type="range"
            min={MIN_BOUND}
            max={MAX_BOUND}
            step={10}
            value={localMin}
            onChange={handleMinSliderChange}
            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-20 pointer-events-auto"
            style={{
              zIndex: localMin > MAX_BOUND - 100 ? 25 : 20,
            }}
          />
          <input
            type="range"
            min={MIN_BOUND}
            max={MAX_BOUND}
            step={10}
            value={localMax}
            onChange={handleMaxSliderChange}
            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-20 pointer-events-auto"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col flex-1">
            <span className="text-xs sec-text-color font-medium mb-1">Min (Rs)</span>
            <input
              type="number"
              min={MIN_BOUND}
              max={localMax}
              value={localMin}
              onChange={handleMinInputChange}
              className="w-full h-[38px] px-3 border border-gray-300 rounded-lg text-sm text-center focus:outline-none focus:border-[var(--primary-color)]"
            />
          </div>
          <span className="text-gray-400 font-semibold mt-4">-</span>
          <div className="flex flex-col flex-1">
            <span className="text-xs sec-text-color font-medium mb-1">Max (Rs)</span>
            <input
              type="number"
              min={localMin}
              max={MAX_BOUND}
              value={localMax}
              onChange={handleMaxInputChange}
              className="w-full h-[38px] px-3 border border-gray-300 rounded-lg text-sm text-center focus:outline-none focus:border-[var(--primary-color)]"
            />
          </div>
        </div>
      </div>
    </CollapsibleFilter>
  );
};

export default function WomenCollections() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [searchQuery, setSearchQuery] = useState("");
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  const { products = [], priceMetadata = {}, loading } = useSelector(
    (state) => state.products || {},
  );
  const { items: subcategories = [] } = useSelector(
    (state) => state.subcategories,
  );

  const { discounts: allDiscounts = [] } = useSelector(
    (state) => state.discounts || {},
  );
  const { productLabels: allLabels = [] } = useSelector(
    (state) => state.productLabels || {},
  );

  const getInitialParams = () => {
    const params = new URLSearchParams(location.search);
    return {
      categories: params.get("category") ? params.get("category").split(",") : [],
      types: params.get("type") ? params.get("type").split(",") : [],
      labels: params.get("label") ? params.get("label").split(",") : [],
      min: params.get("min") !== null ? Number(params.get("min")) : null,
      max: params.get("max") !== null ? Number(params.get("max")) : null,
    };
  };

  const catalogPrices = useMemo(() => {
    if (!Array.isArray(products) || products.length === 0) {
      return { min: 0, max: priceMetadata?.displayMax || priceMetadata?.actualMax || 5000 };
    }
    const prices = products.map(getProductEffectivePrice).filter((pr) => pr > 0);
    if (prices.length === 0) {
      return { min: 0, max: priceMetadata?.displayMax || priceMetadata?.actualMax || 5000 };
    }
    const realMin = Math.min(...prices);
    const realMax = Math.max(...prices);

    const metaMax = priceMetadata?.displayMax || priceMetadata?.actualMax || 0;
    const metaMin = priceMetadata?.displayMin !== undefined ? priceMetadata?.displayMin : 0;

    return {
      min: Math.min(realMin, metaMin),
      max: Math.max(realMax, metaMax, 1000),
    };
  }, [products, priceMetadata]);

  const minCatalogPrice = catalogPrices.min;
  const maxCatalogPrice = catalogPrices.max;

  const [selectedCategories, setSelectedCategories] = useState(() => getInitialParams().categories);
  const [selectedTypes, setSelectedTypes] = useState(() => getInitialParams().types);
  const [typeIdsToFetch, setTypeIdsToFetch] = useState([]);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [selectedLabels, setSelectedLabels] = useState(() => {
    const labelNames = getInitialParams().labels;
    return labelNames.map((name) => ({ id: name, name }));
  });
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [minPrice, setMinPrice] = useState(() => getInitialParams().min ?? minCatalogPrice);
  const [maxPrice, setMaxPrice] = useState(() => getInitialParams().max ?? maxCatalogPrice);
  const [currentSortValue, setCurrentSortValue] = useState("popularity");
  const [currentSortLabel, setCurrentSortLabel] = useState("popularity");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isSortByOpen, setIsSortByOpen] = useState(false);

  const [page] = useState(1);
  const limit = 30;

  const [debouncedMinPrice, setDebouncedMinPrice] = useState(minPrice);
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState(maxPrice);
  const { types = [], loading: typesLoading } = useSelector((state) => state.types || {});
  const { attributes = [], typeAttributes = [], loading: attrLoading,} = useSelector((state) => state.attributes || {});

  useEffect(() => {
    if (!Array.isArray(selectedTypes))  return;
    if (selectedTypes.length === 0) {
      setTypeIdsToFetch([]);
      setSelectedAttributes({});
      dispatch(clearTypeAttributes());
      dispatch(fetchAttributes());
      return;
    }

    const selectedTypeIds = selectedTypes.flatMap((selectedTypeName) => {
      const selectedName = String(selectedTypeName || "").trim().toLowerCase();
      const foundType = types.find((type) => {
      const typeName = String(type?.name || "").trim().toLowerCase();
        return typeName === selectedName;
      });
      if (!foundType) {
        return [];
      }
      const id = foundType?._id || foundType?.id;
      return id ? [String(id)] : [];
    });

    const uniqueTypeIds = [...new Set(selectedTypeIds)];
    if (uniqueTypeIds.length > 0) {
      setTypeIdsToFetch(uniqueTypeIds);
      dispatch(fetchTypeAttributes(uniqueTypeIds));
    }
  }, [selectedTypes, types, dispatch]);

  useEffect(() => {
    if (
      getInitialParams().max === null &&
      maxCatalogPrice > 0 &&
      (maxPrice < maxCatalogPrice || maxPrice === 5000)
    ) {
      setMaxPrice(maxCatalogPrice);
    }
  }, [maxCatalogPrice]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMinPrice(minPrice);
      setDebouncedMaxPrice(maxPrice);
    }, 400);
    return () => clearTimeout(timer);
  }, [minPrice, maxPrice]);

  useEffect(() => {
    const params = { page, limit };
    if (debouncedMinPrice !== undefined && debouncedMinPrice !== null)
      params.minPrice = debouncedMinPrice;
    if (debouncedMaxPrice !== undefined && debouncedMaxPrice !== null)
      params.maxPrice = debouncedMaxPrice;
    if (selectedCategories.length > 0) {
      const matchedCatIds = subcategories
        .filter((cat) => selectedCategories.includes(cat.name))
        .map((cat) => cat._id);
      if (matchedCatIds.length > 0) {
        params.categories = matchedCatIds.join(",");
      }
    }
    dispatch(fetchProducts(params));
  }, [
    dispatch,
    page,
    limit,
    debouncedMinPrice,
    debouncedMaxPrice,
    selectedCategories,
    subcategories,
  ]);
//   useEffect(() => {
//   const params = {
//     page,
//     limit,
//   };

//   if (isPriceFilterActive) {
//     if (
//       debouncedMinPrice !== undefined &&
//       debouncedMinPrice !== null
//     ) {
//       params.minPrice = debouncedMinPrice;
//     }

//     if (
//       debouncedMaxPrice !== undefined &&
//       debouncedMaxPrice !== null
//     ) {
//       params.maxPrice = debouncedMaxPrice;
//     }
//   }

//   if (selectedCategories.length > 0) {
//     const matchedCatIds = subcategories
//       .filter((cat) => selectedCategories.includes(cat.name))
//       .map((cat) => cat._id);

//     if (matchedCatIds.length > 0) {
//       params.categories = matchedCatIds.join(",");
//     }
//   }

//   dispatch(fetchProducts(params));
// }, [
//   dispatch,
//   page,
//   limit,
//   debouncedMinPrice,
//   debouncedMaxPrice,
//   isPriceFilterActive,
//   selectedCategories,
//   subcategories,
// ]);

  useEffect(() => {
    dispatch(fetchAttributes());
    dispatch(fetchtypes());
    dispatch(fetchProductLabels());
  }, [dispatch]);

  const handleCategoryChange = (name) => {
    setSelectedCategories((prev) => (prev.includes(name) ? [] : [name]));
  };

  const handleTypeChange = (typeName) => {
    setSelectedTypes((prev) => {
      if (prev.includes(typeName)) {
        return prev.filter((type) => type !== typeName);
      }

      return [...prev, typeName];
    });
  };

  const handleResetTypes = () => {
    setSelectedTypes([]);
    setTypeIdsToFetch([]);
    setSelectedAttributes({});
    dispatch(clearTypeAttributes());
    dispatch(fetchAttributes());
  };

  const handleAttributeChange = (code, valName) => {
    setSelectedAttributes((prev) => {
      const currentList = prev[code] || [];
      const updatedList = currentList.includes(valName)
        ? currentList.filter((v) => v !== valName)
        : [...currentList, valName];

      return {
        ...prev,
        [code]: updatedList,
      };
    });
  };

  const handleResetAttributes = (code) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [code]: [],
    }));
  };

  const handleLabelChange = (id, name) => {
    setSelectedLabels((prev) =>
      prev.some((l) => l.id === id)
        ? prev.filter((l) => l.id !== id)
        : [...prev, { id, name }]
    );
  };

  const handleClearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedTypes([]);
    setSelectedAttributes({});
    setSelectedLabels([]);
    setIsBestSeller(false);
    setMinPrice(minCatalogPrice);
    setMaxPrice(maxCatalogPrice);
    setDebouncedMinPrice(minCatalogPrice);
    setDebouncedMaxPrice(maxCatalogPrice);
    setTypeIdsToFetch([]);
    dispatch(fetchAttributes());
    dispatch(clearTypeAttributes());
    navigate("/shop", { replace: true });
  };


  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategories.length)
      params.set("category", selectedCategories.join(","));
    if (selectedTypes.length) params.set("type", selectedTypes.join(","));
    if (selectedLabels.length)
      params.set("label", selectedLabels.map((l) => l.name).join(","));
    if (debouncedMinPrice !== null && minCatalogPrice > 0 && debouncedMinPrice > minCatalogPrice) {
      params.set("min", debouncedMinPrice);
    }
    if (debouncedMaxPrice !== null && maxCatalogPrice > 0 && debouncedMaxPrice < maxCatalogPrice) {
      params.set("max", debouncedMaxPrice);
    }

    const queryString = params.toString();
    const newUrl = `/shop${queryString ? `?${queryString}` : ""}`;
    const currentFullUrl = location.pathname + location.search;

    if (currentFullUrl !== newUrl) {
      navigate(newUrl, { replace: true });
    }
  }, [
    selectedCategories,
    selectedTypes,
    selectedLabels,
    debouncedMinPrice,
    debouncedMaxPrice,
  ]);
// useEffect(() => {
//   const params = new URLSearchParams();

//   // Category
//   if (selectedCategories.length > 0) {
//     params.set("category", selectedCategories.join(","));
//   }

//   // Type
//   if (selectedTypes.length > 0) {
//     params.set("type", selectedTypes.join(","));
//   }

//   // Labels
//   if (selectedLabels.length > 0) {
//     params.set(
//       "label",
//       selectedLabels.map((l) => l.name).join(",")
//     );
//   }

//   // Minimum price
//   if (
//     debouncedMinPrice !== null &&
//     debouncedMinPrice !== undefined &&
//     debouncedMinPrice > minCatalogPrice
//   ) {
//     params.set("min", String(debouncedMinPrice));
//   }

//   // Maximum price
//   if (
//     debouncedMaxPrice !== null &&
//     debouncedMaxPrice !== undefined &&
//     debouncedMaxPrice < maxCatalogPrice
//   ) {
//     params.set("max", String(debouncedMaxPrice));
//   }

//   const queryString = params.toString();

//   const newUrl = `/shop${queryString ? `?${queryString}` : ""}`;

//   const currentFullUrl =
//     location.pathname + location.search;

//   if (currentFullUrl !== newUrl) {
//     navigate(newUrl, { replace: true });
//   }
// }, [
//   selectedCategories,
//   selectedTypes,
//   selectedLabels,
//   debouncedMinPrice,
//   debouncedMaxPrice,
//   minCatalogPrice,
//   maxCatalogPrice,
//   location.pathname,
//   location.search,
//   navigate,
// ]);
  const currentFilters = useMemo(() => {
    const arr = [
      ...selectedCategories.map((v) => ({
        type: "category",
        value: v,
        label: v,
      })),
      ...selectedTypes.map((v) => ({ type: "type", value: v, label: v })),
      ...selectedLabels.map((l) => ({
        type: "label",
        value: l.id,
        label: l.name,
      })),
    ];

    Object.keys(selectedAttributes).forEach((code) => {
      const vals = selectedAttributes[code] || [];
      vals.forEach((val) => {
        arr.push({
          type: code,
          value: val,
          label: `${code}: ${val}`,
        });
      });
    });

    if (minPrice > minCatalogPrice || (maxPrice && maxPrice < maxCatalogPrice)) {
      arr.push({
        type: "price",
        value: "price",
        label: `Rs ${minPrice} - Rs ${maxPrice}`,
      });
    }
    return arr;
  }, [
    selectedCategories,
    selectedTypes,
    selectedAttributes,
    selectedLabels,
    minPrice,
    maxPrice,
    minCatalogPrice,
    maxCatalogPrice,
  ]);

  const productTypeNames = (p) =>
    (p?.variants || []).flatMap((v) => {
      const t = v?.type || v?.types;
      if (!t) return [];
      if (Array.isArray(t)) return t.map((x) => x?.name || x);
      if (typeof t === "object") return [t?.name].filter(Boolean);
      return [String(t)];
    });

  const matchesFilters = (p) => {
    if (isBestSeller) {
      const hasBestSeller = (p?.variants || []).some(
        (v) => v.is_best_seller === true
      );
      if (!hasBestSeller) return false;
    }

    if (selectedCategories.length > 0) {
      const matchCat = (val) => {
        if (!val) return false;
        const targetStr = (typeof val === "object" ? val?.name || val?._id : String(val)).toLowerCase().trim();
        return selectedCategories.some((sc) => sc.toLowerCase().trim() === targetStr);
      };

      const matchInSubcats = () => {
        const catId = typeof p.category_id === "object" ? p.category_id?._id : p.category_id;
        const catObj = subcategories.find((c) => c._id === catId || c.name?.toLowerCase().trim() === selectedCategories[0]?.toLowerCase().trim());
        return catObj ? selectedCategories.some((sc) => sc.toLowerCase().trim() === catObj.name?.toLowerCase().trim()) : false;
      };

      const hasDirectCategoryMatch =
        matchCat(p.category_id) ||
        matchCat(p.subcategory_id) ||
        matchCat(p.child_category_id) ||
        matchCat(p.category) ||
        matchCat(p.type_id) ||
        matchCat(p.product_type) ||
        matchInSubcats();

      const hasTypeMatchInVariants = (p?.variants || []).some((v) => {
        const t = v?.type || v?.types || v?.type_id;
        if (!t) return false;
        if (Array.isArray(t)) {
          return t.some((x) => matchCat(x));
        }
        return matchCat(t);
      });

      if (!hasDirectCategoryMatch && !hasTypeMatchInVariants) return false;
    }

    if (selectedTypes.length > 0) {
      const types = productTypeNames(p);
      if (!selectedTypes.some((t) => types.includes(t))) return false;
    }

    if (selectedLabels.length > 0) {
      const productLabelIds = (p?.variants || [])
        .flatMap((v) => v?.labels || [])
        .map((l) => String(typeof l === "object" ? l?._id || l : l));
      if (!selectedLabels.some((l) => productLabelIds.includes(l.id)))
        return false;
    }

    const price = getProductEffectivePrice(p);
    if (price > 0) {
      if (minPrice !== undefined && minPrice !== null && price < minPrice) return false;
      if (maxPrice !== undefined && maxPrice !== null && price > maxPrice) return false;
    }
    return true;
  };

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];

    const baseFiltered = products.filter((p) => {
      const productName = p?.name || p?.title || p?.variants?.[0]?.name || "";
      const matchesSearch =
        !searchQuery ||
        productName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilters(p) && matchesSearch;
    });

    return filterProductsByAttributes(baseFiltered, selectedAttributes);
  }, [
    products,
    selectedCategories,
    selectedTypes,
    selectedAttributes,
    selectedLabels,
    isBestSeller,
    minPrice,
    maxPrice,
    searchQuery,
    subcategories,
  ]);
  const sortComparators = {
    popularity: (a, b) => {
      const pa = (a?.variants || []).reduce(
        (s, v) => s + (v.popularity || v.rank || 0),
        0,
      );
      const pb = (b?.variants || []).reduce(
        (s, v) => s + (v.popularity || v.rank || 0),
        0,
      );
      return pb - pa;
    },
    latest: (a, b) => {
      const ta = new Date(a?.createdAt || a?.updatedAt || 0).getTime() || 0;
      const tb = new Date(b?.createdAt || b?.updatedAt || 0).getTime() || 0;
      return tb - ta;
    },
    price_asc: (a, b) => getProductEffectivePrice(a) - getProductEffectivePrice(b),
    price_desc: (a, b) => getProductEffectivePrice(b) - getProductEffectivePrice(a),
    rating: (a, b) =>
      Number(b?.rating || b?.average_rating || 0) -
      Number(a?.rating || a?.average_rating || 0),
    discounts: (a, b) =>
      (b?.discount_percent || 0) - (a?.discount_percent || 0),
  };

  const sortedProducts = useMemo(() => {
    if (!Array.isArray(filteredProducts)) return [];
    const arr = [...filteredProducts];
    const comparator =
      sortComparators[currentSortValue] || sortComparators.popularity;
    try {
      arr.sort(comparator);
    } catch (err) {
      console.warn("Sort failed:", err);
    }
    return arr;
  }, [filteredProducts, currentSortValue]);
  const filterCount = currentFilters.length;
  const trendingProducts = sortedProducts.filter(
    (p) =>
      p.is_trending === true ||
      p.isTrending === true ||
      (p.variants || []).some((v) => v.is_trending || v.isTrending),
  );
  const showingResults = filteredProducts.length;
  return (
    <>
      <Section>
        <Row className="pt-[25px] custom-lg:pt-[50px]">
          <MobileFilterModal
            isOpen={isMobileFilterOpen}
            onClose={() => setIsMobileFilterOpen(false)}
            selectedCategories={selectedCategories}
            handleCategoryChange={handleCategoryChange}
            handleResetCategories={() => setSelectedCategories([])}
            selectedTypes={selectedTypes}
            handleTypeChange={handleTypeChange}
            handleResetTypes={handleResetTypes}
            selectedAttributes={selectedAttributes}
            handleAttributeChange={handleAttributeChange}
            handleResetAttributes={handleResetAttributes}
            selectedLabels={selectedLabels}
            handleLabelChange={handleLabelChange}
            handleResetLabels={() => setSelectedLabels([])}
            minPrice={minPrice}
            setMinPrice={setMinPrice}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            displayMin={minCatalogPrice}
            displayMax={maxCatalogPrice}
            applyAllFilters={() => setIsMobileFilterOpen(false)}
            onClearAll={handleClearAllFilters}
          />
          <div className="flex justify-between items-center py-2 mb-4 lg:hidden">
            <div className="w-full">
              <div className="flex items-center py-2 space-x-2">
                <div className="flex-1 mx-3 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search here.."
                    className="w-full h-11 bg-white border border-white rounded-[3px] pl-10 pr-4 text-sm font-regular focus:outline-none shadow-[0_0_4px_rgba(0,0,0,0.25)]"
                  />
                  <MagnifyingGlassIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                </div>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-8">
            <span className="text-black border-b border-black lg:border-none">
              <Link to="/home">Home</Link>
            </span>
            <span className="text-black"> / </span>
            <span className="font-regular text-[#989696]">Shop</span>
          </p>
          <div className="mb-3 lg:hidden">
            <MobileFilterBar
              sortBy={currentSortLabel}
              filterCount={filterCount}
              onSortClick={() => setIsSortByOpen(true)}
              onFilterClick={() => setIsMobileFilterOpen(true)}
            />
            <SortByPage
              isOpen={isSortByOpen}
              onClose={() => setIsSortByOpen(false)}
              selectedSort={currentSortValue}
              onSelectSort={(value, label) => {
                setCurrentSortValue(value);
                setCurrentSortLabel(label);
                setIsSortByOpen(false);
              }}
            />
          </div>
          <div className="flex flex-col lg:flex-row gap-[30px]">
            <DesktopFilters
              products={products}
              selectedCategories={selectedCategories}
              handleCategoryChange={handleCategoryChange}
              handleResetCategories={() => setSelectedCategories([])}
              selectedTypes={selectedTypes}
              handleTypeChange={handleTypeChange}
              handleResetTypes={handleResetTypes}
              selectedAttributes={selectedAttributes}
              handleAttributeChange={handleAttributeChange}
              handleResetAttributes={handleResetAttributes}
              selectedLabels={selectedLabels}
              handleLabelChange={handleLabelChange}
              handleResetLabels={() => setSelectedLabels([])}
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              displayMin={minCatalogPrice}
              displayMax={maxCatalogPrice}
              isCategorySelected={selectedCategories.length > 0}
            />
            <main className="w-full lg:w-3/4">
              <div className="hidden lg:block w-full">
                <div className="flex items-center py-2 space-x-2">
                  <div className="flex-1 mx-3 relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search here.."
                      className="w-full h-11 bg-white border border-white rounded-[3px] pl-10 pr-4 text-sm font-regular focus:outline-none shadow-[0_0_4px_rgba(0,0,0,0.25)]"
                    />
                    <MagnifyingGlassIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center mb-6">
                <div className="hidden lg:block text-[16px] sec-text-color">
                  Showing{" "}
                  <span className="font-medium text-black">
                    {showingResults}
                  </span>{" "}
                  results for "
                  <span className="font-medium text-black">
                    {selectedCategories.length > 0
                      ? selectedCategories.join(", ")
                      : "Products"}
                  </span>
                  "
                </div>
                <div className="hidden lg:flex justify-end">
                  <DesktopSortBar
                    sortBy={currentSortValue}
                    setSortBy={setCurrentSortValue}
                  />
                </div>
              </div>
              <div className="hidden sm:flex flex-wrap items-center gap-2 mb-6">
                {currentFilters.length > 0 || isBestSeller ? (
                  <>
                    <button
                      onClick={handleClearAllFilters}
                      className="text-[16px] font-medium text-[#989696] mr-2 border-b border-[#989696] cursor-pointer"
                    >
                      Clear Filters:
                    </button>
                    {isBestSeller && (
                      <span
                        className="theme-border min-w-[110px] text-theme border px-[10px] py-[5px] rounded-[10px] cursor-pointer flex items-center justify-between"
                        onClick={() => setIsBestSeller(false)}
                      >
                        Best Sellers
                        <X className="w-4 h-4 ml-2 text-theme" />
                      </span>
                    )}
                    {currentFilters.map((filter, idx) => (
                      <span
                        key={idx}
                        className="theme-border min-w-[110px] text-theme border px-[10px] py-[5px] rounded-[10px] cursor-pointer flex items-center justify-between"
                        onClick={() => {
                          const { type, value } = filter;
                          if (type === "category")
                            setSelectedCategories((p) =>
                              p.filter((x) => x !== value),
                            );

                          if (type === "type")
                            setSelectedTypes((p) =>
                              p.filter((x) => x !== value),
                            );

                          if (type === "label")
                            setSelectedLabels((p) =>
                              p.filter((l) => l.id !== value),
                            );
                          if (selectedAttributes[type]) {
                            handleAttributeChange(type, value);
                          }
                          if (type === "price") {
                            // setMinPrice(0);
                            // setMaxPrice(maxCatalogPrice);
                            // setDebouncedMinPrice(0);
                            setMinPrice(minCatalogPrice);
                            setMaxPrice(maxCatalogPrice);
                            setDebouncedMinPrice(minCatalogPrice);
                            setDebouncedMaxPrice(maxCatalogPrice);
                          }
                        }}
                      >
                        {filter.label}
                        <X className="w-4 h-4 ml-2 text-theme" />
                      </span>
                    ))}
                  </>
                ) : null}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[30px]">
                {trendingProducts.length > 0 &&
                  trendingProducts
                    .slice(0, 2)
                    .map((product) => (
                      <TrandingCard
                        key={product._id || product.id}
                        product={product}
                      />
                    ))}
              </div>
              <ProductGrid
                products={sortedProducts}
                loading={loading}
                setShowLoginPopup={setShowLoginPopup}
              />
            </main>
          </div>
        </Row>
      </Section>
      {showLoginPopup && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center px-4">
          <div className="relative bg-white w-full max-w-[1062px] rounded-md overflow-hidden">
            <LoginForm
              onClose={() => setShowLoginPopup(false)}
              onSwitch={() => setShowLoginPopup(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}

export {
  CollapsibleFilter,
  FilterItemCheckbox,
  SizeFilterItem,
  ColorFilterItem,
  PriceRangeFilter,
};
