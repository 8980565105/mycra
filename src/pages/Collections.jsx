import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { getImageUrl } from "../components/utils/helper";
import shoppingImg from "../assets/shopping.png";
import kurtiImg from "../assets/Kurti.png";
import JeansImg from "../assets/Jeans.png";
import jewelleryImg from "../assets/jewellery.png";
import cropImg from "../assets/Crop Tops.png";
import { fetchsubCategories } from "../features/subcategories/subcategoriesThunk";
import { fetchCategories } from "../features/categories/categoriesThunk";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Row from "../components/ui/Row";

const STATIC_CATEGORIES = [
  {
    _id: "static-1",
    name: "Saree",
    image_url: shoppingImg,
    isStatic: true,
    parent_id: null,
  },
  {
    _id: "static-2",
    name: "Kurti",
    image_url: kurtiImg,
    isStatic: true,
    parent_id: null,
  },
  {
    _id: "static-3",
    name: "Jeans",
    image_url: JeansImg,
    isStatic: true,
    parent_id: null,
  },
  {
    _id: "static-4",
    name: "Jewellery",
    image_url: jewelleryImg,
    isStatic: true,
    parent_id: null,
  },
  {
    _id: "static-5",
    name: "Crop Tops",
    image_url: cropImg,
    isStatic: true,
    parent_id: null,
  },
];

function Collections({ products = [] }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const scrollRef = useRef();

  // activecategory stores the _id of the selected category (or "all")
  const [activecategory, setActivecategory] = useState("all");

  const { items: categories, loading: catLoading } = useSelector(
    (state) => state.categories,
  );
  const { items: subcategories, loading: subLoading } = useSelector(
    (state) => state.subcategories,
  );

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

  const parentCategories =
    !catLoading && categories && categories.length > 0
      ? categories.filter((cat) => !cat.parent_id)
      : STATIC_CATEGORIES;

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

  // Dynamic heading: "All Subcategories" or "Jeans Subcategories" etc.
  const selectedCategoryName =
    activecategory === "all"
      ? null
      : categories.find((cat) => String(cat._id) === String(activecategory))
          ?.name;

  const headingText = selectedCategoryName
    ? `${selectedCategoryName} Subcategories`
    : "All Subcategories";

  const [visibleSubCount, setVisibleSubCount] = useState(10);

  // Reset visible count when category changes
  useEffect(() => {
    setVisibleSubCount(10);
  }, [activecategory]);

  const visibleSubcategories = displaySubcategories.slice(0, visibleSubCount);
  const hasMoreSub = visibleSubCount < displaySubcategories.length;

  const getLoadMoreCount = () => (window.innerWidth >= 768 ? 5 : 6);

  const handleCategoryClick = (cat) => {
    setActivecategory(cat._id);
    navigate(`/collections?categoryId=${cat._id}`, { replace: true });
  };

  const handleAllClick = () => {
    setActivecategory("all");
    navigate(`/collections`, { replace: true });
  };

  const [visibleCount, setVisibleCount] = useState(6);
  const visibleProducts = products.slice(0, visibleCount);

  const scroll = (direction) => {
    scrollRef.current.scrollBy({
      left: direction === "left" ? -300 : 300,
      behavior: "smooth",
    });
  };

  return (
    <div className="w-[90%] md:w-[90%] lg:max-w-[1440px] mx-auto mt-5">
      {loading && <p className="text-center text-gray-400 py-8">Loading...</p>}

      {!loading && (
        <>
          {/* ── Category filter bar ── */}
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
              {/* All button */}
              <button
                onClick={handleAllClick}
                className={`whitespace-nowrap px-4 py-2 rounded-[5px] border text-sm transition
                  ${
                    activecategory === "all"
                      ? "bg-[#f32f94] text-white"
                      : "bg-white text-black"
                  }`}
              >
                All
              </button>

              {/* Dynamic category buttons */}
              {categories
                .filter((cat) => cat.status === "active")
                .map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => handleCategoryClick(cat)}
                    className={`whitespace-nowrap px-4 py-2 rounded-[5px] border text-sm transition
                      ${
                        activecategory === cat._id
                          ? "bg-[#f32f94] text-white"
                          : "bg-white text-black"
                      }`}
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

          {/* ── Dynamic heading ── */}
          <div className="px-4 mb-6 mt-4">
            <h2 className="text-dark text-[22px] font-semibold">
              {headingText}
            </h2>
          </div>

          {/* ── Subcategory grid ── */}
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
                    onClick={() => navigate(`/shop?category=${sub.name}`)}
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
                    <p className="mt-4 text-dark text-center text-[18px] font-medium">
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

      {/* ── Products section ── */}
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
    </div>
  );
}

export default Collections;
