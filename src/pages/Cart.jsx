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

export default function Cart() {
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    const saved = localStorage.getItem("appliedCoupon");
    return saved ? JSON.parse(saved) : null;
  });
  const dispatch = useDispatch();
  const { coupons = [] } = useSelector((state) => state.coupons);
  const [cartCouponCode, setCartCouponCode] = useState(() =>
    localStorage.getItem("appliedCoupon")
      ? JSON.parse(localStorage.getItem("appliedCoupon")).code
      : "",
  );
  const { items = [] } = useSelector((state) => state.cart);
  const [couponMsg, setCouponMsg] = useState({ text: "", type: "" });

  const cart_id = localStorage.getItem("cart_id");

  useEffect(() => {
    dispatch(fetchCoupons({ status: "active" }));
  }, [dispatch]);

  const applyCouponByCode = (code) => {
    const coupon = coupons.find((c) => c.code === code);
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

  // const removeCoupon = () => {
  //   if (appliedCoupon?.coupon_type === "free_gift" && cart_id) {
  //     dispatch(removeGiftCoupon({ cart_id }));
  //   }

  //   setAppliedCoupon(null);
  //   setCartCouponCode("");
  //   localStorage.removeItem("appliedCoupon");
  //   toast.success("Coupon removed");
  // };
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
            <CartItem />
            {items.length > 0 && (
              <div>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-[12px] mt-[20px] md:mt-[30px]">
                  <div className="flex flex-col md:flex-row gap-[12px] md:gap-[16px] items-start">
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
                  <Link to="/updatecart">
                    <Button
                      variant="secondary"
                      className="uppercase !text-18 md:min-w-[181px] self-center md:self-auto"
                    >
                      UPDATE CART
                    </Button>
                  </Link>
                </div>
              </div>
            )}
            <CouponCard
              appliedCoupon={appliedCoupon}
              setAppliedCoupon={setAppliedCoupon}
              onSelectCoupon={handleSelectCoupon}
            />
          </div>
          <CartSummary appliedCoupon={appliedCoupon} />
        </Row>
      </Section>
    </>
  );
}
