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
        {/* <Section>
          <Row>
            <SectionHeading page="Offer" order="2" />
          </Row>
          <SizeSection />
        </Section> */}
        <Section>
          <Row className="!max-w-[1122px]">
            <div className="border border-[var(--primary-color)] rounded-[5px] py-[24px] text-center">
              <p className="w-full max-w-[973px] mx-auto text-light text-center text-[14px]">
                Mykra Fashion will never contact their customers for cash prizes or request
                passwords, PINs, or CVVs. Please refrain from sharing such confidential
                information with anyone, as this can result in fraudulent transactions.
              </p>
            </div>
          </Row>
        </Section>
      </div>

    </>

  );
}
