import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import Row from "../ui/Row";
import HeartIcon from "../icons/HeartIcon";
import { faCartShopping } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { getImageUrl } from "../utils/helper";
import { useAddToWishlist } from "../wishlist/handleAddTowishlist";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import {
  addToCart,
  createCart,
  fetchCart,
} from "../../features/cart/cartThunk";
import toast from "react-hot-toast";
import FlowerIcon from "../icons/FlowerIcon";
import { fetchWishlistByUser } from "../../features/wishlist/wishlistThunk";

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

const FeaturedProducts = ({ setShowLoginPopup }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const cart = useSelector((state) => state.cart.cart);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedColors, setSelectedColors] = useState({});
  const sliderRef = useRef();
  const { handleAddToWishlist } = useAddToWishlist(setShowLoginPopup);
  const cartItems = useSelector((state) => state.cart.items) || [];
  const userId = useSelector((state) => state.auth.user?._id);
  const { items: wishlistItems = [] } = useSelector((state) => state.wishlist);
  const isInWishlist = (productId, variantId) => {
    if (!productId || !variantId) return false;
    return wishlistItems.some(
      (w) =>
        (w.product_id?._id || w.product_id) === productId &&
        (w.variant_id?._id || w.variant_id) === variantId,
    );
  };
  const isInCart = (productId, variantId) => {
    if (!productId || !variantId) return false;
    return cartItems.some(
      (ci) =>
        (ci.product_id?._id || ci.product_id) === productId &&
        (ci.variant_id?._id || ci.variant_id) === variantId,
    );
  };
  const { items: categories = [], loading: catLoading } = useSelector(
    (state) => state.categories,
  );
  const { items: subcategories = [] } = useSelector(
    (state) => state.subcategories,
  );
  const { products = [], loading: productLoading } = useSelector(
    (state) => state.products,
  );
  const handleCategorySelect = (category) => {
    setActiveCategory(category._id);
  };
  const { productReviews } = useSelector((state) => state.reviews);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [mounted, setMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState("");
  const tabItems = subcategories.length > 0 ? subcategories : categories;
  useEffect(() => {
    if (userId) {
      dispatch(fetchWishlistByUser(userId));
    }
  }, [dispatch, userId]);
  useEffect(() => {
    const cartId = localStorage.getItem("cart_id");
    if (cartId) {
      dispatch(fetchCart(cartId));
    }
  }, [dispatch]);
  const getDiscountedPrice = (product) => {
    const variant = product?.variants?.[0] || {};
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
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (tabItems.length > 0) {
      handleCategorySelect(tabItems[0]);
    }
  }, [tabItems]);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const getUniqueColors = (variants) => {
    const colorMap = new Map();
    variants?.forEach((variant) => {
      variant.color?.forEach((clr) => {
        if (clr.code && !colorMap.has(clr.code)) {
          colorMap.set(clr.code, clr.name);
        }
      });
    });
    return Array.from(colorMap.entries()).map(([code, name]) => ({
      code,
      name,
    }));
  };

  const getVariantForColor = (product, colorCode) => {
    return (
      product?.variants?.find((v) =>
        v.color?.some((c) => c.code === colorCode),
      ) || product?.variants?.[0]
    );
  };
  if (!mounted) return null;
  const settings = {
    slidesToShow:
      windowWidth <= 480
        ? 2
        : windowWidth <= 767
          ? 3
          : windowWidth <= 980
            ? 4
            : windowWidth <= 1280
              ? 6
              : 9,
    slidesToScroll: 1,
    autoplay: true,
    speed: 5000,
    cssEase: "linear",
    autoplaySpeed: 0,
    initialSlide: 1,
    dots: false,
    infinite: true,
    arrows: false,
  };

  // const filteredProducts =
  //   activeCategory && products.length > 0
  //     ? products.filter((p) => {
  //         const hasFeaturedVariant = p?.variants?.some(
  //           (v) => v?.is_featured === true,
  //         );

  //         if (!hasFeaturedVariant) return false;

  //         const productCatId = p.category_id || "";

  //         if (productCatId === activeCategory) return true;

  //         const selectedTab = tabItems.find((t) => t._id === activeCategory);

  //         if (
  //           selectedTab &&
  //           selectedTab.parent_id &&
  //           productCatId === selectedTab.parent_id
  //         ) {
  //           return true;
  //         }

  //         return false;
  //       })
  //     : [];
  const filteredProducts =
    activeCategory && products.length > 0
      ? products.filter((p) => {
          if (p?.is_featured !== true) return false;

          const productCatId = p.category_id || "";

          if (productCatId === activeCategory) return true;

          const selectedTab = tabItems.find((t) => t._id === activeCategory);

          if (
            selectedTab &&
            selectedTab.parent_id &&
            productCatId === selectedTab.parent_id
          ) {
            return true;
          }

          return false;
        })
      : [];

  const limitedProducts = filteredProducts.slice(0, 8);
  const handleAddToCart = async (product) => {
    if (!token) {
      setShowLoginPopup(true);
      return;
    }
    const selectedColorCode = selectedColors[product._id];
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
  return (
    <>
      <section className="w-full py-[25px] md:py-[50px]">
        <div className="flex flex-col items-center">
          <div className="relative flex justify-center items-center w-full mb-[50px] md:mb-[90px]">
            <div className="w-[18px] md:w-[50px] border-t border-black"></div>

            <div className="relative mx-2 md:mx-4 flex flex-col items-center justify-center">
              <h2 className="font-h2 text-black whitespace-nowrap relative z-10">
                Featured Products
              </h2>
              <FlowerIcon className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[40px] h-[25px] md:w-[110px] md:h-[80px] pointer-events-none z-0" />
            </div>
            <div className="w-[18px] md:w-[50px] border-t border-black"></div>
          </div>
          <Row>
            {catLoading ? (
              <p>Loading categories...</p>
            ) : Array.isArray(tabItems) && tabItems.length > 0 ? (
              <Slider ref={sliderRef} {...settings}>
                {tabItems.map((cat) => (
                  <div key={cat._id} className="px-[5px]">
                    <button
                      onClick={() => handleCategorySelect(cat)}
                      className={` rounded-[30px] flex items-center justify-center 
                      w-full h-[22px] md:h-[38px] text-center transition
                      ${
                        activeCategory === cat._id
                          ? "bg-color text-white"
                          : "text-black "
                      }`}
                      style={{
                        boxShadow: "inset 0 0 5px 1px rgba(0, 0, 0, 0.25)",
                      }}
                    >
                      <p className="text-[12px] md:text-[16px] font-medium">
                        {cat.name}
                      </p>
                    </button>
                  </div>
                ))}
              </Slider>
            ) : (
              <p>No categories available.</p>
            )}
          </Row>
          <Row className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-[10px] lg:gap-[30px] lg:px-0 sm:px-2 pt-[50px] custom-lg:pt-[100px]">
            {productLoading ? (
              <p>Loading products...</p>
            ) : Array.isArray(filteredProducts) &&
              filteredProducts.length > 0 ? (
              limitedProducts.map((p, index) => {
                const {
                  originalPrice,
                  discountedPrice,
                  hasOffer,
                  discountPercent,
                } = getDiscountedPrice(p);
                const uniqueColors = getUniqueColors(p.variants);
                const reviews = productReviews?.[p?._id]?.reviews || [];
                let reviewAverage = 0;
                let reviewTotal = 0;
                if (reviews.length > 0) {
                  reviewTotal = reviews.length;
                  const sum = reviews.reduce(
                    (acc, curr) => acc + (Number(curr.rating) || 0),
                    0,
                  );
                  reviewAverage = (sum / reviewTotal).toFixed(1);
                }
                const discount = p?.discount || {};
                const hasDiscount = discount?.value > 0;
                const endsWithin24h =
                  discount?.end_date &&
                  new Date(discount.end_date).getTime() - Date.now() <=
                    24 * 60 * 60 * 1000;
                const currentSelectedColor =
                  selectedColors[p._id] || uniqueColors[0]?.code;
                const currentVariant = getVariantForColor(
                  p,
                  currentSelectedColor,
                );
                const isOutOfStock = currentVariant?.stock_quantity === 0;
                const wishlisted = isInWishlist(p._id, currentVariant?._id);
                return (
                  <Link
                    to={`/products/${p._id}`}
                    key={index}
                    className="relative overflow-hidden transform transition-transform cursor-aero_arrow.cur"
                  >
                    <div className="relative group">
                      <img
                        src={getImageUrl(
                          p.variants?.[0]?.images?.[0] ||
                            p.images?.[0] ||
                            "/uploads/placeholder.png",
                        )}
                        alt={p.name}
                        className="w-full h-[227px] md:h-[227px] lg:h-[355px] transform transition-transform duration-300"
                      />

                      <div className="absolute top-3 right-3 opacity-100 transition-opacity duration-300 z-10">
                        <div className="flex flex-col space-y-2">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleAddToWishlist(p, currentVariant);
                            }}
                            className={`w-[20px] h-[20px] md:w-[20px] md:h-[20px] lg:w-[40px] lg:h-[40px] flex items-center justify-center rounded-full border transition-all duration-200
                ${
                  wishlisted
                    ? "bg-[var(--primary-color)] border-[var(--primary-color)] text-white"
                    : "bg-white text-black hover:bg-[var(--primary-color)] hover:border-[var(--primary-color)]"
                }`}
                          >
                            <HeartIcon
                              className={`w-[12px] h-[12px] sm:w-[12px] sm:h-[12px] lg:w-[20px] lg:h-[20px] ${
                                wishlisted
                                  ? "invert brightness-0 contrast-200"
                                  : "hover:invert hover:brightness-0 hover:contrast-200"
                              }`}
                            />
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleAddToCart(p);
                            }}
                            className={`w-[20px] h-[20px] md:w-[20px] md:h-[20px]
  lg:w-[40px] lg:h-[40px]
  flex items-center justify-center rounded-full border
  transition-all duration-200
  ${
    isInCart(p._id, currentVariant?._id)
      ? "bg-[var(--primary-color)] border-[var(--primary-color)] text-white"
      : "bg-white text-black hover:bg-[var(--primary-color)] hover:border-[var(--primary-color)] hover:text-white"
  }`}
                          >
                            <FontAwesomeIcon
                              icon={faCartShopping}
                              className="w-[12px] h-[12px] lg:w-[20px] lg:h-[20px]"
                            />
                          </button>
                        </div>
                      </div>
                      <div className="absolute inset-3 bg-[rgba(12,11,11,0.3)] border border-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-400">
                        <p className="text-white font-medium text-center">
                          View product
                        </p>
                      </div>
                    </div>
                    <div className="pt-[10px] text-center">
                      <div className="flex items-center gap-2 justify-center mb-1">
                        {hasDiscount && (
                          <div className="flex items-center gap-2 justify-left mb-1">
                            <span className="bg-theme text-theme text-[12px] md:text-[15px] px-2 py-1 rounded font-bold">
                              {discount?.type === "percentage"
                                ? `${discount?.value}% OFF`
                                : `₹${discount?.value} OFF`}
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
                      <p className="text-black text-[12px] md:text-[15px] mb-1 line-clamp-1">
                        {p.name}
                      </p>
                      <div className="flex flex-col justify-center items-center">
                        <p className="text-black text-[12px] md:text-[15px] lg:text-[15px] mb-1">
                          Rs{" "}
                          {discountedPrice.toLocaleString("en-IN", {
                            maximumFractionDigits: 0,
                          })}
                          {hasOffer && (
                            <span className="line-through text-light text-[10px] md:text-[12px] lg:text-[12px] ml-[5px]">
                              Rs{" "}
                              {originalPrice.toLocaleString("en-IN", {
                                maximumFractionDigits: 0,
                              })}
                            </span>
                          )}
                        </p>
                        {hasOffer && (
                          <p className="discount-badge">
                            {discountPercent}% OFF
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1.5 py-1 justify-center">
                        {uniqueColors.map((clr, idx) => {
                          const clrVariant = getVariantForColor(p, clr.code);
                          const clrOutOfStock =
                            clrVariant?.stock_quantity === 0;
                          const isSelected = currentSelectedColor === clr.code;
                          return (
                            <button
                              key={idx}
                              title={
                                clrOutOfStock
                                  ? `${clr.name} (Out of Stock)`
                                  : clr.name
                              }
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedColors((prev) => ({
                                  ...prev,
                                  [p._id]: clr.code,
                                }));
                              }}
                              className={`w-4 h-4 rounded-full border-2 transition-transform hover:scale-110
                                ${isSelected ? "border-black scale-110" : ""}
                              `}
                              style={{ backgroundColor: clr.code }}
                            />
                          );
                        })}
                      </div>
                      {isOutOfStock && (
                        <p className="text-theme text-[12px] mt-1">
                          Out of Stock
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })
            ) : (
              <p>No products available.</p>
            )}
          </Row>
        </div>
      </section>
    </>
  );
};

export default FeaturedProducts;
