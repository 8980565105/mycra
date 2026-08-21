import { useMemo, useState } from "react";
import {
  CollapsibleFilter,
  FilterItemCheckbox,
  PriceRangeFilter,
} from "./WomenCollections";
import { useSelector } from "react-redux";
import { getGroupedTypes, getEnrichedAttributes } from "../utils/attribut";

const DesktopFilters = ({
  selectedCategories = [],
  handleCategoryChange,
  handleResetCategories,
  selectedTypes = [],
  handleTypeChange,
  handleResetTypes,
  selectedAttributes = {},
  handleAttributeChange,
  handleResetAttributes,
  selectedLabels = [],
  handleLabelChange,
  handleResetLabels,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  displayMin: propDisplayMin,
  displayMax: propDisplayMax,
  isCategorySelected,
}) => {
  const [openFilter, setOpenFilter] = useState("Category");

  const toggleFilter = (filterId) => {
    setOpenFilter((prev) => (prev === filterId ? null : filterId));
  };

  const { items: subcategories = [], loading: subcatLoading } = useSelector(
    (state) => state.subcategories
  );
  const { products = [], priceMetadata = {} } = useSelector((state) => state.products);
  const displayMin = propDisplayMin !== undefined ? propDisplayMin : (priceMetadata.displayMin ?? 0);
  const displayMax = propDisplayMax !== undefined ? propDisplayMax : (priceMetadata.displayMax ?? 5000);
  const { types = [], loading: typesLoading } = useSelector(
    (state) => state.types
  );
  const { attributes = [], typeAttributes = [], loading: attrLoading } = useSelector(
    (state) => state.attributes
  );
  const displayAttributes =
    selectedTypes.length > 0 && typeAttributes.length > 0
      ? typeAttributes
      : attributes;
  const enrichedAttributes = getEnrichedAttributes(displayAttributes, products);
  const { productLabels = [], loading: labelsLoading } = useSelector(
    (state) => state.productLabels
  );

  const selectedCategoryName = selectedCategories.length > 0 ? selectedCategories[0].trim().toLowerCase() : "";
  const selectedCategoryObject = subcategories.find((cat) => cat.name?.trim().toLowerCase() === selectedCategoryName);
  const selectedCategoryId = selectedCategoryObject?._id ? String(selectedCategoryObject._id) : null;

  const getId = (value) => {
    if (!value) return null;

    if (typeof value === "object") {
      return String(value._id || value.id || "");
    }

    return String(value);
  };

  const categoryProducts = selectedCategoryName
    ? products.filter((product) => {
      const categoryId = getId(product.category_id);
      const subcategoryId = getId(product.subcategory_id);
      const childCategoryId = getId(product.child_category_id);

      const categoryName =
        typeof product.category_id === "object"
          ? product.category_id?.name?.trim().toLowerCase()
          : "";

      const subcategoryName =
        typeof product.subcategory_id === "object"
          ? product.subcategory_id?.name?.trim().toLowerCase()
          : "";

      const childCategoryName =
        typeof product.child_category_id === "object"
          ? product.child_category_id?.name?.trim().toLowerCase()
          : "";

      return (
        categoryId === selectedCategoryId ||
        subcategoryId === selectedCategoryId ||
        childCategoryId === selectedCategoryId ||
        categoryName === selectedCategoryName ||
        subcategoryName === selectedCategoryName ||
        childCategoryName === selectedCategoryName
      );
    })
    : products;

  const categoryTypeIds = new Set();
  const categoryTypeNames = new Set();

  categoryProducts.forEach((product) => {
    (product.variants || []).forEach((variant) => {
      const variantTypes =
        variant.type ||
        variant.types ||
        variant.type_id;

      if (!variantTypes) return;

      const typeArray = Array.isArray(variantTypes)
        ? variantTypes
        : [variantTypes];

      typeArray.forEach((type) => {
        if (!type) return;

        if (typeof type === "object") {
          const id = type._id || type.id;
          const name = type.name;

          if (id) { categoryTypeIds.add(String(id)); }

          if (name) { categoryTypeNames.add(String(name).trim().toLowerCase()); }
        } else {
          categoryTypeIds.add(String(type));

          categoryTypeNames.add(
            String(type).trim().toLowerCase()
          );
        }
      });
    });
  });

  const categoryFilteredTypes = selectedCategoryName
    ? types.filter((type) => {
      const typeId = String(
        type?._id || type?.id || ""
      );

      const typeName = String(type?.name || "")
        .trim()
        .toLowerCase();

      return (
        categoryTypeIds.has(typeId) ||
        categoryTypeNames.has(typeName)
      );
    })
    : types;

  const groupedTypes = getGroupedTypes(categoryFilteredTypes);
  const subCategoryCountsById = useMemo(() => {
    const counts = {};

    products.forEach((product) => {
      const categoryId = getId(product.category_id);

      if (!categoryId) return;

      counts[categoryId] = (counts[categoryId] || 0) + 1;
    });

    return counts;
  }, [products]);

  const typeCountsByName = useMemo(() => {
    const counts = {};

    categoryProducts.forEach((product) => {
      const productTypeNames = new Set();

      (product.variants || []).forEach((variant) => {
        const variantTypes =
          variant?.type ||
          variant?.types ||
          variant?.type_id;

        if (!variantTypes) return;

        const typeArray = Array.isArray(variantTypes)
          ? variantTypes
          : [variantTypes];

        typeArray.forEach((type) => {
          let typeName = "";

          if (typeof type === "object" && type !== null) {
            typeName = type?.name || "";
          } else {
            const foundType = types.find(
              (t) =>
                String(t?._id || t?.id) === String(type)
            );

            typeName = foundType?.name || String(type);
          }

          if (typeName) {
            productTypeNames.add(
              typeName.trim().toLowerCase()
            );
          }
        });
      });

      productTypeNames.forEach((typeName) => {
        counts[typeName] = (counts[typeName] || 0) + 1;
      });
    });

    return counts;
  }, [categoryProducts, types]);

  const labelCounts = Array.isArray(products)
    ? products.reduce((acc, product) => {
      const labelId = product.variants?.[0]?.labels?.[0];
      if (labelId) acc[labelId] = (acc[labelId] || 0) + 1;
      return acc;
    }, {})
    : {};

  return (
    <aside className="hidden lg:block lg:w-1/4 h-[100%] box-shadow px-4 py-5 rounded-[20px]">
      <div className="p-4">
        <h2 className="text-20px font-medium text-black lowercase">
          Filter Products
        </h2>
      </div>

      <CollapsibleFilter
        title="Categories"
        defaultOpen={true}
        isOpen={openFilter === "Category"}
        onToggle={() => toggleFilter("Category")}
        isSelected={selectedCategories.length > 0}
        onReset={() => {
          handleResetCategories();
        }}
        showButtons={true}
      >
        <div className="space-y-1.5 px-3 py-3 max-h-[260px] overflow-y-auto hide-scrollbar text-sm font-inter">
          {subcatLoading ? (
            <p className="text-sm text-gray-500">Loading categories...</p>
          ) : (
            <>
              {selectedCategories.length > 0 ? (
                <>
                  <div className="flex items-center gap-1 mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <span
                      className="cursor-pointer hover:text-black hover:underline flex items-center gap-1 text-[var(--primary-color)]"
                      onClick={handleResetCategories}
                    >
                      ‹ Categories
                    </span>
                  </div>
                  <div className="pl-2 border-l-2 border-[var(--primary-color)] space-y-2">
                    <p className="font-semibold text-black text-sm mb-1">
                      {selectedCategories[0]}
                    </p>
                    {groupedTypes.length > 0 ? (
                      <div className="pl-2 space-y-1">
                        <p className="text-xs font-bold text-gray-400 uppercase mt-2 mb-1">Product Types</p>
                        {groupedTypes.map((gt) => {
                          const name = gt.displayName;
                          const count = typeCountsByName[name.trim().toLowerCase()] || 0;
                          return (
                            <FilterItemCheckbox
                              key={name}
                              name={name}
                              count={count}
                              isChecked={selectedTypes.includes(name)}
                              onChange={() => handleTypeChange(name, gt.typeIds)}
                            />
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">No sub-items</p>
                    )}
                  </div>
                </>
              ) : (
                subcategories
                  .filter((cat) => cat.parent_id !== null)
                  .map((cat) => (
                    <FilterItemCheckbox
                      key={cat._id}
                      name={cat.name}
                      count={subCategoryCountsById[cat._id] || 0}
                      isChecked={selectedCategories.includes(cat.name)}
                      onChange={handleCategoryChange}
                    />
                  ))
              )}
            </>
          )}
        </div>
      </CollapsibleFilter>

      <PriceRangeFilter
        title="Price"
        minPrice={minPrice}
        maxPrice={maxPrice}
        setMinPrice={setMinPrice}
        setMaxPrice={setMaxPrice}
        displayMin={displayMin}
        displayMax={displayMax}
        isMobile={false}
        isOpen={openFilter === "Price"}
        onToggle={() => toggleFilter("Price")}
        onReset={() => {
          setMinPrice(displayMin);
          setMaxPrice(displayMax);
        }}
      />

      <CollapsibleFilter
        title="Type"
        isOpen={openFilter === "Type"}
        onToggle={() => toggleFilter("Type")}
        isSelected={selectedTypes.length > 0}
        onReset={handleResetTypes}
        showButtons={true}
      >
        <div className="space-y-1 overflow-y-auto px-3 py-3 max-h-[180px]">
          {typesLoading ? (
            <p className="text-sm text-gray-500">Loading types...</p>
          ) : groupedTypes.length > 0 ? (
            groupedTypes.map((gt) => {
              const name = gt.displayName;
              const count = typeCountsByName[name.toLowerCase()] || 0;
              return (
                <FilterItemCheckbox
                  key={name}
                  name={name}
                  count={count}
                  isChecked={selectedTypes.includes(name)}
                  onChange={() => handleTypeChange(name, gt.typeIds)}
                />
              );
            })
          ) : (
            <p className="text-sm text-gray-500">No types found.</p>
          )}
        </div>
      </CollapsibleFilter>

      {attrLoading ? (
        <div className="p-4">
          <p className="text-sm text-gray-500">Loading attributes...</p>
        </div>
      ) : (
        enrichedAttributes.map((attr) => {
          const code = attr.code || attr.name.toLowerCase();
          const selectedVals = selectedAttributes[code] || [];
          const isColorAttr = code === "color" || attr.name.toLowerCase() === "color";
          const valuesArray = Array.isArray(attr.values) ? attr.values : [];

          return (
            <CollapsibleFilter
              key={attr._id || attr.name}
              title={attr.name}
              isOpen={openFilter === attr.name}
              onToggle={() => toggleFilter(attr.name)}
              isSelected={selectedVals.length > 0}
              onReset={() => handleResetAttributes(code)}
              showButtons={true}
            >
              {isColorAttr ? (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-y-[15px] gap-x-[10px] px-3 py-3">
                  {valuesArray.length > 0 ? (
                    valuesArray.map((valObj, idx) => {
                      const valName =
                        typeof valObj === "object" && valObj !== null
                          ? valObj.value || valObj.name || valObj.val || ""
                          : String(valObj || "");
                      const valId =
                        typeof valObj === "object" && valObj !== null
                          ? valObj._id || valObj.id || valName
                          : valName;
                      const hex =
                        typeof valObj === "object" && valObj !== null
                          ? valObj.colorHex || valObj.hex || "#000000"
                          : "#000000";
                      const isChecked =
                        selectedVals.includes(valName) ||
                        selectedVals.includes(valId);

                      return (
                        <div
                          key={valId || idx}
                          className="flex flex-col items-center cursor-pointer"
                          onClick={() => handleAttributeChange(code, valName)}
                        >
                          <div
                            className={`w-[22px] h-[22px] rounded-full box-shadow  ${isChecked ? "border-2 border-black scale-110" : ""
                              } transition-transform duration-200`}
                            style={{ backgroundColor: hex }}
                          />
                          <p className="text-[10px] sec-text-color mt-1 text-center truncate max-w-[45px]">
                            {valName}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-500 col-span-full">
                      No colors found.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-1 overflow-y-auto px-3 py-3 max-h-[160px]">
                  {valuesArray.length > 0 ? (
                    valuesArray.map((valObj, idx) => {
                      const valName =
                        typeof valObj === "object" && valObj !== null
                          ? valObj.value || valObj.name || valObj.val || ""
                          : String(valObj || "");
                      const valId =
                        typeof valObj === "object" && valObj !== null
                          ? valObj._id || valObj.id || valName
                          : valName;
                      const isChecked =
                        selectedVals.includes(valName) ||
                        selectedVals.includes(valId);

                      return (
                        <FilterItemCheckbox
                          key={valId || idx}
                          name={valName}
                          isChecked={isChecked}
                          onChange={() => handleAttributeChange(code, valName)}
                        />
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-500">No options found.</p>
                  )}
                </div>
              )}
            </CollapsibleFilter>
          );
        })
      )}
    </aside>
  );
};

export default DesktopFilters;
