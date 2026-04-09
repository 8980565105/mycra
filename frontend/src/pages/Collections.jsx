import React, { useState, useEffect } from "react";
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

  const searchParams = new URLSearchParams(location.search);
  const categoryNameFromUrl = searchParams.get("category");
  const categoryIdFromUrl = searchParams.get("categoryId");

  const { items: categories, loading: catLoading } = useSelector(
    (state) => state.categories,
  );
  const { items: subcategories, loading: subLoading } = useSelector(
    (state) => state.subcategories,
  );

  const [selectedCategory, setSelectedCategory] = useState(null);

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
    if (!categories || categories.length === 0) return;

    if (categoryIdFromUrl) {
      const found = categories.find(
        (cat) => String(cat._id) === String(categoryIdFromUrl),
      );
      setSelectedCategory(found || null);
    } else if (categoryNameFromUrl) {
      const found = categories.find(
        (cat) => cat.name.toLowerCase() === categoryNameFromUrl.toLowerCase(),
      );
      setSelectedCategory(found || null);
    } else {
      setSelectedCategory(null);
    }
  }, [categoryIdFromUrl, categoryNameFromUrl, categories]);

  const loading = catLoading || subLoading;

  const parentCategories =
    !catLoading && categories && categories.length > 0
      ? categories.filter((cat) => cat.parent_id === null)
      : STATIC_CATEGORIES;

  const getParentId = (sub) => {
    if (!sub.parent_id) return null;
    if (typeof sub.parent_id === "object") return String(sub.parent_id._id);
    return String(sub.parent_id);
  };

  const displaySubcategories = selectedCategory
    ? subcategories.filter(
        (sub) => getParentId(sub) === String(selectedCategory._id),
      )
    : subcategories;

  const [visibleCategoryCount, setVisibleCategoryCount] = useState(20);
  const visibleCategories = parentCategories.slice(0, visibleCategoryCount);
  const hasMoreCategories = visibleCategoryCount < parentCategories.length;

  const [visibleSubCount, setVisibleSubCount] = useState(20);
  const visibleSubcategories = displaySubcategories.slice(0, visibleSubCount);
  const hasMoreSub = visibleSubCount < displaySubcategories.length;

  const getLoadMoreCount = () => (window.innerWidth >= 768 ? 5 : 6);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setVisibleSubCount(20);
    navigate(`/collections?categoryId=${category._id}`, { replace: true });
  };

  const [visibleCount, setVisibleCount] = useState(6);
  const visibleProducts = products.slice(0, visibleCount);

  return (
    <div className="w-[90%] md:w-[90%] lg:max-w-[1440px] mx-auto mt-5">
      {loading && <p className="text-center text-gray-400 py-8">Loading...</p>}

      {!loading && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 px-4 mb-10">
            {visibleCategories.map((category, index) => (
              <div
                key={category._id || index}
                className={`flex flex-col items-center group cursor-pointer`}
                onClick={() => handleCategoryClick(category)}
              >
                <div
                  className={`relative w-full max-w-[160px] aspect-square rounded-full overflow-hidden border-4 duration-300 group-hover:scale-105 transition-transform
                    ${
                      selectedCategory?._id === category._id
                        ? "circle-border-active border-theme"
                        : "circle-border"
                    }
                  `}
                >
                  <img
                    src={
                      category.isStatic
                        ? category.image_url
                        : getImageUrl(category.image_url)
                    }
                    alt={category.name}
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      e.target.src = shoppingImg;
                    }}
                  />
                </div>
                <p
                  className={`mt-4 text-center text-[18px] font-medium
                    ${selectedCategory?._id === category._id ? "text-theme" : "text-dark"}
                  `}
                >
                  {category.name}
                  <span className="theme-border-block w-[20px] mx-auto block mt-1" />
                </p>
              </div>
            ))}
          </div>

          {hasMoreCategories && (
            <div className="flex justify-center mb-10">
              <button
                onClick={() =>
                  setVisibleCategoryCount((p) => p + getLoadMoreCount())
                }
                className="text-[18px] theme-border text-theme w-[187px] h-[70px] sm:w-[220px] sm:h-[89px] font-medium rounded-[10px] shadow-lg transition duration-300 uppercase"
                style={{
                  boxShadow: "inset 0px 0px 30px rgba(244, 50, 151, 0.25)",
                }}
              >
                Load More
              </button>
            </div>
          )}

          <div className="px-4 mb-6">
            <h2 className="text-dark text-[22px] font-semibold">
              All Subcategories
            </h2>
          </div>

          {displaySubcategories.length === 0 ? (
            <p className="text-center text-gray-400 py-8">
              {selectedCategory
                ? `No subcategories found for "${selectedCategory.name}"`
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
                    style={{
                      boxShadow: "inset 0px 0px 30px rgba(244, 50, 151, 0.25)",
                    }}
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
                style={{
                  boxShadow: "inset 0px 0px 30px rgba(244, 50, 151, 0.25)",
                }}
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
