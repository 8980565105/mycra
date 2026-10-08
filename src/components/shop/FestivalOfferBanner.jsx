import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fetchFestivalOffers } from "../../features/FestivalOffer/FestivalOfferThunk";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { getImageUrl } from "../utils/helper";

function NextArrow({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Next festival offer"
      className="absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-black shadow-md transition hover:bg-white sm:right-4 sm:h-10 sm:w-10 lg:right-5 lg:h-11 lg:w-11"
    >
      <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
    </button>
  );
}

function PrevArrow({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Previous festival offer"
      className="absolute left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-black shadow-md transition hover:bg-white sm:left-4 sm:h-10 sm:w-10 lg:left-5 lg:h-11 lg:w-11"
    >
      <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
    </button>
  );
}

const cleanSlug = (value) => {
  return String(value || "")
    .trim()
    .replace(/^\/+|\/+$/g, "");
};

const createSlugFallback = (value) => {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const getBannerSlug = (banner) => {
  if (!banner) {
    return "";
  }

  const databaseSlug = cleanSlug(
    banner.link_slug ||
      banner.slug ||
      banner.product_slug ||
      banner.category_slug ||
      banner.subcategory_slug ||
      ""
  );

  if (databaseSlug) {
    return databaseSlug;
  }

  return createSlugFallback(
    banner.title || banner.description || ""
  );
};

const generateBannerUrl = (banner) => {
  if (!banner) {
    return "";
  }

  const type = banner.link_type || "none";

  const id = banner.link_id
    ? String(banner.link_id).trim()
    : "";

  const slug = getBannerSlug(banner);

  switch (type) {
    case "product":
      return slug
        ? `/products/${encodeURIComponent(slug)}`
        : "";

    case "category":
      return slug
        ? `/shop?category=${encodeURIComponent(slug)}`
        : "";

    case "subcategory":
      return id
        ? `/shop?subcategory=${encodeURIComponent(id)}`
        : "";

    case "childcategory":
      return id
        ? `/shop?childcategory=${encodeURIComponent(id)}`
        : "";

    case "shop":
      return "/shop";

    case "custom":
      return banner.link_slug
        ? String(banner.link_slug).trim()
        : "";

    case "none":
    default:
      return "";
  }
};

export default function FestivalOfferBanner({pageType = "shop"}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const festivalOfferState = useSelector(
    (state) => state.festivalOffers || {}
  );

  const festivalOffers = useMemo(() => {
    const raw =
      festivalOfferState.items ??
      festivalOfferState.data ??
      [];

    if (Array.isArray(raw)) {
      return raw;
    }

    if (Array.isArray(raw?.offers)) {
      return raw.offers;
    }

    if (Array.isArray(raw?.items)) {
      return raw.items;
    }

    if (Array.isArray(raw?.data)) {
      return raw.data;
    }

    return [];
  }, [festivalOfferState]);

  const loading = Boolean(festivalOfferState.loading);

  useEffect(() => {
    dispatch(fetchFestivalOffers());
  }, [dispatch]);

  const normalizedPageType = pageType === "home"
      ? "home"
      : pageType === "collection" ||
        pageType === "collections"
      ? "collection"
      : "shop";

  const pageOffers = useMemo(() => {
    if (!Array.isArray(festivalOffers)) {
      return [];
    }

    return festivalOffers.filter((offer) => {
      if (!offer) {
        return false;
      }

      if (offer.status !== "active") {
        return false;
      }

      return (
        offer.display_on === normalizedPageType
      );
    });
  }, [ festivalOffers, normalizedPageType ]);

  const sliderItems = useMemo(() => {
    if (!Array.isArray(pageOffers)) {
      return [];
    }

    return pageOffers.flatMap((offer) => {
      if (!Array.isArray(offer?.banners)) {
        return [];
      }

      return offer.banners
        .filter(
          (banner) =>
            banner &&
            String(banner.image || "").trim()
        )
        .map((banner, bannerIndex) => ({
          offerId: offer._id || "",
          offerName: offer.name || "",
          offerDescription: offer.description || "",
          bannerId: banner._id || "",
          bannerIndex,
          image: banner.image || "",
          title: banner.title || "",
          description: banner.description || "",
          linkType: banner.link_type || "none",
          linkId: banner.link_id ? String(banner.link_id) : "",
          linkSlug: banner.link_slug || "",
          linkUrl: generateBannerUrl(banner),
        }));
    });
  }, [pageOffers]);

  if (loading && festivalOffers.length === 0) {
    return null;
  }

  if (sliderItems.length === 0) {
    return null;
  }

  const isCollectionPage = normalizedPageType === "collection";
  const slidesToShow = isCollectionPage ? 1 : 2;

  const settings = {
    dots: false,
    infinite: sliderItems.length > slidesToShow,
    autoplay: sliderItems.length > slidesToShow,
    autoplaySpeed: isCollectionPage ? 2500 : 3000,
    speed: isCollectionPage ? 650 : 700,
    slidesToShow,
    slidesToScroll: 1,
    arrows: sliderItems.length > 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    pauseOnHover: false,
    pauseOnFocus: false,
    swipe: true,
    draggable: true,
    touchMove: true,
    adaptiveHeight: false,
    cssEase: "ease-in-out",
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          autoplay: sliderItems.length > 1,
          autoplaySpeed: isCollectionPage ? 2200 : 2500,
          speed: 550,
        },
      },
    ],
  };

  const handleBannerClick = (item) => {
    if (!item) {
      return;
    }

    const url = String(item.linkUrl || "").trim();

    if (!url) {
      return;
    }

    if (url.startsWith("/")) {
      navigate(url);
      return;
    }

    window.open(url, "_blank", "noopener, noreferrer");
  };

  return (
    <div className="mb-[20px] w-full">
      <div className={`festival-offer-slider relative w-full overflow-hidden rounded-[10px] ${
          isCollectionPage ? "collection-festival-offer" : "shop-festival-offer"
        }`}
      >
        <Slider {...settings}>
          {sliderItems.map((item, index) => {
            const imageUrl = getImageUrl(
              item.image
            );

            return (
              <div
                key={`${item.offerId}-${item.bannerId || item.bannerIndex}-${index}`}
                className={
                  isCollectionPage
                    ? "px-1"
                    : "px-0"
                }
              >
                <div
                  onClick={() => handleBannerClick(item)}
                  className={`relative w-full overflow-hidden rounded-[10px] bg-transparent ${
                    item.linkUrl ? "cursor-pointer" : ""
                  }`}
                >
                  <img
                    src={imageUrl}
                    alt={item.title || item.offerName || "Festival Offer"}
                    className="block h-[220px] w-full rounded-[10px] object-fit sm:h-[250px] md:h-[280px] lg:h-[320px]"
                  />
                </div>
              </div>
            );
          })}
        </Slider>
      </div>
    </div>
  );
}