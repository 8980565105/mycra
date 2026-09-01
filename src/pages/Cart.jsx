import React, { useEffect, useState } from "react";
import CartProgress from "../components/cart/CartProgress";
import CartSummary from "../components/cart/CartSummary";
import Row from "../components/ui/Row";
import Section from "../components/ui/Section";
import Button from "../components/ui/Button";
import CartItem from "../components/cart/CartItem";
import CouponCard from "../components/cart/CouponCard";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCoupons } from "../features/coupons/couponsThunk";
import {
  applyGiftCoupon,
  applyBuyXGetYCoupon,
  removeGiftCoupon,
} from "../features/cart/cartThunk";
import toast, { Toaster } from "react-hot-toast";
import SEO from "../components/Seo/seo";
import { getImageUrl } from "../components/utils/helper";
import { fetchPageBySlug } from "../features/pages/pagesThunk";
import { ChevronDown } from "lucide-react";

export default function Cart() {
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    const saved = localStorage.getItem("appliedCoupon");
    return saved ? JSON.parse(saved) : null;
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const dispatch = useDispatch();
  const { pages } = useSelector((state) => state.pages);

  const { coupons = [] } = useSelector((state) => state.coupons);
  const cartPage = pages?.find((page) => page.slug === "cart");


  const [cartCouponCode, setCartCouponCode] = useState(() =>
    localStorage.getItem("appliedCoupon")
      ? JSON.parse(localStorage.getItem("appliedCoupon")).code
      : "",
  );
  const { items = [] } = useSelector((state) => state.cart);
  const [couponMsg, setCouponMsg] = useState({ text: "", type: "" });

  const cart_id = localStorage.getItem("cart_id");

  const isCouponExpired = (coupon) => {
    if (!coupon?.end_date) return false;
    const endDate = new Date(coupon.end_date);
    if (Number.isNaN(endDate.getTime())) {
      return true;
    }

    return endDate.getTime() <= Date.now();
  };

  const activeCoupons = coupons.filter( (coupon) => !isCouponExpired(coupon) );
  const hasAvailableCoupons = activeCoupons.length > 0;

  useEffect(() => {
    dispatch(fetchCoupons({ status: "active" }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchPageBySlug("cart"));
  }, [dispatch]);

  useEffect(() => {
    if (!appliedCoupon) return;

    if (isCouponExpired(appliedCoupon)) {
      setAppliedCoupon(null);
      setCartCouponCode("");
      localStorage.removeItem("appliedCoupon");

      toast.error("Your applied coupon has expired.");
    }
  }, [appliedCoupon, coupons]);


  const applyCouponByCode = (code) => {
    // const coupon = coupons.find((c) => c.code === code);
    const coupon = activeCoupons.find(
      (c) => c.code?.toLowerCase() === code?.trim().toLowerCase()
    );
    if (!coupon) {
      toast.error("Invalid coupon code!");
      return;
    }
    const cartSubtotal = items.reduce((sum, item) => {
      const price = item?.variant_id?.offerprice || 0;
      return sum + price * (item.quantity || 1);
    }, 0);

    const cartProductStoreIds = [
      ...new Set(
        items
          .map((item) => {
            const storeId =
              item?.product_id?.storeId?._id || item?.product_id?.storeId;
            return storeId ? String(storeId) : null;
          })
          .filter(Boolean),
      ),
    ];

    const hasAdminProduct = items.some((item) => {
      const storeId =
        item?.product_id?.storeId?._id || item?.product_id?.storeId;
      return !storeId;
    });

    if (coupon.is_global === true) {
    } else {
      const couponStoreIds = [
        ...(coupon.storeIds || []).map((s) =>
          typeof s === "object" ? String(s._id) : String(s),
        ),
      ];

      if (coupon.storeId) {
        const singleStoreId =
          typeof coupon.storeId === "object"
            ? String(coupon.storeId._id)
            : String(coupon.storeId);

        if (!couponStoreIds.includes(singleStoreId)) {
          couponStoreIds.push(singleStoreId);
        }
      }
      const adminAllowed =
        coupon.include_admin_products === true && hasAdminProduct;
      const storeAllowed = couponStoreIds.some((storeId) =>
        cartProductStoreIds.includes(storeId),
      );

      if (!adminAllowed && !storeAllowed) {
        toast.error("This coupon is not applicable to products in your cart.");
        return;
      }
    }
    if (
      coupon.min_purchase_amount &&
      cartSubtotal < coupon.min_purchase_amount
    ) {
      toast.error(
        `This coupon requires minimum ₹${coupon.min_purchase_amount} purchase`,
      );
      return;
    }

    if (!cart_id) {
      toast.error("Cart not found. Please refresh the page.");
      return;
    }

    if (coupon.coupon_type === "free_gift") {
      dispatch(applyGiftCoupon({ cart_id, code: coupon.code }))
        .unwrap()
        .then(() => {
          setCouponMsg({
            text: `🎁 Coupon "${coupon.code}" applied! Free gift added to cart.`,
            type: "success",
          });
          toast.success(`Coupon "${coupon.code}" applied successfully!`);
        })
        .catch((err) => {
          setCouponMsg({
            text: err || "Failed to add gift product",
            type: "error",
          });
          toast.error(err || "Failed to add gift product");
          return;
        });
    } else if (coupon.coupon_type === "buy_x_get_y") {
      const buyQty = coupon?.buy_x_get_y?.buy_quantity || 0;
      const cartQty = items
        .filter((i) => !i.is_gift)
        .reduce((sum, i) => sum + (i.quantity || 0), 0);

      if (cartQty < buyQty) {
        toast.error(`Add at least ${buyQty} items in cart to use this coupon`);
        return;
      }

      dispatch(applyBuyXGetYCoupon({ cart_id, code: coupon.code }))
        .unwrap()
        .then(() => {
          setCouponMsg({
            text: `🎁 Coupon "${coupon.code}" applied! Free item added as per offer.`,
            type: "success",
          });
          toast.success(`Coupon "${coupon.code}" applied successfully!`);
        })
        .catch((err) => {
          setCouponMsg({ text: err || "Failed to apply offer", type: "error" });
          toast.error(err || "Failed to apply offer");
          return;
        });
    } else {
      setCouponMsg({
        text: `Coupon "${coupon.code}" applied successfully!`,
        type: "success",
      });
      toast.success(`Coupon "${coupon.code}" applied successfully!`);
    }

    setAppliedCoupon(coupon);
    localStorage.setItem("appliedCoupon", JSON.stringify(coupon));
  };


  const removeCoupon = () => {
    if (
      (appliedCoupon?.coupon_type === "free_gift" ||
        appliedCoupon?.coupon_type === "buy_x_get_y") &&
      cart_id
    ) {
      dispatch(removeGiftCoupon({ cart_id }));
    }

    setAppliedCoupon(null);
    setCartCouponCode("");
    localStorage.removeItem("appliedCoupon");
    toast.success("Coupon removed");
  };

  const handleApplyCartCoupon = () => {
    if (appliedCoupon) {
      removeCoupon();
    } else {
      applyCouponByCode(cartCouponCode);
    }
  };

  const handleSelectCoupon = (code) => {
    setCartCouponCode(code);
    applyCouponByCode(code);
  };

  return (
    <>
      <SEO
        title={cartPage?.meta_title}
        description={cartPage?.meta_description}
        image={getImageUrl(cartPage?.seo_image)}
      />


      <Toaster position="top-center" />

      <CartProgress currentStep={1} />
      <Section>
        <Row>
          <h2 className="text-[28px]  mb-[50px] hidden md:block leading">
            <Link to="/home">Home </Link>/{" "}
            <span className="font-light">Cart</span>
          </h2>
        </Row>
        <Row className="grid grid-cols-1 custom-lg:grid-cols-[3fr_1fr] gap-[30px] items-start">
          <div className="flex-1">

            <CouponCard
              appliedCoupon={appliedCoupon}
              setAppliedCoupon={setAppliedCoupon}
              onSelectCoupon={handleSelectCoupon}
              isDrawerOpen={isDrawerOpen}
              setIsDrawerOpen={setIsDrawerOpen}
            />

            {items.length > 0 && hasAvailableCoupons  && (
              <div className="custom-lg:sticky custom-lg:top-[110px] z-[10] mb-[40px]">
                <div className="bg-white border border-gray-200  hover:border-[var(--primary-color)] transition rounded-[6px] shadow-[0_3px_15px_rgba(0,0,0,0.06)] overflow-hidden">
                  <button type="button" onClick={() => setIsDrawerOpen(true)} className="w-full flex items-center justify-between px-[18px] py-[14px] bg-white transition">
                    <div className="flex items-center gap-[12px]">
                      <div className="w-[40px] h-[40px] rounded-full bg-[var(--primary-color)] text-white flex items-center justify-center shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8" />
                          <path d="M2 7h20v5H2z" />
                          <path d="M12 22V7" />
                          <path d="M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7Z" />
                          <path d="M12 7h4.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7Z" />
                        </svg>
                      </div>

                      <div className="text-left">
                        <p className="text-[14px] font-semibold text-black">
                          {appliedCoupon ? `Coupon ${appliedCoupon.code}` : "Apply Coupon"}
                        </p>

                        <p className="text-[11px] text-gray-500 mt-[2px]">
                          {appliedCoupon ? "Coupon applied successfully" : "View available coupons"}
                        </p>
                      </div>
                    </div>

                    <ChevronDown className="w-[20px] h-[20px] -rotate-90 text-gray-600" />
                  </button>

                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-[12px]  border-t border-gray-200 px-[18px] py-[14px] bg-[#fafafa]">
                  <div className="flex flex-wrap gap-[12px] md:gap-[16px] items-start">
                    <div>
                      <input
                        value={cartCouponCode}
                        onChange={(e) => {
                          setCartCouponCode(e.target.value);
                        }}
                        placeholder="COUPON CODE"
                        disabled={!!appliedCoupon}
                        className="text-center border border-theme rounded-[3px] px-[10px] py-[7px]  md:py-[14px] text-18 w-[200px] md:w-[181px] disabled:bg-gray-100"
                      />
                    </div>
                    <Button
                      onClick={handleApplyCartCoupon}
                      variant="common"
                      className="uppercase text-18 md:min-w-[181px]"
                    >
                      {appliedCoupon ? "REMOVE COUPON" : "APPLY COUPON"}
                    </Button>
                  </div>
                
                </div>
                </div>
              </div>
            )}

            <CartItem />


          </div>
          {/* <CartSummary appliedCoupon={appliedCoupon} /> */}
          <aside className="w-full custom-lg:sticky custom-lg:top-[110px] self-start">
            <CartSummary appliedCoupon={appliedCoupon} />
          </aside>
        </Row>
      </Section>
    </>
  );
}
