import { useEffect, useMemo, useState } from "react";
import Section from "../components/ui/Section";
import faqBg from "../assets/size-bg.png";
import { Plus, Minus } from "lucide-react";
import Row from "../components/ui/Row";
import SEO from "../components/Seo/seo";
import { useDispatch, useSelector } from "react-redux";
import { getImageUrl } from "../components/utils/helper";
import { fetchPageBySlug } from "../features/pages/pagesThunk";

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg mb-3 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-4 py-4 text-left transition-colors ${open
          ? "bg-theme"
          : "bg-white hover:bg-gray-50"
          }`}
      >
        <span className="text-[15px] sm:text-[16px] font-medium text-gray-800 pr-4">
          {question}
        </span>

        <span className="flex-shrink-0">
          {open ? (
            <Minus className="w-5 h-5 text-gray-700" />
          ) : (
            <Plus className="w-5 h-5 text-gray-700" />
          )}
        </span>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-3 text-sm text-gray-600 leading-relaxed bg-gray-50 border-t border-gray-100">
          {answer}
        </div>
      )}
    </div>
  );
}

function Faqs() {
  const dispatch = useDispatch();

  const { pages } = useSelector((state) => state.pages);
  const faqsPage = pages?.find((page) => page.slug === "faqs");
  // const heroBg = faqBg;

  useEffect(() => {
    dispatch(fetchPageBySlug("faqs"));
  }, [dispatch]);

  const staticFaqData = [
    {
      id: 1,
      category: "orders",
      categoryLabel: "Orders",
      question: "How can I place an order?",
      answer:
        "You can place an order by selecting your desired product, adding it to your cart, and completing the checkout process.",
    },
    {
      id: 2,
      category: "orders",
      categoryLabel: "Orders",
      question: "Can I cancel my order?",
      answer:
        "Yes, you can cancel your order according to the cancellation policy. Please cancel your order as soon as possible after placing it.",
    },
    {
      id: 3,
      category: "orders",
      categoryLabel: "Orders",
      question: "How can I track my order?",
      answer:
        "You can track your order from the My Orders section of your account after your order has been shipped.",
    },
    {
      id: 4,
      category: "orders",
      categoryLabel: "Orders",
      question: "What happens if my order is delayed?",
      answer:
        "If your order is delayed, you can check the latest tracking information from the My Orders section.",
    },

    {
      id: 5,
      category: "payments",
      categoryLabel: "Payments",
      question: "What payment methods do you accept?",
      answer:
        "We support multiple payment methods including UPI, debit cards, credit cards, net banking and other available payment options.",
    },
    {
      id: 6,
      category: "payments",
      categoryLabel: "Payments",
      question: "Is online payment secure?",
      answer:
        "Yes. Online payments are processed through secure payment gateways and your payment information is protected.",
    },
    {
      id: 7,
      category: "payments",
      categoryLabel: "Payments",
      question: "Can I pay using UPI?",
      answer:
        "Yes, you can use supported UPI applications to complete your payment during checkout.",
    },

    {
      id: 8,
      category: "shipping",
      categoryLabel: "Shipping",
      question: "How long does delivery take?",
      answer:
        "Delivery time depends on your location and the product. The estimated delivery date will be shown during checkout.",
    },
    {
      id: 9,
      category: "shipping",
      categoryLabel: "Shipping",
      question: "Do you provide free shipping?",
      answer:
        "Free shipping may be available on eligible orders depending on the current shipping policy.",
    },
    {
      id: 10,
      category: "shipping",
      categoryLabel: "Shipping",
      question: "Can I change my delivery address?",
      answer:
        "You may be able to change your delivery address before the order is shipped. Contact support as soon as possible.",
    },

    {
      id: 11,
      category: "returns",
      categoryLabel: "Returns & Refunds",
      question: "Can I return a product?",
      answer:
        "Products can be returned only if they meet the applicable return policy requirements.",
    },
    {
      id: 12,
      category: "returns",
      categoryLabel: "Returns & Refunds",
      question: "How long does a refund take?",
      answer:
        "Once your return or cancellation is approved, the refund will be processed according to the applicable refund policy.",
    },
    {
      id: 13,
      category: "returns",
      categoryLabel: "Returns & Refunds",
      question: "What if I receive a damaged product?",
      answer:
        "If you receive a damaged product, contact customer support as soon as possible and provide the required photos or videos.",
    },

    {
      id: 14,
      category: "account",
      categoryLabel: "Account",
      question: "How can I create an account?",
      answer:
        "Click on the Sign Up option and enter your required details to create your account.",
    },
    {
      id: 15,
      category: "account",
      categoryLabel: "Account",
      question: "I forgot my password. What should I do?",
      answer:
        "Click on Forgot Password on the login page and follow the instructions to reset your password.",
    },
  ];

  const staticCategories = [
    { key: "all", label: "All topics" },
    { key: "orders", label: "Orders" },
    { key: "payments", label: "Payments" },
    { key: "shipping", label: "Shipping" },
    { key: "returns", label: "Returns & Refunds" },
    { key: "account", label: "Account" },
  ];

  const faqSection = faqsPage?.sections?.find(
    (sec) => sec.type === "faqs1"
  );

  const faqData = useMemo(() => {
    if (!faqSection?.faqs1) return [];
    return faqSection.faqs1.map((faq) => {
      const catObj = faqSection.faqCategories?.find(
        (c) => c.key === faq.category
      );
      return {
        id: faq._id,
        category: faq.category,
        categoryLabel: catObj?.label || faq.category,
        question: faq.question,
        answer: faq.answer,
      };
    });
  }, [faqSection]);

  const categories = useMemo(() => {
    const apiCats = faqSection?.faqCategories || [];
    return [
      { key: "all", label: "All topics" },
      ...apiCats.map((c) => ({ key: c.key, label: c.label })),
    ];
  }, [faqSection]);



  const heroSection = faqsPage?.sections?.find(
    (sec) => sec.type === "hero_slider"
  );

  const heroSlide = heroSection?.slides?.[0];

  const heroBgImage = heroSlide?.background_image_url
    ? getImageUrl(heroSlide.background_image_url)
    : faqBg;

  const heroTitle = heroSlide?.title || "Frequently Asked Questions";

  const heroDescription =
    heroSlide?.description ||
    "Find answers to common questions about orders, payments, shipping and returns.";

  const [activeCat, setActiveCat] = useState("all");
  const handleCategorySelect = (key) => {
    setActiveCat(key);
  };

  const filtered = useMemo(() => {
    if (activeCat === "all") {
      return faqData;
    }
    return faqData.filter(
      (faq) => faq.category === activeCat
    );
  }, [activeCat, faqData]);

  const activeLabel =
    categories.find(
      (cat) => cat.key === activeCat
    )?.label || "All topics";

  return (
    <>
      <SEO
        title={faqsPage?.meta_title}
        description={faqsPage?.meta_description}
        image={getImageUrl(faqsPage?.seo_image)}
      />
      <Section
        className="bg-cover bg-center bg-no-repeat min-h-[300px] min-[500px]:min-h-[400px] flex items-center justify-center"
        style={{
          backgroundImage: `url(${heroBgImage})`,
        }}
      >
        <div className="text-center max-w-[688px] px-4">
          <h1 className="text-[24px] sm:text-[40px] font-semibold mb-[15px] sm:mb-[22px]">
            {heroTitle}
          </h1>

          <p className="text-dark text-[14px] sm:text-[20px]">
            {heroDescription}
          </p>
        </div>
      </Section>

      <Section>
        <Row>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-52 flex-shrink-0">
              <div className="hidden md:block">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 px-2">
                  Categories
                </p>
                {categories.map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() =>
                      handleCategorySelect(cat.key)
                    }
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${activeCat === cat.key
                      ? "bg-theme text-[var(--theme-color)] font-medium"
                      : "text-black hover:bg-gray-100 hover:text-[var(--theme-color)]"
                      }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="flex md:hidden gap-2 overflow-auto">
                {categories.map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() =>
                      handleCategorySelect(cat.key)
                    }
                    className={`px-3 whitespace-nowrap py-1.5 rounded-full text-xs w-full border transition-colors ${activeCat === cat.key
                      ? "bg-pink-50 text-pink-700 border-pink-200 font-medium"
                      : "text-gray-500 border-gray-200 hover:bg-gray-50"
                      }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1">
              <p className="font-medium text-gray-800 mb-4 capitalize text-[20px]">
                {activeLabel}
              </p>

              {filtered.length === 0 ? (
                <p className="text-sm text-gray-400 py-4">
                  No results found.
                </p>
              ) : (
                filtered.map((faq) => (
                  <FAQItem
                    key={faq.id}
                    question={faq.question}
                    answer={faq.answer}
                  />
                ))
              )}
            </div>
          </div>

        </Row>
      </Section>
    </>
  );
}
export default Faqs;