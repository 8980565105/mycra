import React, { useState, useEffect, useCallback, useMemo } from "react";
import HeartIcon from "../icons/HeartIcon";
import { getImageUrl } from "../utils/helper";
import { Link } from "react-router-dom";
import { useAddToWishlist } from "../wishlist/handleAddTowishlist";
import { faCartShopping } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchProductReviews } from "../../features/reivews/reviewsThunk";
import { Star } from "lucide-react";
import {
  addToCart,
  createCart,
  fetchCart,
} from "../../features/cart/cartThunk";
import toast from "react-hot-toast";

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

  const getDiscountedPrice = (product) => {
    const originalPrice = product?.variants?.[0]?.price || 0;
    const discount = product?.discount?.value || 0;
    const discountType = product?.discount?.type || "none";

    let discountedPrice = originalPrice;

    if (discountType === "percentage") {
      discountedPrice = originalPrice - (originalPrice * discount) / 100;
    } else if (discountType === "flat") {
      discountedPrice = originalPrice - discount;
    }

    return {
      originalPrice,
      discountedPrice,
      discountValue: discount,
      discountType,
    };
  };

  // useEffect(() => {
  //   if (product?._id) {
  //     dispatch(
  //       fetchProductReviews({ productId: product._id, page: 1, limit: 100 }),
  //     );
  //   }
  // }, [dispatch, product?._id]);

  const reviewData = useMemo(() => {
    const reviews = productReviewData?.reviews || [];
    if (reviews.length === 0) return { average: 0, total: 0 };
    const total = reviews.length;
    const sum = reviews.reduce(
      (acc, curr) => acc + (Number(curr.rating) || 0),
      0,
    );
    return { average: (sum / total).toFixed(1), total };
  }, [productReviewData]);

  const [currentIndex, setCurrentIndex] = useState(0);

  const firstVariantImages = Array.isArray(product?.variants?.[0]?.images)
    ? product.variants[0].images
    : [];
  const mainImages = Array.isArray(product?.images) ? product.images : [];
  const allImages =
    firstVariantImages.length > 0 ? firstVariantImages : mainImages;

  const displayedImage = getImageUrl(allImages[currentIndex]);
  const hasMultipleImages = allImages.length > 1;

  const { handleAddToWishlist } = useAddToWishlist(setShowLoginPopup);

  const wishlistProductIds = useSelector((state) => state.wishlist.productIds);
  const isWishlisted = wishlistProductIds.includes(product._id);

  const uniqueColors = (() => {
    const seen = new Set();
    const result = [];

    (product?.variants || []).forEach((variant) => {
      const firstColor = Array.isArray(variant?.color)
        ? variant.color[0]
        : variant?.color;

      if (!firstColor) return;

      const colorCode = firstColor?.code || firstColor;
      const colorName = firstColor?.name || "";
      if (seen.has(colorCode)) return;
      seen.add(colorCode);

      result.push({ code: colorCode, name: colorName });
    });

    return result;
  })();

  const getVariantForColor = (product, colorCode) => {
    return (
      product?.variants?.find((v) =>
        v.color?.some((c) => c.code === colorCode),
      ) || product?.variants?.[0]
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
  const currentSelectedColor = selectedColor || uniqueColors[0]?.code;
  const currentVariant = getVariantForColor(product, currentSelectedColor);
  const isOutOfStock = currentVariant?.stock_quantity === 0;

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

              <div className="absolute bottom-0 left-0 flex flex-col space-y-2">
                {reviewData.total > 0 && (
                  <span className="flex items-center gap-[5px] bg-[rgba(239,58,150,0.09)] text-theme px-2 py-[3px] rounded-[2px] text-[12px] font-medium">
                    {reviewData.average}{" "}
                    <Star
                      size={12}
                      fill="currentColor"
                      className="text-yellow-500"
                    />
                  </span>
                )}
              </div>
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
                className="h-[26px] w-[26px] sm:h-[40px] sm:w-[40px] bg-white flex items-center justify-center rounded-full hover:bg-[var(--primary-color)]"
              >
                <FontAwesomeIcon
                  icon={faCartShopping}
                  className="w-[16px] h-[16px] sm:w-[26px] sm:h-[24px] hover:invert over:brightness-0 hover:contrast-200"
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

            <p className="sec-text-color text-14 mb-2 lowercase capitalize line-clamp-2">
              {product.name}
            </p>

            <div className="flex flex-wrap items-center gap-[5px] text-p mb-[5px]">
              <p className="text-p text-black">
                ₹{" "}
                {getDiscountedPrice(product).discountedPrice.toLocaleString(
                  "en-IN",
                  {
                    maximumFractionDigits: 0,
                  },
                )}
              </p>
              {getDiscountedPrice(product).discountValue > 0 && (
                <p className="line-through text-[#BCBCBC]">
                  ₹
                  {getDiscountedPrice(product).originalPrice.toLocaleString(
                    "en-IN",
                    {
                      maximumFractionDigits: 0,
                    },
                  )}
                </p>
              )}
              {getDiscountedPrice(product).discountValue > 0 && (
                <p className="text-theme text-p">
                  {getDiscountedPrice(product).discountType === "percentage"
                    ? `${getDiscountedPrice(product).discountValue}% Off`
                    : `₹${getDiscountedPrice(product).discountValue} Off`}
                </p>
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
            {product.rating !== undefined && product.rating !== null && (
              <div className="flex gap-[6px] mt-1">
                {Array(5)
                  .fill()
                  .map((_, i) => (
                    <span
                      key={i}
                      className={`text-sm ${
                        i < product.rating ? "text-theme" : "sec-text-color"
                      }`}
                    >
                      ★
                    </span>
                  ))}
              </div>
            )}
          </div>
        </div>
      </Link>
    </>
  );
}
