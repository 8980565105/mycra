// import { useState, useEffect } from "react";
// import { Heart, ChevronRight } from "lucide-react";
// import { useDispatch } from "react-redux";
// import { fetchtypes } from "../features/types/typeThunk";
// import Row from "../components/ui/Row";
// import Section from "../components/ui/Section";
// import FlowerIcon from "../components/icons/FlowerIcon";
// import { useNavigate } from "react-router-dom";
// import faqBg from "../assets/size-bg.png"
// import shopsaree2 from "../assets/shopsaree2.jpg"
// import shopsaree1 from "../assets/shopsaree1.jpg"
// import shoppingImg from "../assets/shopping.png";
// import collectionImg from "../assets/herobanner.png";


// const CATEGORIES = [
//   { id: "saree", name: "Saree", image: shopsaree1 },
//   { id: "kurti", name: "Kurti", image: shopsaree1 },
//   { id: "crop-tops", name: "Crop Tops", image: shopsaree1 },
//   { id: "jeans", name: "Jeans", image: shopsaree1 },
//   { id: "nightwear", name: "Nightwear", image: shopsaree1 },
// ];

// const SUBCATEGORIES = [
//   { id: "anarkali", name: "Anarkali", image: shopsaree2 },
//   { id: "straight-cut", name: "Straight Cut", image: shopsaree2 },
//   { id: "a-line", name: "A-Line" ,image: shopsaree2},
//   { id: "printed", name: "Printed" , image: shopsaree2},
//   { id: "festive", name: "Festive" , image: shopsaree2},
// ];

// const FILTER_CHIPS = ["All", "Cotton", "Under Rs 999", "New arrivals"];

// const PRODUCTS = [
//   {
//     id: 1,
//     name: "Floral cotton jaipuri kurta",
//     price: 1099,
//     mrp: 1699,
//     discount: 40,
//     colors: ["#e2b6c6", "#7b8d6b", "#3d3d3d"],
//   },
//   {
//     id: 2,
//     name: "Women kurta and trouser set",
//     price: 1999,
//     mrp: null,
//     discount: null,
//     colors: ["#e6d5b8", "#c65b4e"],
//   },
//   {
//     id: 3,
//     name: "Printed anarkali kurta",
//     price: 1399,
//     mrp: 1899,
//     discount: 25,
//     colors: ["#6c93c7", "#dbb8e0"],
//   },
//   {
//     id: 4,
//     name: "Pink floral handwork anarkali",
//     price: 1599,
//     mrp: null,
//     discount: null,
//     colors: ["#e2b6c6", "#5a4a3f"],
//   },
//   {
//     id: 5,
//     name: "Self design banarasi silk kurta",
//     price: 1499,
//     mrp: 2299,
//     discount: 45,
//     colors: ["#8a1f3d", "#d4af37"],
//   },
//   {
//     id: 6,
//     name: "Green cotton straight kurti",
//     price: 1099,
//     mrp: null,
//     discount: null,
//     colors: ["#5b7a4f"],
//   },
//   {
//     id: 7,
//     name: "Full sleeve printed fancy kurti",
//     price: 999,
//     mrp: 1429,
//     discount: 30,
//     colors: ["#7a4a2d", "#e6d5b8"],
//   },
//   {
//     id: 8,
//     name: "Maroon self design festive kurti",
//     price: 1899,
//     mrp: null,
//     discount: null,
//     colors: ["#6e1f2a"],
//   },
// ];

// const FOOTER_COLS = [
//   {
//     title: "Navigation",
//     links: ["About", "Contact", "Offers"],
//   },
//   {
//     title: "Customer Support",
//     links: ["Return policy", "FAQ", "Terms"],
//   },
// ];


// const collectionData = {
//   name: "Fashion",
//   eyebrow: "MyCra Fashion Collection",

//   heroTitle: "Style made for every version of you.",

//   heroDescription:
//     "Discover feminine, contemporary and effortless fashion collections curated for everyday moments, special occasions and everything in between.",

//   storyTitle: "Wear your story.",

//   storyDescription:
//     "From timeless essentials to expressive seasonal pieces, our fashion collection brings together styles designed to make everyday dressing feel effortless and personal.",
// };


// export default function CollectionAbout() {
//     const dispatch = useDispatch();
//     const navigate = useNavigate();
//   const [activeCategory, setActiveCategory] = useState("kurti");
//   const [activeChip, setActiveChip] = useState("All");
//   const [visibleCount, setVisibleCount] = useState(8);

//   const activeCategoryName = CATEGORIES.find(
//     (c) => c.id === activeCategory,
//   )?.name;
  

//   const visibleProducts = PRODUCTS.slice(0, visibleCount);
//   const hasMore = visibleCount < PRODUCTS.length;

//     useEffect(() => {
//       // dispatch(fetchAttributes());
//       dispatch(fetchtypes());
//       // dispatch(fetchProductLabels());
//     }, [dispatch]);


//    const collection = collectionData;

//   const handleImageError = (event) => {
//     event.currentTarget.src = shoppingImg;
//   };

//   const scrollToCategories = () => {
//     document.getElementById("collection-categories")?.scrollIntoView({
//       behavior: "smooth",
//     });
//   };
  
//   return (
//     <>
    // <Section className="!pt-5">

    //   <Row >

    //    <div className="relative overflow-hidden bg-theme rounded-[18px] px-6 py-10 md:px-12 md:py-12 flex items-center justify-between ">
    //       <div className="relative z-10">
    //         <p className="uppercase tracking-[0.12em] text-[12px] font-bold text-primary mb-2.5">
    //           Shop by category
    //         </p>
    //         <h1 className="text-[28px] md:text-[40px] font-bold leading-tight max-w-[520px]">
    //           Women collection
    //         </h1>
    //         <p className="mt-3  max-w-[460px] text-[#989696] text-14 break">
    //           Handpicked cotton, printed and festive styles for everyday and
    //           celebration wear.
    //         </p>
    //         <span className="mt-5 inline-block text-[13px] bg-white border border-[#EEE3DD] px-4 py-2 rounded-full">
    //           {PRODUCTS.length * 16} styles curated for you
    //         </span>
    //       </div>
    //       <div className="hidden sm:flex relative z-10 w-[110px] h-[110px] md:w-[150px] md:h-[150px] rounded-full bg-white shadow-[0_0_0_2px_#FDEDF3] items-center justify-center flex-shrink-0 text-[11px] text-[#c9beb6]">
    //         Category photo
    //       </div>
    //       <span className="absolute -right-10 -top-10 w-[230px] h-[230px] rounded-full border border-[#E23E80]/25" />
    //       <span className="absolute right-16 -bottom-[70px] w-[160px] h-[160px] rounded-full border border-[#F0997B]/30" />
    //     </div> 
  
       
    //   </Row>

    // </Section>
//       <Section >
//           <Row>
//            <h2 className="text-[22px] font-bold mb-6 text-primary">
//             Browse Categories
//           </h2>
//         <div className="flex gap-7 overflow-x-auto">
//           {CATEGORIES.map((cat) => {
//             const isActive = cat.id === activeCategory;
//             return (
//               <button
//                 key={cat.id}
//                 onClick={() => setActiveCategory(cat.id)}
//                 className="flex flex-col items-center gap-2.5 flex-shrink-0"
//               >
//                  <img
//                     src={cat.image}
//                     alt={cat.name}
//                     loading="lazy"
//                     className={`w-[100px] h-[100px] rounded-full bg-[#FAF3EE] flex items-center justify-center text-[11px] text-[#8A817A] border-2 ${
//                             isActive ? "theme-border " : "border-transparent"
//                           }`}
//                   />
//                 <span
//                   className={` text-dark text-center text-[16px] ${
//                     isActive ? "text-primary font-bold" : "text-[#000000]"
//                   }`}
//                 >
//                   {cat.name}
//                 </span>
//               </button>
//             );
//           })}
//         </div>
//         </Row>
//           </Section>
//         {/* subcategory grid */}
//         <Section>
//           <Row>
//           <div className="relative flex justify-center items-center w-full mb-[50px] md:mb-[90px]">
//             <div className="w-[18px] md:w-[50px] border-t border-black"></div>

//             <div className="relative mx-2 md:mx-4 flex flex-col items-center justify-center">
//               <h2 className="font-h2 text-black whitespace-nowrap relative z-10">
//                 {activeCategoryName} subcategories
//               </h2>
//               <FlowerIcon className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[40px] h-[25px] md:w-[110px] md:h-[80px] pointer-events-none z-0" />
//             </div>
//             <div className="w-[18px] md:w-[50px] border-t border-black"></div>
//           </div>
//         {/* <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 mb-14">
//           {SUBCATEGORIES.map((sub) => (
//             <button
//               key={sub.id}
//               className="group flex flex-col items-center gap-3.5"
//             >
//               <div className="w-full aspect-square max-w-[150px] rounded-full bg-[#FAF3EE] border-[3px] border-[#FDEDF3] flex items-center justify-center text-[12px] text-[#8A817A] transition-colors duration-200 group-hover:border-[#E23E80]">
//                 {sub.name}
//               </div>
//               <p className="text-[15px] font-semibold text-center">
//                 {sub.name}
//                 <span className="block w-5 h-0.5 bg-[#E23E80] mx-auto mt-1.5" />
//               </p>
//             </button>
//           ))}
//         </div> */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-6 lg:gap-8 mb-14">
//           {SUBCATEGORIES.slice(0, 4).map((sub, index) => (
//             <button
//               key={sub.id}
//               type="button"
//               onClick={() => {
//                 navigate(`/shop?subcategory=${sub.slug}`);
//               }}
//               className="group relative text-left"
//             >
//               {/* CARD */}
//               <div className="relative">

//                 {/* BACKGROUND FRAME */}
//                 <div
//                   className={`
//                     absolute
//                     inset-0
//                     translate-x-[7px]
//                     translate-y-[7px]
//                     border-[3px]
//                     pointer-events-none
//                     border-[#ef3a96]

//                   `}
//                 />

//                 {/* IMAGE */}
//                 <div className="relative z-10 aspect-[3/4] overflow-hidden bg-[#F5F1ED] border-[6px] border-white">

//                   <img
//                     src={sub.image}
//                     alt={sub.name}
//                     loading="lazy"
//                     className="
//                       w-full
//                       h-full
//                       object-cover
//                       transition-transform
//                     "
//                   />

//                   {/* SOFT IMAGE OVERLAY */}
//                   <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />

//                 </div>

//                 {/* LABEL */}
//                 <div
//                   className="
//                     absolute
//                     z-20
//                     left-1/2
//                     -translate-x-1/2
//                     bottom-[-22px]
//                     min-w-[75%]
//                     sm:min-w-[70%]
//                     px-4
//                     sm:px-5
//                     py-2.5
//                     sm:py-3
//                     rounded-md
//                     border border-transparent
//                     group-hover:border-[#ef3a96]
//                   "
//                   style={{
//                       backgroundImage: `url(${faqBg})`,
//                       backgroundPosition: "center",
//                       backgroundRepeat: "no-repeat",
//                       backgroundSize: "cover",
//                     }}
//                 >
//                   <p className="text-center font-serif text-sm sm:text-base md:text-lg font-semibold text-[#292323] whitespace-nowrap">
//                     {sub.name}
//                   </p>
//                 </div>

//               </div>
//             </button>
//           ))}
//         </div>
//         </Row>
//             </Section>

//         {/* filter bar */}
//         <Row>
//         <div className="flex items-center justify-between border-y border-[#EEE3DD] py-4 px-1 mb-8">
//           <div className="flex gap-3 flex-wrap">
//             {FILTER_CHIPS.map((chip) => {
//               const isActive = chip === activeChip;
//               return (
//                 <button
//                   key={chip}
//                   onClick={() => setActiveChip(chip)}
//                   className={`border rounded-full px-4 py-1.5 text-[13px] ${
//                     isActive
//                       ? "bg-[var(--primary-color)] text-white border-[var(--primary-color)]"
//                       : "border-[#EEE3DD] text-[#8A817A]"
//                   }`}
//                 >
//                   {chip}
//                 </button>
//               );
//             })}
//           </div>
//           <span className="text-[13px] text-[#8A817A] hidden sm:inline">
//             Sorted by: Newest first
//           </span>
//         </div>
//         </Row>
//         {/* product grid */}
//         <Section className="!pb-0 ">
//           <Row>
//         <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-[20px] md:gap-[30px] pb-12">
//           {visibleProducts.map((product) => (
//             <div key={product.id} className="cursor-pointer group">
//               <div className="relative aspect-[3/4] rounded-lg bg-[#FAF3EE] overflow-hidden flex items-center justify-center text-[12px] text-[#c9beb6]">
//                 Product photo
//                 {product.discount && (
//                   <span className="absolute top-2.5 left-2.5 bg-[var(--primary-color)] text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
//                     -{product.discount}%
//                   </span>
//                 )}
//                 <button
//                   onClick={(e) => e.stopPropagation()}
//                   aria-label="Add to wishlist"
//                   className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#8A817A]"
//                 >
//                   <Heart size={15} />
//                 </button>
//               </div>
//               <p className="mt-3 text-[14px] font-semibold line-clamp-1">
//                 {product.name}
//               </p>
//               <p className="mt-1 text-[14px]">
//                 Rs {product.price}
//                 {product.mrp && (
//                   <span className="text-[#8A817A] line-through ml-1.5 font-normal">
//                     Rs {product.mrp}
//                   </span>
//                 )}
//               </p>
//               {product.colors.length > 0 && (
//                 <div className="flex gap-1.5 mt-2">
//                   {product.colors.map((color, i) => (
//                     <span
//                       key={i}
//                       className="w-[13px] h-[13px] rounded-full border border-[#EEE3DD]"
//                       style={{ backgroundColor: color }}
//                     />
//                   ))}
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>

//         {hasMore && (
//           <div className="flex justify-center mb-16">
//             <button
//               onClick={() => setVisibleCount((c) => c + 4)}
//               className="border-[1.5px] border-[#E23E80] text-[#B8215F] bg-white px-11 py-4 rounded-[10px] text-[14px] font-bold tracking-wide uppercase"
//             >
//               Load more
//             </button>
//           </div>
//         )}
//         </Row>
//         </Section>
//         </>
//   );
// }
import { useState } from "react";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Row from "../components/ui/Row";
import Section from "../components/ui/Section";
import FlowerIcon from "../components/icons/FlowerIcon";

import faqBg from "../assets/size-bg.png";
import shopsaree2 from "../assets/shopsaree2.jpg";
import shopsaree1 from "../assets/shopsaree1.jpg";
import shoppingImg from "../assets/shopping.png";

const CATEGORIES = [
  {
    id: "saree",
    name: "Saree",
    image: shopsaree1,
  },
  {
    id: "kurti",
    name: "Kurti",
    image: shopsaree1,
  },
  {
    id: "crop-tops",
    name: "Crop Tops",
    image: shopsaree1,
  },
  {
    id: "jeans",
    name: "Jeans",
    image: shopsaree1,
  },
  {
    id: "nightwear",
    name: "Nightwear",
    image: shopsaree1,
  },
];

const SUBCATEGORIES_BY_CATEGORY = {
  saree: [
    {
      id: "banarasi",
      slug: "banarasi",
      name: "Banarasi",
      image: shopsaree2,
    },
    {
      id: "silk",
      slug: "silk",
      name: "Silk Saree",
      image: shopsaree2,
    },
    {
      id: "cotton-saree",
      slug: "cotton-saree",
      name: "Cotton Saree",
      image: shopsaree2,
    },
    {
      id: "printed-saree",
      slug: "printed-saree",
      name: "Printed",
      image: shopsaree2,
    },
  ],

  kurti: [
    {
      id: "anarkali",
      slug: "anarkali",
      name: "Anarkali",
      image: shopsaree1,
    },
    {
      id: "straight-cut",
      slug: "straight-cut",
      name: "Straight Cut",
      image: shopsaree1,
    },
    {
      id: "a-line",
      slug: "a-line",
      name: "A-Line",
      image: shopsaree2,
    },
    {
      id: "printed",
      slug: "printed",
      name: "Printed",
      image: shopsaree1,
    },
    {
      id: "festive",
      slug: "festive",
      name: "Festive",
      image: shopsaree2,
    },
  ],

  "crop-tops": [
    {
      id: "casual-crop",
      slug: "casual-crop",
      name: "Casual Crop Tops",
      image: shopsaree2,
    },
    {
      id: "party-crop",
      slug: "party-crop",
      name: "Party Crop Tops",
      image: shopsaree2,
    },
    {
      id: "printed-crop",
      slug: "printed-crop",
      name: "Printed",
      image: shopsaree2,
    },
    {
      id: "basic-crop",
      slug: "basic-crop",
      name: "Basic",
      image: shopsaree2,
    },
  ],

  jeans: [
    {
      id: "straight-jeans",
      slug: "straight-jeans",
      name: "Straight Jeans",
      image: shopsaree1,
    },
    {
      id: "skinny-jeans",
      slug: "skinny-jeans",
      name: "Skinny Jeans",
      image: shopsaree2,
    },
    {
      id: "wide-leg",
      slug: "wide-leg",
      name: "Wide Leg",
      image: shopsaree2,
    },
    {
      id: "mom-jeans",
      slug: "mom-jeans",
      name: "Mom Jeans",
      image: shopsaree2,
    },
  ],

  nightwear: [
    {
      id: "night-suit",
      slug: "night-suit",
      name: "Night Suit",
      image: shopsaree2,
    },
    {
      id: "night-dress",
      slug: "night-dress",
      name: "Night Dress",
      image: shopsaree1,
    },
    {
      id: "sleepwear",
      slug: "sleepwear",
      name: "Sleepwear",
      image: shopsaree2,
    },
    {
      id: "cotton-nightwear",
      slug: "cotton-nightwear",
      name: "Cotton Nightwear",
      image: shopsaree1,
    },
  ],
};

const FILTER_CHIPS = [
  "All",
  "Cotton",
  "Under Rs 999",
  "New arrivals",
];

const PRODUCTS = [
  {
    id: 1,
    name: "Floral cotton jaipuri kurta",
    price: 1099,
    mrp: 1699,
    discount: 40,
    colors: ["#e2b6c6", "#7b8d6b", "#3d3d3d"],
  },
  {
    id: 2,
    name: "Women kurta and trouser set",
    price: 1999,
    mrp: null,
    discount: null,
    colors: ["#e6d5b8", "#c65b4e"],
  },
  {
    id: 3,
    name: "Printed anarkali kurta",
    price: 1399,
    mrp: 1899,
    discount: 25,
    colors: ["#6c93c7", "#dbb8e0"],
  },
  {
    id: 4,
    name: "Pink floral handwork anarkali",
    price: 1599,
    mrp: null,
    discount: null,
    colors: ["#e2b6c6", "#5a4a3f"],
  },
  {
    id: 5,
    name: "Self design banarasi silk kurta",
    price: 1499,
    mrp: 2299,
    discount: 45,
    colors: ["#8a1f3d", "#d4af37"],
  },
  {
    id: 6,
    name: "Green cotton straight kurti",
    price: 1099,
    mrp: null,
    discount: null,
    colors: ["#5b7a4f"],
  },
  {
    id: 7,
    name: "Full sleeve printed fancy kurti",
    price: 999,
    mrp: 1429,
    discount: 30,
    colors: ["#7a4a2d", "#e6d5b8"],
  },
  {
    id: 8,
    name: "Maroon self design festive kurti",
    price: 1899,
    mrp: null,
    discount: null,
    colors: ["#6e1f2a"],
  },
];

export default function CollectionAbout() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("kurti");
  const [activeChip, setActiveChip] = useState("All");
  const [visibleCount, setVisibleCount] = useState(4);
  const activeCategoryData = CATEGORIES.find((category) => category.id === activeCategory);
  const activeCategoryName = activeCategoryData?.name || "";
  const activeSubcategories = SUBCATEGORIES_BY_CATEGORY[activeCategory] || [];
  const visibleProducts = PRODUCTS.slice(0, visibleCount);
  const hasMore = visibleCount < PRODUCTS.length;
  const handleImageError = (event) => {
    event.currentTarget.src = shoppingImg;
  };

  const handleCategoryClick = (categoryId) => {
    setActiveCategory(categoryId);
    setActiveChip("All");
    setVisibleCount(8);
  };

  const handleSubcategoryClick = (subcategory) => {
    navigate(`/shop?subcategory=${subcategory.slug}`);
  };

  const handleFilterClick = (chip) => {
    setActiveChip(chip);
    setVisibleCount(8);
  };

  const handleLoadMore = () => {
    setVisibleCount((v) => v + 4);
  };

  return (
    <>
      {/* <Section className="!pt-5">
        <Row>
          <div className="relative flex items-center justify-between overflow-hidden rounded-[18px] bg-theme px-6 py-10 md:px-12 md:py-12">

            <div className="relative z-10">
              <p className="mb-2.5 text-[12px] font-bold uppercase tracking-[0.12em] text-primary">
                Shop by category
              </p>

              <h1 className="max-w-[520px] text-[28px] font-bold leading-tight md:text-[40px]">
                Women Collection
              </h1>

              <p className="mt-3 max-w-[460px] text-[#989696]">
                Handpicked cotton, printed and festive styles for everyday and celebration wear.
              </p>

              <span className="mt-5 inline-block rounded-full border border-[#EEE3DD] bg-white px-4 py-2 text-[13px]">
                {PRODUCTS.length * 16} styles curated for you
              </span>
            </div>


            <div className="relative z-10 hidden h-[110px] w-[110px] flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_0_0_2px_#FDEDF3] sm:flex md:h-[150px] md:w-[150px]">
              <img
                src={shopsaree1}
                alt="Women Collection"
                className="h-full w-full object-cover"
                onError={handleImageError}
              />
            </div>


            <span className="absolute -right-10 -top-10 h-[230px] w-[230px] rounded-full border border-[#E23E80]/25" />

            <span className="absolute -bottom-[70px] right-16 h-[160px] w-[160px] rounded-full border border-[#F0997B]/30" />
          </div>
        </Row>
      </Section> */}
      <Section className="!pt-5">
        <Row >
          <div className="relative overflow-hidden bg-theme rounded-[18px] px-6 py-10 md:px-12 md:py-12 flex items-center justify-between ">
              <div className="relative z-10">
                <p className="uppercase tracking-[0.12em] text-[12px] font-bold text-primary mb-2.5">
                  Shop by category
                </p>
                <h1 className="text-[28px] md:text-[40px] font-bold leading-tight max-w-[520px]">
                  Women collection
                </h1>
                <p className="mt-3  max-w-[460px] text-[#989696] text-14 break">
                  Handpicked cotton, printed and festive styles for everyday and
                  celebration wear.
                </p>
                <span className="mt-5 inline-block text-[13px] bg-white border border-[#EEE3DD] px-4 py-2 rounded-full">
                  {PRODUCTS.length * 16} styles curated for you
                </span>
              </div>
              <div className="hidden sm:flex relative z-10 w-[110px] h-[110px] md:w-[150px] md:h-[150px] rounded-full bg-white shadow-[0_0_0_2px_#FDEDF3] items-center justify-center flex-shrink-0 text-[11px] text-[#c9beb6]">
                Category photo
              </div>
              <span className="absolute -right-10 -top-10 w-[230px] h-[230px] rounded-full border border-[#E23E80]/25" />
              <span className="absolute right-16 -bottom-[70px] w-[160px] h-[160px] rounded-full border border-[#F0997B]/30" />
          </div> 
        </Row>
      </Section>
      <Section>
        <Row>
          <h2 className="mb-6 text-[22px] font-bold text-primary">
            Browse Categories
          </h2>

          <div className="flex gap-7 overflow-x-auto pb-3">
            {CATEGORIES.map((category) => {
              const isActive = category.id === activeCategory;

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategoryClick(category.id)}
                  className="group flex flex-shrink-0 flex-col items-center gap-2.5"
                >
                  {/* CATEGORY IMAGE */}

                  <div className={`h-[100px] w-[100px] overflow-hidden rounded-full border-2 bg-[#FAF3EE]  ${isActive ? "theme-border" : "border-transparent"}`}>
                    <img
                      src={category.image}
                      alt={category.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                      onError={handleImageError}
                    />
                  </div>

                  <span className={`text-center text-[16px] ${isActive ? "font-bold text-primary" : "text-black"}`}>
                    {category.name}
                  </span>
                </button>
              );
            })}
          </div>
        </Row>
      </Section>

      <Section>
        <Row>

          <div className="relative mb-[50px] flex w-full items-center justify-center md:mb-[90px]">
            <div className="w-[18px] border-t border-black md:w-[50px]" />

            <div className="relative mx-2 flex flex-col items-center justify-center md:mx-4">
              <h2 className="relative z-10 whitespace-nowrap font-h2 text-black">
                {activeCategoryName} subcategories
              </h2>

              <FlowerIcon className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[25px] w-[40px] -translate-x-1/2 -translate-y-1/2 md:h-[80px] md:w-[110px]" />
            </div>

            <div className="w-[18px] border-t border-black md:w-[50px]" />
          </div>

          {/* SUBCATEGORY GRID */}

          {activeSubcategories.length === 0 ? (
            <div className="py-10 text-center text-gray-500">
              No subcategories found.
            </div>
          ) : (
            <div className="mb-14 grid grid-cols-2 md:grid-cols-4 gap-x-6   lg:gap-x-8 gap-y-10 lg:gap-y-16">
              {activeSubcategories.map((subcategory) => (
                <button
                  key={subcategory.id}
                  type="button"
                  onClick={() => handleSubcategoryClick(subcategory)}
                  className="group relative text-left"
                >
                  <div className="relative">
                    {/* PINK BACK FRAME */}

                    <div className="pointer-events-none absolute inset-0 translate-x-[7px] translate-y-[7px] border-[3px] border-[#ef3a96]" />

                    {/* IMAGE */}

                    <div className="relative z-10 aspect-[3/4] overflow-hidden border-white bg-[#F5F1ED]">
                      <img
                        src={subcategory.image}
                        alt={subcategory.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={handleImageError}
                      />

                      {/* IMAGE OVERLAY */}

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
                    </div>

                    {/* LABEL */}

                    <div
                      className="absolute bottom-[-22px] left-1/2 z-20 min-w-[75%] -translate-x-1/2 rounded-md border border-transparent px-4 py-2.5 group-hover:border-[#ef3a96] sm:min-w-[70%] sm:px-5 sm:py-3"
                      style={{
                        backgroundImage: `url(${faqBg})`,
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "cover",
                      }}
                    >
                      <p className="whitespace-nowrap text-center font-serif text-[12px] md:text-sm font-semibold text-[#292323] sm:text-base md:text-lg">
                        {subcategory.name}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Row>
      </Section>

      <Row>
        <div className="mb-8 flex items-center justify-between border-y border-[#EEE3DD] px-1 py-4">
          {/* FILTER BUTTONS */}

          <div className="flex flex-wrap gap-3">
            {FILTER_CHIPS.map((chip) => {
              const isActive = chip === activeChip;

              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleFilterClick(chip)}
                  className={`rounded-full border px-4 py-1.5 text-[13px] ${isActive ? "border-[#E23E80] bg-[#E23E80] text-white" : "border-[#EEE3DD] text-[#8A817A]"}`}
                >
                  {chip}
                </button>
              );
            })}
          </div>

          {/* SORT */}

          <span className="hidden text-[13px] text-[#8A817A] sm:inline">
            Sorted by: Newest first
          </span>
        </div>
      </Row>

      <Section >
        <Row>
          <div className="grid grid-cols-2 gap-[20px] sm:grid-cols-3 md:gap-[30px] lg:grid-cols-4">
            {visibleProducts.map((product) => (
              <div
                key={product.id}
                className="group cursor-pointer"
              >
                {/* PRODUCT IMAGE */}

                <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-lg bg-[#FAF3EE] text-[12px] text-[#c9beb6]">
                  Product photo

                  {/* DISCOUNT */}

                  {product.discount && (
                    <span className="absolute left-2.5 top-2.5 rounded-full bg-[#E23E80] px-2.5 py-1 text-[11px] font-bold text-white">
                      -{product.discount}%
                    </span>
                  )}

                  {/* WISHLIST */}

                  <button
                    type="button"
                    onClick={(event) => event.stopPropagation()}
                    aria-label="Add to wishlist"
                    className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#8A817A]"
                  >
                    <Heart size={15} />
                  </button>
                </div>

                {/* PRODUCT NAME */}

                <p className="mt-3 line-clamp-1 text-[14px] font-semibold">
                  {product.name}
                </p>

                {/* PRICE */}

                <p className="mt-1 text-[14px]">
                  Rs {product.price}

                  {product.mrp && (
                    <span className="ml-1.5 font-normal text-[#8A817A] line-through">
                      Rs {product.mrp}
                    </span>
                  )}
                </p>

                {/* COLORS */}

                {product.colors.length > 0 && (
                  <div className="mt-2 flex gap-1.5">
                    {product.colors.map((color, index) => (
                      <span
                        key={index}
                        className="h-[13px] w-[13px] rounded-full border border-[#EEE3DD]"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* LOAD MORE */}

          {hasMore && (
            <div className="mt-20 flex justify-center">
              {/* <button
                type="button"
                onClick={() => setVisibleCount((count) => count + 4)}
                className="rounded-[10px] border-[1.5px] border-[#E23E80] bg-white px-11 py-4 text-[14px] font-bold uppercase tracking-wide text-[#B8215F]"
              >
                Load more
              </button> */}
                <button
            onClick={handleLoadMore}
            className="text-[18px] theme-border text-theme w-[187px] h-[70px] sm:w-[220px] sm:h-[89px] font-medium rounded-[10px] shadow-lg transition duration-300 uppercase"
            style={{
              boxShadow: "inset 0px 0px 30px ",
            }}
          >
            Load More
          </button>
            </div>
          )}
        </Row>
      </Section>
    </>
  );
}