import React, { useEffect } from "react";
import ContactCard from "../components/contactus/ContactCard";
import Section from "../components/ui/Section";
import Row from "../components/ui/Row";
import { MapPinIcon, PhoneIcon } from "lucide-react";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import MapForm from "../components/contactus/MapForm";
import FAQ from "../components/contactus/Faq";
import SecondarySection from "../components/ui/SecondarySection";
import { useDispatch, useSelector } from "react-redux";
import { fetchPageBySlug } from "../features/pages/pagesThunk";
import { getImageUrl } from "../components/utils/helper";
import contactBg from "../assets/contact.jpg";
import SEO from "../components/Seo/seo";
const staticBg = {
  sections: [
    {
      _id: "static-1",
      title: "Contact Us",
      description: "We are here to help you. Reach out anytime.",
      image_url: contactBg,
      isStatic: true,
    },
  ],
};

export default function ContactUs() {
  const dispatch = useDispatch();
  const { pages } = useSelector((state) => state.pages);

  useEffect(() => {
    dispatch(fetchPageBySlug("contact"));
  }, [dispatch]);

  const contactPageFromApi = pages?.find((page) => page.slug === "contact");
  const contactPage = contactPageFromApi || staticBg;
  const faqSection = contactPage?.sections?.find(
    (section) => section.type === "faqs",
  );
  const heroSection = contactPage?.sections?.find(
    (section) => section.type === "hero_slider",
  );
  <FAQ faqSection={faqSection} />;
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
        title={contactPageFromApi?.meta_title}
        description={contactPageFromApi?.meta_description}
        image={getImageUrl(contactPageFromApi?.seo_image)}
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
      <Section>
        <Row className="xl:max-w-[1122px] grid grid-cols-1 md:grid-cols-3 gap-[30px] py-[25px] md:py-[50px]">
          <ContactCard
            icon={<MapPinIcon />}
            title="Visit Us"
            description="215, Dhara Arcade, near lajamani chowk (Surat)."
            linkText="View on Google Maps"
            linkHref="https://maps.google.com"
          />
          <ContactCard
            icon={<EnvelopeIcon />}
            title="Email Us"
            description="Visit our office HR"
            linkText="Sales@untitledul.com"
            linkHref="mailto:Sales@uniteddul.com"
          />
          <ContactCard
            icon={<PhoneIcon />}
            title="Call Us"
            description="Mon-Fri 8am to 6pm"
            linkText="+1[155]000-0000"
            linkHref="tel:+1155000000"
          />
        </Row>
      </Section>

      <MapForm />
      <FAQ faqSection={faqSection} />
    </>
  );
}
