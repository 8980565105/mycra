import React, { useState } from "react";
import { X } from "lucide-react";
import {
  CollapsibleFilter,
  FilterItemCheckbox,
  PriceRangeFilter,
} from "./WomenCollections";
import { useSelector } from "react-redux";
import { getGroupedTypes, getEnrichedAttributes } from "../utils/attribut";

const MobileFilterModal = ({
  isOpen,
  onClose,
  selectedCategories,
  handleCategoryChange,
  handleResetCategories,
  selectedTypes,
  handleTypeChange,
  handleResetTypes,
  selectedAttributes = {},
  handleAttributeChange,
  handleResetAttributes,
  selectedLabels,
  handleLabelChange,
  handleResetLabels,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  displayMin: propDisplayMin,
  displayMax: propDisplayMax,
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

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 lg:hidden transition-opacity duration-300"
        onClick={onClose}
      ></div>
      <div
        className={`
              fixed top-0 left-0 z-50 bg-white lg:hidden overflow-y-auto w-4/5 h-full max-w-md
              transition-transform duration-500 ease-in-out
              ${isOpen ? "translate-x-0" : "-translate-x-full"}
          `}
      >
        <div className="w-full h-full">
          <div className="sticky top-0 bg-white px-2 py-4 flex justify-start items-center z-10 border-b">
            <button
              onClick={onClose}
              className="flex items-center space-x-1 p-1 font-inter text-base sm:text-lg font-semibold text-black/70 hover:text-black gap-3"
            >
              <X className="w-5 h-5 text-black" />
              CLOSE
            </button>
          </div>

          <div className="space-y-4 py-[10px]">
            <CollapsibleFilter
              title="Categories"
              defaultOpen={true}
              isOpen={openFilter === "Category"}
              onToggle={() => toggleFilter("Category")}
              isSelected={selectedCategories.length > 0}
              showButtons={true}
              onCancelClick={handleResetCategories}
              onApplyClick={onClose}
            >
              <div className="space-y-1.5 h-[200px] overflow-y-auto hide-scrollbar text-sm font-inter">
                <div className="px-3 py-3">
                  {subcatLoading ? (
                    <p className="text-sm text-gray-500">
                      Loading categories...
                    </p>
                  ) : selectedCategories.length > 0 ? (
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
                            })}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 italic">No sub-items</p>
                        )}
                      </div>
                    </>
                  ) : subcategories.length > 0 ? (
                    subcategories.map((cat) => (
                      <FilterItemCheckbox
                        key={cat._id}
                        name={cat.name}
                        count={subCategoryCountsById[cat._id] || 0}
                        isChecked={selectedCategories.includes(cat.name)}
                        onChange={handleCategoryChange}
                      />
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">
                      No categories found.
                    </p>
                  )}
                </div>
              </div>
            </CollapsibleFilter>

            <PriceRangeFilter
              isOpen={openFilter === "Price"}
              onToggle={() => toggleFilter("Price")}
              minPrice={minPrice}
              maxPrice={maxPrice}
              setMinPrice={setMinPrice}
              setMaxPrice={setMaxPrice}
              displayMin={displayMin}
              displayMax={displayMax}
              isMobile={true}
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
              showButtons={true}
              onCancelClick={handleResetTypes}
              onApplyClick={onClose}
            >
              <div className="px-3 py-3 max-h-[160px] overflow-y-auto">
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
              <div className="px-3 py-2">
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
                    showButtons={true}
                    onCancelClick={() => handleResetAttributes(code)}
                    onApplyClick={onClose}
                  >
                    {isColorAttr ? (
                      <div className="grid grid-cols-5 px-3 py-3 gap-2">
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
                                  className={`w-[22px] h-[22px] rounded-full box-shadow ${isChecked ? "ring-2 ring-offset-1 ring-black" : ""
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
                      <div className="px-3 py-3 max-h-[160px] overflow-y-auto space-y-1">
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
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileFilterModal;
