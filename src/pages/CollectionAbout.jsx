import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Row from "../components/ui/Row";
import Section from "../components/ui/Section";
import FlowerIcon from "../components/icons/FlowerIcon";
import faqBg from "../assets/size-bg.png";
import shopsaree1 from "../assets/shopsaree1.jpg";
import shoppingImg from "../assets/shopping.png";
import { fetchChildCategory } from "../features/childcategory/childcategoryThunk";
import { useDispatch, useSelector } from "react-redux";
import { getImageUrl } from "../components/utils/helper";
import { fetchtypes } from "../features/types/typeThunk";
import { fetchProducts } from "../features/products/productsThunk";
import ShopProductCard from "../components/productcard/ShopproductCard";
import { fetchsubCategories } from "../features/subcategories/subcategoriesThunk";
import SEO from "../components/Seo/seo";

const childcategory = [
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


const formatSlugName = (slug) => {
  if (!slug) return "";
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function CollectionAbout({ setShowLoginPopup }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { slug } = useParams();
  const bannerTitle = formatSlugName(slug);
  const { items: categories } = useSelector((state) => state.categories);
  const [searchParams, setSearchParams] = useSearchParams();
  const { items: apiChildCategory, error } = useSelector(
    (state) => state.childcategory,
  );
  const { types: apiTypes, loading: typesLoading } = useSelector(
    (state) => state.types,
  );
  const [activeType, setActiveType] = useState(null);
  const [visibleCount, setVisibleCount] = useState(4);
  const [activeCategory, setActiveCategory] = useState(
    searchParams.get("category") || null,
  );
  const { items: subcategories, loading: subLoading } = useSelector(
    (state) => state.subcategories,
  );
  useEffect(() => {
    dispatch(fetchChildCategory());
    if (!subcategories || subcategories.length === 0) {
      dispatch(fetchsubCategories());
    }
  }, [dispatch]);

  const matchedCategory = Array.isArray(subcategories)
    ? subcategories.find((sub) => sub.slug === slug)
    : null;

  const {
    products: apiProducts,
    loading: productsLoading,
    error: productsError,
  } = useSelector((state) => state.products);

  useEffect(() => {
    if (!activeCategory) return;

    dispatch(
      fetchProducts({
        childCategory: activeCategory,
        gender: slug,
        type: activeType || undefined,
        page: 1,
        limit: visibleCount,
      }),
    );
  }, [activeCategory, activeType, slug, visibleCount, dispatch]);

  const genderFilteredProducts = Array.isArray(apiProducts) ? apiProducts : [];
  const childcategorydata =
    Array.isArray(apiChildCategory) && apiChildCategory.length > 0 && !error
      ? apiChildCategory
      : childcategory;
  const filteredChildCategoryData = slug
    ? childcategorydata.filter(
      (category) => category?.subCategoryId?.slug === slug,
    )
    : childcategorydata;
  const activeCategoryData = childcategorydata.find(
    (category) => (category._id || category.id) === activeCategory,
  );


  useEffect(() => {
    if (!filteredChildCategoryData.length) return;

    const paramCategory = searchParams.get("category");

    const validCategory = filteredChildCategoryData.find(
      (category) =>
        String(category._id || category.id) === String(paramCategory),
    );

    const firstCategoryId =
      filteredChildCategoryData[0]._id || filteredChildCategoryData[0].id;

    const categoryId = validCategory ? paramCategory : firstCategoryId;

    setActiveCategory(String(categoryId));

    if (String(paramCategory) !== String(categoryId)) {
      setSearchParams({ category: categoryId }, { replace: true });
    }
  }, [slug, apiChildCategory, searchParams, setSearchParams]);

  useEffect(() => {
    if (activeCategory) {
      dispatch(fetchtypes({ childCategory: activeCategory }));
    }
  }, [activeCategory, dispatch]);

  const activeSubcategories = Array.isArray(apiTypes) ? apiTypes : [];
  const totalTypeCount = activeSubcategories.length;
  const activeTypeIds = activeType
    ? [activeType]
    : activeSubcategories.map((t) => t._id || t.id);
  const activeCategoryName = activeCategoryData?.name || "";
  const visibleProducts = Array.isArray(apiProducts) ? apiProducts : [];
  const hasMore =
    !productsLoading && genderFilteredProducts.length >= visibleCount;
  const handleImageError = (event) => {
    event.currentTarget.src = shoppingImg;
  };
  const handleCategoryClick = (categoryId) => {
    const id = String(categoryId);
    setActiveCategory(id);
    setActiveType(null);
    setVisibleCount(8);
    setSearchParams({
      category: id,
    });
  };

  const handleSubcategoryClick = (subcategory) => {
    const params = new URLSearchParams();
    if (bannerTitle) {
      params.set("category", bannerTitle);
    }
    if (subcategory?.name) {
      params.set("type", subcategory.name);
    }
    navigate(`/shop?${params.toString()}`);
  };

  const handleLoadMore = () => {
    const newCount = visibleCount + 8;
    setVisibleCount(newCount);
  };

  return (
    <>
      <SEO
        title={matchedCategory?.name ? `${matchedCategory.name} Collection` : `${bannerTitle} Collection`}
        description={
          matchedCategory?.description ||
          `Shop the best ${bannerTitle} collection - handpicked styles for everyday and celebration wear.`
        }
        image={getImageUrl(matchedCategory?.image_url)}
      />

      <Section className="!pt-5">
        <Row>
          <div className="relative overflow-hidden bg-theme rounded-[18px] px-6 py-10 md:px-12 md:py-12 flex items-center justify-between ">
            <div className="relative z-10">
              <p className="uppercase tracking-[0.12em] text-[12px] font-bold text-primary mb-2.5">
                Shop by category
              </p>
              <h1 className="text-[28px] md:text-[40px] font-bold leading-tight max-w-[520px]">
                {bannerTitle} collection
              </h1>
              <p className="mt-3  max-w-[460px] text-[#989696] text-14 break">
                Handpicked cotton, printed and festive styles for everyday and
                celebration wear.
              </p>
              <span className="mt-5 inline-block text-[13px] bg-white border border-[#EEE3DD] px-4 py-2 rounded-full">
                {typesLoading
                  ? "Loading..."
                  : `${totalTypeCount} styles curated for you`}
              </span>
            </div>
            <div className="hidden sm:flex relative z-10 w-[110px] h-[110px] md:w-[150px] md:h-[150px] rounded-full bg-white shadow-[0_0_0_2px_#FDEDF3] items-center justify-center flex-shrink-0 text-[11px] text-[#c9beb6]">
              <img
                src={
                  matchedCategory?.image_url
                    ? getImageUrl(matchedCategory.image_url)
                    : shoppingImg
                }
                alt={bannerTitle || "Category"}
                className="w-full h-full object-cover rounded-full"
              />
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
            {filteredChildCategoryData.map((category) => {
              const catId = category._id || category.id;
              const isActive = catId === activeCategory;
              return (
                <button
                  key={String(catId)}
                  type="button"
                  onClick={() => handleCategoryClick(catId)}
                  className="group flex flex-shrink-0 flex-col items-center gap-2.5"
                >
                  <div
                    className={`h-[100px] w-[100px] overflow-hidden rounded-full border-2 bg-[#FAF3EE]  ${isActive ? "theme-border" : "border-transparent"}`}
                  >
                    <img
                      src={getImageUrl(category.image_url)}
                      alt={category.name}
                      loading="lazy"
                      className="h-full w-full object-fit"
                      onError={handleImageError}
                    />
                  </div>
                  <span
                    className={`text-center text-[16px] ${isActive ? "font-bold text-primary" : "text-black"}`}
                  >
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

          {activeSubcategories.length === 0 ? (
            <div className="py-10 text-center text-gray-500">
              {typesLoading ? "Loading..." : "No subcategories found."}
            </div>
          ) : (
            <div className="mb-14 grid grid-cols-2 md:grid-cols-4 gap-x-6   lg:gap-x-8 gap-y-10 lg:gap-y-16">
              {activeSubcategories.map((subcategory) => (
                <button
                  key={String(subcategory._id || subcategory.id)}
                  type="button"
                  onClick={() => handleSubcategoryClick(subcategory)}
                  className="group relative text-left"
                >
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-0 translate-x-[7px] translate-y-[7px] border-[3px] border-[#ef3a96]" />

                    <div className="relative z-10 aspect-[3/4] overflow-hidden border-white bg-[#F5F1ED]">
                      <img
                        src={getImageUrl(subcategory.image_url)}
                        alt={subcategory.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={handleImageError}
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
                    </div>
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

      <Section>
        <Row>
          <div className="relative mb-[50px] flex w-full items-center justify-center md:mb-[90px]">
            <div className="w-[18px] border-t border-black md:w-[50px]" />
            <div className="relative mx-2 flex flex-col items-center justify-center md:mx-4">
              <h2 className="relative z-10 whitespace-nowrap font-h2 text-black">
                {activeCategoryName} Products
              </h2>
              <FlowerIcon className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[25px] w-[40px] -translate-x-1/2 -translate-y-1/2 md:h-[80px] md:w-[110px]" />
            </div>
            <div className="w-[18px] border-t border-black md:w-[50px]" />
          </div>
          <div className="grid grid-cols-2 gap-[20px] sm:grid-cols-3 md:gap-[30px] lg:grid-cols-4">
            {productsLoading ? (
              <p className="col-span-full text-center py-10 text-gray-500">
                Loading products...
              </p>
            ) : productsError ? (
              <p className="col-span-full text-center py-10 text-red-500">
                {productsError}
              </p>
            ) : visibleProducts.length === 0 ? (
              <p className="col-span-full text-center py-10 text-gray-500">
                No products found.
              </p>
            ) : (
              visibleProducts.map((product) => (
                <ShopProductCard
                  key={product._id}
                  product={product}
                  onNavigate={(idOrSlug) => navigate(`/products/${idOrSlug}`)}
                  setShowLoginPopup={setShowLoginPopup}
                />
              ))
            )}
          </div>

          {hasMore && (
            <div className="mt-20 flex justify-center">
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