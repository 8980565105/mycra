// import { ChevronRight, Search, XCircleIcon } from "lucide-react";
// import { useEffect, useRef, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchProducts } from "../../features/products/productsThunk";

// export default function SearchBar({ onNavigate }) {
//   const dispatch = useDispatch();
//   const { products = [] } = useSelector((state) => state.products);

//   useEffect(() => {
//     if (!products || products.length === 0) {
//       dispatch(fetchProducts());
//     }
//   }, [dispatch, products]);
//   const [isOpen, setIsOpen] = useState(false);
//   const [query, setQuery] = useState("");
//   const inputRef = useRef(null);
//   const containerRef = useRef(null);

//   const filtered =
//     query.trim().length > 0
//       ? (products || [])
//           .filter((product) => {
//             const search = query.trim().toLowerCase();

//             const productFields = [
//               product.name,
//               product.tag,
//               product.slug,
//               product.sku,
//               product.category?.name,
//             ];

//           const variantFields = (product.variants || []).flatMap(
//             (variant) => [
//               variant.sku,

//               ...(variant.brand || []).map((item) => item.name),
//               ...(variant.fabric || []).map((item) => item.name),
//               ...(variant.type || []).map((item) => item.name),
//               ...(variant.color || []).map((item) => item.name),
//               ...(variant.size || []).map((item) => item.name),
//               ...(variant.labelsInfo || []).map((item) => item.name),
//             ]
//           );
//           const searchableText = [ ...productFields, ...variantFields ]
//               .filter(Boolean)
//               .join(" ")
//               .toLowerCase();

//             return searchableText.includes(search);
//           })
//           .slice(0, 8)
//       : [];

//   useEffect(() => {
//     const handler = (e) => {
//       if (containerRef.current && !containerRef.current.contains(e.target)) {
//         setIsOpen(false);
//         setQuery("");
//       }
//     };
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, []);

//   useEffect(() => {
//     if (isOpen && inputRef.current) {
//       inputRef.current.focus();
//     }
//   }, [isOpen]);

//   const handleOpen = () => setIsOpen(true);

//   const handleSelect = ({ _id }) => {
//     setIsOpen(false);
//     setQuery("");

//     onNavigate(`/products/${_id}`);
//   };
//   const getImageUrl = (url) => {
//     if (!url) return null;
//     return `${process.env.REACT_APP_API_URL_IMAGE}${url}`;
//   };

//   const getPrice = (product) => {
//     const variant = product.variants?.[0];
//     return variant?.offerprice || variant?.price || null;
//   };

//   const getOriginalPrice = (product) => {
//     const variant = product.variants?.[0];
//     if (
//       variant?.offerprice &&
//       variant?.price &&
//       variant.offerprice < variant.price
//     ) {
//       return variant.price;
//     }
//     return null;
//   };

//   const getProductImage = (product) => {
//     if (product.images?.length) {
//       return getImageUrl(product.images[0]);
//     }

//     return null;
//   };

//   return (
//     <div ref={containerRef} className="relative">
//       <button
//         onClick={handleOpen}
//         aria-label="search"
//         className="flex items-center justify-center text-[rgba(0,0,0,0.70)] hover:text-[var(--primary-color)]"
//       >
//         <Search size={22} />
//       </button>

//       {isOpen && (
//         <>
//           <div
//             className="fixed inset-0 bg-black/30 z-40 md:hidden"
//             onClick={() => {
//               setIsOpen(false);
//               setQuery("");
//             }}
//           />

//           <div
//             className="
//               fixed md:absolute
//               top-0 
//               left-0 md:left-auto
//               right-0
//               md:right-[-80px]
//               md:top-12
//               w-full md:w-[420px]
//               bg-white
//               md:rounded-[5px]
//               z-50
//               shadow-2xl
//               border-0 md:border border-gray-200
//               overflow-hidden
//             "
//             style={{ top: window.innerWidth < 768 ? 0 : undefined }}
//           >
//             <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
//               <Search size={18} className="text-gray-400 flex-shrink-0" />
//               <input
//                 ref={inputRef}
//                 type="text"
//                 value={query}
//                 onChange={(e) => setQuery(e.target.value)}
//                 placeholder="Search products..."
//                 className="flex-1 outline-none text-[15px] text-gray-800 placeholder-gray-400 bg-transparent"
//                 onKeyDown={(e) => {
//                   if (e.key === "Escape") {
//                     setIsOpen(false);
//                     setQuery("");
//                   }
//                 }}
//               />
//               <button
//                 onClick={() => {
//                   setIsOpen(false);
//                   setQuery("");
//                 }}
//                 className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
//               >
//                 <XCircleIcon size={20} />
//               </button>
//             </div>

//             <div className="max-h-[60vh] md:max-h-[400px] overflow-y-auto">
//               {query.trim().length === 0 && (
//                 <div className="px-4 py-8 text-center text-gray-400 text-sm">
//                   Start typing to search products...
//                 </div>
//               )}

//               {query.trim().length > 0 && filtered.length === 0 && (
//                 <div className="px-4 py-8 text-center text-gray-400 text-sm">
//                   No products found for "
//                   <span className="font-medium text-gray-600">{query}</span>"
//                 </div>
//               )}

//               {filtered.map((product) => {
//                 const img = getProductImage(product);
//                 const price = getPrice(product);
//                 const originalPrice = getOriginalPrice(product);

//                 return (
//                   <button
//                     key={product._id}
//                     onClick={() => handleSelect(product)}
//                     className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 text-left"
//                   >
//                     <div className="w-[30px] h-[34px] overflow-hidden flex-shrink-0 ">
//                       {img ? (
//                         <img
//                           src={img}
//                           alt={product.name}
//                           className="w-full h-full object-contain"
//                         />
//                       ) : (
//                         <div className="w-full h-full flex items-center justify-center text-gray-300">
//                           <Search size={16} />
//                         </div>
//                       )}
//                     </div>

//                     <div className="flex-1 min-w-0">
//                       <p className="text-[14px] font-medium text-gray-800 line-clamp-1 leading-snug">
//                         {product.name}
//                       </p>
//                       {/* {price && (
//                         <div className="flex items-center gap-2 mt-0.5">
//                           <span className="text-[13px] font-semibold text-primary">
//                             ₹{price}
//                           </span>
//                           {originalPrice && (
//                             <span className="text-[12px] text-gray-400 line-through">
//                               ₹{originalPrice}
//                             </span>
//                           )}
//                         </div>
//                       )} */}
//                     </div>
// {/* 
//                     <ChevronRight
//                       size={16}
//                       className="text-gray-300 flex-shrink-0"
//                     /> */}
//                   </button>
//                 );
//               })}
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }


import { Search, XCircleIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../../features/products/productsThunk";
import { getImageUrl } from "../utils/helper";

export default function SearchBar({ onNavigate }) {
  const dispatch = useDispatch();
  const { products = [] } = useSelector((state) => state.products);

  const [searchProducts, setSearchProducts] = useState([]);
  const { types = [] } = useSelector((state) => state.types);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  useEffect(() => {
    if (Array.isArray(products) && products.length > 0) {
      setSearchProducts((prev) => {
        if (prev.length === 0) {
          return products;
        }

        return prev;
      });
    }
  }, [products]);
  useEffect(() => {
    if (!products || products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products]);

  const getValueName = (value) => {
    if (!value) return "";

    if (typeof value === "string") {
      return "";
    }

    if (typeof value === "object") {
      return (
        value.name || value.title || value.label || value.value || ""
      );
    }

    return "";
  };
  const getProductCategory = (product) => {
    return (
      getValueName(product?.mainCategory_id) ||
      getValueName(product?.mainCategory) ||
      getValueName(product?.category) ||
      getValueName(product?.category_id) ||
      getValueName(product?.subcategory) ||
      getValueName(product?.subcategory_id) ||
      getValueName(product?.childCategory) ||
      getValueName(product?.child_category_id) ||
      ""
    );
  };
  
  const getProductType = (product) => {
    if (product?.type_id && typeof product.type_id === "object") {
      return (
        product.type_id.name ||
        product.type_id.title ||
        product.type_id.label ||
        ""
      );
    }

    if (product?.type && typeof product.type === "object") {
      return (
        product.type.name ||
        product.type.title ||
        product.type.label ||
        ""
      );
    }
    const productTypeId = typeof product?.type_id === "string" ? product.type_id : product?.type_id?._id;

    if (productTypeId) {
      const foundType = types.find(
        (type) =>
          String(type?._id || type?.id) === String(productTypeId)
      );

      if (foundType?.name) {
        return foundType.name;
      }
    }
    if (Array.isArray(product?.variants)) {
      for (const variant of product.variants) {
        if (
          variant?.type_id &&
          typeof variant.type_id === "object"
        ) {
          const name =
            variant.type_id.name ||
            variant.type_id.title ||
            variant.type_id.label ||
            "";

          if (name) return name;
        }

        // Populated variant.type
        if (
          variant?.type &&
          typeof variant.type === "object"
        ) {
          const name =
            variant.type.name ||
            variant.type.title ||
            variant.type.label ||
            "";

          if (name) return name;
        }

        // Raw variant.type_id
        const variantTypeId =
          typeof variant?.type_id === "string"
            ? variant.type_id
            : variant?.type_id?._id;

        if (variantTypeId) {
          const foundType = types.find(
            (type) =>
              String(type?._id || type?.id) ===
              String(variantTypeId)
          );

          if (foundType?.name) {
            return foundType.name;
          }
        }
      }
    }

    // IMPORTANT:
    // Never return raw ObjectId as type name.
    return "";
  };

  // const getProductCategoryId = (product) => {
  //   const category =
  //     product?.mainCategory_id ||
  //     product?.mainCategory ||
  //     product?.category ||
  //     product?.category_id ||
  //     product?.subcategory ||
  //     product?.subcategory_id ||
  //     product?.childCategory ||
  //     product?.child_category_id;

  //   if (!category) return "";

  //   if (typeof category === "string") {
  //     return category;
  //   }

  //   return category?._id || category?.id || "";
  // };


  const searchableProducts = searchProducts.length > 0 ? searchProducts : products;
  const filtered =
    query.trim().length > 0
      ? searchableProducts
        .filter((product) => {
          const search = query.trim().toLowerCase();

          const productFields = [
            product?.name,
            product?.tag,
            product?.slug,
            product?.sku,
            getProductCategory(product),
            getProductType(product),
            product?.category?.name,
            product?.mainCategory?.name,
            product?.category_id?.name,
            product?.mainCategory_id?.name,
            product?.subcategory?.name,
            product?.subcategory_id?.name,
            product?.childCategory?.name,
            product?.child_category_id?.name,
            product?.type?.name,
            product?.type_id?.name,
          ];

          const variantFields = (product?.variants || []).flatMap((variant) => {
            const variantTypeId = typeof variant?.type_id === "string"
                ? variant.type_id
                : variant?.type_id?._id;

            const resolvedVariantType = variantTypeId ? types.find(
                  (type) =>
                    String(type?._id || type?.id) ===
                    String(variantTypeId)
                )?.name
              : "";

              return [
                variant?.sku,
                getValueName(variant?.brand),
                getValueName(variant?.fabric),
                getValueName(variant?.type),
                getValueName(variant?.color),
                getValueName(variant?.size),
                getValueName(variant?.labelsInfo),
                resolvedVariantType,
              ];
            });
          const searchableText = [ ...productFields, ...variantFields ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

            return searchableText.includes(search);
          })
          .slice(0, 8)
      : [];

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => {document.removeEventListener("mousedown", handler); };
  }, []);
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleSelect = (product) => {
    const category = getProductCategory(product);
    const type = getProductType(product);
    setIsOpen(false);
    setQuery("");

    const params = new URLSearchParams();
    if (category) {
      params.set("category", category);
    }
    if (type) {
      params.set("type", type);
    }
    const queryString = params.toString();
    const finalUrl = queryString ? `/shop?${queryString}` : "/shop";
    onNavigate(finalUrl);
  };

  const getProductImage = (product) => {
    if (product.images?.length) {
      return getImageUrl(product.images[0]);
    }

    return null;
  };

  return (
    <div ref={containerRef} className="relative">
      <button onClick={handleOpen} aria-label="search" className="flex items-center justify-center text-[rgba(0,0,0,0.70)] hover:text-[var(--primary-color)]">
        <Search size={22} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40 md:hidden"
            onClick={() => {
              setIsOpen(false);
              setQuery("");
            }}
          />

          <div
            className="fixed md:absolute top-0 left-0 md:left-auto right-0 md:right-[-80px] md:top-12 w-full md:w-[420px] bg-white md:rounded-[5px] z-50 shadow-2xl border-0 md:border border-gray-200 overflow-hidden"
            style={{
              top:
                typeof window !== "undefined" &&
                window.innerWidth < 768
                  ? 0
                  : undefined,
            }}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
              <Search size={18} className="text-gray-400 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="flex-1 outline-none text-[15px] text-gray-800 placeholder-gray-400 bg-transparent"
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setIsOpen(false);
                    setQuery("");
                  }
                }}
              />
              <button
                onClick={() => {
                  setIsOpen(false);
                  setQuery("");
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              >
                <XCircleIcon size={20} />
              </button>
            </div>
            <div className="max-h-[60vh] md:max-h-[400px] overflow-y-auto">
              {query.trim().length === 0 && (
                <div className="px-4 py-8 text-center text-gray-400 text-sm">
                  Start typing to search products...
                </div>
              )}
              {query.trim().length > 0 && filtered.length === 0 && (
                <div className="px-4 py-8 text-center text-gray-400 text-sm">
                  No products found for{" "}
                  <span className="font-medium text-gray-600">
                    "{query}"
                  </span>
                </div>
              )}

              {filtered.map((product) => {
                const img = getProductImage(product);
                const category = getProductCategory(product);
                const type = getProductType(product);

                return (
                  <button
                    key={product._id}
                    onClick={() => handleSelect(product)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 text-left"
                  >
                    <div className="w-[30px] h-[34px] overflow-hidden flex-shrink-0 ">
                      {img ? (
                        <img
                          src={img}
                          alt={product.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Search size={16} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-gray-800 line-clamp-1 leading-snug">
                        {product.name}
                      </p>
                      {/* <p className="text-[11px] text-gray-400 mt-1">
                        {category}
                        {category && type ? " • " : ""}
                        {type}
                      </p> */}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}