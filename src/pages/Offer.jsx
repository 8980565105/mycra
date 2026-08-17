import CategoriesSection from "../components/home/CategoriesSection";
import OfferBanner from "../components/offers/offerBanner";
import SizeSection from "../components/offers/SizeSection";
import Row from "../components/ui/Row";
import Section from "../components/ui/Section";
import SectionHeading from "../components/ui/SectionHeading";

export default function Offer() {
  return (
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
  );
}
