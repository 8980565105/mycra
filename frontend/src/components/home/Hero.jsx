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

export default function Hero() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchPageBySlug("home"));
  }, [dispatch]);

  const { currentPage, slugLoading } = useSelector((state) => state.pages);

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
          <div className="w-full min-h-[220px] lg:min-h-[680px] bg-[#f5ebe3] rounded-lg" />
        </section>
      </div>
    );
  }

  const settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: false,
    appendDots: (dots) => (
      <div style={{ position: "absolute", bottom: "24px", width: "100%" }}>
        <ul className="flex justify-center gap-3">{dots}</ul>
      </div>
    ),
    customPaging: () => (
      <div className="w-[40px] h-[3px] bg-white/50 rounded-full transition-all duration-300 slick-dot-bar" />
    ),
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
              className="text-[#D2AF9F] hover:text-white transition-colors"
            />
          </a>
          <a href="#" aria-label="Heart">
            <FaRegHeart
              size={16}
              className="text-[#D2AF9F] hover:text-white transition-colors"
            />
          </a>
        </div>
      </div>

      <section className="relative lg:ml-[50px] mt-4 mx-2 lg:mx-0 overflow-hidden rounded-lg">
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
                      <button className="lg:w-[160px] w-[72px] lg:h-[54px] h-[26px]  text-[12px]  lg:text-[22px] text-white font-regular rounded shadow-md duration-300 bg-color ">
                        {slide.button_name}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </section>

      <style>{`
        .slick-active .slick-dot-bar {
          background-color: white !important;
          width: 50px !important;
        }
        .slick-dots {
          bottom: 20px !important;
        }
      `}</style>
    </div>
  );
}
