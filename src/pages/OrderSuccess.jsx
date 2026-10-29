import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrder } from "../features/orders/orderThunk";
import Button from "../components/ui/Button";
import Section from "../components/ui/Section";
import Row from "../components/ui/Row";

export default function OrderSuccess() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { order, loading, error } = useSelector(
    (state) => state.orders
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchOrder(id));
    }
  }, [dispatch, id]);

  const formatPrice = (price) =>
  `₹ ${Number(price || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
  if (!id) {
    return (
      <div className="p-10 text-center">
        <p className="mb-4">Order ID not found.</p>
        <Button
          variant="common"
          onClick={() => navigate("/my-account/orders")}
        >
          Check My Orders
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-600">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-10 text-center">
        <p className="mb-4">
          {error || "Order details not found."}
        </p>
        <Button
          variant="common"
          onClick={() => navigate("/my-account/orders")}
        >
          Check My Orders
        </Button>
      </div>
    );
  }

  // fetchOrder now returns order fields with items attached.
  const orderData = order;

  const items = Array.isArray(orderData?.items)
    ? orderData.items
    : [];

  const isCOD = ["cod", "cash on delivery"].includes(
    String(orderData?.payment_method || "").toLowerCase()
  );

  const isPaid =
    String(orderData?.payment_status || "").toLowerCase() === "paid";

  const orderNumber =
    orderData?.order_number || orderData?._id || id;

 
const itemsSubtotal = items.reduce((sum, item) => {
  const variant = item.variant_id || item.variant || {};

  const quantity = Number(item.quantity ?? item.qty ?? 1);

  const unitPrice = Number(
    item.price_at_order ??
    item.price ??
    item.unit_price ??
    variant.offerprice ??
    variant.price ??
    0
  );

  return sum + unitPrice * quantity;
}, 0);

const rawApiTotal =
  orderData?.total_price ??
  orderData?.total_amount ??
  orderData?.total;

const total =
  rawApiTotal != null && Number.isFinite(Number(rawApiTotal))
    ? Number(rawApiTotal)
    : itemsSubtotal;

const otherCharges = total - itemsSubtotal;

const orderTotal = Number(order?.order_total ?? order?.total_price ?? 0);
const giftCardRedeemed = Number(order?.gift_card_redeemed ?? 0);
const amountPaid = Number(order?.amount_payable ?? order?.total_price ?? 0);

  return (
    <Section className="!py-8 md:!py-12">
      <Row>
        <div className="w-full max-w-5xl mx-auto rounded-[10px] border border-blue-100 bg-white shadow-md overflow-hidden ">
          {/* Success content */}
          <div className="rounded-[10px] bg-gray-50 px-4 py-10 text-center sm:px-8 md:py-12">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary-color)] text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-9 w-9"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m5 12 4 4L19 6"
                />
              </svg>
            </div>

            <h1 className="mb-3 text-[20px] md:text-[30px] font-semibold text-gray-900 sm:text-3xl">
              Thank you for your purchase
            </h1>

            <p className="text-[14px] md:text-[16px] sec-text-color ">
              We've received your order. It will ship in 5–7
              business days.
            </p>

            <p className="mt-1 text-[14px] md:text-[16px] sec-text-color">
              Your order number is{" "}
              <span className="font-medium ">
                #{orderNumber}
              </span>
            </p>

            {/* Order summary */}
            <div className="mx-auto mt-8 w-full max-w-3xl min-w-0 rounded-xl bg-white p-3 text-left shadow-sm sm:p-5">
              <h2 className="mb-4 text-[18px] md:text-[24px] font-medium text-black">
                Order Summary
              </h2>

              {items.length > 0 ? (
                <div>
                  {items.map((item, index) => {
                    const product =
                      item.product_id || item.product || {};

                    const variant =
                      item.variant_id || item.variant || {};

                    const name =
                      product.name ||
                      product.product_name ||
                      product.title ||
                      "Product";

                    // Your API stores product images on variant_id.images.
                    const image =
                      product.image ||
                      product.image_url ||
                      product.thumbnail ||
                      product.product_image ||
                      (Array.isArray(variant.images)
                        ? variant.images[0]
                        : "") ||
                      variant.image ||
                      variant.image_url ||
                      "";

                    const quantity = Number(
                      item.quantity ?? item.qty ?? 1
                    );

                    const unitPrice = Number(
                      item.price_at_order ??
                      item.price ??
                      item.unit_price ??
                      variant.offerprice ??
                      variant.price ??
                      product.price ??
                      0
                    );

                    const lineTotal = Number(
                      item.subtotal ??
                      item.line_total ??
                      item.total_price ??
                      unitPrice * quantity
                    );

                    // Convert backend-relative image paths to absolute URLs.
                    const imageUrl = image
                      ? /^https?:\/\//i.test(image)
                        ? image
                        : `http://localhost:5000${
                            image.startsWith("/") ? "" : "/"
                          }${image}`
                      : "";

                    return (
                      <div
                        key={item._id || item.id || index}
                        className="flex items-center gap-3 border-b border-gray-200 py-3 last:border-b-0"
                      >
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden bg-gray-100 sm:h-16 sm:w-16">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={name}
                              className="h-full w-full object-fit"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <span className="text-xs text-gray-400">
                              No image
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1 overflow-hidden">
                          <p className="block w-full overflow-hidden text-ellipsis whitespace-nowrap text-[14px] md:text-[16px] sec-text-color">
                            {name}
                          </p>
                        </div>

                        <p className="shrink-0 text-[14px] md:text-[16px] font-medium">
                          {formatPrice(lineTotal)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="py-4 text-sm text-gray-500">
                  No product items were found for this order.
                </p>
              )}

              
              {/* Product subtotal */}
        
            <div className="mt-2 flex w-full min-w-0 items-start justify-between gap-3 border-t border-gray-200 pt-4">
              <span className="min-w-0 flex-1 break-words text-[14px] md:text-[16px] sec-text-color">
                Product subtotal
              </span>

              <span className="shrink-0 text-right text-[14px] md:text-[16px] font-medium tabular-nums">
                {formatPrice(orderTotal)}
              </span>
            </div>

            {/* Additional charges or adjustments */}
            {Math.abs(giftCardRedeemed) > 0.009 && (
              <div className="mt-2 flex w-full min-w-0 items-start justify-between gap-3">
                <span className="min-w-0 flex-1 break-words text-[14px] md:text-[16px] sec-text-color">
                  Other Shipment charges
                </span>

                <span className="shrink-0 text-right text-[14px] md:text-[16px]font-medium tabular-nums">
                  {formatPrice(giftCardRedeemed)}
                </span>
              </div>
            )}

            {/* Final order total */}
            <div className="mt-3 flex w-full min-w-0 items-center justify-between gap-3 border-t border-gray-200 pt-3">
              <span className="min-w-0 flex-1 break-words font-semibold text-black sm:text-base">
                Total
              </span>

              <span className="shrink-0 text-right text-base font-semibold tabular-nums sm:text-lg">
                {formatPrice(amountPaid)}
              </span>
            </div>

  
            </div>

            {/* Back to home */}
            <Button
              type="button"
              variant="common"
              onClick={() => navigate("/")}
              className="mt-7"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </Row>
    </Section>
  );
}