import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { getImageUrl } from "../components/utils/helper";
import shoppingImg from "../assets/shopping.png";
import { fetchsubCategories } from "../features/subcategories/subcategoriesThunk";
import { fetchCategories } from "../features/categories/categoriesThunk";
import Row from "../components/ui/Row";
import CategoryNavigation from "../components/category/CategoryNavigation";
import { fetchtypes } from "../features/types/typeThunk";
import SEO from "../components/Seo/seo";
import { fetchPageBySlug } from "../features/pages/pagesThunk";

const createSlug = (name) => {
  return name
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

function Collections({ products = [] }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [activecategory, setActivecategory] = useState("all");
  const { items: categories, loading: catLoading } = useSelector(
    (state) => state.categories,
  );
  const { items: subcategories, loading: subLoading } = useSelector(
    (state) => state.subcategories,
  );
  const { items: types } = useSelector(
    (state) => state.types,
  );
  const { pages } = useSelector((state) => state.pages);
  useEffect(() => {
    dispatch(fetchPageBySlug("collections"));
  }, [dispatch]);
  const collectionsPage = pages?.find((page) => page.slug === "collections");
  useEffect(() => {
    if (!types || types.length === 0) {
      dispatch(fetchtypes());
    }
  }, [dispatch, types]);

  useEffect(() => {
    if (!categories || categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch]);

  useEffect(() => {
    if (!subcategories || subcategories.length === 0) {
      dispatch(fetchsubCategories());
    }
  }, [dispatch]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const categoryIdFromUrl = searchParams.get("categoryId");
    if (categoryIdFromUrl) {
      setActivecategory(categoryIdFromUrl);
    } else {
      setActivecategory("all");
    }
  }, [location.search]);

  const loading = catLoading || subLoading;

  const getParentId = (sub) => {
    if (!sub.parent_id) return null;
    if (typeof sub.parent_id === "object") return String(sub.parent_id._id);
    return String(sub.parent_id);
  };

  const displaySubcategories =
    activecategory === "all"
      ? subcategories
      : subcategories.filter(
        (sub) => getParentId(sub) === String(activecategory),
      );

  const selectedCategory =
    activecategory === "all"
      ? null
      : categories.find((cat) => String(cat._id) === String(activecategory));

  const selectedCategoryName = selectedCategory?.name;
  const headingText = selectedCategoryName
    ? `${selectedCategoryName} Subcategories`
    : "All Subcategories";

  const [visibleSubCount, setVisibleSubCount] = useState(10);

  useEffect(() => {
    setVisibleSubCount(10);
  }, [activecategory]);
  const visibleSubcategories = displaySubcategories.slice(0, visibleSubCount);
  const hasMoreSub = visibleSubCount < displaySubcategories.length;
  const getLoadMoreCount = () => (window.innerWidth >= 768 ? 5 : 6);
  const [visibleCount, setVisibleCount] = useState(6);
  const visibleProducts = products.slice(0, visibleCount);
  return (
    <>
      <SEO
        title={collectionsPage?.meta_title}
        description={collectionsPage?.meta_description}
        image={getImageUrl(collectionsPage?.seo_image)}
      />
      <Row className=" mt-5">
        <CategoryNavigation />

        <div className="relative overflow-hidden rounded-[16px] mt-5 bg-theme px-6 py-8 md:px-10 md:py-10 mb-6 flex items-center justify-between">
          <div className="relative">
            <p className="uppercase tracking-widest text-theme text-[12px] font-medium mb-2">
              Shop By Category
            </p>
            <h1 className="text-dark text-[26px] md:text-[34px] font-semibold leading-tight">
              {selectedCategoryName
                ? `${selectedCategoryName} Collection`
                : "All Collections"}
            </h1>
            <p className="text-gray-500 text-[14px] mt-2">
              {displaySubcategories.length} styles curated for you
            </p>
          </div>
          <div className="hidden sm:flex relative z-10 w-[76px] h-[76px] md:w-[130px] md:h-[130px]  rounded-full bg-white items-center justify-center overflow-hidden">
            <img
              src={
                selectedCategory?.image_url
                  ? getImageUrl(selectedCategory.image_url)
                  : shoppingImg
              }
              alt={selectedCategoryName || "Collections"}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = shoppingImg;
              }}
            />
          </div>
          <span className="absolute -right-6 -top-6 w-[140px] h-[140px] rounded-full border border-theme/20" />
        </div>

        {loading && <p className="text-center text-gray-400 py-8">Loading...</p>}

        {!loading && (
          <>
            <div className="px-4 my-10">
              <h2 className="text-dark text-[22px] font-semibold">
                {headingText}
              </h2>
            </div>
            {displaySubcategories.length === 0 ? (
              <p className="text-center text-gray-400 py-8">
                {selectedCategoryName
                  ? `No subcategories found for "${selectedCategoryName}"`
                  : "No subcategories found"}
              </p>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 px-4">
                  {visibleSubcategories.map((sub, index) => (
                    <div
                      key={sub._id || index}
                      className="flex flex-col items-center group cursor-pointer"
                      onClick={() =>
                        navigate(`/collections/${createSlug(sub.name)}`)
                      }
                    >
                      <div className="relative w-full max-w-[160px] aspect-square rounded-full overflow-hidden border-4 circle-border duration-300 group-hover:scale-105 transition-transform">
                        <img
                          src={getImageUrl(sub.image_url)}
                          alt={sub.name}
                          className="w-full h-full object-cover rounded-full"
                          onError={(e) => {
                            e.target.src = shoppingImg;
                          }}
                        />
                      </div>
                      <p className="mt-4 text-dark text-center text-[18px] font-medium break">
                        {sub.name}
                        <span className="theme-border-block w-[20px] mx-auto block mt-1" />
                      </p>
                    </div>
                  ))}
                </div>

                {hasMoreSub && (
                  <div className="flex justify-center mt-[50px]">
                    <button
                      onClick={() =>
                        setVisibleSubCount((p) => p + getLoadMoreCount())
                      }
                      className="text-[18px] theme-border text-theme w-[187px] h-[70px] sm:w-[220px] sm:h-[89px] font-medium rounded-[10px] shadow-lg transition duration-300 uppercase"
                      style={{ boxShadow: "inset 0px 0px 30px " }}
                    >
                      Load More
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {visibleProducts.length > 0 && (
          <div className="mt-10">
            {visibleCount < products.length && (
              <div className="flex justify-center mt-[50px]">
                <button
                  onClick={() => setVisibleCount((v) => v + 3)}
                  className="text-[18px] theme-border text-theme w-[187px] h-[70px] sm:w-[220px] sm:h-[89px] font-medium rounded-[10px] shadow-lg transition duration-300 uppercase"
                  style={{ boxShadow: "inset 0px 0px 30px " }}
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        )}
      </Row>

    </>
  );
}

export default Collections;
