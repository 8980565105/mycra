import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Star, } from "lucide-react";
import { fetchProductReviews } from "../../features/reivews/reviewsThunk";
import cod from "../../assets/cod.png";
import exchange from "../../assets/exchange.png";
import delivery from "../../assets/delivery.png";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const deliveryOptions = [
  {
    id: 1,
    icon: cod,
    title: (
      <>COD<span className="font-regular"> available </span></>
    ),
  },
  {
    id: 2,
    icon: exchange,
    title: (
      <>7-day return <span className="font-regular">&</span> size exchange</>
    ),
  },
  {
    id: 3,
    icon: delivery,
    title: (
      <>Usually ships in <span className="font-regular"> 1 day </span></>
    ),
  },
  {
    id: 4,
    icon: cod,
    title: (
      <>abcd</>
    ),
  },
];


export default function ProductTabs({ product, selectedVariant }) {
  const tabs = [ "Delivery Location", "Product Information", "Customer Review", ];
  const [activeTab, setActiveTab] = useState("Delivery Location");
  const [openAccordion, setOpenAccordion] = useState(0);
  const [pincode, setPincode] = useState("");
  const [deliveryMessage, setDeliveryMessage] = useState("");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [pincodeLoading, setPincodeLoading] = useState(false);

  const dispatch = useDispatch();
  const { loading, error, productReviews } = useSelector(
    (state) => state.reviews,
  );

  const productReviewData = productReviews?.[product?._id];
  const filteredReviews = productReviewData?.reviews || [];

  useEffect(() => {
    if (
      product?._id &&
      (activeTab === "Customer Review" || openAccordion === 2)
    ) {
      dispatch(
        fetchProductReviews({ productId: product._id, page: 1, limit: 50 }),
      );
    }
  }, [activeTab, openAccordion, dispatch, product?._id]);

  const handleAccordionToggle = (index) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  const isValidHtml = (html) =>
    html && html.trim() !== "" && html.trim() !== "<p></p>";

  const activeDescription = isValidHtml(selectedVariant?.description)
    ? selectedVariant.description
    : product?.description;

  // ----slider----
  const handleApplyPincode = async () => {
  const pinCode = pincode.trim();

  if (!pinCode) {
    setDeliveryMessage("Please enter your pincode.");
    return;
  }

  if (!/^[A-Za-z0-9\s-]+$/.test(pinCode)) {
    setDeliveryMessage("Please enter a valid pincode.");
    return;
  }

  try {
    setPincodeLoading(true);
    setDeliveryMessage("");
    if (/^\d{6}$/.test(pinCode)) {
      const response = await fetch(
        `https://api.postalpincode.in/pincode/${pinCode}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch pincode");
      }

      const data = await response.json();
      const result = data?.[0];

      if (
        !result ||
        result.Status !== "Success" ||
        !result.PostOffice ||
        result.PostOffice.length === 0
      ) {
        setDeliveryMessage(
          "Invalid pincode. Please check and try again."
        );
        return;
      }

      const postOffice = result.PostOffice[0];

      const city =
        postOffice.District ||
        postOffice.Block ||
        postOffice.Division ||
        "";

      const state = postOffice.State || "";

      setDeliveryMessage(
        `✓ Delivery available in ${city}${state ? `, ${state}` : ""}`
      );

      return;
    }

    setDeliveryMessage(
      "Pincode format is valid, but location lookup is not available for this country."
    );
  } catch (error) {
    console.error("Pincode API Error:", error);

    setDeliveryMessage(
      "Unable to check pincode. Please try again."
    );
  } finally {
    setPincodeLoading(false);
  }
};

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const slidesToShow = windowWidth <= 480 ? 2 : windowWidth <= 767 ? 2 : 3;
  const PrevArrow = ({ onClick, currentSlide }) => {
    const isFirstSlide = currentSlide === 0;
    return (
      <button
        onClick={onClick}
        disabled={isFirstSlide}
        className={`absolute left-[-40px] top-1/2 -translate-y-1/2 z-10 w-[30px] h-[30px] flex items-center justify-center transition-colors ${
            isFirstSlide ? "pointer-events-none text-[#989696]" : "hover:text-black"
          }`}
      >
        <ChevronLeft size={24} />
      </button>
    );
  };

  const NextArrow = ({ onClick, currentSlide, slideCount, }) => {
    const isLastSlide = currentSlide >= slideCount - slidesToShow;
    return (
      <button
        onClick={onClick}
        disabled={isLastSlide}
        className={`absolute right-[-40px] top-1/2 -translate-y-1/2 z-10 w-[30px] h-[30px] flex items-center justify-center transition-colors ${
          isLastSlide ? "pointer-events-none text-[#989696]" : "hover:text-black"
          }`}
      >
        <ChevronRight size={24} />
      </button>
    );
  };

  const deliverySliderSettings = {
    dots: false,
    arrows: true,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    infinite: false,
    speed: 600,
    slidesToShow: slidesToShow,
    slidesToScroll: 1,
  };

  // Delivery Content
  const renderDeliveryLocationContent = () => {
    return (
      <div className="w-full">
        <h2 className="text-[20px] md:text-[24px] mb-4">
          Select Delivery Location
        </h2>

        <p className="text-[14px] text-black/70 leading-5 mb-3">
          Enter the pincode of your area to check product availability and
          delivery options location
        </p>

        <div className="flex w-full h-[54px] bg-[#9896961A] shadow-[0_4px_4px_0px_rgba(0,0,0,0.40)]">
          <input
            type="text"
            value={pincode}
            onChange={(e) => {
              setPincode(e.target.value);
              setDeliveryMessage("");
            }}
            placeholder="Enter Pincode"
            className="flex-1 min-w-0 px-3 text-sm bg-transparent outline-none placeholder:text-[#BCBCBC]"
          />
          <button
            type="button"
            onClick={handleApplyPincode}
            disabled={pincodeLoading}
            className="px-4 text-xs text-gray-400 hover:text-[var(--primary-color)] transition-colors disabled:opacity-50"
          >
            {pincodeLoading ? "Checking..." : "Apply"}
          </button>
        </div>

        {deliveryMessage && (
          <p
            className={`mt-2 text-xs ${
              deliveryMessage.includes("available")
                ? "text-green-600"
                : "text-red-500"
            }`}
          >
            {deliveryMessage}
          </p>
        )}

        <div className="relative mt-10 delivery-slider px-10">
          <Slider {...deliverySliderSettings}>
            {deliveryOptions.map((item) => (
              <div key={item.id} className="px-3">
                <div className="flex flex-col items-start text-left min-h-[130px]">
                  <div className="mb-[12px]">
                    <img
                      src={item.icon}
                      alt="delivery option"
                      className="w-[30px] h-[30px] object-contain"
                    />
                  </div>
                  <div className="flex-1 text-[18px] leading-[22px] font-light">
                    {item.title}
                  </div>
                  <button
                    type="button"
                    className="mt-auto text-sm text-[var(--primary-color)] hover:underline font-medium"
                  >
                    Know More
                  </button>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    );
  };


  // Review Content

  const ReviewContent = () => {
    if (loading) {
      return (
        <p className="py-4 text-center"> Loading reviews... </p>
      );
    }

    if (error) {
      return (
        <p className="py-4 text-red-500 text-center"> {error} </p>
      );
    }

    if (filteredReviews.length === 0) {
      return (
        <p className="py-10 text-center text-gray-500 font-medium">
          No reviews yet for this product.
        </p>
      );
    }

    const REVIEW_ITEM_HEIGHT = 110;
    const VISIBLE_COUNT = 5;
    const scrollContainerHeight = REVIEW_ITEM_HEIGHT * VISIBLE_COUNT;

    return (
      <div className="w-full">
        {/* Review header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-gray-400 mb-1">
              Customer Reviews
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-color)]/10 text-[var(--primary-color)] self-start sm:self-auto px-3 py-1">
            <span className="font-bold text-sm">
              {filteredReviews.length}
            </span>

            <span className="text-sm">
              {filteredReviews.length === 1
                ? "Review"
                : "Reviews"}
            </span>
          </div>
        </div>

        {/* Reviews */}
        <div
          style={{
            maxHeight: `${scrollContainerHeight}px`,
          }}
          className="overflow-y-auto pr-2 space-y-4 h-[300px] no-scrollbar cursor-pointer"
        >
          {filteredReviews.map((review) => {
            const rating = Number(review.rating) || 0;
            const userName = review.user_id?.name || "Anonymous User";

            return (
              <article key={review._id}
                className="group relative rounded-xl border border-gray-200 bg-white p-5 transition-all duration-300 hover:border-[var(--primary-color)] hover:shadow-md"
              >
                <div className="absolute left-0 top-5 bottom-5 w-1 rounded-r-full bg-[var(--primary-color)]" />

                <div className="flex items-start justify-between gap-4 pl-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center bg-[var(--primary-color)]/10 text-[var(--primary-color)] font-bold text-sm">
                      {userName
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm text-gray-900 truncate">
                        {userName}
                      </h4>

                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-[2px]">
                          {[...Array(5)].map(
                            (_, i) => (
                              <Star
                                key={i}
                                size={14}
                                strokeWidth={1.5}
                                fill={
                                  i < rating
                                    ? "currentColor"
                                    : "none"
                                }
                                className={
                                  i < rating
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }
                              />
                            )
                          )}
                        </div>

                        <span className="text-xs text-gray-400">
                          {rating}/5
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="flex-shrink-0 text-xs text-gray-400 whitespace-nowrap">
                    {review.createdAt
                      ? new Date(
                          review.createdAt
                        ).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )
                      : ""}
                  </span>
                </div>

                <div className="mt-4 pl-2">
                  {review.title && (
                    <h5 className="text-sm font-bold text-gray-800 mb-2">
                      {review.title}
                    </h5>
                  )}

                  <p className="text-sm leading-6 text-gray-600">
                    {review.comment ||
                      "No comment provided."}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between pl-2">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-3.5 h-3.5 text-green-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2.586-2.586z"
                        clipRule="evenodd"
                      />
                    </svg>

                    <span>Customer Review</span>
                  </div>

                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-600">
                    {rating >= 4
                      ? "Excellent"
                      : rating === 3
                      ? "Good"
                      : rating === 2
                      ? "Average"
                      : "Needs Improvement"}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    );
  };
  // Main UI

  return (
    <div className="mt-[15px] md:mt-[65px]">
      <div className="hidden md:flex w-full">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-[30px] py-[14px] text-center font-18 ${
              activeTab === tab
                ? "text-theme border-b-0 border border-[#BCBCBC] "
                : "text-black border-b border-[#BCBCBC] "
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="hidden md:block border border-[#BCBCBC] border-t-0 px-[38px] py-[35px]">
        {activeTab === "Delivery Location" && (
           renderDeliveryLocationContent()
        )}
        {activeTab === "Product Information" && (
          <div className="prose max-w-full">
            {activeDescription ? (
              <div dangerouslySetInnerHTML={{ __html: activeDescription }} />
            ) : (
              <p>Product details coming soon.</p>
            )}
          </div>
        )}
        {activeTab === "Customer Review" && (<ReviewContent />)}
      </div>

      <div className="md:hidden">
        {tabs.map((tab, index) => (
          <div key={index} className="border-b border-[#BCBCBC]">
            <button
              className="w-full flex justify-between items-center py-4 text-left font-18"
              onClick={() => handleAccordionToggle(index)}
            >
              {tab}
              {openAccordion === index ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>

            {openAccordion === index && (
              <div className="pb-5">
                {index === 0 && (
                  renderDeliveryLocationContent()
                )}
                {index === 1 && (
                  <div className="prose max-w-full">
                    {activeDescription ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: activeDescription }}
                      />
                    ) : (
                      <p>Product details coming soon.</p>
                    )}
                  </div>
                )}
                {index === 2 && (<ReviewContent />)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
