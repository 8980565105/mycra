import { useEffect, useMemo, useState, useCallback } from "react";
import { Handbag, Star } from "lucide-react";
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
  selectedColor,
  setSelectedColor,
  setShowLoginPopup,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const cart = useSelector((state) => state.cart.cart);
  const [addingToCart, setAddingToCart] = useState(false);
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

    if (Array.isArray(variant.attributes) && variant.attributes.length > 0) {
      const sizeAttr = variant.attributes.find((a) => {
        const attrObj = a.attributeId || a.attribute || {};
        const code = (attrObj.code || a.attributeCode || a.code || "")
          .toString()
          .toLowerCase();
        const name = (attrObj.name || a.attributeName || a.name || "")
          .toString()
          .toLowerCase();

        return (
          code.includes("size") ||
          name.includes("size") ||
          code.includes("waist") ||
          name.includes("waist") ||
          code.includes("alpha") ||
          name.includes("alpha") ||
          code.includes("numeric") ||
          name.includes("numeric") ||
          code === "size" ||
          name === "size"
        );
      });

      if (sizeAttr) {
        const valObj =
          sizeAttr.valueId || sizeAttr.valueObj || sizeAttr.val || {};
        const id = valObj._id || sizeAttr.valueId || sizeAttr._id;
        const val =
          typeof valObj === "object"
            ? valObj.value || valObj.name || valObj.val
            : typeof sizeAttr.value === "string"
              ? sizeAttr.value
              : typeof sizeAttr.valueId === "string"
                ? sizeAttr.valueId
                : sizeAttr.customValue;

        if (val) return { _id: id || val, name: String(val) };
      }

      const nonColorAttr = variant.attributes.find((a) => {
        const attrObj = a.attributeId || a.attribute || {};
        const code = (attrObj.code || a.attributeCode || a.code || "")
          .toString()
          .toLowerCase();
        const name = (attrObj.name || a.attributeName || a.name || "")
          .toString()
          .toLowerCase();
        return (
          !code.includes("color") &&
          !name.includes("color") &&
          !code.includes("colour") &&
          !name.includes("colour")
        );
      });

      if (nonColorAttr) {
        const valObj =
          nonColorAttr.valueId ||
          nonColorAttr.valueObj ||
          nonColorAttr.val ||
          {};
        const id = valObj._id || nonColorAttr.valueId || nonColorAttr._id;
        const val =
          typeof valObj === "object"
            ? valObj.value || valObj.name || valObj.val
            : typeof nonColorAttr.value === "string"
              ? nonColorAttr.value
              : typeof nonColorAttr.valueId === "string"
                ? nonColorAttr.valueId
                : nonColorAttr.customValue;

        if (val) return { _id: id || val, name: String(val) };
      }
    }

    const oldSize =
      variant.size_id ||
      variant.size ||
      variant.sizes ||
      variant.available_sizes;
    if (oldSize) {
      if (typeof oldSize === "object") {
        const val = oldSize.name || oldSize.value || oldSize.size;
        if (val) return { _id: oldSize._id || val, name: String(val) };
      } else if (typeof oldSize === "string") {
        return { _id: oldSize, name: oldSize };
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

  const colorOptions = useMemo(() => {
    const seen = new Map();
    variants.forEach((v) => {
      if (Array.isArray(v.attributes) && v.attributes.length > 0) {
        const colorAttr = v.attributes.find((a) => {
          const code =
            a.attributeId?.code ||
            a.attributeCode ||
            a.code ||
            a.name ||
            a.attributeId?.name;
          return code && code.toString().toLowerCase() === "color";
        });
        if (colorAttr) {
          const valObj = colorAttr.valueId || colorAttr.valueObj || {};
          const id = valObj._id || colorAttr.valueId || colorAttr._id;
          const name =
            valObj.value ||
            valObj.name ||
            colorAttr.value ||
            (typeof colorAttr.valueId === "string" ? colorAttr.valueId : null);
          const hex =
            valObj.colorHex ||
            valObj.code ||
            colorAttr.colorHex ||
            colorAttr.code ||
            name ||
            "#000000";
          if (id && name) {
            seen.set(String(id), {
              id: String(id),
              name: String(name),
              code: hex,
            });
            return;
          }
        }
      }

      if (v.color_id?._id) {
        seen.set(String(v.color_id._id), {
          id: String(v.color_id._id),
          name: v.color_id.name,
          code: v.color_id.code,
        });
      }
    });
    return Array.from(seen.values());
  }, [variants]);

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
      <p className="text-p text-light pb-[12px] lowercase capitalize">
        {product.name}
      </p>

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
        <div className="flex items-center justify-between">
          <span className="text-[24px]">Select Size</span>
        </div>

        <div className="flex flex-wrap gap-[13px]">
          {sizesForSelectedColor.map((v) => {
            const sizeObj = getSizeFromVariant(v);
            const sizeId = sizeObj?._id || v._id;
            const sizeName = sizeObj?.name || "N/A";
            const outOfStock = v.stock_quantity === 0;

            return (
              <div key={v._id || sizeId} className="flex flex-col items-center">
                <button
                  disabled={outOfStock}
                  onClick={() => !outOfStock && setSelectedSize(sizeId)}
                  className={`text-black w-[65px] py-[6px] rounded-[20px] text-[16px] transition-all
                    ${
                      selectedSize === sizeId
                        ? "border border-black bg-black text-white"
                        : "border light-border"
                    }
                    ${outOfStock ? "cursor-not-allowed opacity-50" : ""}
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
        <div className="flex items-center justify-between">
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
        </div>

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
    </>
  );
}
