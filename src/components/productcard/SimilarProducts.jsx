import React, { useMemo, useRef, useState, useEffect } from "react";
import Slider from "react-slick";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import Row from "../ui/Row";

function PrevArrow({ onClick, currentSlide }) {
  return (
    <button
      onClick={onClick}
      className="absolute right-16 md:right-20 top-0 -translate-y-[140%] z-10 flex items-center justify-center rounded-[3px] border light-border bg-white p-0 md:p-2 text-black disabled:opacity-40"
      disabled={currentSlide === 0}
    >
      <ChevronLeft size={22} />
    </button>
  );
}

function NextArrow({ onClick, currentSlide, slideCount, slidesToShow }) {
  return (
    <button
      onClick={onClick}
      className="absolute right-8 top-0 -translate-y-[140%] z-10 flex items-center justify-center rounded-[3px] border light-border bg-white p-0 md:p-2 text-black disabled:opacity-40"
      disabled={currentSlide >= slideCount - slidesToShow}
    >
      <ChevronRight size={22} />
    </button>
  );
}

export default function SimilarProducts({
  product,
  products = [],
  setShowLoginPopup,
}) {
  const sliderRef = useRef(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [slideState, setSlideState] = useState({ current: 0, total: 0 });

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const similarProducts = useMemo(() => {
    if (!product || !product.category_id) return [];

    const categoryId =
      typeof product.category_id === "object"
        ? product.category_id._id
        : product.category_id;

    return products
      .filter((p) => {
        const pCategoryId =
          typeof p.category_id === "object" ? p.category_id._id : p.category_id;
        return pCategoryId === categoryId && p._id !== product._id;
      })
      .slice(0, 6);
  }, [product, products]);

  if (!similarProducts.length) {
    return <p className="text-center py-10">No similar products found.</p>;
  }

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow:
      windowWidth <= 480
        ? 1
        : windowWidth <= 767
          ? 2
          : windowWidth <= 980
            ? 3
            : 4,
    slidesToScroll: 1,
    beforeChange: (c, n) =>
      setSlideState({ current: n, total: similarProducts.length }),
    nextArrow: (
      <NextArrow disabled={slideState.current >= similarProducts.length - 4} />
    ),
    prevArrow: <PrevArrow disabled={slideState.current === 0} />,
  };

  return (
    <Row>
      <Slider ref={sliderRef} {...settings}>
        {similarProducts.map((p) => (
          <div key={p._id} className="px-[15px]">
            {/* <ProductCard product={p} /> */}
            <ProductCard product={p} setShowLoginPopup={setShowLoginPopup} />
          </div>
        ))}
      </Slider>
    </Row>
  );
}
