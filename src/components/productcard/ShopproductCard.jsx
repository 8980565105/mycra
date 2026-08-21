import { useState } from "react";
import { getImageUrl } from "../utils/helper";
import { Heart } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useAddToWishlist } from "../wishlist/handleAddTowishlist";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import HeartIcon from "../icons/HeartIcon";

import {
  addToCart,
  createCart,
  fetchCart,
} from "../../features/cart/cartThunk";
import { useNavigate } from "react-router-dom";
import { faCartShopping } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

export default function ShopProductCard({
  product,
  onNavigate,
  setShowLoginPopup,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);

  const { handleAddToWishlist } = useAddToWishlist(setShowLoginPopup);
  const wishlistProductIds = useSelector((state) => state.wishlist.productIds);
  const isWishlisted = wishlistProductIds.includes(product._id);
  const { token } = useSelector((state) => state.auth);
  const [addingToCart, setAddingToCart] = useState(false);
  const cartItems = useSelector((state) => state.cart.items) || [];
  const cart = useSelector((state) => state.cart.cart);

  const isInCart = (productId, variantId) => {
    if (!productId || !variantId) return false;
    return cartItems.some(
      (ci) =>
        (ci.product_id?._id || ci.product_id) === productId &&
        (ci.variant_id?._id || ci.variant_id) === variantId,
    );
  };

  const handleAddToCart = async (product) => {
    if (!token) {
      setShowLoginPopup(true);
      return;
    }
    const selectedColorCode = selectedColor;
    const variant = selectedColorCode
      ? getVariantForColor(product, selectedColorCode)
      : product?.variants?.[0];

    if (!variant?._id) {
      toast.error("Variant not found!");
      return;
    }
    if (variant?.stock_quantity === 0) {
      toast.error("This variant is out of stock!");
      return;
    }
    const alreadyInCart = isInCart(product._id, variant._id);
    if (alreadyInCart) {
      toast.success("Already added in cart", { position: "top-center" });
      return;
    }
    setAddingToCart(true);
    try {
      let cartId = cart?._id || localStorage.getItem("cart_id");
      if (!cartId) {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user?._id) {
          toast.error("Please login again");
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
          variant_id: variant._id,
          quantity: 1,
        }),
      ).unwrap();
      await dispatch(fetchCart(cartId));
      navigate("/cart");
      toast.success("Added to cart successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
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
        const code =
          valObj.colorHex ||
          valObj.hex ||
          valObj.code ||
          valObj.value ||
          valObj.name ||
          (typeof colorAttr.value === "string" ? colorAttr.value : null) ||
          colorAttr.customValue;
        const name =
          valObj.name ||
          valObj.value ||
          valObj.colorName ||
          valObj.val ||
          code ||
          "";
        if (code) return { code, name };
      }
    }
    const oldColor = Array.isArray(variant?.color)
      ? variant.color[0]
      : variant?.color || variant?.colors;
    if (oldColor) {
      if (typeof oldColor === "object") {
        const code =
          oldColor.code ||
          oldColor.colorHex ||
          oldColor.hex ||
          oldColor.value ||
          oldColor.name;
        const name =
          oldColor.name || oldColor.value || oldColor.colorName || code || "";
        if (code) return { code, name };
      } else if (typeof oldColor === "string") {
        return { code: oldColor, name: oldColor };
      }
    }
    return null;
  };

  const uniqueColors = (() => {
    const seen = new Set();
    const result = [];
    (product?.variants || []).forEach((variant) => {
      const clr = getColorFromVariant(variant);
      if (!clr || !clr.code || seen.has(clr.code)) return;
      seen.add(clr.code);
      result.push(clr);
    });
    return result;
  })();

  const getVariantForColor = (colorCode) => {
    if (!colorCode) return product?.variants?.[0];
    return (
      product?.variants?.find(
        (v) => getColorFromVariant(v)?.code === colorCode,
      ) || product?.variants?.[0]
    );
  };

  const getDiscountedPrice = (variant) => {
    const originalPrice = Number(variant?.price) || 0;
    const offerPrice =
      variant?.offerprice !== undefined && variant?.offerprice !== null
        ? Number(variant.offerprice)
        : originalPrice;
    const hasOffer = offerPrice > 0 && offerPrice < originalPrice;
    const discountPercent = hasOffer
      ? Math.round(((originalPrice - offerPrice) / originalPrice) * 100)
      : 0;
    return {
      originalPrice,
      discountedPrice: hasOffer ? offerPrice : originalPrice,
      hasOffer,
      discountPercent,
    };
  };

  const currentSelectedColor = selectedColor || uniqueColors[0]?.code;
  const currentVariant = getVariantForColor(currentSelectedColor);
  const price = getDiscountedPrice(currentVariant);

  const variantImages = Array.isArray(currentVariant?.images)
    ? currentVariant.images
    : [];
  const mainImages = Array.isArray(product?.images) ? product.images : [];
  const allImages = variantImages.length > 0 ? variantImages : mainImages;
  const displayedImage = getImageUrl(allImages[currentIndex]);
  const hasMultipleImages = allImages.length > 1;

  return (
    <div
      onClick={() => onNavigate(product.slug || product._id)}
      className="group cursor-pointer"
    >
      <div
        className="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-lg bg-[#FAF3EE] text-[12px] text-[#c9beb6]"
        onMouseEnter={() => hasMultipleImages && setCurrentIndex(1)}
        onMouseLeave={() => hasMultipleImages && setCurrentIndex(0)}
      >
        <img
          src={displayedImage}
          alt={product.name}
          className="w-full h-full transition duration-300 object-cover"
        />
        {price.hasOffer && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-[#E23E80] px-2.5 py-1 text-[11px] font-bold text-white">
            -{price.discountPercent}%
          </span>
        )}
        <div className="absolute top-3 right-3 flex flex-col space-y-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              handleAddToWishlist(product);
            }}
            className={`h-[26px] w-[26px] sm:h-[40px] sm:w-[40px] flex items-center justify-center shadow-[0_0_4px_0_rgba(0,0,0,0.25)] rounded-full hover:bg-[var(--primary-color)]
                  ${isWishlisted ? "bg-[var(--primary-color)] " : "bg-white text-black"}`}
          >
            <HeartIcon
              className={`w-[16px] h-[16px] sm:w-[26px] sm:h-[24px] transition hover:invert over:brightness-0 hover:contrast-200
                  ${isWishlisted ? "invert brightness-0 contrast-200" : ""}`}
            />
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAddToCart(product);
            }}
            className={`h-[26px] w-[26px] sm:h-[40px] sm:w-[40px] flex items-center justify-center rounded-full shadow-[0_0_4px_0_rgba(0,0,0,0.25)] transition-all duration-200
    ${
      isInCart(product._id, currentVariant?._id)
        ? "bg-[var(--primary-color)] border-[var(--primary-color)] text-white"
        : "bg-white text-black hover:bg-[var(--primary-color)] hover:border-[var(--primary-color)] hover:text-white"
    }`}
          >
            <FontAwesomeIcon
              icon={faCartShopping}
              className="w-[14px] h-[14px] sm:w-[22px] sm:h-[22px]"
            />
          </button>
        </div>
      </div>

      <p className="mt-3 line-clamp-1 text-[14px] font-semibold">
        {product.name}
      </p>

      <p className="mt-1 text-[14px]">
        ₹{price.discountedPrice.toLocaleString("en-IN")}
        {price.hasOffer && (
          <span className="ml-1.5 font-normal text-[#8A817A] line-through">
            ₹{price.originalPrice.toLocaleString("en-IN")}
          </span>
        )}
      </p>

      {uniqueColors.length > 0 && (
        <div className="mt-2 flex gap-1.5">
          {uniqueColors.map((clr, index) => (
            <span
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedColor(clr.code);
              }}
              title={clr.name}
              className={`h-[13px] w-[13px] rounded-full border cursor-pointer ${
                currentSelectedColor === clr.code
                  ? "border-black"
                  : "border-[#EEE3DD]"
              }`}
              style={{ backgroundColor: clr.code }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
