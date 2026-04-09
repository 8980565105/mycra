import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import SectionHeading from "../ui/SectionHeading";
import Row from "../ui/Row.jsx";
import Section from "../ui/Section.jsx";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useSelector } from "react-redux";
import { getImageUrl } from "../utils/helper.js";
import { ChevronLeft, ChevronRight } from "lucide-react";


const RecommendedSection = () => {
  const { products } = useSelector( (state) => state.products );
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!products.length) return null;

  const NextArrow = ({ onClick }) => (
    <button
      onClick={onClick}
      className="w-[30px] md:w-[40px] h-[30px] md:h-[40px] flex items-center justify-center bg-white box-shadow rounded-full  absolute right-0 top-1/2 z-10 
      translate-x-[120%] md:translate-x-[110%] -translate-y-[50%]"
    >
      <ChevronRight />
    </button>
  );

  const PrevArrow = ({ onClick }) => (
    <button
      onClick={onClick}
      className="w-[30px] md:w-[40px] h-[30px] md:h-[40px] flex items-center justify-center bg-white box-shadow rounded-full  absolute left-0 top-1/2 z-10 
      -translate-x-[120%] md:-translate-x-[110%] -translate-y-[50%]"
    >
      <ChevronLeft />
    </button>
  );

  const settings = {
    dots: false,
    arrows: true,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    infinite: true,
    speed: 600,
    slidesToShow:  windowWidth <= 767 ? 1 : windowWidth <= 980 ? 2 : 3,
    slidesToScroll: 1,
  };

  return (
    <Section className="w-full ">
      <Row>
        <SectionHeading page="Home" order={8} />
      </Row>

      <Row className="!max-w-[1179px] mx-auto mb-[50px] md:mb-[90px] overflow-visible relative px-11 ">
        <Slider {...settings}>
          {products.map((item) => (
            <div key={item._id} className="px-[5px] sm:px-[12.5px]">
              <ProductCard item={item} />
            </div>
          ))}
        </Slider>
      </Row>
    </Section>
  );
};

// PRODUCT CARD
const ProductCard = ({ item }) => {
  const imageUrl =
    item?.images?.length > 0
      ? getImageUrl(item.images[0])
      : "/placeholder.png";

  const title = item?.category?.name || "Recommanded Item";
  const description = item?.name || "No description available";

  return (
      <div className="relative shadow-lg overflow-hidden transition-transform duration-300">
        <div className="relative w-full min-h-[300px]  lg:w-[342px] h-[315px] sm:h-[398px]">
          <img src={imageUrl} alt={title} className="w-full h-full object-cover filter grayscale brightness-35 contrast-125" />
          <div className="absolute inset-0 bg-black opacity-30" style={{ mixBlendMode: 'luminosity' }}></div>
        </div>
        <div className="absolute inset-0 flex justify-center items-center">
          <img src={imageUrl} alt={title} className="w-[90%] h-[92%] object-fit" />
        </div>
        <div className="absolute bottom-8 left-6 text-white z-20">
          <h2 className="font-h5 max-w-[200px] leading">
            {title}
          </h2>
          <p className="font-sans font-medium text-[16px] line-clamp-3">
            {description}
          </p>
        </div>
    </div>
  );
};

export default RecommendedSection;
