import { useDispatch, useSelector } from "react-redux";
import CategoriesSection from "../components/home/CategoriesSection";
import OfferBanner from "../components/offers/offerBanner";
import SEO from "../components/Seo/seo";
import Row from "../components/ui/Row";
import Section from "../components/ui/Section";
import SectionHeading from "../components/ui/SectionHeading";
import { fetchPageBySlug } from "../features/pages/pagesThunk";
import { useEffect } from "react";
import { getImageUrl } from "../components/utils/helper";

export default function Offer() {

  const dispatch = useDispatch();
  const { pages } = useSelector((state) => state.pages);

 useEffect(() => {
    dispatch(fetchPageBySlug("offer"));
  }, [dispatch]);

  const offarPage = pages?.find((page) => page.slug === "offer");

  return (
    <>

      <SEO
        title={offarPage?.meta_title}
        description={offarPage?.meta_description}
        image={getImageUrl(offarPage?.seo_image)}
      />

      <div>
        <OfferBanner />
        <Section>
          <Row className="pt-[25px] md:pt-[50px]">
            <CategoriesSection />
          </Row>
        </Section>
        <Section>
          <Row>
            <SectionHeading page="Offer" order="2" />
          </Row>
          {/* <SizeSection /> */}
        </Section>
      </div>

    </>

  );
}
