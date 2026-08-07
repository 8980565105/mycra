import React, { useState, useEffect, useCallback, useMemo } from "react";
import HeartIcon from "../icons/HeartIcon";
import { getImageUrl } from "../utils/helper";
import { Link } from "react-router-dom";
import { useAddToWishlist } from "../wishlist/handleAddTowishlist";
import { faCartShopping } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import {
  addToCart,
  createCart,
  fetchCart,
} from "../../features/cart/cartThunk";
import toast from "react-hot-toast";
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
export default function ProductCard({ product, setShowLoginPopup }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const cart = useSelector((state) => state.cart.cart);
  const reviewsState = useSelector((state) => state.reviews);
  const productReviewData = reviewsState?.productReviews?.[product?._id];
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const cartItems = useSelector((state) => state.cart.items) || [];
  const isInCart = (productId, variantId) => {
    if (!productId || !variantId) return false;
    return cartItems.some(
      (ci) =>
        (ci.product_id?._id || ci.product_id) === productId &&
        (ci.variant_id?._id || ci.variant_id) === variantId,
    );
  };
  const [currentIndex, setCurrentIndex] = useState(0);

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
      if (!clr || !clr.code) return;
      if (seen.has(clr.code)) return;
      seen.add(clr.code);
      result.push(clr);
    });
    return result;
  })();

  const getVariantForColor = (prod, colorCode) => {
    if (!colorCode) return prod?.variants?.[0];
    return (
      prod?.variants?.find((v) => {
        const clr = getColorFromVariant(v);
        return clr?.code === colorCode;
      }) || prod?.variants?.[0]
    );
  };

  const getDiscountedPrice = (variant) => {
    const targetVariant = variant || {};
    const originalPrice = Number(targetVariant?.price) || 0;
    const offerPrice =
      targetVariant?.offerprice !== undefined &&
      targetVariant?.offerprice !== null
        ? Number(targetVariant.offerprice)
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
  const currentVariant = getVariantForColor(product, currentSelectedColor);
  const isOutOfStock = currentVariant?.stock_quantity === 0;
  const price = getDiscountedPrice(currentVariant);

  const { productReviews } = useSelector((state) => state.reviews);
  const reviewData = useMemo(() => {
    if (product?.averageRating !== undefined && product?.totalReviews !== undefined) {
      return {
        average: product.averageRating,
        total: product.totalReviews,
      };
    }
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
  }, [productReviews, product?._id, product?.averageRating, product?.totalReviews]);

  const variantImages = Array.isArray(currentVariant?.images)
    ? currentVariant.images
    : [];
  const mainImages = Array.isArray(product?.images) ? product.images : [];
  const allImages = variantImages.length > 0 ? variantImages : mainImages;
  const displayedImage = getImageUrl(allImages[currentIndex]);
  const hasMultipleImages = allImages.length > 1;

  const { handleAddToWishlist } = useAddToWishlist(setShowLoginPopup);
  const wishlistProductIds = useSelector((state) => state.wishlist.productIds);
  const isWishlisted = wishlistProductIds.includes(product._id);
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
  const discount = product?.discount || {};
  const hasDiscount = discount?.value > 0;
  const endsWithin24h =
    discount?.end_date &&
    new Date(discount.end_date).getTime() - Date.now() <= 24 * 60 * 60 * 1000;
  return (
    <>
      <Link to={`/products/${product._id}`}>
        <div className="bg-white overflow-hidden transition-all group w-full h-[470px] sm:h-[540px] hover:p-[10px] hover:shadow-[0_0_4px_0_rgba(0,0,0,0.25)] cursor-pointer">
          <div className="relative mb-[10px]">
            <div
              className="relative mb-[10px] w-full h-[300px] sm:h-[355px]"
              onMouseEnter={() => hasMultipleImages && setCurrentIndex(1)}
              onMouseLeave={() => hasMultipleImages && setCurrentIndex(0)}
            >
              <img
                src={displayedImage}
                alt={product.subtitle || product.name}
                className="w-full h-full transition duration-300 object-cover"
              />
            </div>
            <div className="absolute top-3 right-3 flex flex-col space-y-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleAddToWishlist(product);
                }}
                className={`h-[26px] w-[26px] sm:h-[40px] sm:w-[40px] flex items-center justify-center rounded-full hover:bg-[var(--primary-color)]
                ${isWishlisted ? "bg-[var(--primary-color)]" : "bg-white"}`}
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
                className={`w-[20px] h-[20px] md:w-[20px] md:h-[20px] lg:w-[40px] lg:h-[40px] flex items-center justify-center rounded-full border transition-all duration-200
    ${
      isInCart(product._id, currentVariant?._id)
        ? "bg-[var(--primary-color)] border-[var(--primary-color)] text-white"
        : "bg-white text-black hover:bg-[var(--primary-color)] hover:border-[var(--primary-color)] hover:text-white"
    }`}
              >
                <FontAwesomeIcon
                  icon={faCartShopping}
                  className="w-[12px] h-[12px] sm:w-[12px] sm:h-[12px] lg:w-[20px] lg:h-[20px]"
                />
              </button>
            </div>
            {hasMultipleImages && (
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-[5px] px-[10px] py-[4px] bg-[rgba(217,217,217,60%)] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {allImages.map((_, index) => (
                  <div
                    key={index}
                    onMouseEnter={() => setCurrentIndex(index)}
                    className={`w-[6px] h-[6px] rounded-full cursor-pointer transition-colors duration-300 ${
                      currentIndex === index ? "bg-color" : "bg-white"
                    }`}
                  ></div>
                ))}
              </div>
            )}
          </div>
          <div className="p-1">
            {product.express && (
              <p className="inline-flex px-[7px] py-[3px] bg-[rgba(244,50,151,9%)] text-theme text-[12px] md:text-[14px] rounded-[3px] mb-[10px]">
                Express Shipping
              </p>
            )}
            {product.isSale && (
              <div className="mb-2 inline-block text-theme theme-bg-light text-[12px] sm:text-[14px] font-regular font-sans px-2 py-0.5 rounded-sm">
                Sale
              </div>
            )}
            <div className="flex items-center gap-2 justify-left mb-1">
              {hasDiscount && (
                <div className="flex items-center gap-2 justify-left mb-1">
                  <span className="bg-theme text-theme text-[12px] md:text-[15px] px-2 py-1 rounded font-bold">
                    {discount?.type === "percentage"
                      ? `${discount?.value || 0}% OFF`
                      : `₹${discount?.value || 0} OFF`}
                  </span>
                  {endsWithin24h ? (
                    <CountdownTimer endDate={discount.end_date} />
                  ) : (
                    <span className="text-theme text-[12px] md:text-[15px] font-bold">
                      Limited time deal
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* <p>{product|| "store name"}</p> */}

            <p className="sec-text-color text-14 mb-2 lowercase capitalize line-clamp-1">
              {product.name}
            </p>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="text-[20px] font-semibold text-black">
                ₹{price.discountedPrice.toLocaleString("en-IN")}
              </span>
              {price.hasOffer && (
                <>
                  <span className="text-[15px] text-[#9CA3AF] line-through">
                    ₹{price.originalPrice.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[15px] font-medium text-pink-600">
                    {price.discountPercent}%
                  </span>
                </>
              )}
            </div>
            <div className="flex gap-[5px]">
              {uniqueColors.map((clr, idx) => {
                const clrVariant = getVariantForColor(product, clr.code);
                const clrOutOfStock = clrVariant?.stock_quantity === 0;
                const isSelected = currentSelectedColor === clr.code;
                return (
                  <button
                    key={idx}
                    title={
                      clrOutOfStock ? `${clr.name} (Out of Stock)` : clr.name
                    }
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedColor(clr.code);
                    }}
                    className={`w-[10px] h-[10px] sm:w-[16px] sm:h-[16px] rounded-full border-2 transition-transform hover:scale-110
          ${isSelected ? "border-black scale-110" : ""}
        `}
                    style={{ backgroundColor: clr.code }}
                  />
                );
              })}
            </div>
            {isOutOfStock && (
              <p className="text-theme text-[11px] mt-1">Out of Stock</p>
            )}
            {reviewData.total > 0 && (
              <div className="flex gap-[3px] mt-1">
                {Array(5)
                  .fill()
                  .map((_, i) => {
                    const rating = Number(reviewData.average);
                    const diff = rating - i;
                    if (diff >= 1) {
                      return (
                        <Star
                          key={i}
                          size={14}
                          className="text-theme"
                          fill="currentColor"
                        />
                      );
                    }
                    if (diff > 0 && diff < 1) {
                      return (
                        <span
                          key={i}
                          className="relative inline-block"
                          style={{ width: 14, height: 14 }}
                        >
                          <Star
                            size={14}
                            className="text-theme absolute top-0 left-0"
                            fill="none"
                          />
                          <span
                            className="absolute top-0 left-0 overflow-hidden"
                            style={{ width: "50%", height: "100%" }}
                          >
                            <Star
                              size={14}
                              className="text-theme"
                              fill="currentColor"
                            />
                          </span>
                        </span>
                      );
                    }
                    return (
                      <Star
                        key={i}
                        size={14}
                        className="text-theme"
                        fill="none"
                      />
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </Link>
    </>
  );
}
