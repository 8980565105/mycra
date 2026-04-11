import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Hero from "../components/home/Hero";
import CategoriesSection from "../components/home/CategoriesSection";
import NewArrivals from "../components/home/NewArrivals";
import FeaturedProducts from "../components/home/FeaturedProducts";
import TrendingClothes from "../components/home/TrendingClothes";
import HeroBanner from "../components/home/HeroBanner";
import Bestsellers from "../components/home/Bestsellers";
import RecommendedSection from "../components/home/RecommendedSection";
import BannerClothes from "../components/home/bannerclothes.jsx";
import FeatureSection from "../components/home/FeatureSection.jsx";
import Row from "../components/ui/Row.jsx";
import SectionHeading from "../components/ui/SectionHeading.jsx";
import Section from "../components/ui/Section.jsx";
import { fetchPages } from "../features/pages/pagesThunk";
import { fetchProducts } from "../features/products/productsThunk";
import { fetchCategories } from "../features/categories/categoriesThunk";
import LoginForm from "./Login.jsx";
import { Toaster } from "react-hot-toast";
import FlowerIcon from "../components/icons/FlowerIcon.jsx";

const Home = () => {
  const dispatch = useDispatch();
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  useEffect(() => {
    dispatch(fetchPages());
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <>
      <div className="text-center">
        <Toaster position="top center" />
        <Hero />
        <Section>
          {/* <Row className="pt-[25px] md:pt-[50px]"> */}
          {/* <SectionHeading page="Home" order={2} /> */}
          {/* </Row> */}

          <div className="relative flex justify-center items-center w-full mb-[50px] md:mb-[90px]">
            <div className="w-[18px] md:w-[50px] border-t border-black"></div>

            <div className="relative mx-2 md:mx-4 flex flex-col items-center justify-center">
              <h2 className="font-h2 text-black whitespace-nowrap relative z-10">
                shop by category
              </h2>
              <FlowerIcon className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[40px] h-[25px] md:w-[110px] md:h-[80px] pointer-events-none z-0" />
            </div>

            <div className="w-[18px] md:w-[50px] border-t border-black"></div>
          </div>
          <Row>
            <CategoriesSection />
          </Row>
        </Section>

        <NewArrivals />
        <FeaturedProducts setShowLoginPopup={setShowLoginPopup} />
        <TrendingClothes />
        <HeroBanner />
        <Bestsellers />
        <RecommendedSection />
        <BannerClothes />
        <FeatureSection />
      </div>

      {showLoginPopup && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center px-4">
          <div className="relative bg-white w-full max-w-[1062px] rounded-md overflow-hidden">
            <LoginForm
              onClose={() => setShowLoginPopup(false)}
              onSwitch={() => setShowLoginPopup(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
