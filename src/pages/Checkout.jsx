import React, { useEffect, useState } from "react";
import CheckoutForm from "../components/checkout/CheckoutForm";
import OrderSummary from "../components/checkout/OrderSummary";
import Section from "../components/ui/Section";
import Row from "../components/ui/Row";
import CartProgress from "../components/cart/CartProgress";
import { Link } from "react-router-dom";
import SEO from "../components/Seo/seo";
import { useDispatch, useSelector } from "react-redux";
import { getImageUrl } from "../components/utils/helper";
import { fetchPageBySlug } from "../features/pages/pagesThunk";

export default function Checkout() {
  const dispatch = useDispatch();
  const { pages } = useSelector((state) => state.pages);


  useEffect(() => {
      dispatch(fetchPageBySlug("checkout"));
    }, [dispatch]);

  const chekoutPage = pages?.find((page) => page.slug === "checkout");

  const [appliedCoupon] = useState(() => {
    const saved = localStorage.getItem("appliedCoupon");
    return saved ? JSON.parse(saved) : null;
  });

  const [formData, setFormData] = React.useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    country: "",
    state: "",
    city: "",
    pincode: "",
    phone: "",
  });

  return (
    <div>

      <SEO
        title={chekoutPage?.meta_title}
        description={chekoutPage?.meta_description}
        image={getImageUrl(chekoutPage?.seo_image)}
      />

      <CartProgress currentStep={2} />

      <Section>
        <Row>
          <h2 className="text-[28px] font-normal mb-[50px] hidden md:block leading">
            <Link to="/home">Home </Link>/{" "}
            <span className="font-light">Checkout</span>
          </h2>
        </Row>

        <Row className="grid grid-cols-1 custom-lg:grid-cols-[2fr_1fr] gap-[30px] items-start">
          <CheckoutForm formData={formData} setFormData={setFormData} />
          <OrderSummary formData={formData} appliedCoupon={appliedCoupon} />
        </Row>
      </Section>
    </div>
  );
}
