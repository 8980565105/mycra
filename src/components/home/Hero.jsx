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
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    fade: true,
    autoplay: heroSlides.length > 1,
    autoplaySpeed: 5000,
    pauseOnHover: false,
    arrows: false,
    swipe: true,
    draggable: true,
  };

  return (
    <div className="relative w-full mx-auto">
      <div className="hidden lg:flex absolute items-center left-0 top-0 bottom-0 flex-col justify-between z-20 pb-8 w-[50px]">
        <div className="flex flex-col items-center gap-5">
          <div className="w-[1px] h-[100px] bg-[#D2AF9F]" />
          <span className="rotate-[-90deg] text-[#D2AF9F] text-xs tracking-widest mt-[60px] whitespace-nowrap">
            Trending Collection
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

      <section className="relative lg:ml-[50px] lg:mx-0 overflow-hidden lg:rounded-tl-[10px] lg:rounded-bl-[10px] hero-slider">
        <Slider {...settings} className="w-full">
          {heroSlides.map((slide, index) => (
            <div key={index} className="h-[220px] md:h-[400px] lg:h-[680px]">
              <div
                className="relative w-full h-full"
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
                {/* <div className="absolute inset-0 bg-black/25" /> */}
                <div className="relative z-10 w-full h-full flex items-center px-6 sm:px-12 lg:px-20 py-10 lg:py-0 lg:pl-40 xl:pl-60">
                  <div className="max-w-[250px] sm:max-w-[400px] lg:max-w-[600px] text-left break">
                    <div className="relative">
                    <h1 className="mb-4 md:mb-6 lg:mb-10">
                      <span
                        className="font-sans italic text-[30px] md:text-[40px] lg:text-[80px] leading-[34px] md:leading-[44px] lg:leading-[84px] text-black tracking-normal"
                        dangerouslySetInnerHTML={{ __html: slide.title }}
                      />
                      <span
                        className="absolute top-0 left-[2px] lg:left-[4px] tracking-normal  [filter:drop-shadow(1px_5px_4px_#00000080)] font-sans italic text-[30px] md:text-[40px] lg:text-[80px] leading-[34px] md:leading-[44px] lg:leading-[84px] text-transparent w-full -z-[10] [-webkit-text-stroke:1px_white] lg:[-webkit-text-stroke:1.5px_white]"
                        dangerouslySetInnerHTML={{ __html: slide.title }}
                      />
                    </h1>
                    </div>
                    <div>
                    <span className="relative text-black text-[12px] md:text-[16px] lg:text-[24px] leading-[19px] block">
                      {slide.description}
                      <span className="absolute left-0 bottom-0 lg:translate-y-[10px] w-[35%] h-[0.5px] bg-black" />
                    </span>
                    </div>

                    <div>
                    {slide.is_button !== false && (
                      <Button
                        onClick={() => navigate(slide.button_link)}
                        variant="common"
                        className="w-auto  lg:w-[160px] md:text-[16px] lg:text-[20px] w-[72px] mt-6 md:mt-10 lg:mt-14"
                      >
                        {slide.button_name}
                      </Button>
                    )}
                    </div>
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

       @media (max-width: 767px) {
        .hero-slider .slick-dots {
          bottom: 12px !important;
          gap: 5px !important;
          padding: 0 12px !important;
        }

        .hero-slider .slick-dots li,
        .hero-slider .slick-dots li button {
          width: 28px !important;
          flex-basis: 28px !important;
          height: 3px !important;
        }

        .hero-slider .slick-dots li button {
          height: 3px !important;
        }
      }
      `}</style>
    </div>
  );
}