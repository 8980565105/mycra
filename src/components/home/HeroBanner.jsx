import React from "react";
import herobannerImage from "../../assets/herobanner.png";
import sale from "../../assets/sale.png";
import Row from "../ui/Row";
import Section from "../ui/Section";
import Button from "../ui/Button";
import { useSelector } from "react-redux";
import { getImageUrl } from "../utils/helper";

const heroBannerItem = {
  title: "Flesh Deals",
  description: "Best outfits for every occasion",
  button_name: "Shop Now",
  button_link: "/shop",
  image_url: herobannerImage,
  isStatic: true,
};

const DiscountBadge = () => {
  return (
    <>
      <div className="absolute top-3 left-3 w-[70px] h-[70px] sm:w-[90px] sm:h-[90px] md:w-[130px] md:h-[130px] z-30 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-[var(--primary-color)] shadow-md"
          style={{
            clipPath:
              "polygon(22% 10%, 46% 12%, 61% 2%, 71% 19%, 89% 24%, 86% 43%, 99% 64%, 82% 74%, 77% 96%, 77% 96%, 55% 94%, 35% 99%, 25% 84%, 8% 81%, 11% 59%, 1% 44%, 17% 31%)",
          }}
        ></div>

        <div
          className="absolute text-white font-bold leading-tight text-center 
                      text-[12px] sm:text-[16px] md:text-[24px] 
                      transform rotate-[-40deg] select-none tracking-tight"
        >
          50% <br /> off
        </div>
      </div>
    </>
  );
};

export default function HeroBanner() {
  const { pages } = useSelector((state) => state.pages);

  const homepage = pages?.find((page) => page.slug === "home");
  const bannerSectionFromApi = homepage?.sections?.find(
    (section) => section.type === "banner",
  );

  const flashbanner = bannerSectionFromApi || heroBannerItem;

  return (
    <Section className="bg-theme relative overflow-hidden !pb-0">
      <div className="absolute top-0 left-0 w-[23%] h-full bg-white/10 backdrop-blur-sm z-20 pointer-events-none"></div>
      <DiscountBadge />
      <div className="flex gap-[10px] justify-center items-center h-auto min-h-[150px] md:h-[544px] relative z-10">
        <div className="relative flex-1">
          <img
            src={getImageUrl(flashbanner.image_url)}
            alt="image alt"
            className="w-[400px] sm:w-[850px] h-auto min-h-[150px] md:h-[544px] object-cover"
          />
        </div>
        <div className="flex-1 text-left flex flex-col z-30 px-[20px]">
          <div className="max-w-[460px] flex flex-col">
            <h2
              className="text-[20px] md:text-[50px] font-sans text-black mb-[10px] md:mb-[30px] relative leading"
              style={{ filter: "drop-shadow(5px 2px 4px rgba(0,0,0,0.25))" }}
            >
              {flashbanner.title}
              <span className="absolute theme-border-block w-[25px] md:w-[100px] !h-[3px]"></span>
            </h2>
            <p className="text-[10px] md:text-[24px] text-[#989696] mb-[5px] md:mb-[10px] font-regular">
              {flashbanner.description}
            </p>
            <p className="text-[10px] md:text-[18px] font-regular text-black mb-[17px] md:mb-[50px] inline-block w-[51px] md:w-[94px] pb-1 border-b md:border-b-2 border-black">
              Rs {flashbanner.rs}
            </p>
            <Button
              variant="common"
              className=" px-[10px] lg:max-w-[200px] sm:max-w-[100px] mb-[10px]"
              onClick={() => (window.location.href = flashbanner.button_link)}
            >
              {flashbanner.button_name}
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
