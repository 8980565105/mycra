import React, { useEffect } from "react";
import SecondarySection from "../components/ui/SecondarySection";
import WomenCollections from "../components/shop/WomenCollections";
import { useDispatch, useSelector } from "react-redux";
import { fetchPages } from "../features/pages/pagesThunk";
import { getImageUrl } from "../components/utils/helper";
import shopBg from "../assets/shopBannerImage.jpg";
import { Toaster } from "react-hot-toast";

const staticBg = {
  sections: [
    {
      _id: "static-1",
      title: "Shop",
      description: "Wearing Fancy Clothes.",
      image_url: shopBg,
      isStatic: true,
    },
  ],
};

export default function Shop() {
  const dispatch = useDispatch();
  const { pages } = useSelector((state) => state.pages);

  useEffect(() => {
    dispatch(fetchPages());
  }, [dispatch]);

  const shopPage = pages.find((page) => page.slug === "shop") || staticBg;

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="hidden lg:flex relative">
        {shopPage?.sections.map((section) => (
          <SecondarySection
            key={section._id}
            title={section.title}
            description={section.description}
            backgroundImage={
              section.isStatic
                ? section.image_url
                : getImageUrl(section.image_url)
            }
          />
        ))}
      </div>
      <WomenCollections />
    </>
  );
}
