import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import forYouImg from "../../assets/all.png";
import { getImageUrl } from "../utils/helper";

const CategoryNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollRef = useRef();

  const [isScrolled, setIsScrolled] = useState(false);
  const [activecategory, setActivecategory] = useState("all");

  const { items: categories = [], loading: catLoading } = useSelector(
    (state) => state.categories,
  );

  // useEffect(() => {
  //   const handleScroll = () => {
  //     setIsScrolled(window.scrollY > 80);
  //   };

  //   window.addEventListener("scroll", handleScroll, { passive: true });
  //   handleScroll();

  //   return () => window.removeEventListener("scroll", handleScroll);
  // }, []);
  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsScrolled(true);
      } else if (currentScrollY < lastScrollY) {
        setIsScrolled(false);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const categoryIdFromUrl = searchParams.get("categoryId");
    setActivecategory(categoryIdFromUrl || "all");
  }, [location.search]);

  const handleCategoryClick = (cat) => {
    setActivecategory(cat._id);
    navigate(`/collections?categoryId=${cat._id}`, { replace: true });
  };

  const handleForYouClick = () => {
    setActivecategory("all");
    navigate(`/collections`, { replace: true });
  };

  const activeCategories = categories.filter((cat) => cat.status === "active");

  return (
    <nav
      className={`sticky top-[100px] z-[1000] w-full border-y py-2 bg-white transition-all duration-300 ease-in-out ${
        isScrolled
          ? "border-color shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
          : "border-color"
      }`}
    >
      <div className="w-full max-w-[1400px] mx-auto">
        <div
          ref={scrollRef}
          className="flex w-full items-stretch overflow-x-auto scroll-smooth overscroll-x-contain no-scrollbar"
        >
          <button
            type="button"
            onClick={handleForYouClick}
            className="group relative flex min-w-[86px] shrink-0 cursor-pointer flex-col items-center justify-center px-2 text-center outline-none transition-all duration-300 ease-in-out hover:bg-gray-50 sm:min-w-[96px] sm:px-3 lg:min-w-[104px]"
          >
            <div
              className={`flex items-center justify-center overflow-hidden transition-all duration-300 ease-in-out ${
                isScrolled
                  ? "h-0 translate-y-[-8px] opacity-0 "
                  : "h-[40px] translate-y-0 opacity-100 "
              }
              ${
                activecategory === "all"
                  ? "bg-[linear-gradient(180deg,#f43297a6_0%,rgba(244,50,151,0.7)_20%,rgba(244,50,151,0.58)_40%,rgba(244,50,151,0.32)_60%,rgba(244,50,151,0.29)_80%,rgba(255,255,255,0)_100%)]"
                  : "bg-none"
              }
                            
              `}
            >
              <img
                src={forYouImg}
                alt="For You"
                className="h-9 w-9 object-contain"
              />
            </div>

            <span
              className={`whitespace-nowrap font-medium transition-all duration-300 ease-in-out ${
                isScrolled ? "pb-3 text-[13px]" : "pb-3 pt-1 text-[13px]"
              } ${
                activecategory === "all"
                  ? "font-semibold text-gray-900 "
                  : "text-gray-700"
              } group-hover:text-blue-600`}
            >
              For You
            </span>

            <span
              className={`absolute bottom-0 left-1/2 h-[3px] -translate-x-1/2 rounded-t-full bg-color transition-all duration-300 ${
                activecategory === "all"
                  ? "w-[42px] opacity-100"
                  : "w-0 opacity-0"
              }`}
            />
          </button>

          {!catLoading &&
            activeCategories.map((cat) => {
              const isActive = activecategory === cat._id;

              return (
                <button
                  key={cat._id}
                  type="button"
                  onClick={() => handleCategoryClick(cat)}
                  className="group relative flex min-w-[86px] shrink-0 cursor-pointer flex-col items-center justify-center px-2 text-center outline-none transition-all duration-300 ease-in-out hover:bg-gray-50 sm:min-w-[96px] sm:px-3 lg:min-w-[104px]"
                >
                  <div
                    className={`flex items-center justify-center overflow-hidden transition-all duration-300 ease-in-out ${
                      isScrolled
                        ? "h-0 translate-y-[-8px] opacity-0"
                        : "h-[40px] translate-y-0 opacity-100"
                    }
                    ${
                      isActive 
                        ? "bg-[linear-gradient(180deg,#f43297a6_0%,rgba(244,50,151,0.7)_20%,rgba(244,50,151,0.58)_40%,rgba(244,50,151,0.32)_60%,rgba(244,50,151,0.29)_80%,rgba(255,255,255,0)_100%)]"
                        : "bg-none"
                    }
                    
                    `}
                  >
                    {cat.image_url ? (
                      <img
                        src={getImageUrl(cat.image_url)}
                        alt={cat.name}
                        className="h-9 w-9 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const fallback = e.currentTarget.nextElementSibling;
                          if (fallback) fallback.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className={`${
                        cat.image_url ? "hidden" : "flex"
                      } items-center justify-center`}
                    >
                      <ShoppingBag
                        size={30}
                        strokeWidth={1.8}
                        className="text-gray-700 transition-colors duration-200 group-hover:text-blue-600"
                      />
                    </div>
                  </div>
                  <span
                    className={`whitespace-nowrap font-medium transition-all duration-300 ease-in-out ${
                      isScrolled ? "pb-3 text-[13px]" : "pb-3 pt-1 text-[13px]"
                    } ${
                      isActive ? "font-semibold text-color" : "text-gray-700"
                    } group-hover:text-color`}
                  >
                    {cat.name}
                  </span>
                  <span
                    className={`absolute bottom-0 left-1/2 h-[3px] -translate-x-1/2 rounded-t-full bg-color transition-all duration-300 ${
                      isActive ? "w-[42px] opacity-100" : "w-0 opacity-0"
                    }`}
                  />
                </button>
              );
            })}
        </div>
      </div>
    </nav>
  );
};

export default CategoryNavigation;
