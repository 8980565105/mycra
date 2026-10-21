// import { useMemo, useState } from "react";
// import {
//   CollapsibleFilter,
//   FilterItemCheckbox,
//   PriceRangeFilter,
// } from "./WomenCollections";
// import { useSelector } from "react-redux";
// import { getGroupedTypes, getEnrichedAttributes, getGroupedBrands, productMatchesSelectedTypes, normalizeFilterValue } from "../utils/attribut";

// const DesktopFilters = ({
//   selectedCategories = [],
//   handleCategoryChange,
//   handleResetCategories,
//   selectedTypes = [],
//   handleTypeChange,
//   handleResetTypes,
//   selectedBrands = [],
//   handleBrandChange,
//   handleResetBrands,
//   selectedAttributes = {},
//   handleAttributeChange,
//   handleResetAttributes,
//   selectedLabels = [],
//   handleLabelChange,
//   handleResetLabels,
//   minPrice,
//   setMinPrice,
//   maxPrice,
//   setMaxPrice,
//   displayMin: propDisplayMin,
//   displayMax: propDisplayMax,
//   isCategorySelected,
// }) => {
//   const [openFilter, setOpenFilter] = useState("Category");

//   const toggleFilter = (filterId) => {
//     setOpenFilter( (prev) => prev === filterId ? null : filterId);
//   };

//   const { items: subcategories = [], loading: subcatLoading } = useSelector(
//     (state) => state.subcategories
//   );
//   const { products = [], priceMetadata = {} } = useSelector((state) => state.products);
//   const { types = [], loading: typesLoading } = useSelector(
//     (state) => state.types
//   );
//   const { brands = [], loading: brandLoading = false } = useSelector(
//     (state) => state.brands
//   );
//   const { attributes = [], typeAttributes = [], loading: attrLoading } = useSelector(
//     (state) => state.attributes
//   );
//   const { productLabels = [], loading: labelsLoading } = useSelector(
//     (state) => state.productLabels
//   );

//   const displayMin = propDisplayMin !== undefined ? propDisplayMin : (priceMetadata.displayMin ?? 0);
//   const displayMax = propDisplayMax !== undefined ? propDisplayMax : (priceMetadata.displayMax ?? 5000);
//   const selectedCategoryValue = selectedCategories.length > 0 ? String(selectedCategories[0]).trim() : "";
//   const selectedCategoryName = selectedCategoryValue.toLowerCase();

//   const getId = (value) => {
//     if (!value) return "";

//     if (typeof value === "object") {
//       return String(value._id || value.id || "");
//     }

//     return String(value);
//   };
//   const getName = (value) => {
//     if (!value) return "";

//     if (typeof value === "object") {
//       return String(
//         value.name ||
//           value.title ||
//           value.label ||
//           ""
//       )
//         .trim()
//         .toLowerCase();
//     }

//     return "";
//   };
//   const getTypeName = (typeValue) => {
//     if (!typeValue) return "";
//     if (
//       typeof typeValue === "object" && typeValue !== null
//     ) {
//       return String(typeValue.name || typeValue.title || typeValue.label || "").trim().toLowerCase();
//     }

//     const foundType = types.find((type) =>
//           String(
//             type?._id ||
//               type?.id ||
//               ""
//           ) ===
//           String(typeValue)
//       );

//     return String(
//       foundType?.name || ""
//     )
//       .trim()
//       .toLowerCase();
//   };

//   const categoryProducts = selectedCategoryName
//     ? products.filter((product) => {
//       const categoryNames = [
//         getName(product?.mainCategory_id),
//         getName(product?.mainCategory),
//         getName(product?.category_id),
//         getName(product?.category),
//         getName(product?.subcategory_id),
//         getName(product?.subcategory),
//         getName(product?.child_category_id),
//         getName(product?.childCategory),
//       ].filter(Boolean);

//       return categoryNames.includes(selectedCategoryName);
//     })
//     : products;

//   const categoryTypeIds = new Set();
//   const categoryTypeNames = new Set();

//   categoryProducts.forEach((product) => {
//     (product.variants || []).forEach((variant) => {
//       const variantTypes =
//         variant.type ||
//         variant.types ||
//         variant.type_id;

//       if (!variantTypes) return;

//       const typeArray = Array.isArray(variantTypes)
//         ? variantTypes
//         : [variantTypes];

//       typeArray.forEach((typeValue) => {
//         if (!typeValue) return;

//         if (typeof typeValue === "object" && typeValue !== null) {
//           const id = typeValue._id || typeValue.id;
//           const name = typeValue.name || typeValue.title || typeValue.label;

//           if (id) { categoryTypeIds.add(String(id)); }

//           if (name) { categoryTypeNames.add(String(name).trim().toLowerCase()); }
//           return;
//         }

//         const typeId = String(typeValue);
//         categoryTypeIds.add(typeId);
//         const foundType = types.find((type) => String(
//                 type?._id ||
//                   type?.id ||
//                   ""
//               ) === typeId
//           );

//         if (foundType?.name) {
//           categoryTypeNames.add(
//             String(foundType.name).trim().toLowerCase()
//           );
//         }
//       });
//     });
//   });

//   const categoryFilteredTypes = selectedCategoryName
//     ? types.filter((type) => {
//       const typeId = String(
//         type?._id || type?.id || ""
//       );

//       const typeName = String(type?.name || "")
//         .trim()
//         .toLowerCase();

//       return (
//         categoryTypeIds.has(typeId) ||
//         categoryTypeNames.has(typeName)
//       );
//     })
//     : types;

//   const groupedTypes = getGroupedTypes(categoryFilteredTypes);
  // const subCategoryCountsById = useMemo(() => {
  //   const counts = {};

  //   products.forEach((product) => {
  //     const categoryId = getId(product.category_id);

  //     if (!categoryId) return;

  //     counts[categoryId] = (counts[categoryId] || 0) + 1;
  //     });

  //   return counts;
  // }, [products]);

//   const typeCountsByName = useMemo(() => {
//     const counts = {};

//     categoryProducts.forEach(
//       (product) => {
//         const productTypeNames = new Set();

//         (product?.variants || []).forEach((variant) => {
//           const variantTypes =
//             variant?.type ||
//             variant?.types ||
//             variant?.type_id;

//           if (!variantTypes)
//             return;

//           const typeArray = Array.isArray(variantTypes) ? variantTypes : [variantTypes];

//           typeArray.forEach((typeValue) => {
//             const typeName = getTypeName(typeValue);

//             if (typeName) {
//               productTypeNames.add(typeName);
//             }
//           });
//         });

//         productTypeNames.forEach((typeName) => {
//           counts[typeName] = (counts[typeName] || 0) + 1;
//         });
//       }
//     );

//     return counts;
//   }, [categoryProducts, types]);

//   const typeFilteredProducts = useMemo(() =>
//     categoryProducts.filter((product) =>
//       productMatchesSelectedTypes(product, selectedTypes, types)
//     ),
//     [categoryProducts, selectedTypes, types]
//   );

//   const groupedBrands = useMemo(
//     () => getGroupedBrands(typeFilteredProducts, brands, selectedTypes, types),
//     [typeFilteredProducts, brands, selectedTypes, types]
//   );

//   const labelCounts =
//     Array.isArray(products)
//       ? products.reduce(
//           (acc, product) => {
//             const labelId = product?.variants?.[0] ?.labels?.[0];

//             if (labelId) {
//               acc[labelId] = (acc[labelId] || 0) + 1;
//             }

//             return acc;
//           },
//           {}
//         )
//       : {};
//   const displayAttributes = selectedTypes.length > 0 &&
//     typeAttributes.length > 0
//       ? typeAttributes
//       : attributes;

//   const enrichedAttributes =
//     getEnrichedAttributes(
//       displayAttributes,
//       products
//     ); 
//   return (
//     <aside className="hidden lg:block lg:w-1/4 h-[100%] box-shadow px-4 py-5 rounded-[20px]">
//       <div className="p-4">
//         <h2 className="text-20px font-medium text-black lowercase">
//           Filter Products
//         </h2>
//       </div>

//       <CollapsibleFilter
//         title="Categories"
//         defaultOpen={true}
//         isOpen={openFilter === "Category"}
//         onToggle={() => toggleFilter("Category")}
//         isSelected={selectedCategories.length > 0}
//         onReset={() => {
//           handleResetCategories();
//         }}
//         showButtons={true}
//       >
//         <div className="space-y-1.5 px-3 py-3 max-h-[260px] overflow-y-auto hide-scrollbar text-sm font-inter">
//           {subcatLoading ? (
//             <p className="text-sm text-gray-500">Loading categories...</p>
//           ) : (
//             <>
//               {selectedCategories.length > 0 ? (
//                 <>
//                   <div className="flex items-center gap-1 mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
//                     <span
//                       className="cursor-pointer hover:text-black hover:underline flex items-center gap-1 text-[var(--primary-color)]"
//                       onClick={handleResetCategories}
//                     >
//                       ‹ Categories
//                     </span>
//                   </div>
//                   <div className="pl-2 border-l-2 border-[var(--primary-color)] space-y-2">
//                     <p className="font-semibold text-black text-sm mb-1">
//                       {selectedCategories[0]}
//                     </p>
//                     {groupedTypes.length > 0 ? (
//                       <div className="pl-2 space-y-1">
//                         <p className="text-xs font-bold text-gray-400 uppercase mt-2 mb-1">Product Types</p>
//                         {groupedTypes.map((gt) => {
//                           const name = gt.displayName;
//                           const count = typeCountsByName[name.trim().toLowerCase()] || 0;
//                           return (
//                             <FilterItemCheckbox
//                               key={name}
//                               name={name}
//                               count={count}
//                               isChecked={selectedTypes.includes(name)}
//                               onChange={() => handleTypeChange(name, gt.typeIds)}
//                             />
//                           );
//                         })}
//                       </div>
//                     ) : (
//                       <p className="text-xs text-gray-400 italic">No sub-items</p>
//                     )}
//                   </div>
//                 </>
//               ) : (
//                 subcategories
//                   .filter((cat) => cat.parent_id !== null)
//                   .map((cat) => (
//                     <FilterItemCheckbox
//                       key={cat._id}
//                       name={cat.name}
//                       count={subCategoryCountsById[cat._id] || 0}
//                       isChecked={selectedCategories.includes(cat.name)}
//                       onChange={handleCategoryChange}
//                     />
//                   ))
//               )}
//             </>
//           )}
//         </div>
//       </CollapsibleFilter>

//       <PriceRangeFilter
//         title="Price"
//         minPrice={minPrice}
//         maxPrice={maxPrice}
//         setMinPrice={setMinPrice}
//         setMaxPrice={setMaxPrice}
//         displayMin={displayMin}
//         displayMax={displayMax}
//         isMobile={false}
//         isOpen={openFilter === "Price"}
//         onToggle={() => toggleFilter("Price")}
//         onReset={() => {
//           setMinPrice(displayMin);
//           setMaxPrice(displayMax);
//         }}
//       />

//       <CollapsibleFilter
//         title="Type"
//         isOpen={openFilter === "Type"}
//         onToggle={() => toggleFilter("Type")}
//         isSelected={selectedTypes.length > 0}
//         onReset={handleResetTypes}
//         showButtons={true}
//       >
//         <div className="space-y-1 overflow-y-auto px-3 py-3 max-h-[180px]">
//           {typesLoading ? (
//             <p className="text-sm text-gray-500">Loading types...</p>
//           ) : groupedTypes.length > 0 ? (
//             groupedTypes.map((gt) => {
//               const name = gt.displayName;
//               const count = typeCountsByName[name.trim().toLowerCase()] || 0;
//               return (
//                 <FilterItemCheckbox
//                   key={name}
//                   name={name}
//                   count={count}
//                   isChecked={selectedTypes.includes(name)}
//                   onChange={() => handleTypeChange(name, gt.typeIds)}
//                 />
//               );
//             })
//           ) : (
//             <p className="text-sm text-gray-500">No types found.</p>
//           )}
//         </div>
//       </CollapsibleFilter>

//       <CollapsibleFilter
//         title="Brand"
//         isOpen={openFilter === "Brand"}
//         onToggle={() => toggleFilter("Brand")}
//         isSelected={selectedBrands.length > 0}
//         onReset={handleResetBrands}
//         showButtons={true}
//       >
        // <div className="space-y-2">
        //   {brandLoading ? (
        //       <p className="text-sm text-gray-500">Loading brands...</p>
        //     ) : groupedBrands.length > 0 ? (
        //       groupedBrands.map((brand) => (
        //         <FilterItemCheckbox
        //           key={brand.key}
        //           name={brand.displayName}
        //           count={brand.count}
        //           isChecked={selectedBrands.some(
        //             (selected) =>
        //               normalizeFilterValue(selected) === brand.key
        //           )}
        //           onChange={() => handleBrandChange(brand.displayName)}
        //         />
        //       ))
        //     ) : (
        //     <p className="text-sm text-gray-500">
        //       No brands available for this type.
        //     </p>
        //   )}
        // </div>
//       </CollapsibleFilter>

//       {attrLoading ? (
//         <div className="p-4">
//           <p className="text-sm text-gray-500">Loading attributes...</p>
//         </div>
//       ) : (
//         enrichedAttributes.map((attr) => {
//           const code = attr.code || attr.name.toLowerCase();
//           const selectedVals = selectedAttributes[code] || [];
//           const isColorAttr = code === "color" || attr.name.toLowerCase() === "color";
//           const valuesArray = Array.isArray(attr.values) ? attr.values : [];

//           return (
            // <CollapsibleFilter
            //   key={attr._id || attr.name}
            //   title={attr.name}
            //   isOpen={openFilter === attr.name}
            //   onToggle={() => toggleFilter(attr.name)}
            //   isSelected={selectedVals.length > 0}
            //   onReset={() => handleResetAttributes(code)}
            //   showButtons={true}
            // >
            //   {isColorAttr ? (
            //     <div className="grid grid-cols-3 sm:grid-cols-5 gap-y-[15px] gap-x-[10px] px-3 py-3">
            //       {valuesArray.length > 0 ? (
            //         valuesArray.map((valObj, idx) => {
            //           const valName =
            //             typeof valObj === "object" && valObj !== null
            //               ? valObj.value || valObj.name || valObj.val || ""
            //               : String(valObj || "");
            //           const valId =
            //             typeof valObj === "object" && valObj !== null
            //               ? valObj._id || valObj.id || valName
            //               : valName;
            //           const hex =
            //             typeof valObj === "object" && valObj !== null
            //               ? valObj.colorHex || valObj.hex || "#000000"
            //               : "#000000";
            //           const isChecked =
            //             selectedVals.includes(valName) ||
            //             selectedVals.includes(valId);

            //           return (
            //             <div
            //               key={valId || idx}
            //               className="flex flex-col items-center cursor-pointer"
            //               onClick={() => handleAttributeChange(code, valName)}
            //             >
            //               <div
            //                 className={`w-[22px] h-[22px] rounded-full box-shadow  ${isChecked ? "border-2 border-black scale-110" : ""
            //                   } transition-transform duration-200`}
            //                 style={{ backgroundColor: hex }}
            //               />
            //               <p className="text-[10px] sec-text-color mt-1 text-center truncate max-w-[45px]">
            //                 {valName}
            //               </p>
            //             </div>
            //           );
            //         })
            //       ) : (
            //         <p className="text-sm text-gray-500 col-span-full">
            //           No colors found.
            //         </p>
            //       )}
            //     </div>
            //   ) : (
            //     <div className="space-y-1 overflow-y-auto px-3 py-3 max-h-[160px]">
            //       {valuesArray.length > 0 ? (
            //         valuesArray.map((valObj, idx) => {
            //           const valName =
            //             typeof valObj === "object" && valObj !== null
            //               ? valObj.value || valObj.name || valObj.val || ""
            //               : String(valObj || "");
            //           const valId =
            //             typeof valObj === "object" && valObj !== null
            //               ? valObj._id || valObj.id || valName
            //               : valName;
            //           const isChecked =
            //             selectedVals.includes(valName) ||
            //             selectedVals.includes(valId);

            //           return (
            //             <FilterItemCheckbox
            //               key={valId || idx}
            //               name={valName}
            //               isChecked={isChecked}
            //               onChange={() => handleAttributeChange(code, valName)}
            //             />
            //           );
            //         })
            //       ) : (
            //         <p className="text-sm text-gray-500">No options found.</p>
            //       )}
            //     </div>
            //   )}
            // </CollapsibleFilter>
//           );
//         })
//       )}
//     </aside>
//   );
// };

// export default DesktopFilters;



import { useMemo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  CollapsibleFilter,
  FilterItemCheckbox,
  PriceRangeFilter,
} from "./WomenCollections";
import { getGroupedTypes, getEnrichedAttributes, getGroupedBrands, productMatchesSelectedTypes, normalizeFilterValue } from "../utils/attribut";

const DesktopFilters = ({
  selectedCategories = [],
  handleCategoryChange,
  handleResetCategories,
  selectedChildCategories = [],
  handleChildCategoryChange,
  selectedTypes = [],
  handleTypeChange,
  handleResetTypes,
  selectedBrands = [],
  handleBrandChange,
  handleResetBrands,
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
  // const [selectedChildCategory, setSelectedChildCategory] = useState(null);

  const { items: subcategories = [], loading: subcatLoading } = useSelector(
    (state) => state.subcategories
  );
  const { items: allChildCategories = [], loading: childCategoriesLoading = false, error: childCategoriesError = null, } = useSelector((state) => state.childcategory || {});
  const { products = [], priceMetadata = {} } = useSelector((state) => state.products);
  const { types = [], loading: typesLoading } = useSelector(
    (state) => state.types
  );
  const { brands = [], loading: brandLoading = false } = useSelector(
    (state) => state.brands
  );
  const { attributes = [], typeAttributes = [], loading: attrLoading } = useSelector(
    (state) => state.attributes
  );
  const { productLabels = [], loading: labelsLoading } = useSelector(
    (state) => state.productLabels
  );

  const displayMin = propDisplayMin !== undefined ? propDisplayMin : (priceMetadata.displayMin ?? 0);
  const displayMax = propDisplayMax !== undefined ? propDisplayMax : (priceMetadata.displayMax ?? 5000);
  const selectedCategoryValue = selectedCategories.length > 0 ? String(selectedCategories[0]).trim() : "";
  const selectedCategoryName = selectedCategoryValue.toLowerCase();
  const toggleFilter = (id) => {
    setOpenFilter((previous) => (previous === id ? null : id));
  };
  const getId = (value) => {
    if (value == null || value === "") return "";

    if (typeof value === "object") {
      return String(
        value._id ?? value.id ?? value.value ?? ""
      );
    }

    return String(value);
  };
  const getName = (value) => {
    if (!value) return "";

    if (typeof value === "object") {
      return String(
        value.name ?? value.title ?? value.label ?? ""
      ).trim().toLowerCase();
    }

    return "";
  };

  const normalize = (value) =>
    String(value ?? "").trim().toLowerCase();

  const selectedSubCategory = useMemo(() =>
      subcategories.find(
        (category) =>
          normalize(category.name) === selectedCategoryName ||
          getId(category) === selectedCategoryValue
      ),
    [subcategories, selectedCategoryName, selectedCategoryValue]
  );

  const selectedSubCategoryId = getId(selectedSubCategory);

  const getSubCategoryId = (child) =>
    getId(
      child?.subCategoryId ??
      child?.sub_category_id ??
      child?.subcategory_id ??
      child?.parent_id ??
      child?.parentId
    );


  const childCategoriesForSelectedSubCategory = useMemo(() => {
    if (!selectedSubCategoryId) return [];

    return allChildCategories.filter(
      (child) =>
        getSubCategoryId(child) === selectedSubCategoryId
    );
  }, [allChildCategories, selectedSubCategoryId]);

    
  
  const selectedChildCategory = useMemo(() => {
    if (!Array.isArray(selectedChildCategories) ||
        selectedChildCategories.length === 0) {
      return null;
    }

    const selectedValue = selectedChildCategories[0];
    const selectedId = getId(selectedValue);
    const selectedName =
      typeof selectedValue === "string"
        ? normalize(selectedValue)
        : normalize(selectedValue?.name ?? selectedValue?.title ?? "");

    // Search all child categories first using the selected ID.
    const foundChild = allChildCategories.find((child) => {
      const childId = getId(child);
      const childName = normalize(child.name);

      return (
        (selectedId && childId === selectedId) ||
        (selectedName && childName === selectedName)
      );
    });

    // Return the selected record even if the parent filter
    // did not match because of a different parent-field name.
    return (
      foundChild ||
      childCategoriesForSelectedSubCategory.find(
        (child) =>
          getId(child) === selectedId ||
          normalize(child.name) === selectedName
      ) ||
      null
    );
  }, [
    selectedChildCategories,
    allChildCategories,
    childCategoriesForSelectedSubCategory,
  ]);
  
  const selectedChildId = getId(selectedChildCategory);
  const selectedChildName = normalize(selectedChildCategory?.name);
  
  const productMatchesSubCategory = (product) => {
    if (!selectedSubCategory) return true;

    const childIds = new Set(
      childCategoriesForSelectedSubCategory.map((child) => getId(child))
    );

    const childNames = new Set(
      childCategoriesForSelectedSubCategory
        .map((child) => normalize(child.name))
        .filter(Boolean)
    );

    const categoryValues = [
      product?.subcategory_id,
      product?.subcategory,
      product?.subCategoryId,
      product?.sub_category_id,
      product?.category_id,
      product?.category,
      product?.mainCategory_id,
      product?.mainCategory,
      product?.child_category_id,
      product?.childCategoryId,
      product?.childCategory,
      product?.child_category,
    ];

    return categoryValues.some((value) => {
      if (value == null || value === "") return false;

      const id = getId(value);
      const name = getName(value);
      const stringValue =
        typeof value === "string" ? normalize(value) : "";

      return (
        id === selectedSubCategoryId ||
        name === selectedCategoryName ||
        stringValue === selectedCategoryName ||
        childIds.has(id) ||
        childNames.has(name) ||
        childNames.has(stringValue)
      );
    });
  };

  const categoryProducts = useMemo(
    () => products.filter(productMatchesSubCategory),
 [
      products,
      selectedSubCategory,
      selectedSubCategoryId,
      selectedCategoryName,
      allChildCategories,
    ]
  );

  const productMatchesChildCategory = (product, child) => {
    const childId = getId(child);
    const childName = normalize(child?.name);

    const values = [
      product?.child_category_id,
      product?.childCategoryId,
      product?.childCategory_id,
      product?.child_category,
      product?.childCategory,
      product?.child_categoryId,
      product?.childcategory_id,
      product?.childcategory,
      product?.category_id,
      product?.category,
      product?.subcategory_id,
      product?.subcategory,
      product?.subCategoryId,
      product?.sub_category_id,
      product?.mainCategory_id,
      product?.mainCategory,
    ];

    // Some APIs store category information inside variants.
    (product?.variants || []).forEach((variant) => {
      values.push(
        variant?.child_category_id,
        variant?.childCategoryId,
        variant?.childCategory,
        variant?.category_id,
        variant?.category,
        variant?.subcategory_id
      );
    });

    return values.some((value) => {
      if (value == null || value === "") return false;

      const id = getId(value);
      const name = getName(value);
      const textValue =
        typeof value === "string" ? normalize(value) : "";

      return (
        (!!childId && id === childId) ||
        (!!childName && name === childName) ||
        (!!childName && textValue === childName)
      );
    });
  };

  const childCategoryProducts = useMemo(() => {
    if (!selectedChildCategory) return categoryProducts;

    return categoryProducts.filter((product) =>
      productMatchesChildCategory(product, selectedChildCategory)
    );
  }, [ categoryProducts, selectedChildCategory, selectedChildId, selectedChildName ]);  

  const getVariantTypes = (product) => {
    const result = [];

    const addType = (value) => {
      if (value == null || value === "") return;

      if (Array.isArray(value)) {
        value.forEach(addType);
        return;
      }

      // Handle populated type objects and ID values.
      result.push(value);
    };

    addType(product?.type);
    addType(product?.types);
    addType(product?.type_id);
    addType(product?.typeId);
    addType(product?.productType);
    addType(product?.product_type);
    addType(product?.productTypeId);

    (Array.isArray(product?.variants) ? product.variants : []).forEach(
      (variant) => {
        addType(variant?.type);
        addType(variant?.types);
        addType(variant?.type_id);
        addType(variant?.typeId);
        addType(variant?.productType);
        addType(variant?.product_type);
        addType(variant?.productTypeId);
      }
    );

    return result;
  };

  const getTypeName = (value) => {
    if (value && typeof value === "object") {
      const name =
        value.name ??
        value.title ??
        value.label ??
        value.displayName;

      if (name) return normalize(name);

      // Resolve an ID-only type object against the types API.
      const id = getId(value);
      const found = types.find((type) => getId(type) === id);

      return normalize(found?.name);
    }

    const found = types.find(
      (type) => getId(type) === String(value)
    );

    // A raw string might already be a type name rather than an ID.
    return normalize(found?.name || value);
  };

  const visibleTypes = useMemo(() => {
    const scopedProducts = selectedChildCategory
      ? childCategoryProducts
      : selectedSubCategory
        ? categoryProducts
        : products;

    if (!selectedSubCategory && !selectedChildCategory) {
      return types;
    }

    const availableIds = new Set();
    const availableNames = new Set();

    scopedProducts.forEach((product) => {
      getVariantTypes(product).forEach((value) => {
        const id = getId(value);
        const name = getTypeName(value);

        if (id) availableIds.add(id);
        if (name) availableNames.add(name);
      });
    });

    return types.filter((type) => {
      const id = getId(type);
      const name = normalize(type?.name);

      return (
        (id && availableIds.has(id)) ||
        (name && availableNames.has(name))
      );
    });
  }, [products, types, categoryProducts, childCategoryProducts, selectedSubCategory, selectedChildCategory ]);

  const groupedTypes = useMemo(() => 
    getGroupedTypes(visibleTypes),
    [visibleTypes]
  );

  const typeCountsByName = useMemo(() => {
    const counts = {};

    const scopedProducts = selectedChildCategory
      ? childCategoryProducts : selectedSubCategory
        ? categoryProducts : products;

    scopedProducts.forEach((product) => {
      const names = new Set(
        getVariantTypes(product)
          .map(getTypeName)
          .filter(Boolean)
      );

      names.forEach((name) => {
        counts[name] = (counts[name] || 0) + 1;
      });
    });

    return counts;
  }, [ products, categoryProducts, childCategoryProducts, selectedSubCategory, selectedChildCategory, types ]);

  const subCategoryCountsById = useMemo(() => {
    const counts = {};

    products.forEach((product) => {
      const id = getId(product?.category_id);
      if (id) counts[id] = (counts[id] || 0) + 1;
    });

    return counts;
  }, [products]);

  const childCategoryCountsById = useMemo(() => {
    const counts = {};

    products.forEach((product) => {
      const id = getId(product?.childCategory_id);
      if (id) counts[id] = (counts[id] || 0) + 1;
    });

    return counts;
  }, [products]);

  const typeFilteredProducts = useMemo(() =>
    childCategoryProducts.filter((product) =>
      productMatchesSelectedTypes(product, selectedTypes, types)
    ),
    [childCategoryProducts, selectedTypes, types]
  );

  const groupedBrands = useMemo(
    () => getGroupedBrands(typeFilteredProducts, brands, selectedTypes, types),
    [typeFilteredProducts, brands, selectedTypes, types]
  );

  const displayAttributes =
    selectedTypes.length > 0 && typeAttributes.length > 0
      ? typeAttributes
      : attributes;

  const enrichedAttributes = useMemo(
    () => getEnrichedAttributes(displayAttributes, childCategoryProducts),
    [displayAttributes, childCategoryProducts]
  );

  const resetCategorySelection = () => {
    handleChildCategoryChange(null);
    handleResetCategories?.();
  };

    
  useEffect(() => {
    console.log(
      "Variant type values:",
      childCategoryProducts.slice(0, 3).map((product) => ({
        product: product.name,
        category_id: product.category_id,
        child_category_id: product.child_category_id,
        variants: product.variants,
      }))
    );
  }, [ selectedChildCategory, categoryProducts, childCategoryProducts, types ]);

  const renderTypeCheckboxes = () =>
    groupedTypes.length > 0 ? (
      groupedTypes.map((group) => {
        const name = group.displayName;

        return (
          <FilterItemCheckbox
            key={name}
            name={name}
            count={typeCountsByName[normalize(name)] || 0}
            isChecked={selectedTypes.includes(name)}
            onChange={() => handleTypeChange(name, group.typeIds)}
          />
        );
      })
    ) : (
      <p className="text-xs text-gray-400 italic">
        No product types found for this selection.
      </p>
    );

  return (
    <aside className="hidden lg:block lg:w-1/4 h-[100%] box-shadow px-4 py-5 rounded-[20px]">
      <div className="p-4">
        <h2 className="text-20px font-medium text-black lowercase">
          Filter Products
        </h2>
      </div>

      <CollapsibleFilter
        title="Categories"
        defaultOpen
        isOpen={openFilter === "Category"}
        onToggle={() => toggleFilter("Category")}
        isSelected={selectedCategories.length > 0}
        onReset={resetCategorySelection}
        showButtons
      >
        <div className="space-y-1.5 px-3 py-3 max-h-[260px] overflow-y-auto hide-scrollbar text-sm font-inter">
          {subcatLoading ? (
            <p className="text-sm text-gray-500">Loading categories...</p>
          ) : selectedCategories.length === 0 ? (
            subcategories
              .filter((category) => category.parent_id != null)
              .map((category) => (
                <FilterItemCheckbox
                  key={category._id}
                  name={category.name}
                  count={subCategoryCountsById[category._id] || 0}
                  isChecked={selectedCategories.includes(category.name)}
                  onChange={() => {
                    handleChildCategoryChange(null);
                    handleCategoryChange(category.name);
                  }}
                />
              ))
          ) : (
            <>
              <button
                type="button"
                className="mb-2 text-xs font-semibold text-[var(--primary-color)] hover:underline"
                onClick={() => {
                  if (selectedChildCategory) {
                    handleChildCategoryChange(null);
                  } else {
                    resetCategorySelection();
                  }
                }}
              >
                ‹{" "}
                {selectedChildCategory
                  ? selectedSubCategory?.name || "Subcategories"
                  : "Categories"}
              </button>

              <p className="mb-2 font-semibold text-black">
                {selectedSubCategory?.name || selectedCategoryValue}
              </p>

              {!selectedChildCategory ? (
                childCategoriesLoading ? (
                  <p className="text-sm text-gray-500">
                    Loading child categories...
                  </p>
                ) : childCategoriesError ? (
                  <p className="text-sm text-red-500">
                    Could not load child categories.
                  </p>
                ) : childCategoriesForSelectedSubCategory.length > 0 ? (
                  <div className="space-y-2">
                    {childCategoriesForSelectedSubCategory.map((child) => {
                      const childId = getId(child);
                      const isChecked = selectedChildCategories.some((value) => {
                        const selectedId = getId(value);
                        const selectedName = getName(value);

                        return (
                          (selectedId && selectedId === childId) ||
                          (selectedName &&
                            selectedName === normalize(child.name)) ||
                          (typeof value === "string" &&
                            normalize(value) === normalize(child.name))
                        );
                      });

                      return (
                        <FilterItemCheckbox
                          key={childId}
                          name={child.name}
                          count={childCategoryCountsById?.[childId] ?? 0}
                          isChecked={isChecked}
                          onChange={() => {
                            handleChildCategoryChange(
                              isChecked ? null : childId
                            );
                          }}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs italic text-gray-400">
                    No child categories found for this subcategory.
                  </p>
                )
              ) : (
                <div className="border-l-2 border-[var(--primary-color)] pl-2 space-y-2">
                  <p className="mb-2 font-semibold text-black">
                    {selectedChildCategory?.name || "Selected child category"}
                  </p>

                  <p className="text-xs font-bold uppercase text-gray-400">
                    Product Types
                  </p>

                  {renderTypeCheckboxes()}
                </div>
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
        showButtons
      >
        <div className="space-y-1 overflow-y-auto px-3 py-3 max-h-[180px]">
          {typesLoading ? (
            <p className="text-sm text-gray-500">Loading types...</p>
          ) : (
            renderTypeCheckboxes()
          )}
        </div>
      </CollapsibleFilter>

      <CollapsibleFilter
        title="Brand"
        isOpen={openFilter === "Brand"}
        onToggle={() => toggleFilter("Brand")}
        isSelected={selectedBrands.length > 0}
        onReset={handleResetBrands}
        showButtons
      >
        <div className="space-y-2">
          {brandLoading ? (
              <p className="text-sm text-gray-500">Loading brands...</p>
            ) : groupedBrands.length > 0 ? (
              groupedBrands.map((brand) => (
                <FilterItemCheckbox
                  key={brand.key}
                  name={brand.displayName}
                  count={brand.count}
                  isChecked={selectedBrands.some(
                    (selected) =>
                      normalizeFilterValue(selected) === brand.key
                  )}
                  onChange={() => handleBrandChange(brand.displayName)}
                />
              ))
            ) : (
            <p className="text-sm text-gray-500">
              No brands available for this type.
            </p>
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