import React from "react";
import SectionHeading from "../ui/SectionHeading";
import Row from "../ui/Row.jsx";
import { useSelector } from "react-redux";
import Section from "../ui/Section.jsx";
import { getImageUrl } from "../utils/helper.js";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import FlowerIcon from "../icons/FlowerIcon.jsx";

const Bestsellers = () => {
  const { products = [] } = useSelector((state) => state.products);

  const sellersProducts = products.filter(
    (product) =>
      product.status === "active" &&
      product.variants?.some((variant) => variant.is_best_seller),
  );

  const bestSellersLimited = sellersProducts.slice(0, 4);

  const getDiscountedPrice = (product) => {
    const originalPrice = product?.variants?.[0]?.price || 0;
    const discount = product?.discount?.value || 0;

    const discountedPrice =
      discount > 0
        ? originalPrice - (originalPrice * discount) / 100
        : originalPrice;

    return { discount, originalPrice, discountedPrice };
  };

  return (
    <Section>
      {/* <Row className="pt-[25px] md:pt-[50px]">
        <SectionHeading page="Home" order={7} />
      </Row> */}

      <div className="relative flex justify-center items-center w-full mb-[50px] md:mb-[90px]">
        <div className="w-[18px] md:w-[50px] border-t border-black"></div>

        <div className="relative mx-2 md:mx-4 flex flex-col items-center justify-center">
          <h2 className="font-h2 text-black whitespace-nowrap relative z-10">
            Our Best Seller’s
          </h2>
          <FlowerIcon className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[40px] h-[25px] md:w-[110px] md:h-[80px] pointer-events-none z-0" />
        </div>

        <div className="w-[18px] md:w-[50px] border-t border-black"></div>
      </div>

      <Row className="grid grid-cols-2 lg:grid-cols-4 gap-[10px] lg:gap-[30px]">
        {bestSellersLimited.map((product) => {
          const price = getDiscountedPrice(product);

          return (
            <Link key={product._id} to={`/products/${product._id}`}>
              <div className="relative overflow-hidden bg-white rounded-[5px] group h-[250px] sm:h-[400px]">
                {/* Main Image */}
                <img
                  src={getImageUrl(
                    product.variants?.[0]?.images?.[0] ||
                      product.images?.[0] ||
                      "/uploads/placeholder.png",
                  )}
                  alt={product.name}
                  className="w-full h-full transition-transform duration-300"
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                  <div className="absolute inset-3 bg-black bg-opacity-30 rounded-[5px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-400">
                    <div className="bg-white px-4 py-2 rounded-[5px] text-center mx-[10px]">
                      <p className="text-black text-[10px] lg:text-[18px] font-medium line-clamp-3">
                        {product.name}
                      </p>
                      <p className="text-black text-[8px] lg:text-[16px]">
                        <span className="text-p">
                          Rs {price.discountedPrice.toFixed(0)}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </Row>

      {/* "View all" Button */}
      <Row className="flex justify-center pt-[50px] md:pt-[100px] pb-[0px] md:pb-[0px]">
        <Link
          to="/shop?filter=bestseller"
          className="lg:w-[217px] lg:w-[217px] gap-[5px] flex items-center justify-center text-theme text-[12px] lg:text-[16px] font-sans border border-black py-3 px-5 rounded-[5px] transition-colors "
        >
          View all Best Seller's <ArrowRight size={20} />
        </Link>
      </Row>
    </Section>
  );
};

export default Bestsellers;
