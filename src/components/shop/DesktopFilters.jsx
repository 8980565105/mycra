import React, { useState } from "react";
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
  const { displayMin, displayMax } = priceMetadata;
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

  const groupedTypes = getGroupedTypes(types);

  const subCategoryCountsById = Array.isArray(products)
    ? products.reduce((acc, product) => {
        const catId = product.category_id;
        if (catId) acc[catId] = (acc[catId] || 0) + 1;
        return acc;
      }, {})
    : {};

  const typeCountsByName = Array.isArray(products)
    ? products.reduce((acc, product) => {
        const tName = product.variants?.[0]?.type?.[0]?.name?.trim();
        if (tName) {
          const lower = tName.toLowerCase();
          acc[lower] = (acc[lower] || 0) + 1;
        }
        return acc;
      }, {})
    : {};

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
        title="Category"
        defaultOpen={true}
        isOpen={openFilter === "Category"}
        onToggle={() => toggleFilter("Category")}
        isSelected={isCategorySelected}
        onReset={handleResetCategories}
        showButtons={true}
      >
        <div className="space-y-1 px-3 py-3 h-[200px] overflow-y-auto hide-scrollbar">
          {subcatLoading ? (
            <p className="text-sm text-gray-500">Loading subcategories...</p>
          ) : subcategories.length > 0 ? (
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
          ) : (
            <p className="text-sm text-gray-500">No categories found.</p>
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
                            className={`w-[22px] h-[22px] rounded-full box-shadow ${
                              isChecked ? "ring-2 ring-offset-1 ring-black" : ""
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

      {/* <CollapsibleFilter
        title="Product Label"
        isOpen={openFilter === "Product Label"}
        onToggle={() => toggleFilter("Product Label")}
        isSelected={selectedLabels.length > 0}
        onReset={handleResetLabels}
        showButtons={true}
      >
        <div className="space-y-1 overflow-y-auto px-3 py-3">
          {labelsLoading ? (
            <p className="text-sm text-gray-500">Loading labels...</p>
          ) : productLabels.length > 0 ? (
            productLabels.map((label) => (
              <FilterItemCheckbox
                key={label._id}
                name={label.name}
                count={labelCounts[label._id] || 0}
                isChecked={selectedLabels.some((l) => l.id === label._id)}
                onChange={() => handleLabelChange(label._id, label.name)}
              />
            ))
          ) : (
            <p className="text-sm text-gray-500">No product labels found.</p>
          )}
        </div>
      </CollapsibleFilter> */}
    </aside>
  );
};

export default DesktopFilters;
