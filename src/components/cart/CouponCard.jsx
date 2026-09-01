import Button from "../ui/Button";
import logo from "../../assets/logo.png";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useState } from "react";
import { ChevronDown, XCircleIcon } from "lucide-react";

export default function CouponCard({
  appliedCoupon,
  setAppliedCoupon,
  onSelectCoupon,
  isDrawerOpen,
  setIsDrawerOpen,
}) {
  // const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { coupons = [] } = useSelector((state) => state.coupons);
  const { items = [] } = useSelector((state) => state.cart);

  if (items.length === 0) {
    return null;
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
    const storeId = item?.product_id?.storeId?._id || item?.product_id?.storeId;

    return !storeId;
  });
  const filteredCoupons = coupons.filter((coupon) => {
      if (coupon?.end_date) {
      const endDate = new Date(coupon.end_date);

      if (Number.isNaN(endDate.getTime())) {
        return false;
      }

      if (endDate.getTime() <= Date.now()) {
        return false;
      }
    }

    if (coupon?.is_global === true) {
      return true;
    }
    const minPurchase = Number(coupon?.min_purchase_amount || 0);
    if (cartSubtotal < minPurchase) {
      return false;
    }
    const adminAllowed =
      coupon?.include_admin_products === true && hasAdminProduct;
    const couponStoreIds = [
      ...(coupon?.storeIds || []).map((s) =>
        typeof s === "object" ? String(s._id) : String(s),
      ),
    ];
    if (coupon?.storeId) {
      const singleStoreId =
        typeof coupon.storeId === "object"
          ? String(coupon.storeId._id)
          : String(coupon.storeId);

      if (!couponStoreIds.includes(singleStoreId)) {
        couponStoreIds.push(singleStoreId);
      }
    }
    const storeAllowed =
      couponStoreIds.length > 0 &&
      couponStoreIds.some((storeId) => cartProductStoreIds.includes(storeId));
    return adminAllowed || storeAllowed;
  });
  if (filteredCoupons.length === 0) {
    return null;
  }
  const handleApplyCoupon = (code) => {
    onSelectCoupon(code);
    setIsDrawerOpen(false);
  };

  return (
    <>
    {/* <div className="w-full ">
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className="w-full flex items-center justify-between px-4 py-3 mt-10 border border-gray-200 rounded-md bg-white hover:border-[var(--primary-color)] transition"
        >
          <div className="flex items-center gap-3">
            <div className="h-[36px] w-[36px] rounded-full bg-[var(--primary-color)] text-white flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8" />
                <path d="M2 7h20v5H2z" />
                <path d="M12 22V7" />
                <path d="M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7Z" />
                <path d="M12 7h4.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7Z" />
              </svg>
            </div>

            <div className="text-left">
              <p className="text-[14px] font-semibold text-black">
                Apply Coupon
              </p>

              <p className="text-[11px] text-gray-500">
                View available coupons
              </p>
            </div>
          </div>

          <ChevronDown className="w-5 h-5 -rotate-90 " />
        </button>
      </div> */}

      {/* =====================================================
          DRAWER
      ====================================================== */}
          {isDrawerOpen && (
            <>
              <div className=" fixed inset-0 bg-black/40 z-[9999] "
                onClick={() => setIsDrawerOpen(false)} 
              />

              {/* Right Drawer */}
              <div className={`fixed top-0 right-0 h-screen w-full w-3/4 max-w-[430px] bg-white z-[9999] transform transition-transform duration-300 flex flex-col ${
                  isDrawerOpen ? "translate-x-0" : "-translate-x-full"
                }`}
              > 
            <div className=" flex items-center justify-between px-5 py-4 border-b border-theme shrink-0 " >
              <div>
                <h2 className="text-[20px] font-semibold text-black"> Coupons </h2>
                <p className="text-[12px] text-gray-500"> Save more on your order </p>
              </div>

              {/* Close */}
              <button className="absolute top-4 right-2 transition-colors text-light border rounded-[3px] p-[5px] border-[#D2AF9F]"
                onClick={() => setIsDrawerOpen(false)}
              >
                <XCircleIcon size={22} />
              </button>
            </div>

            {/* =================================================
                DRAWER BODY
            ================================================== */}
            <div className=" flex-1 h-full overflow-y-auto no-scrollbar px-4 py-5 " >
              {filteredCoupons.length === 0 ? (
                <div className=" h-full flex items-center justify-center text-center " >
                  <div>
                    <p className="text-[15px] font-semibold text-black">
                      No coupons available
                    </p>

                    <p className="text-[12px] text-gray-500 mt-1">
                      There are no coupons applicable to your cart.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {filteredCoupons.map((coupon) => {
                    const isApplied =
                      appliedCoupon === coupon.code ||
                      appliedCoupon?.code === coupon.code;

                    return (
                      <div key={coupon._id}
                        className={`flex bg-white rounded-[3px] overflow-hidden shadow-md border 
                          ${
                            isApplied
                              ? "border-[var(--primary-color)]"
                              : "border-transparent"
                          }
                        `}
                      >
                        <div className="bg-color text-white w-[80px] shrink-0 flex items-center justify-center" >
                          <span className=" text-[18px] font-bold tracking-wider -rotate-90 whitespace-nowrap " >
                            DISCOUNT
                          </span>
                        </div>

                        <div className=" flex-1 p-4 bg-white " >
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <p className="sec-text-color text-[14px] font-medium">
                                {coupon.discount_type === "fixed"
                                  ? `Flat ₹${coupon.discount_value} off*`
                                  : `Flat ${coupon.discount_value}% off*`}
                              </p>

                              <h2 className="text-[18px] font-semibold text-black mt-1">
                                {coupon.code}
                              </h2>
                            </div>

                            <div className="h-[40px] w-[40px] min-w-[40px] border border-gray-300 rounded-full flex items-center justify-center overflow-hidden p-[3px]">
                              <Link to="/home">
                                <img
                                  src={logo}
                                  alt="Logo"
                                  className="w-full h-full object-contain"
                                />
                              </Link>
                            </div>
                          </div>

                          {coupon.description && (
                            <p className=" sec-text-color font-medium text-[12px] mt-[9px] " >
                              {coupon.description}
                            </p>
                          )}

                          {Number(
                            coupon.min_purchase_amount || 0
                          ) > 0 && (
                            <p className=" text-[11px] text-gray-500 mt-[3px] ">
                              Min order ₹
                              {coupon.min_purchase_amount}
                            </p>
                          )}

                          {/* Terms */}
                          <p className="text-[12px] font-medium text-[var(--primary-color)] mt-[6px] cursor-pointer hover:underline" >
                            *Terms & conditions
                          </p>

                          {/* Apply */}
                          <div className="mt-4">
                            <Button
                              onClick={() => handleApplyCoupon(coupon.code)}
                              className="w-full text-black !text-[12px] font-bold !py-[7px] rounded-full transition"
                              variant="outline"
                            >
                              {isApplied ? "Applied" : "Apply Code"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* <div className=" shrink-0 border-t border-gray-200 bg-white px-5 py-3" >
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className=" w-full text-[13px] font-semibold  text-gray-600 py-2 "
              >
                Close
              </button>
            </div> */}
            <div className=" shrink-0 border-t border-theme bg-white px-5 py-3 " >
              <p className="text-[11px] text-gray-500 text-center">
                Coupons are applicable based on your cart items and minimum order
                value.
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
