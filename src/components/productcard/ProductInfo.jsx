import { useEffect, useMemo, useState, useCallback } from "react";
import { Handbag, Star, XCircleIcon } from "lucide-react";
import Button from "../ui/Button";
import { useNavigate } from "react-router-dom";
import HeartIcon from "../icons/HeartIcon";
import { useDispatch, useSelector } from "react-redux";
import {
  addToCart,
  createCart,
  fetchCart,
} from "../../features/cart/cartThunk";
import { useAddToWishlist } from "../wishlist/handleAddTowishlist";
import toast, { Toaster } from "react-hot-toast";
import { fetchProductReviews } from "../../features/reivews/reviewsThunk";
import { getImageUrl } from "../utils/helper";
import { fetchTypeAttributes } from "../../features/attribut/attributThunk";
import ProductTabs from "./ProductTabs";
import Row from "../ui/Row";

function CountdownTimer({ endDate }) {
  const calcTimeLeft = useCallback(() => {
    const diff = new Date(endDate).getTime() - Date.now();
    if (diff <= 0) return null;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return {
      hours,
      minutes: String(minutes).padStart(2, "0"),
      seconds: String(seconds).padStart(2, "0"),
    };
  }, [endDate]);

  const [timeLeft, setTimeLeft] = useState(calcTimeLeft);

  useEffect(() => {
    const interval = setInterval(() => {
      const t = calcTimeLeft();
      setTimeLeft(t);
      if (!t) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [calcTimeLeft]);

  if (!timeLeft) return null;

  return (
    <span className="text-theme text-[12px] md:text-[15px] font-bold">
      Ends in {timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}
    </span>
  );
}

export default function ProductInfo({
  product,
  setSelectedVariant,
  selectedVariant,
  selectedColor,
  setSelectedColor,
  setShowLoginPopup,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const cart = useSelector((state) => state.cart.cart);
  const [addingToCart, setAddingToCart] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const variants = product?.variants || [];

  const { productReviews } = useSelector((state) => state.reviews);

  const reviewData = useMemo(() => {
    const reviews = productReviews?.[product?._id]?.reviews || [];

    if (reviews.length === 0) return { average: 0, total: 0 };

    const total = reviews.length;

    const sum = reviews.reduce(
      (acc, curr) => acc + (Number(curr.rating) || 0),
      0,
    );

    return {
      average: (sum / total).toFixed(1),
      total,
    };
  }, [productReviews, product?._id]);

  useEffect(() => {
    if (product?._id) {
      dispatch(
        fetchProductReviews({ productId: product._id, page: 1, limit: 50 }),
      );
    }
  }, [product?._id, dispatch]);

  const [selectedSize, setSelectedSize] = useState(null);
  const [activeVariant, setActiveVariant] = useState(null);

  const getSizeFromVariant = (variant) => {
    if (!variant) return null;

  if (Array.isArray(variant.attributes)) {
    const sizeAttr = variant.attributes.find((a) => {
      const attrObj = a.attributeId || a.attribute || {};
      const code = String( attrObj.code || a.attributeCode || a.code || "" ).toLowerCase().trim();
      const name = String( attrObj.name || a.attributeName || a.name || "" ).toLowerCase().trim();

      // ONLY accept actual size attributes
      return (
        code === "size" ||
        name === "size" ||
        code.includes("size") ||
        name.includes("size") ||
        code === "shoe_size" ||
        name === "shoe size" ||
        code === "footwear_size" ||
        name === "footwear size"
      );
    });

    if (sizeAttr) {
      const valObj = 
      sizeAttr.valueId || sizeAttr.valueObj || sizeAttr.val || {};
      const id = typeof valObj === "object" ? valObj?._id : sizeAttr.valueId || sizeAttr._id;
      const value = typeof valObj === "object" ? valObj?.value || valObj?.name || valObj?.val
          : typeof sizeAttr.value === "string"
            ? sizeAttr.value
            : typeof sizeAttr.valueId === "string" ? sizeAttr.valueId
              : sizeAttr.customValue;

      if (value) {
        return { _id: id || value, name: String(value),};
      }
    }
  }

  const oldSize =
    variant.size_id ||
    variant.size ||
    variant.sizes ||
    variant.available_sizes;
  if (oldSize) {
    if (typeof oldSize === "object") {
      const value = oldSize.name || oldSize.value || oldSize.size;
      if (value) {
        return { _id: oldSize._id || value, name: String(value), };
      }
    } if (typeof oldSize === "string") {
        return { _id: oldSize, name: oldSize, };
      }
    }

    return null;
  };

  const getColorFromVariant = (variant) => {
    if (!variant) return null;

    if (Array.isArray(variant.attributes) && variant.attributes.length > 0) {
      const colorAttr = variant.attributes.find((a) => {
        const attrObj = a.attributeId || a.attribute || {};
        const code = (attrObj.code || a.attributeCode || a.code || "")
          .toString()
          .toLowerCase();
        const name = (attrObj.name || a.attributeName || a.name || "")
          .toString()
          .toLowerCase();
        return (
          code.includes("color") ||
          name.includes("color") ||
          code.includes("colour") ||
          name.includes("colour")
        );
      });

      if (colorAttr) {
        const valObj =
          colorAttr.valueId || colorAttr.valueObj || colorAttr.val || {};
        const id = valObj._id || colorAttr.valueId || colorAttr._id;
        const val =
          typeof valObj === "object"
            ? valObj.value || valObj.name || valObj.val
            : typeof colorAttr.value === "string"
              ? colorAttr.value
              : typeof colorAttr.valueId === "string"
                ? colorAttr.valueId
                : colorAttr.customValue;

        if (val) return { _id: id || val, name: String(val) };
      }
    }

    const oldColor = variant.color_id || variant.color || variant.colors;
    if (oldColor) {
      if (typeof oldColor === "object") {
        const val = oldColor.name || oldColor.value || oldColor.color;
        return { _id: oldColor._id || val, name: String(val || "N/A") };
      }
      return { _id: String(oldColor), name: String(oldColor) };
    }
    return null;
  };

  const sizesForSelectedColor = useMemo(() => {
    const variants = product?.variants || [];
    if (!variants.length) return [];

    if (!selectedColor) return variants;

    return variants.filter((v) => {
      const colorObj = getColorFromVariant(v);
      return (
        colorObj?._id === selectedColor || colorObj?.name === selectedColor
      );
    });
  }, [product, selectedColor]);
  const productSizeValues = useMemo(() => {
    const seen = new Map();

    sizesForSelectedColor.forEach((variant) => {
      const sizeObj = getSizeFromVariant(variant);

      if (!sizeObj) return;

      const key = String(sizeObj._id || sizeObj.name);

      if (!seen.has(key)) { seen.set(key, {
          _id: sizeObj._id, value: sizeObj.name,
        });
      }
    });

    return Array.from(seen.values());
  }, [sizesForSelectedColor]);

  const hasProductSizes = useMemo(() => {
    return productSizeValues.length > 0;
  }, [productSizeValues]);

  // const colorOptions = useMemo(() => {
  //   const seen = new Map();
  //   variants.forEach((v) => {
  //     if (Array.isArray(v.attributes) && v.attributes.length > 0) {
  //       const colorAttr = v.attributes.find((a) => {
  //         const code =
  //           a.attributeId?.code ||
  //           a.attributeCode ||
  //           a.code ||
  //           a.name ||
  //           a.attributeId?.name;
  //         return code && code.toString().toLowerCase() === "color";
  //       });
  //       if (colorAttr) {
  //         const valObj = colorAttr.valueId || colorAttr.valueObj || {};
  //         const id = valObj._id || colorAttr.valueId || colorAttr._id;
  //         const name =
  //           valObj.value ||
  //           valObj.name ||
  //           colorAttr.value ||
  //           (typeof colorAttr.valueId === "string" ? colorAttr.valueId : null);
  //         const hex =
  //           valObj.colorHex ||
  //           valObj.code ||
  //           colorAttr.colorHex ||
  //           colorAttr.code ||
  //           name ||
  //           "#000000";
  //         if (id && name) {
  //           seen.set(String(id), {
  //             id: String(id),
  //             name: String(name),
  //             code: hex,
  //           });
  //           return;
  //         }
  //       }
  //     }

  //     if (v.color_id?._id) {
  //       seen.set(String(v.color_id._id), {
  //         id: String(v.color_id._id),
  //         name: v.color_id.name,
  //         code: v.color_id.code,
  //       });
  //     }
  //   });
  //   return Array.from(seen.values());
  // }, [variants]);

  useEffect(() => {
    if (product?.variants?.length > 0) {
      const first = product.variants[0];
      const colorObj = getColorFromVariant(first);
      const sizeObj = getSizeFromVariant(first);
      setSelectedColor(colorObj?._id || colorObj?.name || null);
      setSelectedSize(sizeObj?._id || sizeObj?.name || null);
      setActiveVariant(first);
      setSelectedVariant(first);
    }
  }, [product, setSelectedColor, setSelectedVariant]);
  console.log("ACTIVE VARIANT:", activeVariant);
  console.log("BRAND ID:", activeVariant?.brand_id);
  console.log("BRAND NAME:", activeVariant?.brand_id?.name);

  useEffect(() => {
    if (!selectedColor) return;
    const variantsForColor = (product?.variants || []).filter((v) => {
      const colorObj = getColorFromVariant(v);
      return (
        colorObj?._id === selectedColor || colorObj?.name === selectedColor
      );
    });

    if (variantsForColor.length > 0) {
      const firstAvailable =
        variantsForColor.find((v) => v.stock_quantity > 0) ||
        variantsForColor[0];
      const sizeObj = getSizeFromVariant(firstAvailable);

      setSelectedSize(sizeObj?._id || sizeObj?.name || null);
      setActiveVariant(firstAvailable);
      setSelectedVariant(firstAvailable);
    }
  }, [selectedColor, product?.variants, setSelectedVariant]);

  useEffect(() => {
    if (!selectedSize || !selectedColor) return;
    const match = (product?.variants || []).find((v) => {
      const colorObj = getColorFromVariant(v);
      const sizeObj = getSizeFromVariant(v);

      const matchColor =
        colorObj?._id === selectedColor || colorObj?.name === selectedColor;
      const matchSize =
        sizeObj?._id === selectedSize || sizeObj?.name === selectedSize;

      return matchColor && matchSize;
    });

    if (match) {
      setActiveVariant(match);
      setSelectedVariant(match);
    }
  }, [selectedSize, selectedColor, product?.variants, setSelectedVariant]);

  const originalPrice = Number(activeVariant?.price) || 0;

  const offerPrice =
    activeVariant?.offerprice !== undefined &&
    activeVariant?.offerprice !== null
      ? Number(activeVariant.offerprice)
      : originalPrice;

  const hasOffer = offerPrice > 0 && offerPrice < originalPrice;
  const discountedPrice = hasOffer ? offerPrice : originalPrice;
  const discountPercent = hasOffer
    ? Math.round(((originalPrice - offerPrice) / originalPrice) * 100)
    : 0;

  const handleAddToCart = async () => {
    if (!token) {
      setShowLoginPopup(true);
      return;
    }
    if (!activeVariant?._id) {
      toast.error("Please select a variant first!");
      return;
    }
    if (activeVariant?.stock_quantity === 0) {
      toast.error("This variant is out of stock!");
      return;
    }
    setAddingToCart(true);
    try {
      let cartId = cart?._id || localStorage.getItem("cart_id");
      if (!cartId) {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user?._id) {
          toast.error("User session expired. Please login again.");
          setShowLoginPopup(true);
          return;
        }
        const newCart = await dispatch(
          createCart({ user_id: user._id }),
        ).unwrap();
        cartId = newCart._id;
      }
      await dispatch(
        addToCart({
          cart_id: cartId,
          product_id: product._id,
          variant_id: activeVariant._id,
          quantity: 1,
        }),
      ).unwrap();
      await dispatch(fetchCart(cartId));
      navigate("/cart");
    } catch (err) {
      console.error("Add to cart error:", err);
      const msg =
        typeof err === "string"
          ? err
          : err?.message || "Failed to add item to cart. Please try again.";
      toast.error(msg);
    } finally {
      setAddingToCart(false);
    }
  };

  const { handleAddToWishlist } = useAddToWishlist(setShowLoginPopup);

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <p className="text-theme text-p pb-[25px] pt-[20px] md:pt-0">
        {product.tag}
      </p>
      <h1 className="text-[24px] uppercase">
        {activeVariant?.brand_id?.name || "No Brand"}
      </h1>
      <p className="text-p text-light pb-[12px] capitalize">{product.name}</p>

      <div className="flex items-center gap-[15px] text-14 sec-text-color mb-[25px]">
        <span className="flex items-center gap-[5px] border border-[#CECDCD] text-black px-2 py-[3px] rounded-[2px] font-18 font-medium">
          {reviewData.average}{" "}
          <Star size={14} fill="currentColor" className="text-yellow-500" />
        </span>
        <span>Based on {reviewData.total} Ratings</span>
      </div>

      <div className="pb-[33px]">
        <div className="flex items-center gap-2 justify-left mb-1"></div>

        <div className="flex gap-2 items-center">
          <p className="text-[26px] text-black">
            ₹{discountedPrice.toLocaleString("en-IN")}
          </p>
          <span className="text-primary font-semibold">
            {discountPercent}% OFF
          </span>
        </div>
        {hasOffer > 0 && (
          <p className="sec-text-color">
            MRP{" "}
            <span className="line-through">
              ₹{originalPrice.toLocaleString("en-IN")}
            </span>{" "}
            Inclusive of all taxes
          </p>
        )}
      </div>

      <div className="border-dashed border-b light-border"></div>

      <div className="py-[34px] space-y-[28px]">
        {hasProductSizes && (
        <div className="flex items-center justify-between">
          <span className="text-[20px] md:text-[24px]">Select Size</span>
          {hasProductSizes && (
            <button
              type="button"
              onClick={() => setSizeGuideOpen(true)}
              className="text-[14px] md:text-[18px] text-[var(--primary-color)] font-medium cursor-pointer hover:underline transition-all duration-200"
            >
              Size Guide
            </button>
          )}


          {hasProductSizes && sizeGuideOpen && (
            <>
              <div className=" fixed inset-0 bg-black/40 z-[9999] "
                onClick={() => setSizeGuideOpen(false)} 
              />

              <div className={`fixed top-0 right-0 h-screen w-full w-3/4 max-w-[430px] bg-white z-[9999] transform transition-transform duration-300 flex flex-col ${
                  sizeGuideOpen ? "translate-x-0" : "-translate-x-full"
                }`}
              > 
                <div className=" flex items-center justify-between px-5 py-4 border-b border-theme shrink-0 " >
                  <div>
                    <h2 className="text-[20px] font-semibold text-black"> Sizes </h2>
                    <span className="text-[12px] text-gray-500 ">
                      {activeVariant?.brand_id?.name || "No Brand"} . {product?.name}
                    </span>

                  </div>

                  <button className="absolute top-4 right-2 transition-colors text-light border rounded-[3px] p-[5px] border-[#D2AF9F]"
                    onClick={() => setSizeGuideOpen(false)}
                  >
                    <XCircleIcon size={22} />
                  </button>
                </div>

                <div className="flex-1 h-full overflow-y-auto no-scrollbar px-4 py-5">

                  <div className="mb-[30px]">
                    <h3 className="text-[18px] font-medium mb-[15px]">
                      Available Sizes
                    </h3>

                    <div className="border border-gray-200 rounded-[6px] overflow-hidden">
                      <div className="grid grid-cols-2 bg-gray-100 px-[15px] py-[12px] font-medium text-[14px]">
                        <span>Size</span>
                        <span>Availability</span>
                      </div>


                      {productSizeValues.map((size) => {
                        const productVariant = sizesForSelectedColor.find((v) => {
                          const sizeObj = getSizeFromVariant(v);

                          return (
                            String(sizeObj?._id) === String(size._id) ||
                            String(sizeObj?.name).toLowerCase() ===
                              String(size.value).toLowerCase()
                          );
                        });

                        const outOfStock = !productVariant || productVariant.stock_quantity === 0;

                        return (
                          <div
                            key={size._id}
                            className="grid grid-cols-2 px-[15px] py-[13px] border-t border-gray-200 text-[14px]"
                          >
                            <span>{size.value}</span>

                            <span
                              className={
                                outOfStock
                                  ? "text-red-500"
                                  : "text-green-600"
                              }
                            >
                              {outOfStock ? "Sold Out" : "Available"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {product?.size_guide_image && (
                    <div className="mb-[25px]">
                      <h3 className="text-[18px] font-medium mb-[15px]">
                        Measurement Guide
                      </h3>

                      <img
                        src={getImageUrl(product.size_guide_image)}
                        alt="Size Guide"
                        className="w-full h-auto object-contain rounded-[6px]"
                      />
                    </div>
                  )}

                  {product?.size_guide && (
                    <div
                      className="prose max-w-none text-[14px]"
                      dangerouslySetInnerHTML={{
                        __html: product.size_guide,
                      }}
                    />
                  )}
                </div>

                <div className=" shrink-0 border-t border-theme bg-white px-5 py-3 " >
                  <p className="text-[11px] text-gray-500 text-center">
                    Please refer to the size chart and measurement guide above before selecting your size.
                  </p>
                </div>
              </div>
            </>
          )}

        </div>
        )}
      {hasProductSizes && (

        <div className="flex flex-wrap gap-[13px]">
          {sizesForSelectedColor.map((v) => ({ variant: v, size: getSizeFromVariant(v), }))
            .filter(({ size }) => size)
            .map(({ variant: v, size: sizeObj }) => {
              const sizeId = sizeObj._id || v._id;
              const sizeName = sizeObj.name;
              const outOfStock = v.stock_quantity === 0;

              return (
                <div
                  key={v._id || sizeId}
                  className="flex flex-col items-center"
                >
                  <button
                    disabled={outOfStock}
                    onClick={() =>
                      !outOfStock && setSelectedSize(sizeId)
                    }
                    className={`text-black w-[65px] py-[6px] rounded-[20px] text-[16px] transition-all
                      ${
                        selectedSize === sizeId
                          ? "border border-black bg-black text-white"
                          : "border light-border"
                      }
                      ${
                        outOfStock
                          ? "cursor-not-allowed opacity-50"
                          : ""
                      }
                    `}
                  >
                    {sizeName}
                  </button>

                  {outOfStock && (
                    <span className="text-[12px] sec-text-color mt-[3px]">
                      Sold Out
                    </span>
                  )}
                </div>
              );
            })}
        

        </div>
      )}
        {/* <div className="flex items-center justify-between">
          <span className="text-[24px]">Select Color</span>
        </div>
         <div className="flex flex-wrap gap-[13px]">
          {colorOptions.map((color) => (
            <span
              key={color.id}
              onClick={() => setSelectedColor(color.id)}
              className={`w-[24px] h-[24px] rounded-full border-2 transition-all cursor-pointer
                ${
                  selectedColor === color.id
                    ? "border-black scale-110"
                    : "border-gray-300 hover:border-gray-500"
                }`}
              style={{ backgroundColor: color.code }}
              title={color.name}
            />
          ))}
        </div> */}

        <div className="flex flex-col sm:flex-row gap-[17px] pt-[10px]">
          <Button
            variant="outline"
            className="flex items-center gap-[10px] !text-[22px] !py-[10px]"
            onClick={() => handleAddToWishlist(product, activeVariant)}
          >
            <HeartIcon className="h-[22px] w-[22px]" />
            Wishlist
          </Button>
          <Button
            variant="common"
            className="w-full !text-[22px] flex items-center gap-[10px] !py-[10px]"
            onClick={handleAddToCart}
            disabled={addingToCart}
          >
            <span className="flex items-center gap-[10px]">
              <Handbag size={22} />
              {addingToCart ? "Adding..." : "Add To Bag"}
            </span>
          </Button>
        </div>
      </div>

      <div className="border-dashed border-b light-border"></div>

      <ProductTabs product={product} selectedVariant={selectedVariant} />
    </>
  );
}
