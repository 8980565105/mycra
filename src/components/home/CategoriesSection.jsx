import { useState, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useSelector } from "react-redux";
import { getImageUrl } from "../utils/helper";
import { useNavigate } from "react-router-dom";
import shoppingImg from "../../assets/shopping.png";
import kurtiImg from "../../assets/Kurti.png";
import JeansImg from "../../assets/Jeans.png";
import jewelleryImg from "../../assets/jewellery.png";
import cropImg from "../../assets/Crop Tops.png";

const STATIC_CATEGORIES = [
  { _id: "static-1", name: "Saree", image_url: shoppingImg, isStatic: true },
  { _id: "static-2", name: "Kurti", image_url: kurtiImg, isStatic: true },
  { _id: "static-3", name: "Jeans", image_url: JeansImg, isStatic: true },
  {
    _id: "static-4",
    name: "Jewellery",
    image_url: jewelleryImg,
    isStatic: true,
  },
  { _id: "static-5", name: "Crop Tops", image_url: cropImg, isStatic: true },
  {
    _id: "static-6",
    name: "Jewellery",
    image_url: jewelleryImg,
    isStatic: true,
  },
];

const CategoriesSection = () => {
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const { items: categories, loading } = useSelector(
    (state) => state.categories,
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const displayCategories =
    !loading && categories?.length > 0 ? categories : STATIC_CATEGORIES;

  const filteredCategories = displayCategories.filter(
    (cat) => cat.parent_id !== null || cat.isStatic
  );

  const slidesToShow =
    windowWidth <= 767
      ? 2
      : windowWidth <= 980
      ? 3
      : windowWidth <= 1280
      ? 4
      : 5;

  const settings = {
    dots: true,
    infinite: filteredCategories.length > slidesToShow,
    speed: 500,
    slidesToShow,
    slidesToScroll: slidesToShow,
    arrows: false,
  };

  return (
    <>
    {filteredCategories.length > 0 ? (
      <div class="cat-slider">
        <Slider {...settings} className="pb-10">
            {displayCategories
              .filter((cat) => cat.parent_id !== null)
              .map((category, index) => (
                <div
                  key={category._id || index}
                  className="flex flex-col items-center group cursor-pointer px-[10px] sm:px-[26.5px]"
                  onClick={() =>
                    navigate(`/collections?category=${category.name}`)
                  }
                >
                  <div className="relative w-full aspect-square rounded-full overflow-hidden border-4 circle-border duration-300 flex items-center justify-center">
                    <img
                      src={
                        category.isStatic
                          ? category.image_url
                          : getImageUrl(category.image_url)
                      }
                      alt={category.name}
                      className="lg:w-[130px] lg:h-[130px] object-contain "
                    />
                  </div>
                  <p className="mt-4 text-dark text-center text-[20px]">
                    {category.name}
                    <span className="theme-border-block w-[20px] mx-auto"></span>
                  </p>
                </div>
              ))}
          </Slider>
      </div>
    ) : (
      <p className="text-center">No categories found</p>
    )}

    <style>{`
      .cat-slider .slick-dots {
        bottom: 0 !important;
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
        gap: 8px !important;
        width: 100% !important;
      }
      .cat-slider .slick-dots li {
        width: 10px !important;
        height: 10px !important;
        margin: 0 !important;
        border-radius: 50px !important;
      }
      .cat-slider .slick-dots li button {
        width: 10px !important;
        height: 10px !important;
        padding: 0 !important;
        background: #D2AF9F !important;
        border-radius: 50px !important;
      }
      .cat-slider .slick-dots li button:before {
        display: none !important;
      }
      .cat-slider .slick-dots li.slick-active,
      .cat-slider .slick-dots li.slick-active button {
        background: #F43297 !important;
        width: 40px !important;
      }
    `}</style>
    </>
  );
};

export default CategoriesSection;
