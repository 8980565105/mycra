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
    <div className="absolute top-3 left-3 w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] md:w-[120px] md:h-[120px] z-30 flex items-center justify-center">
      <img src={sale} />
      <div className="absolute text-white text-[12px]  md:text-[22px] transform rotate-[-50deg]">
        50% off
      </div>
    </div>
  );
};

export default function HeroBanner() {
  const { pages } = useSelector((state) => state.pages);

  const homepage = pages?.find((page) => page.slug === "home");
  const bannerSectionFromApi = homepage?.sections?.find(
    (section) => section.order === 6,
  );
  const flashbanner = bannerSectionFromApi || heroBannerItem;

  return (
    <Section className="sec-theme relative overflow-hidden !pb-0">
      <div className="absolute top-0 left-0 w-[23%] h-full bg-white/10 backdrop-blur-sm z-20 pointer-events-none"></div>
      <DiscountBadge />
      <div className="flex gap-[10px] justify-center items-center h-auto min-h-[150px] md:h-[544px] relative z-10">
        <div className="relative flex-1">
          <img
            src={getImageUrl(flashbanner.image_url)}
            alt="Stylish woman in a trench coat and hat"
            className="w-[400px] sm:w-[850px] h-auto min-h-[150px] md:h-[544px] object-cover"
          />
        </div>
        <Row className="flex-1 md:text-left flex flex-col z-30 px-[20px]">
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
            Rs 1099.00
          </p>
          <Button
            variant="common"
            className=" px-[10px] lg:max-w-[200px] sm:max-w-[200px] mb-[10px]"
            onClick={() => (window.location.href = flashbanner.button_link)}
          >
            {flashbanner.button_name}
          </Button>
        </Row>
      </div>
    </Section>
  );
}
