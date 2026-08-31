import { useEffect } from "react";
import SecondarySection from "../components/ui/SecondarySection";
import WomenCollections from "../components/shop/WomenCollections";
import { useDispatch, useSelector } from "react-redux";
import { fetchPageBySlug } from "../features/pages/pagesThunk";
import { getImageUrl } from "../components/utils/helper";
import shopBg from "../assets/shopBannerImage.jpg";
import { Toaster } from "react-hot-toast";
import SEO from "../components/Seo/seo";

const staticShopPage = {
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
    dispatch(fetchPageBySlug("shop"));
  }, [dispatch]);

  const shopPageFromApi = pages?.find((page) => page.slug === "shop");
  const shopPage1 = pages?.find((page) => page.slug === "shop");

  const shopPage = shopPageFromApi || staticShopPage;

  const getBgImage = (section) => {
    if (section.isStatic) return section.image_url;
    return getImageUrl(section.background_image_url || section.image_url);
  };

  return (
    <>
      <SEO
        title={shopPage1?.meta_title}
        description={shopPage1?.meta_description}
        image={getImageUrl(shopPage1?.seo_image)}
      />

      <Toaster position="top-center" reverseOrder={false} />
      <div className="hidden lg:flex w-full relative">
        {shopPage?.sections?.map((section) => (
          <SecondarySection
            key={section._id}
            title={section.title || "Shop"}
            description={section.description || "Wearing Fancy Clothes."}
            backgroundImage={getBgImage(section)}
          />
        ))}
      </div>
      <WomenCollections />
    </>
  );
}
