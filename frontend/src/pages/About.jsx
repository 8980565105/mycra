import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchPublicAboutPage } from "../features/about/aboutThunk";
import Section from "../components/ui/Section";
import Row from "../components/ui/Row";
import faqBg from "../assets/size-bg.png";

const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

const HeroSkeleton = () => (
  <Section className="min-h-[400px] flex items-center justify-center bg-gray-100">
    <div className="text-center max-w-[688px] px-4 space-y-4 w-full">
      <Skeleton className="h-10 w-2/3 mx-auto" />
      <Skeleton className="h-6 w-full mx-auto" />
      <Skeleton className="h-6 w-3/4 mx-auto" />
    </div>
  </Section>
);

const ContentSkeleton = () => (
  <Section className="px-0">
    <Row className="space-y-12 py-10 !px-0">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex flex-col md:flex-row md:items-center gap-8"
        >
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex-1">
            <Skeleton className="h-56 w-full rounded-lg" />
          </div>
        </div>
      ))}
    </Row>
  </Section>
);

export default function AboutPage() {
  const dispatch = useDispatch();
  const { page, loading, error } = useSelector((state) => state.about);

  useEffect(() => {
    dispatch(fetchPublicAboutPage());
  }, [dispatch]);

  if (loading && !page) {
    return (
      <>
        <HeroSkeleton />
        <ContentSkeleton />
      </>
    );
  }

  if (error) {
    return (
      <Section className="min-h-[300px] flex items-center justify-center">
        <p className="text-red-500 text-center">{error}</p>
      </Section>
    );
  }

  if (!page) return null;

  const { heroTitle, heroDesc, heroImage, content = [], features = [] } = page;

  const activeContent = content.filter((c) => c.status === "active");

  return (
    <>
      <Section
        className="bg-cover bg-center bg-no-repeat min-h-[250px] min-[500px]:min-h-[400px] flex items-center justify-center"
        style={{ backgroundImage: `url(${heroImage || faqBg})` }}
      >
        <div className="text-center max-w-[688px] px-4">
          {heroTitle && (
            <h1 className="text-[24px] sm:text-[40px] font-semibold mb-[15px] sm:mb-[22px]">
              {heroTitle}
            </h1>
          )}
          {heroDesc && (
            <p className="text-dark text-[14px] sm:text-[24px]">{heroDesc}</p>
          )}
        </div>
      </Section>

      {activeContent.length > 0 && (
        <Section className="px-0">
          <Row className="space-y-12 py-10 !px-0">
            {[...activeContent]
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
              .map((item, index) => (
                <div
                  key={item._id || index}
                  className={`flex flex-col md:flex-row md:items-center gap-8 ${
                    index % 2 !== 0 ? "md:flex-row-reverse" : ""
                  }`}
                >
                  <div className="flex-1 order-2 md:order-none">
                    <h3 className="text-[18px] sm:text-[22px] font-semibold text-dark mb-3">
                      {item.title}
                    </h3>
                    <p className="text-[13px] sm:text-[14px] leading-relaxed text-gray-600 mb-4">
                      {item.desc}
                    </p>
                    <Link to="/shop" className="text-sm underline">
                      Read More
                    </Link>
                  </div>

                  <div className="flex-1 order-1 md:order-none">
                    <img
                      src={item.image || faqBg}
                      alt={item.title}
                      className="rounded-lg w-full h-auto object-cover"
                      onError={(e) => {
                        e.target.src = faqBg;
                      }}
                    />
                  </div>
                </div>
              ))}
          </Row>
        </Section>
      )}

      {features.length > 0 && (
        <Section>
          <Row className="py-[25px] md:py-[50px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {[...features]
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((item, i) => (
                  <div key={item._id || i} className="flex items-center gap-3">
                    <div className="text-2xl shrink-0">
                      {item.icon?.startsWith("http") ? (
                        <img
                          src={item.icon}
                          alt={item.title}
                          className="w-8 h-8 object-contain"
                        />
                      ) : (
                        <span>{item.icon}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold">{item.title}</h4>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
            </div>
          </Row>
        </Section>
      )}
    </>
  );
}
