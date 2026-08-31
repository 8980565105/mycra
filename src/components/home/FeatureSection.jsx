import React from "react";
import Section from "../ui/Section";
import Row from "../ui/Row";
import feature1 from "../../assets/feature1.png";
import feature2 from "../../assets/feature2.png";
import feature3 from "../../assets/feature3.png";
import { useSelector } from "react-redux";
import { getImageUrl } from "../utils/helper";
const staticFeatures = [
  {
    image_url: feature1,
    title: "Shipping Worldwide",
    description: "We deliver to all the locations across the world.",
  },
  {
    image_url: feature2,
    title: "14 Days Return",
    description: "We believe in satisfying and delighting our customers",
  },
  {
    image_url: feature3,
    title: "Security Payment",
    description:
      "Security is a priority at MYcra.in and we make every effort to...",
  },
];
export default function FeatureSection() {
  const { pages } = useSelector((state) => state.pages);
  const homepage = pages?.find((page) => page.slug === "home");
  const featureSectionFromApi = homepage?.sections?.find(
    (section) => section.type === "feature" && section.status === "active",
  );
  const features =
    featureSectionFromApi?.items && featureSectionFromApi.items.length > 0
      ? featureSectionFromApi.items
      : staticFeatures;

  return (
    <Section>
      <Row className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[40px] pt-[25px] md:pt-[50px] !max-w-[935px] mx-auto">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start gap-[22px]">
            <div className="w-[62px] h-[50px] rounded-bl-[20px] bg-[linear-gradient(90deg,var(--primary-color)_0%,#ffffff_80%)] relative overflow-hidden flex-shrink-0">
              <img
                src={
                  feature.isStatic
                    ? feature.image_url
                    : getImageUrl(feature.image_url)
                }
                className="h-[42px] w-[42px] object-contain absolute bottom-0 right-0"
                alt="feature icon"
              />
            </div>
            <div className="flex-1 text-start">
              <h3 className="font-medium text-20px mb-[10px] leading">
                {feature.title}
              </h3>
              <p className="text-14 sec-text-color">{feature.description}</p>
            </div>
          </div>
        ))}
      </Row>
    </Section>
  );
}
