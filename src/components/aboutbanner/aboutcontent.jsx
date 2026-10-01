// import React from "react";
// import { Link } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchPageBySlug } from "../../features/pages/pagesThunk";
// import { useEffect } from "react";
// import { getImageUrl } from "../utils/helper";
// import Section from "../ui/Section";
// import Row from "../ui/Row";
// import faqBg from "../../assets/size-bg.png";

// const STATIC_CONTENT = [
//   {
//     _id: "static-c1",
//     title: "Our Story",
//     description:
//       "Founded with a vision to redefine everyday fashion, we curate collections that blend style, comfort, and affordability. Every piece in our store is handpicked to ensure the best quality for our customers.",
//     image_url: faqBg,
//     is_button: true,
//     button_name: "Read More",
//     button_link: "/shop",
//     order: 1,
//     status: "active",
//     isStatic: true,
//   },
//   {
//     _id: "static-c2",
//     title: "Our Mission",
//     description:
//       "Our mission is to empower individuals to express themselves through fashion. We believe that great style should not come at a great cost, and we work hard to deliver value with every purchase.",
//     image_url: faqBg,
//     is_button: true,
//     button_name: "Read More",
//     button_link: "/shop",
//     order: 2,
//     status: "active",
//     isStatic: true,
//   },
//   {
//     _id: "static-c3",
//     title: "Why Choose Us",
//     description:
//       "With a wide range of styles, sizes, and budgets, we have something for everyone. Our dedicated team ensures a seamless shopping experience from browsing to delivery.",
//     image_url: faqBg,
//     is_button: true,
//     button_name: "Read More",
//     button_link: "/shop",
//     order: 3,
//     status: "active",
//     isStatic: true,
//   },
// ];
// export default function AboutContent() {
//   const dispatch = useDispatch();
//   const { pages } = useSelector((state) => state.pages);
//   const aboutPage = pages?.find((page) => page.slug === "about");
//   const apiContentSections = aboutPage?.sections?.filter(
//     (section) => section.type === "content" && section.status === "active",
//   );
//   const contentList =
//     apiContentSections?.length > 0 ? apiContentSections : STATIC_CONTENT;
//   const sortedContent = [...contentList].sort(
//     (a, b) => (a.order ?? 0) - (b.order ?? 0),
//   );
//   return (
//     <Section className="px-0">
//       <Row className="space-y-12 py-10 !px-0">
//         {sortedContent.map((item, index) => {
//           const isReversed = index % 2 !== 0;

//           const imgSrc = item.isStatic
//             ? item.image_url
//             : getImageUrl(item.image_url);

//           return (
//             <div
//               key={item._id || index}
//               className={`flex flex-col md:flex-row md:items-center gap-8 ${
//                 isReversed ? "md:flex-row-reverse" : ""
//               }`}
//             >
//               <div className="flex-1">
//                 <h3 className="text-[18px] sm:text-[22px] font-semibold text-dark mb-3">
//                   {item.title}
//                 </h3>
//                 <p className="text-[13px] sm:text-[14px] leading-relaxed text-gray-600 mb-4">
//                   {item.description}
//                 </p>
//                 {item.is_button && (
//                   <Link
//                     to={item.button_link || "/shop"}
//                     className="text-sm underline"
//                   >
//                     {item.button_name || "Read More"}
//                   </Link>
//                 )}
//               </div>

//               <div className="flex-1">
//                 <div className="w-full h-[250px] sm:h-[300px] md:h-[350px] overflow-hidden rounded-lg">
//                   <img
//                     src={imgSrc || faqBg}
//                     alt={item.title}
//                     className="w-full h-full object-cover"
//                     onError={(e) => {
//                       e.target.src = faqBg;
//                     }}
//                   />
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </Row>
//     </Section>
//   );
// }


import React, { useEffect, useMemo } from "react";
import { ArrowRight, Check, Heart, Sparkles, Truck, Users, ShoppingBag, Star, Search, CreditCard, PackageCheck, Headphones, Store, BadgeCheck, WalletCards, RefreshCcw, Boxes, Globe2,
        Clock3, LockKeyhole, CircleCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Section from "../ui/Section";
import Row from "../ui/Row";
import aboutimg from "../../assets/about1.jpg"
import { useDispatch, useSelector } from "react-redux";
import { fetchsubCategories } from "../../features/subcategories/subcategoriesThunk";
import { getImageUrl } from "../utils/helper";
import { fetchUserOrders } from "../../features/orders/orderThunk";
import Button from "../ui/Button";

const ecosystem = [
  {
    icon: Store,
    title: "Brands & Sellers",
    description: "We create a digital storefront where products and collections can reach customers through an organized shopping experience.",
  },
  {
    icon: Users,
    title: "Customers",
    description: "Customers can discover products, compare options, choose variants and manage their shopping journey from one place.",
  },
  {
    icon: Boxes,
    title: "Product Discovery",
    description: "Categories, collections, search and filters help customers move from discovery to the products they actually need.",
  },
  {
    icon: Globe2,
    title: "Growing Marketplace",
    description: "Our platform is designed to grow with new products, categories, brands and shopping experiences.",
  },
];

const trustFeatures = [
  "Clear product information",
  "Transparent pricing",
  "Secure shopping experience",
  "Order and delivery updates",
  "Customer-focused support",
  "Easy-to-understand policies",
];

const differenceItems = [
  {
    icon: ShoppingBag,
    title: "One Place for Everyday Shopping",
    description: "Bring multiple product categories and shopping needs together in one convenient digital destination.",
  },
  {
    icon: Users,
    title: "Built Around Customers",
    description: "The platform experience is designed around easier discovery, comparison, purchase and post-order support.",
  },
  {
    icon: Star,
    title: "Focused on Better Discovery",
    description: "Search, categories, filters, collections and recommendations help customers find relevant products faster.",
  },
];

const promises = [
  "Quality",
  "Trust",
  "Transparency",
  "Convenience",
  "Customer First",
];

export default function AboutContent({aboutPage}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products?.products || []);
  const productReviews = useSelector((state) => state.reviews?.productReviews || {});
  const users = useSelector((state) => state.users?.users || []);
  const { items: subcategories = []} = useSelector((state) => state.subcategories);

  useEffect(() => {
    dispatch(fetchsubCategories());
    dispatch(fetchUserOrders());
  }, [dispatch]);

  const totalProducts = useMemo(() => {
    if (!Array.isArray(products)) {
      return 0;
    }
    return products.length;
  }, [products]);

  const totalCategories = useMemo(() => {
    return subcategories.filter(
      (category) =>
        category?.status === undefined ||
        category?.status === null ||
        category?.status === "active"
    ).length;
  }, [subcategories]);

  const customerRating = useMemo(() => {
    const allReviews = [];

    if (productReviews && typeof productReviews === "object") {
      Object.values(productReviews).forEach((productData) => {
        const reviews = productData?.reviews;

        if (Array.isArray(reviews)) {
          reviews.forEach((review) => {
            const rating = Number(
              review?.rating ??
              review?.ratings ??
              review?.stars
            );

            if (Number.isFinite(rating) && rating > 0) {
              allReviews.push(rating);
            }
          });
        }
      });
    }

    if (allReviews.length === 0) {
      return "0.0";
    }

    const average = allReviews.reduce((sum, rating) => sum + rating, 0) / allReviews.length;

    return average.toFixed(1);
  }, [productReviews]);

  const totalCustomers = useMemo(() => {
    if (!Array.isArray(users)) {
      return 0;
    }

    return users.filter((user) =>
      user?.status === undefined || user?.status === null || user?.status === "active"
    ).length;
  }, [users]);


  const formatNumber = (number) => {
    if (!number || number <= 0) {
      return "0";
    }
    if (number >= 1000000) {
      return `${(number / 1000000).toFixed(1)}M+`;
    }
    if (number >= 1000) {
      return `${(number / 1000).toFixed(1)}K+`;
    }

    return `${number}+`;
  };

  const stats = useMemo(() => {
    return [
      { number: formatNumber(totalProducts), label: "Products" },
      { number: formatNumber(totalCategories), label: "Categories" },
      { number: `${customerRating}/5`, label: "Customer Rating" },
      { number: formatNumber(totalCustomers), label: "Happy Customers", },
    ];
  }, [totalProducts, totalCategories, customerRating, totalCustomers]);

  const sections = useMemo(() => {
    return Array.isArray(aboutPage?.sections)
      ? [...aboutPage.sections]
          .filter((section) => section?.status === "active")  
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      : [];
  }, [aboutPage]);

  const getSection = (type, order) => {
    return (
      sections.find(
        (section) =>
          section?.type === type &&
          Number(section?.order) === Number(order)
      ) || null
    );
  };

  const platformSection = getSection("content", 2);
  const whoWeAre = getSection("content", 3);
  const ExploreStore = getSection("feature", 4);
  const shoppingWorks = getSection("feature", 5);
  const customerExperiance = getSection("feature", 6);
  const startExploring = getSection("content", 8);
  return (
    <>

      {platformSection && (
        <Section className="relative overflow-hidden">
          <Row className="grid items-stretch gap-[30px] custom-lg:gap-[50px] custom-lg:grid-cols-2 py-[25px] md:py-[50px]">
            <div className="relative z-10 flex h-full flex-col">

              <span className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-color)]/10 text-sm font-semibold text-theme">
                <Sparkles size={16} />
                {platformSection.title || "ABOUT OUR PLATFORM"}
              </span>

              <p className="mt-6 max-w-xl leading-8 sec-text-color">
                {platformSection.description || ""}
              </p>
                <div className="mt-8 gap-4 grid grid-cols-2">

                {[
                  "Easy Discovery",
                  "Secure Shopping",
                  "Customer Focused",
                  "hello"
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-sm font-medium text-[rgba(0,0,0,0.80)]"
                  >
                    <CircleCheck size={17} className="text-theme" />
                    {item}
                  </div>
                ))}

              </div>
              <div className="mt-8">
                  {platformSection?.is_button &&
                    platformSection?.button_name && (
                      <Button
                        type="button"
                        variant="common"
                        onClick={() => {
                          if (platformSection?.button_link) {
                            navigate(platformSection.button_link);
                          }
                        }}
                        className="flex items-center gap-1"
                      >
                        {platformSection.button_name}
                        <ArrowRight
                          size={18}
                          className="transition-transform duration-300 group-hover:translate-x-1"
                        />
                      </Button>
                    )}
              </div>
            </div>

            <div className="relative  h-full">
              <div className=" absolute -bottom-10 -left-10 z-20 hidden rounded-2xl bg-white p-5 shadow-xl hidden custom-lg:block">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--primary-color)]/10 text-theme">
                    <Heart size={20} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-[#222]">
                      Customer First
                    </p>
                    <p className="text-xs sec-text-color">
                      At the heart of our platform
                    </p>
                  </div>
                </div>
              </div>

              <div className="h-full min-h-[420px] overflow-hidden rounded-[20px]">
                <img
                  src={getImageUrl(platformSection.image_url)}
                  alt={platformSection.title || "About our platform"}
                  className="h-full min-h-[420px] w-full object-cover "
                />
              </div>
            </div>
          </Row>
        </Section>
      )}

      <Section className="bg-[rgba(0,0,0,0.80)] py-16 text-white">
        <Row className="grid grid-cols-2 gap-8 px-5 sm:px-8  custom-lg:grid-cols-4 lg:px-10 py-[25px] md:py-[50px]">

          {stats.map((stat) => (
            <div key={stat.label} className="text-center" >
              <h3 className="text-[30px] sm:text-[40px] font-bold md:text-[50px]">
                {stat.number}
              </h3>
              <p className="mt-2 text-sm text-white/80 sm:text-base">
                {stat.label}
              </p>
            </div>
          ))}

        </Row>
      </Section>

      {whoWeAre && (
        <Section>
          <Row className="grid items-center gap-[30px] custom-lg:gap-[50px] custom-lg:grid-cols-2 py-[25px] md:py-[50px]">
            <div className="h-full min-h-[420px] overflow-hidden rounded-[20px]">
              <img
                src={getImageUrl(whoWeAre.image_url)}
                alt={whoWeAre.title || "About our platform"}
                className="h-full min-h-[420px] w-full object-cover "
              />
            </div>
            <div>
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-theme">
                {whoWeAre.title || "ABOUT OUR PLATFORM"}
              </span>

              <div className="mt-4 space-y-4 leading-8 sec-text-color">
                {(whoWeAre.description || "")
                  .split(/\n\s*\n/)
                  .filter((paragraph) => paragraph.trim())
                  .map((paragraph, index) => (
                    <p key={index}>
                      {paragraph.trim()}
                    </p>
                  ))}
              </div>
              <div>
                <ul className="mt-7 space-y-5">

                  {[
                    "Wide product discovery",
                    "Organized categories and collections",
                    "Customer-focused shopping experience",
                    "Transparent product information",
                    "Continuous platform improvement",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3" >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary-color)] text-white">
                        <Check size={14} />
                      </span>
                      <span className="font-medium text-[rgba(0,0,0,0.80)] ">
                        {item}
                      </span>
                    </li>
                  ))}

                </ul>
              </div>
            </div>
          </Row>
        </Section>
      )}

      {ExploreStore && (
        <Section className="bg-gray-50">
          <Row className="py-[25px] md:py-[50px]">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-theme">
                {ExploreStore.title}
              </span>
              <p className="mt-5 leading-7 sec-text-color">
                {ExploreStore.description}
              </p>
            </div>

            {ExploreStore?.items?.length > 0 && (
              <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

                {[...ExploreStore.items].sort((a, b) => Number(a?.order ?? 0) - Number(b?.order ?? 0))
                  .map((item) => (

                    <div key={item.title}
                      className="group rounded-[10px] border border-gray-100 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[var(--primary-color)]/30 hover:shadow-xl"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--primary-color)]/10 text-theme transition-all duration-300 group-hover:bg-[var(--primary-color)] group-hover:text-white">
                        <img
                          src={getImageUrl(item.image_url)}
                          alt={item?.title || "Feature"}
                          className="h-6 w-6 object-contain transition-all duration-300 group-hover:brightness-0 group-hover:invert"
                        />
                      </div>
                      <h3 className="mt-6 text-[18px] font-bold ">
                        {item.title}
                      </h3>
                      <p className="mt-3 text-14 leading-7 sec-text-color">
                        {item.description}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </Row>
        </Section>
      )}
    
      <Section>
        <Row className="pt-[25px] md:pt-[50px]">
          <div className="grid items-center gap-[30px] custom-lg:gap-[50px] custom-lg:grid-cols-2">
            <div>
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-theme">
                Our Marketplace
              </span>
              <p className="mt-4 leading-8 sec-text-color">
                A modern ecommerce platform is more than a product catalog.
                It connects customers with products, brands, sellers and
                services through one organized shopping experience.
              </p>

              <div className="mt-8 space-y-5">

                {ecosystem.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div key={item.title} className="flex gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-color)]/10 text-theme">
                        <Icon size={26} />
                      </div>
                      <div>
                        <h3 className="font-bold text-[18px]">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-sm leading-6 sec-text-color">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[25px] bg-[rgba(0,0,0,0.80)] p-8 sm:p-12">
              <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[var(--primary-color)]/20 blur-2xl z-[999]" />
              <div className="relative z-10">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary-color)] text-white">
                  <Store size={28} />
                </div>

                <h3 className="mt-7 text-2xl font-bold text-white sm:text-3xl">
                  One platform.
                  <br />
                  Multiple possibilities.
                </h3>

                <p className="mt-5 leading-7 text-white/60">
                  From discovering products to managing orders, our platform
                  brings the essential parts of online shopping together in
                  one place.
                </p>

                <div className="mt-8 grid grid-cols-2 gap-4">

                  {[
                    ["Products", "Discover"],
                    ["Categories", "Explore"],
                    ["Orders", "Manage"],
                    ["Support", "Connect"],
                  ].map(([title, subtitle]) => (

                    <div
                      key={title}
                      className="rounded-2xl border border-white/10 bg-white/5 p-5"
                    >

                      <p className="font-bold text-white">
                        {title}
                      </p>

                      <p className="mt-1 text-xs text-white/50">
                        {subtitle}
                      </p>

                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </Row>
      </Section>

      <Section>
        <Row className="mx-auto !lg:max-w-7xl">
          <div className="flex flex-col-reverse custom-lg:grid custom-lg:grid-cols-2  overflow-hidden rounded-[25px] bg-[rgba(0,0,0,0.80)] ">
            <div className="flex items-center p-8 text-white sm:p-12 lg:p-16">

              <div>

                <span className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--primary-color)]">
                  What Makes Us Different
                </span>

                <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
                  Designed for

                  <span className="text-[var(--primary-color)]">
                    {" "}modern shoppers.
                  </span>
                </h2>

                <p className="mt-5 leading-8 text-white/60">
                  We want online shopping to feel natural. Customers should be
                  able to find products quickly, understand what they are buying
                  and move through the purchase journey without unnecessary
                  complexity.
                </p>

                <div className="mt-8 space-y-6">

                  {differenceItems.map((item) => {

                    const Icon = item.icon;

                    return (

                      <div
                        key={item.title}
                        className="flex gap-4"
                      >

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[var(--primary-color)]">
                          <Icon size={19} />
                        </div>

                        <div>

                          <h4 className="font-semibold">
                            {item.title}
                          </h4>

                          <p className="mt-1 text-sm leading-6 text-white/50">
                            {item.description}
                          </p>

                        </div>

                      </div>

                    );

                  })}

                </div>

              </div>

            </div>
            <div className="min-h-[300px]">

              <img
                src={aboutimg}
                alt="What makes our ecommerce platform different"
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />

            </div>
          </div>
        </Row>
      </Section>

      {shoppingWorks && (
        <Section>
          <Row>
            <div className="text-center">
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-theme">
                {shoppingWorks.title}
              </span>
              <p className="mx-auto mt-5 max-w-2xl leading-7 sec-text-color">
                {shoppingWorks.description}
              </p>
            </div>
            {shoppingWorks?.items?.length > 0 && (
              <div className="mt-14 grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">

                {[...shoppingWorks.items].sort((a, b) => Number(a?.order ?? 0) - Number(b?.order ?? 0))
                  .map((item, index, sortedItems) => (
                    <div key={item.title}
                    className="group relative rounded-[10px] border border-gray-200 bg-white p-6 transition-all duration-300 hover:-translate-y-2 hover:border-[var(--primary-color)]/40 hover:shadow-xl"
                    >
                    <div className="flex items-center justify-between">
                      <span className="text-4xl font-black text-[var(--primary-color)]/15">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      
                      <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[var(--primary-color)]/10 text-theme transition-all duration-300 
                        group-hover:bg-[var(--primary-color)] group-hover:text-white">
                        <img
                          src={getImageUrl(item.image_url)}
                          alt={item?.title || "Feature"}
                          className="h-6 w-6 object-contain transition-all duration-300 group-hover:brightness-0 group-hover:invert"
                        />
                      </div>
                    </div>

                    <h3 className="mt-5 text-[18px] font-bold">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-14 leading-7 sec-text-color">
                      {item.description}
                    </p>

                    {index < sortedItems.length - 1 && (
                      <div className="absolute -right-5 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--primary-color)] text-white shadow-md lg:flex">
                        <ArrowRight size={17} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
            )}
          </Row>
        </Section>
      )}

       {/* =========================================================
          TRUST & SECURITY
      ========================================================= */}

      <Section >
        <Row className=" py-[25px] md:py-[50px] grid items-center gap-[30px] custom-lg:gap-[50px] custom-lg:grid-cols-2">
          <div>
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-theme">
              Trust & Transparency
            </span>
            <p className="mt-4 leading-8 sec-text-color">
              We believe customers should have access to useful information
              before making a purchase and clear guidance throughout the order
              journey.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {trustFeatures.map((item) => (
                <div key={item}
                  className="flex items-center gap-3 rounded-[10px] border border-gray-100 bg-gray-50 px-4 py-4"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--primary-color)]/10 text-theme">
                    <Check size={15} />
                  </div>

                  <span className="text-sm font-medium text-[#333]">
                    {item}
                  </span>
                </div>

              ))}

            </div>

          </div>

          <div className="grid grid-cols-2 gap-5">

            <div className="rounded-[20px] bg-[#171717] p-5 sm:p-7 text-white">

              <LockKeyhole
                size={28}
                className="text-[var(--primary-color)]"
              />

              <h3 className="mt-6 text-lg font-bold">
                Secure Shopping
              </h3>

              <p className="mt-3 text-sm leading-6 text-white/50">
                Designed around a safer and more transparent checkout journey.
              </p>

            </div>


            <div className="mt-10 rounded-[20px] bg-[var(--primary-color)]  p-5 sm:p-7 text-white">

              <WalletCards size={28} />

              <h3 className="mt-6 text-lg font-bold">
                Easy Checkout
              </h3>

              <p className="mt-3 text-sm leading-6 text-white/80">
                A simple purchase flow designed to reduce unnecessary steps.
              </p>

            </div>


            <div className="rounded-[20px] bg-gray-100  p-5 sm:p-7 text-[#222]">

              <Clock3
                size={28}
                className="text-theme"
              />

              <h3 className="mt-6 text-lg font-bold">
                Order Updates
              </h3>

              <p className="mt-3 text-sm leading-6 sec-text-color">
                Keep customers informed throughout the order journey.
              </p>

            </div>


            <div className="rounded-[20px] border border-gray-200 bg-white  p-5 sm:p-7">

              <Headphones
                size={28}
                className="text-theme"
              />

              <h3 className="mt-6 text-lg font-bold text-[#222]">
                Customer Care
              </h3>

              <p className="mt-3 text-sm leading-6 sec-text-color">
                Support when customers need help with their shopping journey.
              </p>

            </div>

          </div>
        </Row>
      </Section>

      {customerExperiance && (
        <Section className="bg-gray-50">
          <Row className="mx-auto !lg:max-w-7xl py-[25px] md:py-[50px] !max-w-7xl mx-auto">
            <div className="mx-auto max-w-2xl text-center">

              <span className="text-sm font-bold uppercase tracking-[0.2em] text-theme">
                {customerExperiance.title}
              </span>

              <p className="mt-5 leading-7 sec-text-color">
                {customerExperiance.description}
              </p>

            </div>

            {customerExperiance?.items?.length > 0 && (
              <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

                {[...customerExperiance.items].sort((a, b) => Number(a?.order ?? 0) - Number(b?.order ?? 0))
                  .map((item) => (
                  <div
                    key={item.title}
                    className="group rounded-[10px] bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:-translate-y-2 hover:border-[var(--primary-color)]/30"
                  >

                    <div className="f p-[10px] bg-color-100 w-[50px] h-[50px] rounded-[10px]">
                      <span className="w-[30px] h-[30px] inline-flex items-center justify-center text-xl ">
                        <img
                          src={getImageUrl(item.image_url)}
                          alt={item?.title || "Feature"}
                          className="h-6 w-6 brightness-0 invert"
                        />
                      </span>
                    </div>

                    <h3 className="mt-6 text-[18px] font-bold ">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-14 leading-7 sec-text-color">
                      {item.description}
                    </p>

                  </div>
                  ))}
              </div>
            )} 
          </Row>
        </Section>
      )}
    
      {/* =========================================================
          CUSTOMER PROMISE
      ========================================================= */}

      <Section >
        <Row className="mx-auto !lg:max-w-5xl text-center py-[25px] md:py-[50px]">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full light-color text-theme">
            <Heart size={28} />
          </div>

          <h2 className="mt-7 text-3xl font-bold text-[#222] sm:text-4xl">
            Our promise to every customer
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 sec-text-color">
            We are committed to creating an ecommerce experience where
            customers can discover products easily, shop confidently and get
            the support they need throughout their journey.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">

            {promises.map((item) => (

              <span
                key={item}
                className="rounded-full border border-gray-200 bg-gray-50 px-5 py-2 text-sm font-medium text-[rgba(0,0,0,0.80)]"
              >
                {item}
              </span>

            ))}

          </div>
        </Row>
      </Section>

      {startExploring && (
        <Section>
          <Row className="mx-auto !lg:max-w-7xl overflow-hidden rounded-[25px] bg-[var(--primary-color)]">
            <div className="relative px-7 py-14 text-center sm:px-12 sm:py-20">
              <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-white/10" />
              <div className="absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-black/10" />
              <div className="relative z-10">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white">
                  <ShoppingBag size={16} />
                  START EXPLORING
                </span>

                <h2 className="mt-8 text-3xl font-bold text-white text-[18px] sm:text-[20px] lg:text-[24px]">
                  {startExploring.title}
                </h2>

                <p className="mx-auto mt-2 max-w-2xl leading-7 text-white/85">
                  {startExploring.description}
                </p>

                <div className="mt-10 flex flex-wrap justify-center gap-4">
                  {startExploring?.is_button && (
                    <button
                      type="button"
                      onClick={() => navigate(startExploring?.button_link || "/shop")}
                      className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-semibold text-[var(--primary-color)]"
                    >
                      {startExploring?.button_name || "Start Shopping"}
                      <ArrowRight size={18} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => navigate("/contact-us")}
                    className="inline-flex items-center gap-2 rounded-full border border-white/40 px-7 py-3.5 font-semibold text-white transition-all duration-300 hover:bg-white/10"
                  >
                    Contact Us
                    <Headphones size={18} />
                  </button>
                </div>
              </div>
            </div>
          </Row>
        </Section>
      )}
    </>
  );
}