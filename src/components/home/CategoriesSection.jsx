import React, { useState, useRef, useEffect } from "react";
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
  const sliderRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const { items: categories, loading } = useSelector(
    (state) => state.categories,
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const displayCategories =
    !loading && categories?.length > 0 ? categories : STATIC_CATEGORIES;

  //slider
  const slidesToShow =
    windowWidth <= 767
      ? 2
      : windowWidth <= 980
        ? 3
        : windowWidth <= 1280
          ? 4
          : 5;

  const totalDots = Math.ceil(displayCategories.length / slidesToShow);
  const slidesToScroll = slidesToShow;

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow,
    slidesToScroll,
    arrows: false,
    beforeChange: (_, next) => {
      setCurrentSlide(Math.floor(next / slidesToShow));
    },
  };

  return (
    <>
      {displayCategories.length > 0 ? (
        <>
          <Slider ref={sliderRef} {...settings}>
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
                  <div className="relative w-full aspect-square rounded-full overflow-hidden border-4 circle-border duration-300">
                    <img
                      src={
                        category.isStatic
                          ? category.image_url
                          : getImageUrl(category.image_url)
                      }
                      alt={category.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <p className="mt-4 text-dark text-center text-[20px]">
                    {category.name}
                    <span className="theme-border-block w-[20px] mx-auto"></span>
                  </p>
                </div>
              ))}
          </Slider>

          <div className="flex justify-center mt-[35px] sm:mt-[65px] space-x-[6px]">
            {Array.from({ length: totalDots }).map((_, i) => (
              <button
                key={i}
                onClick={() => sliderRef.current.slickGoTo(i * slidesToShow)}
                className={`transition-all duration-300 ${
                  currentSlide === i
                    ? "w-[40px] h-[10px] rounded-full bg-color"
                    : "w-[10px] h-[10px] rounded-full bg-[#D2AF9F]"
                }`}
              />
            ))}
          </div>
        </>
      ) : (
        <p className="text-center">No categories found</p>
      )}
    </>
  );
};

export default CategoriesSection;
