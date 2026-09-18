//D:\mycara\frontend\src\components\userAccount\OrderCardMobile.jsx

import { useState } from "react";
import {
  ChevronDown,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUp,
  Download,
} from "lucide-react";
import sortImg from "../../assets/sorting.png";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";

export default function OrderCardMobile({
  orders,
  total,
  page,
  limit,
  onPageChange,
  totalPages,
  downloadOrderPdf
}) {
  const [openRow, setOpenRow] = useState(null);
  const reviews = useSelector((state) => state.reviews.reviews);
  const toggleRow = (id) => {
    setOpenRow(openRow === id ? null : id);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const formatted = date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const [day, month, year] = formatted.split(" ");
    return `${day} ${month}, ${year}`;
  };

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="block custom-lg:hidden [box-shadow:0_2px_4px_rgba(0,0,0,25%)] rounded-[10px] overflow-hidden">
      <div className="block">
        <div className="flex items-center gap-6 sm:gap-10 light-color text-20px text-dark font-normal p-2 px-[12px]">
          <span className="text-black text-p ">#</span>
          <span className="text-black text-p flex gap-[5px] items-center">
            Order Id
            <img src={sortImg} className="h-[14px] w-[14px]" />
          </span>
        </div>
      </div>

      {orders.map((order, index) => (
        <div key={order._id} className="border-b last:border-0">
          <div
            className="flex justify-between items-center px-[12px] py-[15px]"
            onClick={() => toggleRow(order._id)}
          >
            <div className="flex items-center gap-6 sm:gap-10">
              <span className="sec-text-color text-p ">{index + 1}</span>
              <span className="sec-text-color text-p break">
                {order.order_id || order._id}
              </span>
            </div>
            {openRow === order._id ? (
              <FontAwesomeIcon icon={faCaretUp} className="sec-text-color"/>
            ) : (
              <FontAwesomeIcon icon={faCaretDown} className="sec-text-color"/>
            )}
          </div>

          {/* Expanded Details */}
          {openRow === order._id && (
            // <div className="flex flex-col gap-[10px] px-[46px] sm:px-[60px] pb-[20px] text-14 sec-text-color">
            <div className="px-[46px] sm:px-[60px] pb-[20px] text-14 sec-text-color mt-2 sm:mt-4">
            <div className="flex flex-col gap-[10px]">
              <p className="flex items-center gap-2">
                <span className="text-black w-[80px] inline-block">Date:</span>
                <span>{formatDate(order.createdAt)}</span>
              </p>

              <p className="flex items-center gap-2">
                <span className="text-black w-[80px] inline-block">Price:</span>
                <span>₹{order.total_price?.toLocaleString()}</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-black w-[80px] inline-block">Paid:</span>{" "}
                <span
                    className={`flex justify-center items-center px-2 py-1 text-[12px] font-medium rounded-[3px] w-[60px] ${order.payment_method === "Online"
                        ? "bg-[rgba(62,232,99,10%)] text-[#3EE878]"
                        : "bg-[rgba(235,23,36,10%)] text-[#EB1724]"
                      }`}
                  >
                    {order.payment_method}
                  </span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-black w-[80px] inline-block">
                  Address:
                </span>
                <span>{order.shippingAddress?.address || "-"}</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-black w-[80px] inline-block">
                  Status:
                </span>{" "}
                <span
                    className={`flex justify-center items-center px-2 py-1 text-[12px] font-medium rounded-[3px] w-[98px] ${order.status === "completed"
                        ? "bg-[rgba(62,232,99,10%)] text-[#3EE878]"
                        : order.status === "pending"
                          ? "bg-[rgba(235,23,36,10%)] text-[#EB1724]"
                          : order.status === "cancelled"
                            ? "bg-[rgba(239,68,68,10%)] text-red-500"
                            : order.status === "shipped"
                              ? " bg-purple-100 text-purple-700"
                              : order.status === "ready_to_ship"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-yellow-100 text-yellow-600"
                      }`}
                  >
                    {order.status}
                  </span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-black w-[80px] inline-block">
                  Comments:
                </span>
                <span>
                  {/* 1 Comments */}
                  {reviews?.length || 0} Comments
                </span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-black w-[80px] inline-block">
                    Order PDF:
                </span>
                <span>
                <button 
                    type="button"
                    onClick={() => downloadOrderPdf(order)}
                    className="flex w-full items-center text-left gap-2"
                  >
                    <Download size={17} strokeWidth={1.8}
                    />
                    <span>
                      Download PDF
                    </span>
                  </button>
                </span>
              </p>
            </div>
            </div>
          )}
        </div>
      ))}
      {totalPages > 1 && (
        <div className="flex justify-between items-center py-[18px] px-[12px] text-sm">
          <div className="flex flex-row justify-between items-center gap-3 text-14 sec-text-color w-full">
            <p className="sec-text-color text-p">
              Showing <span>{total === 0 ? 0 : start}</span> to{" "}
              <span>{end}</span> of <span>{total}</span> entries
            </p>
            <div className="flex items-center gap-[10px]">
              <button
                className="flex items-center gap-1 text-light text-p"
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
              >
                <ChevronLeftIcon size={16} />
              </button>
              <button
                className="flex items-center gap-1 text-light text-p"
                onClick={() => onPageChange(page + 1)}
              >
                <ChevronRightIcon size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
