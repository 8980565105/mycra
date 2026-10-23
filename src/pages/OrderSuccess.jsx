import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "../components/ui/Button";
import Row from "../components/ui/Row";

export default function OrderSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <Row className=" pt-[25px] custom-lg:pt-[50px]">
      <div className="mx-auto max-w-3xl">

        {/* Confirmation card */}
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50 shadow-sm">

          {/* Success heading */}
          <div className="border-b light-border px-5 py-8 text-center sm:px-10">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-green-600"
                aria-hidden="true"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>

            <h1 className=" text-[20px] md:text-[30px] font-bold text-gray-900 sm:text-3xl">
              Thank you! Your order has been placed.
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 sec-text-color text-14">
              We have received your order. You can view your order details
              and track its status from your account.
            </p>
          </div>

          {/* Order information */}
          <div className="p-5 sm:p-8">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
              <p className="text-sm text-gray-500">
                Order ID
              </p>

              <p className="mt-1 break-all text-base font-semibold text-gray-900">
                {id || "Order ID unavailable"}
              </p>

              <p className="mt-3 text-xs leading-5 text-gray-500">
                Keep this ID for your reference. Open your order history
                to see the latest order information.
              </p>
            </div>

            {/* Next steps */}
            <div className="mt-7">
              <h2 className="text-lg font-semibold text-gray-900">
                What happens next?
              </h2>

              <div className="mt-5 space-y-5">

                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-700">
                    <span className="font-semibold">1</span>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900">
                      Order confirmation
                    </h3>
                    <p className="mt-1 text-sm leading-5 text-gray-600">
                      Your order has been submitted successfully.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-700">
                    <span className="font-semibold">2</span>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900">
                      Processing and shipping
                    </h3>
                    <p className="mt-1 text-sm leading-5 text-gray-600">
                      Follow the order status in your account as it
                      progresses through fulfillment.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                    variant="common"
                    onClick={() => navigate("/my-account/orders")}
                    className="flex-1"
                >
                    VIEW MY ORDERS
                </Button>
                <Button
                    variant="outline"
                    onClick={() => navigate("/home")}
                    className="flex-1"
                >
                    CONTINUE SHOPPING
                </Button>
            </div>

            <p className="mt-6 text-center text-14 leading-5 sec-text-color">
              Need help? Contact our customer support team.
            </p>
          </div>
        </section>
      </div>
    </Row>
  );
}