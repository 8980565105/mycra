import React, { useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaTwitter } from "react-icons/fa";
import { FaRegHeart } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../utils/helper";
import { fetchPageBySlug } from "../../features/pages/pagesThunk";
import Button from "../ui/Button";

export default function Hero() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchPageBySlug("home"));
  }, [dispatch]);
  const { pagesBySlug, slugLoading } = useSelector((state) => state.pages);
  const currentPage = pagesBySlug["home"];

  const heroSection =
    currentPage?.slug === "home"
      ? currentPage?.sections?.find((sec) => sec.type === "hero_slider")
      : null;

  const heroSlides = heroSection?.slides || [];

  if (slugLoading) return <p>Loading...</p>;

  if (!currentPage || heroSlides.length === 0) {
    return (
      <div className="relative w-full mx-auto">
        <section className="relative lg:ml-[50px] mt-4 mx-2 lg:mx-0 overflow-hidden rounded-lg">
          <div className="w-full min-h-[220px] lg:min-h-[680px] bg-theme rounded-lg" />
        </section>
      </div>
    );
  }

  // const settings = {
  //   dots: true,
  //   infinite: true,
  //   speed: 1000,
  //   slidesToShow: 1,
  //   slidesToScroll: 1,
  //   autoplay: true,
  //   autoplaySpeed: 4000,
  //   arrows: false,
  //   appendDots: (dots) => (
  //     <div className="absolute bottom-[20px] left-0 w-full">
  //       <ul className="flex justify-center items-center gap-[5px]">{dots}</ul>
  //     </div>
  //   ),
  //   customPaging: () => (
  //     <div className="slick-dot-bar w-[40px] h-[3px] rounded-full transition-all duration-300" />
  //   ),
  // };
  const settings = {
    dots: heroSlides.length > 1,
    infinite: heroSlides.length > 1,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: heroSlides.length > 1,
    autoplaySpeed: 4000,
    pauseOnHover: false,
    arrows: false,
    swipe: true,
    draggable: true,
  };

  return (
    <div className="relative w-full mx-auto">
      <div className="hidden lg:flex absolute items-center left-0 top-0 bottom-0 flex-col justify-between z-20 py-8 w-[50px]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-[1px] h-[50px] bg-[#D2AF9F]" />
          <span className="rotate-[-90deg] text-[#D2AF9F] text-xs tracking-widest mt-[60px] whitespace-nowrap">
            Winter Collection
          </span>
        </div>
        <span className="rotate-[-90deg] text-[#D2AF9F] text-xs mb-[30px]">
          2024
        </span>
        <div className="flex flex-col items-center space-y-4">
          <a href="#" aria-label="Twitter">
            <FaTwitter
              size={16}
              className="text-[#D2AF9F] hover:text-[var(--primary-color)] transition-colors"
            />
          </a>
          <a href="/wishlist" aria-label="Heart">
            <FaRegHeart
              size={16}
              className="text-[#D2AF9F] hover:text-[var(--primary-color)] transition-colors"
            />
          </a>
        </div>
      </div>

      <section className="relative lg:ml-[50px] mt-4 mx-2 lg:mx-0 overflow-hidden rounded-lg hero-slider">
        <Slider {...settings} className="w-full">
          {heroSlides.map((slide, index) => (
            <div key={index}>
              <div
                className="relative w-full min-h-[220px] lg:min-h-[680px]"
                style={{
                  backgroundImage: slide.background_image_url
                    ? `url(${getImageUrl(slide.background_image_url)})`
                    : "none",
                  backgroundColor: slide.background_image_url
                    ? "transparent"
                    : "#f5ebe3",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <div className="absolute inset-0 bg-black/25" />
                <div className="relative z-10 w-full h-full min-h-[220px] lg:min-h-[680px] flex items-center px-6 sm:px-12 lg:px-20 py-10 lg:py-0">
                  <div className="flex-1 flex flex-col items-start justify-center gap-3 lg:gap-6 max-w-[250px] sm:max-w-[400px] lg:max-w-[600px]">
                    <h1 className="text-stroke text-shadow-custom py-2 lg:py-5">
                      <span
                        className="font-sans italic font-bold  sm:text-[26px] lg:text-[80px] text-black "
                        dangerouslySetInnerHTML={{ __html: slide.title }}
                      />
                    </h1>
                    <span className="text-black text-[8px] md:text-[8px] lg:text-[24px] leading-[19px] relative">
                      {slide.description}
                      <span className="absolute left-0 bottom-0 sm:translate-y-[0px] md:translate-y-[0px] lg:translate-y-[10px]  w-[56px] sm:w-[56px] md:w-[90px] lg:w-[225px] h-[0.5px] bg-black"></span>
                    </span>

                    {slide.is_button !== false && (
                      <Button
                        onClick={() => navigate(slide.button_link)}
                        variant="common"
                        className="lg:w-[160px] w-[72px]"
                      >
                        {slide.button_name}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </section>

      <style>{`
        .hero-slider .slick-dots {
          bottom: 20px !important;
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          gap: 8px !important;
          width: 100% !important;
        }
        .hero-slider .slick-dots li {
          width: 50px !important;
          height: 4px !important;
          margin: 0 !important;
        }
        .hero-slider .slick-dots li button {
          width: 50px !important;
          height: 4px !important;
          padding: 0 !important;
          background: #fff !important;
          border-radius: 50px !important;
        }
        .hero-slider .slick-dots li button:before {
          display: none !important;
        }
        .hero-slider .slick-dots li.slick-active button {
          background: #F43297 !important;
        }
      `}</style>
    </div>
  );
}