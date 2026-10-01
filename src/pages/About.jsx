import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPageBySlug } from "../features/pages/pagesThunk";
import Section from "../components/ui/Section";
import Row from "../components/ui/Row";
import AboutContent from "../components/aboutbanner/aboutcontent";
import { getImageUrl } from "../components/utils/helper";
import SEO from "../components/Seo/seo";
import FeatureSection from "../components/home/FeatureSection";
import SecondarySection from "../components/ui/SecondarySection";

const STATIC_FEATURES = [
  { _id: "static-f1", icon: "🚚", title: "Free Shipping", desc: "On all orders above ₹999", order: 1 },
  { _id: "static-f2", icon: "🔄", title: "Easy Returns", desc: "7-day hassle-free returns", order: 2 },
  { _id: "static-f3", icon: "🔒", title: "Secure Payment", desc: "100% safe transactions", order: 3 },
  { _id: "static-f4", icon: "🎧", title: "24/7 Support", desc: "We are here to help anytime", order: 4 },
];

export default function AboutPage() {
  const dispatch = useDispatch();
  const { pages } = useSelector((state) => state.pages);

  useEffect(() => {
    dispatch(fetchPageBySlug("about"));
  }, [dispatch]);

  const aboutPage = pages?.find((page) => page.slug === "about");

  const heroSection = aboutPage?.sections?.find(
    (section) => section.type === "hero_slider",
  );

  const getBgImage = (section) => {
    const firstSlide = section.slides?.[0];
    if (section.isStatic) {
      return section.image_url;
    }
    return getImageUrl(
      firstSlide?.background_image_url ||
      section.background_image_url ||
      section.image_url,
    );
  };

  return (
    <>

      <SEO
        title={aboutPage?.meta_title}
        description={aboutPage?.meta_description}
        image={getImageUrl(aboutPage?.seo_image)}
      />
      {heroSection && (
          <SecondarySection
            key={heroSection._id}
            title={
              heroSection.slides?.[0]?.title || heroSection.title || "Contact Us"
            }
            description={
              heroSection.slides?.[0]?.description ||
              heroSection.description ||
              "We are here to help you."
            }
            backgroundImage={getBgImage(heroSection)}
          />
        )}
      <AboutContent aboutPage={aboutPage} />
      <FeatureSection className="!pt-0"/>
    </>
  );
}