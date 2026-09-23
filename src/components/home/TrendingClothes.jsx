import React, { useEffect, useRef, useState } from "react";
import Slider from "react-slick";
import FlowerIcon from "../icons/FlowerIcon";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Row from "../ui/Row.jsx";
import { useSelector } from "react-redux";
import { getImageUrl } from "../utils/helper.js";
import Section from "../ui/Section";
import { Link } from "react-router-dom";
const NextArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="w-6 h-6 flex items-center justify-center bg-color text-white rounded-full mx-2 hover:bg-pink-600 transition"
  >
    &gt;
  </button>
);

const PrevArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="w-6 h-6 flex items-center justify-center bg-color text-white rounded-full mx-2 hover:bg-pink-600 transition"
  >
    &lt;
  </button>
);

const TrendingClothes = () => {
  const { products = [], loading } = useSelector((state) => state.products);
  const sliderRef = useRef(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // const trendingProducts = products.filter(
  //   (product) =>
  //     product.status === "active" &&
  //     product.variants?.some((variant) => variant.is_trending),
  // );
  const trendingProducts = products.filter(
    (product) => product.status === "active" && product.is_trending === true,
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const trendingProductsLimited = trendingProducts.slice(0, 3);
  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: windowWidth <= 640 ? 1 : windowWidth <= 980 ? 2 : 2,
    slidesToScroll: 1,
    arrows: false,
  };

  if (loading) return <p>Loading...</p>;
  if (!trendingProductsLimited.length)
    return <p>No trending products found.</p>;

  return (
    <Section className="mb-[25px] md:mb-[50px]">
      <div className="relative flex justify-center items-center w-full mb-[50px] md:mb-[90px]">
        <div className="w-[18px] md:w-[50px] border-t border-black"></div>

        <div className="relative mx-2 md:mx-4 flex flex-col items-center justify-center">
          <h2 className="font-h2 text-black whitespace-nowrap relative z-10">
            Tranding Product
          </h2>
          <FlowerIcon className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[40px] h-[25px] md:w-[110px] md:h-[80px] pointer-events-none z-0" />
        </div>
        <div className="w-[18px] md:w-[50px] border-t border-black"></div>
      </div>

      <Row>
        <div className="hidden custom-lg:grid grid-cols-3 gap-8">
          {trendingProductsLimited.map((product) => (
            <TrendingCloth key={product._id} product={product} desktop />
          ))}
        </div>

        <div className="custom-lg:hidden w-full relative">
          <Slider ref={sliderRef} {...sliderSettings}>
            {trendingProducts.map((product) => (
              <div key={product._id} className="px-2">
                <TrendingCloth product={product} />
              </div>
            ))}
          </Slider>

          <div className="flex justify-center mt-4">
            <PrevArrow onClick={() => sliderRef.current.slickPrev()} />
            <NextArrow onClick={() => sliderRef.current.slickNext()} />
          </div>
        </div>
      </Row>
    </Section>
  );
};

const TrendingCloth = ({ product, desktop }) => {
  const variants = product?.variants || [];

  const variantPrices = variants.map((variant) => {
    const price = Number(variant?.price || 0);
    const offerPrice = Number(variant?.pfferprice || 0);

    return offerPrice > 0 && offerPrice < price
      ? offerPrice
      : price;
  }).filter((price) => price > 0);

  const minPrice =
    variantPrices.length > 0
      ? Math.min(...variantPrices)
      : 0;

  const maxPrice =
    variantPrices.length > 0
      ? Math.max(...variantPrices)
      : 0;

  const mainVariant = variants[0];

  const originalPrice = Number(mainVariant?.price || 0);
  const offerPrice = Number(mainVariant?.offerprice || 0);

  const isSale = originalPrice > 0 && offerPrice > 0 && offerPrice < originalPrice;

  return (
    <Link to={`/products/${product.slug}`}>
      <div className={`group ${desktop ? "" : "w-full"}`}>
        <div className="relative rounded-lg overflow-visible p-2 h-[350px] md:h-[555px]">
          <span className="absolute top-0 left-0 w-[139px] border-t-[0.5px] border-dashed border-black"></span>
          <span className="absolute top-0 left-0 h-[177px] border-l-[0.5px] border-dashed border-black"></span>
          <span className="absolute bottom-0 right-0 w-[139px] border-b-[0.5px] border-dashed border-black"></span>
          <span className="absolute bottom-0 right-0 h-[177px] border-r-[0.5px] border-dashed border-black"></span>
          <FlowerIcon className="absolute top-0 left-0  w-[40px]  -translate-x-1/2   -translate-y-1/2  h-[30px] text-pink-300 pointer-events-none" />
          <img
            src={getImageUrl(
              product.variants?.[0]?.images?.[0] ||
                product.images?.[0] ||
                "/uploads/placeholder.png",
            )}
            alt={product.name}
            className=" w-full h-full rounded-[5px]"
          />

          {isSale && (
            <span className="absolute top-5 right-[15px] bg-color text-white text-xs px-3 py-1 rounded-[5px]">
              Sale
            </span>
          )}
        </div>

        <div className="p-2 pt-[20px] text-left">
          <h3 className="font-medium text-[16px] md:text-[20px]  mb-[5px] leading line-clamp-1">
            {product.name}
          </h3>
          <p className="sec-text-color mb-[5px]">
            <span className="text-[12px] md:text-[14px]">
                {minPrice === maxPrice
                ? `Rs ${minPrice.toFixed(2)}`
                : `Rs ${minPrice.toFixed(2) } - Rs ${maxPrice.toFixed(2)}`}
            </span>
          </p>
          <p className="text-black mb-[5px]">★★★★★</p>
          <button className="text-black text-[12px] md:text-[14px] relative transition">
            Select Option
            <span className="theme-border-block w-8 bg-color " />
          </button>
        </div>
      </div>
    </Link>
  );
};
export default TrendingClothes;