// import { useState, useEffect, useRef } from "react";
// import { Link } from "react-router-dom";
// import { useDispatch } from "react-redux";
// import toast from "react-hot-toast";
// import Section from "../ui/Section";
// import HeartIcon from "../icons/HeartIcon";
// import { faCartShopping } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import Row from "../ui/Row";
// import { ChevronLeft, ChevronRight } from "lucide-react";
// import { useSelector } from "react-redux";
// import { fetchDiscounts } from "../../features/discounts/discountsThunk";
// import { getImageUrl } from "../utils/helper";
// import { useNavigate } from "react-router-dom";
// import { fetchProducts } from "../../features/products/productsThunk";
// import { useAddToWishlist } from "../wishlist/handleAddTowishlist";

// import {
//   createCart,
//   addToCart,
//   fetchCart,
// } from "../../features/cart/cartThunk";

// import ProductCard from "../productcard/ProductCard";

// export default function OfferSlider({ setShowLoginPopup }) {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const scrollRef = useRef();
//   const { token } = useSelector((state) => state.auth);
//   const { cart } = useSelector((state) => state.cart);
//   const { handleAddToWishlist } = useAddToWishlist(setShowLoginPopup);
//   const [addingToCart, setAddingToCart] = useState(false);
//   const [visibleCount, setVisibleCount] = useState(20);
//   const [activeOffer, setActiveOffer] = useState("all");
//   const [currentTime, setCurrentTime] = useState(new Date());

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentTime(new Date());
//     }, 1000);

//     return () => clearInterval(interval);
//   }, []);
//   const { discounts = [] } = useSelector((state) => state.discounts);

//   const { products = [], loading: productLoading } = useSelector(
//     (state) => state.products,
//   );
//   useEffect(() => {
//     dispatch(fetchDiscounts());
//     dispatch(fetchProducts());
//   }, [dispatch]);

//   const scroll = (direction) => {
//     const scrollAmount = 300;

//     if (direction === "left") {
//       scrollRef.current.scrollBy({
//         left: -scrollAmount,
//         behavior: "smooth",
//       });
//     } else {
//       scrollRef.current.scrollBy({
//         left: scrollAmount,
//         behavior: "smooth",
//       });
//     }
//   };

//   const getRemainingTime = (endDate) => {
//     const end = new Date(endDate).getTime();
//     const now = currentTime.getTime();

//     let diff = end - now;

//     if (diff <= 0) return "00:00:00";

//     const hours = Math.floor(diff / (1000 * 60 * 60));
//     diff %= 1000 * 60 * 60;

//     const minutes = Math.floor(diff / (1000 * 60));
//     diff %= 1000 * 60;

//     const seconds = Math.floor(diff / 1000);

//     return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
//       .toString()
//       .padStart(2, "0")}`;
//   };

//   const getTimeDiff = (endDate) => {
//     const end = new Date(endDate).getTime();
//     const now = currentTime.getTime();
//     return end - now;
//   };

//   const filteredProducts =
//     activeOffer === "all"
//       ? products.filter((p) => p.discount_id)
//       : products.filter((p) => p.discount_id && p.discount_id === activeOffer);

//   const visibleProducts = filteredProducts.slice(0, visibleCount);

//   useEffect(() => {
//     setVisibleCount(20);
//   }, [filteredProducts.length]);

//   const getDiscountedPrice = (product) => {
//     const originalPrice = product?.variants?.[0]?.price || 0;
//     const discount =
//       product?.discount?.discount_value ?? product?.discount?.value ?? 0;
//     const discountType =
//       product?.discount?.discount_type ?? product?.discount?.type ?? "none";

//     let discountedPrice = originalPrice;
//     if (discountType === "percentage") {
//       discountedPrice = originalPrice - (originalPrice * discount) / 100;
//     } else if (discountType === "fixed" || discountType === "flat") {
//       discountedPrice = originalPrice - discount;
//     }

//     return {
//       originalPrice,
//       discountedPrice: Math.max(0, discountedPrice),
//       discountValue: discount,
//       discountType,
//     };
//   };

//   const getUniqueColors = (variants) => {
//     const colorMap = new Map();
//     variants?.forEach((variant) => {
//       const colorObj = variant?.color_id || variant?.color?.[0];
//       if (colorObj?.code && !colorMap.has(colorObj.code)) {
//         colorMap.set(colorObj.code, colorObj.name);
//       }
//     });
//     return Array.from(colorMap.entries()).map(([code, name]) => ({
//       code,
//       name,
//     }));
//   };

//   const handleAddToCart = async (product) => {
//     if (!token) {
//       setShowLoginPopup(true);
//       return;
//     }

//     const variant = product?.variants?.[0];
//     if (!variant?._id) {
//       toast.error("Variant not found!");
//       return;
//     }

//     setAddingToCart(true);

//     try {
//       let cartId = cart?._id || localStorage.getItem("cart_id");

//       if (!cartId) {
//         const user = JSON.parse(localStorage.getItem("user") || "{}");
//         if (!user?._id) {
//           toast.error("Please login again");
//           setShowLoginPopup(true);
//           return;
//         }
//         const newCart = await dispatch(
//           createCart({ user_id: user._id }),
//         ).unwrap();
//         cartId = newCart._id;
//       }

//       await dispatch(
//         addToCart({
//           cart_id: cartId,
//           product_id: product._id,
//           variant_id: variant._id,
//           quantity: 1,
//         }),
//       ).unwrap();

//       await dispatch(fetchCart(cartId));
//       navigate("/cart");
//       toast.success("Added to cart successfully!");
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to add to cart");
//     } finally {
//       setAddingToCart(false);
//     }
//   };
//   return (
//     <>
//       <Section>
//         <Row className="relative">
//           <button
//             onClick={() => scroll("left")}
//             className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow p-2 py-3 rounded-[5px]"
//           >
//             <ChevronLeft size={20} />
//           </button>
//           <div
//             ref={scrollRef}
//             className="flex gap-3 overflow-x-auto scroll-smooth px-10 py-3 no-scrollbar"
//           >
//             <button
//               onClick={() => setActiveOffer("all")}
//               className={`whitespace-nowrap px-4 py-2 rounded-[5px] border text-sm transition
//     ${
//       activeOffer === "all" ? "bg-[#f32f94] text-white" : "bg-white text-black"
//     }`}
//             >
//               All
//             </button>
//             {discounts
//               .filter((cat) => cat.status === "active")
//               .map((cat) => (
//                 <button
//                   key={cat._id}
//                   onClick={() => setActiveOffer(cat._id)}
//                   className={`whitespace-nowrap px-4 py-2 rounded-[5px] border text-sm transition
//       ${
//         activeOffer === cat._id
//           ? "bg-[#f32f94] text-white"
//           : "bg-white text-black"
//       }`}
//                 >
//                   {cat.name}
//                 </button>
//               ))}
//           </div>
//           <button
//             onClick={() => scroll("right")}
//             className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow p-2 py-3 rounded-[5px]"
//           >
//             <ChevronRight size={20} />
//           </button>
//         </Row>

//         <Row className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-[10px] lg:gap-[30px] lg:px-0 sm:px-2 pt-[50px] custom-lg:pt-[100px]">
//           {productLoading ? (
//             <p>Loading products...</p>
//           ) : visibleProducts.length > 0 ? (
//             visibleProducts.map((p, index) => {
//               const {
//                 originalPrice,
//                 discountedPrice,
//                 discountValue,
//                 discountType,
//               } = getDiscountedPrice(p);
//               const uniqueColors = getUniqueColors(p.variants);

//               return (
//                 <Link
//                   to={`/products/${p._id}`}
//                   key={p._id}
//                   className="relative overflow-hidden transform transition-transform cursor-pointer"
//                 >
//                   <div className="relative group">
//                     <img
//                       src={getImageUrl(
//                         p.variants?.[0]?.images?.[0] ||
//                           p.images?.[0] ||
//                           "/uploads/placeholder.png",
//                       )}
//                       alt={p.name}
//                       className="w-full h-[227px] md:h-[227px] lg:h-[355px] transform transition-transform duration-300 hover:scale-105"
//                     />

//                     <div className="absolute top-3 right-3 opacity-100 transition-opacity duration-300 z-10">
//                       <button
//                         onClick={(e) => {
//                           e.preventDefault();
//                           e.stopPropagation();
//                           handleAddToWishlist(p);
//                         }}
//                         className="w-[20px] h-[20px] md:w-[20px] md:h-[20px] lg:w-[40px] lg:h-[40px] flex items-center justify-center bg-white text-black rounded-full border hover:scale-110 transition"
//                       >
//                         <HeartIcon className="w-[12px] h-[12px] sm:w-[12px] sm:h-[12px] lg:w-[26px] lg:h-[24px]" />
//                       </button>
//                     </div>

//                     <div className="absolute top-[38px] md:top-[38px] lg:top-[60px] right-3 opacity-100 transition-opacity duration-300 z-10">
//                       <button
//                         onClick={(e) => {
//                           e.preventDefault();
//                           e.stopPropagation();
//                           handleAddToCart(p);
//                         }}
//                         disabled={addingToCart}
//                         className="w-[20px] h-[20px] md:w-[20px] md:h-[20px] lg:w-[40px] lg:h-[40px] flex items-center justify-center bg-white text-black rounded-full border hover:scale-110 transition disabled:opacity-50"
//                       >
//                         <FontAwesomeIcon
//                           icon={faCartShopping}
//                           className="w-[12px] h-[12px] sm:w-[12px] sm:h-[12px] lg:w-[26px] lg:h-[24px]"
//                         />
//                       </button>
//                     </div>

//                     {/* <div className="absolute inset-3 bg-[rgba(12,11,11,0.3)] border border-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-400">
//                     <p className="text-white font-medium text-center">
//                       View product
//                     </p>
//                   </div> */}
//                   </div>

//                   <div className="pt-[10px] text-center">
//                     <div className="flex items-center gap-2 justify-center mb-1">
//                       {p.discount && (
//                         <>
//                           <span className="bg-[rgba(239,58,150,0.09)] text-theme text-[12px] md:text-[15px] px-2 py-1 rounded font-bold">
//                             {p.discount.type === "percentage"
//                               ? `${p.discount.value}% OFF`
//                               : `₹${p.discount.value} OFF`}
//                           </span>

//                           {getTimeDiff(p.discount.end_date) <=
//                           24 * 60 * 60 * 1000 ? (
//                             <span className="text-theme text-[12px] md:text-[15px] font-bold">
//                               Ends in {getRemainingTime(p.discount.end_date)}
//                             </span>
//                           ) : (
//                             <span className="text-theme text-[12px] md:text-[15px] font-bold">
//                               Limited time deal
//                             </span>
//                           )}
//                         </>
//                       )}
//                     </div>

//                     <p className="text-black text-[12px] md:text-[15px] mb-1 line-clamp-2">
//                       {p.name}
//                     </p>
//                     <div>
//                       <p className="text-black text-[12px] md:text-[15px] lg:text-[15px] mb-1">
//                         Rs{" "}
//                         {discountedPrice.toLocaleString("en-IN", {
//                           maximumFractionDigits: 0,
//                         })}
//                         {discountValue > 0 && (
//                           <span className="line-through text-[#BCBCBC] text-[10px] md:text-[12px] lg:text-[12px] ml-[5px]">
//                             Rs{" "}
//                             {originalPrice.toLocaleString("en-IN", {
//                               maximumFractionDigits: 0,
//                             })}
//                           </span>
//                         )}
//                       </p>
//                       {discountValue > 0 && (
//                         <p className="text-theme text-[10px] lg:text-[12px] font-medium bg-[rgba(239,58,150,0.09)] p-[1px] w-[60px] block mx-auto text-center">
//                           {discountType === "percentage"
//                             ? `${discountValue}% OFF`
//                             : `₹${discountValue} OFF`}
//                         </p>
//                       )}
//                     </div>

//                     <div className="flex gap-1.5 mt-2 justify-center">
//                       {uniqueColors.map((clr, idx) => (
//                         <span
//                           key={idx}
//                           className="w-4 h-4 rounded-full border-black border-2"
//                           title={clr.name}
//                           style={{ backgroundColor: clr.code }}
//                         ></span>
//                       ))}
//                     </div>
//                   </div>
//                 </Link>
//               );
//             })
//           ) : activeOffer ? (
//             <p className="col-span-4 text-center text-gray-400 py-10">
//               coming soon products for this offer.
//             </p>
//           ) : null}

//           {filteredProducts.length > visibleCount && (
//             <div className="col-span-4 flex justify-center mt-10">
//               <button
//                 onClick={() => setVisibleCount((prev) => prev + 20)}
//                 className="text-[18px] theme-border text-theme w-[187px] h-[70px] sm:w-[220px] sm:h-[89px] font-medium rounded-[10px] shadow-lg transition duration-300 uppercase"
//                 style={{
//                   boxShadow: "inset 0px 0px 30px rgba(244, 50, 151, 0.25)",
//                 }}
//               >
//                 Load More
//               </button>
//             </div>
//           )}
//         </Row>
//       </Section>
//     </>
//   );
// }

import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Section from "../ui/Section";
import Row from "../ui/Row";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fetchDiscounts } from "../../features/discounts/discountsThunk";
import { fetchProducts } from "../../features/products/productsThunk";
import ProductCard from "../productcard/ProductCard"; // ✅ Import

export default function OfferSlider({ setShowLoginPopup }) {
  const dispatch = useDispatch();
  const scrollRef = useRef();
  const [visibleCount, setVisibleCount] = useState(20);
  const [activeOffer, setActiveOffer] = useState("all");

  const { discounts = [] } = useSelector((state) => state.discounts);
  const { products = [], loading: productLoading } = useSelector(
    (state) => state.products,
  );

  useEffect(() => {
    dispatch(fetchDiscounts());
    dispatch(fetchProducts());
  }, [dispatch]);

  const scroll = (direction) => {
    scrollRef.current.scrollBy({
      left: direction === "left" ? -300 : 300,
      behavior: "smooth",
    });
  };

  // ── Filter: discount_id હોય એ products ─────────────────────────────────────
  const filteredProducts =
    activeOffer === "all"
      ? products.filter((p) => p.discount_id)
      : products.filter((p) => p.discount_id && p.discount_id === activeOffer);

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  useEffect(() => {
    setVisibleCount(20);
  }, [filteredProducts.length]);

  return (
    <Section>
      {/* ── Discount Filter Tabs ── */}
      <Row className="relative">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow p-2 py-3 rounded-[5px]"
        >
          <ChevronLeft size={20} />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scroll-smooth px-10 py-3 no-scrollbar"
        >
          <button
            onClick={() => setActiveOffer("all")}
            className={`whitespace-nowrap px-4 py-2 rounded-[5px] border text-sm transition
              ${activeOffer === "all" ? "bg-[#f32f94] text-white" : "bg-white text-black"}`}
          >
            All
          </button>
          {discounts
            .filter((cat) => cat.status === "active")
            .map((cat) => (
              <button
                key={cat._id}
                onClick={() => setActiveOffer(cat._id)}
                className={`whitespace-nowrap px-4 py-2 rounded-[5px] border text-sm transition
                  ${activeOffer === cat._id ? "bg-[#f32f94] text-white" : "bg-white text-black"}`}
              >
                {cat.name}
              </button>
            ))}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow p-2 py-3 rounded-[5px]"
        >
          <ChevronRight size={20} />
        </button>
      </Row>

      {/* ── Products Grid ── */}
      <Row className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-[10px] lg:gap-[30px] pt-[50px]">
        {productLoading ? (
          <p>Loading products...</p>
        ) : visibleProducts.length > 0 ? (
          visibleProducts.map((p) => (
            <ProductCard
              key={p._id}
              product={p}
              setShowLoginPopup={setShowLoginPopup}
            />
          ))
        ) : (
          <p className="col-span-4 text-center text-gray-400 py-10">
            Coming soon products for this offer.
          </p>
        )}

        {/* ── Load More ── */}
        {filteredProducts.length > visibleCount && (
          <div className="col-span-4 flex justify-center mt-10">
            <button
              onClick={() => setVisibleCount((prev) => prev + 20)}
              className="text-[18px] theme-border text-theme w-[187px] h-[70px] sm:w-[220px] sm:h-[89px] font-medium rounded-[10px] shadow-lg transition duration-300 uppercase"
              style={{
                boxShadow: "inset 0px 0px 30px rgba(244, 50, 151, 0.25)",
              }}
            >
              Load More
            </button>
          </div>
        )}
      </Row>
    </Section>
  );
}
