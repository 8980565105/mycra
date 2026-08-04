import { ChevronRight, Search, XCircleIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

export default function SearchBar({ onNavigate }) {
  const { products } = useSelector((state) => state.products);

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // const filtered =
  //   query.trim().length > 0
  //     ? (products || [])
  //         .filter((p) => p.name?.toLowerCase().includes(query.toLowerCase()))
  //         .slice(0, 8)
  //     : [];
  const filtered =
    query.trim().length > 0
      ? (products || [])
          .filter((product) => {
            const search = query.toLowerCase().trim();

            const variant = product.variants?.[0] || {};

            const fields = [
              product.name,
              product.tag,
              product.slug,
              product.sku,

              product.category?.name,

              variant.sku,

              ...(variant.brand || []).map((b) => b.name),
              ...(variant.fabric || []).map((f) => f.name),
              ...(variant.type || []).map((t) => t.name),
              ...(variant.color || []).map((c) => c.name),
              ...(variant.size || []).map((s) => s.name),

              ...(variant.labelsInfo || []).map((l) => l.name),
            ]
              .flat()
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

            return fields.includes(search);
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
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleOpen = () => setIsOpen(true);

  const handleSelect = ({ _id }) => {
    setIsOpen(false);
    setQuery("");

    onNavigate(`/products/${_id}`);
  };
  const getImageUrl = (url) => {
    if (!url) return null;
    return `${process.env.REACT_APP_API_URL_IMAGE}${url}`;
  };

  const getPrice = (product) => {
    const variant = product.variants?.[0];
    return variant?.offerprice || variant?.price || null;
  };

  const getOriginalPrice = (product) => {
    const variant = product.variants?.[0];
    if (
      variant?.offerprice &&
      variant?.price &&
      variant.offerprice < variant.price
    ) {
      return variant.price;
    }
    return null;
  };

  const getProductImage = (product) => {
    if (product.images?.length) {
      return getImageUrl(product.images[0]);
    }

    return null;
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={handleOpen}
        aria-label="search"
        className="flex items-center justify-center text-black hover:text-[var(--primary-color)]"
      >
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
            className="
              fixed md:absolute
              top-0 
              left-0 md:left-auto
              right-0
              md:right-[-80px]
              md:top-12
              w-full md:w-[420px]
              bg-white
              md:rounded-xl
              z-50
              shadow-2xl
              border-0 md:border border-gray-200
              overflow-hidden
            "
            style={{ top: window.innerWidth < 768 ? 0 : undefined }}
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
                  No products found for "
                  <span className="font-medium text-gray-600">{query}</span>"
                </div>
              )}

              {filtered.map((product) => {
                const img = getProductImage(product);
                const price = getPrice(product);
                const originalPrice = getOriginalPrice(product);

                return (
                  <button
                    key={product._id}
                    onClick={() => handleSelect(product)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 text-left"
                  >
                    <div className="w-[48px] h-[48px] rounded-lg overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50">
                      {img ? (
                        <img
                          src={img}
                          alt={product.name}
                          className="w-full h-full object-cover"
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
                      {price && (
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[13px] font-semibold text-primary">
                            ₹{price}
                          </span>
                          {originalPrice && (
                            <span className="text-[12px] text-gray-400 line-through">
                              ₹{originalPrice}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <ChevronRight
                      size={16}
                      className="text-gray-300 flex-shrink-0"
                    />
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
