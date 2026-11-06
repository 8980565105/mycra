import React, { useEffect, useState, useRef } from "react";
import OrderCardMobile from "./OrderCardMobile";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MessageCircleMore,
  MoreVertical,
  Search,
  SlidersHorizontal,
  SortDesc,
  Eye,
  X,
  Star,
  Trash2,
  FileText,
  History,
  Package,
  MapPin,
  CreditCard,
  User,
  Download,
} from "lucide-react";
import sortImg from "../../assets/sorting.png";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserOrders, cancelOrder } from "../../features/orders/orderThunk";
import { addReview } from "../../features/reivews/reviewsThunk";
import { resetReviewStatus } from "../../features/reivews/reviewsSlice";
import toast, { Toaster } from "react-hot-toast";
import Button from "../ui/Button"
import jsPDF from "jspdf";
import OrderPdf from "./OrderPdf";

export default function Orders() {
  const dispatch = useDispatch();
  const limit = 5;
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [openActionId, setOpenActionId] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailType, setDetailType] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const cancelReasons = [
    "Ordered by mistake",
    "Found a better price",
    "Delivery is taking too long",
    "Changed my mind",
    "Ordered wrong product",
    "Other",
  ];

  const canCancelOrder = (order) => {
    // return ["pending", "processing"].includes(
    //   String(order?.status || "").toLowerCase()
    // );
    const status = String(order?.status || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");

    const allowedStatuses = [
      "pending",
      "processing",
      "confirmed",
      "placed",
    ];

    return allowedStatuses.includes(status);
  };
  const openDetailModal = (order, type) => {
    setSelectedOrder(order);
    setDetailType(type);
    setOpenActionId(null);
    setIsDetailOpen(true);
  };

  const closeDetailModal = () => {
    setSelectedOrder(null);
    setDetailType("");
    setIsDetailOpen(false);
  };
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    title: "",
    comment: "",
    product_id: "",
  });
  const { success: reviewSuccess, loading: reviewLoading } = useSelector(
    (state) => state.reviews,
  );
  const sortRef = useRef(null);
  const filterRef = useRef(null);
  const actionRef = useRef(null);
  useEffect(() => {
  const userStr = localStorage.getItem("user");

  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      setLoggedInUser(user);
    } catch (error) {
      console.error("Invalid user data in localStorage:", error);
      setLoggedInUser(null);
    }
  }
}, []);
  const getUserDetail = (field) => {
    if (!loggedInUser) return "N/A";

    return (
      loggedInUser[field] ||
      loggedInUser.user?.[field] ||
      loggedInUser.customer?.[field] ||
      "N/A"
    );
  };
  useEffect(() => {
    if (reviewSuccess) {
      toast.success("Review submitted successfully!", {
        position: "top-center",
      });
      setIsReviewOpen(false);
      setReviewData({ rating: 5, title: "", comment: "", product_id: "" });
      dispatch(resetReviewStatus());
    }
  }, [reviewSuccess, dispatch]);
  const openReviewModal = (order) => {
    if (order.status !== "completed") {
      toast.error("You can only review completed orders.", {
        position: "top-center",
      });
      return;
    }
    const rawProd =
      order.products?.[0]?.product_id ||
      order.products?.[0]?.product ||
      order.items?.[0]?.product_id ||
      order.items?.[0]?.product;
    const productId =
      typeof rawProd === "object" ? rawProd?._id || rawProd?.id : rawProd;

    setSelectedOrder(order);
    setReviewData({ ...reviewData, product_id: productId });
    setIsReviewOpen(true);
  };
  const handleReviewSubmit = (e) => {
    e.preventDefault();
    const userStr = localStorage.getItem("user");
    const userObj = userStr ? JSON.parse(userStr) : null;
    const userId = userObj?._id || userObj?.id;

    const targetProductId =
      typeof reviewData.product_id === "object"
        ? reviewData.product_id?._id || reviewData.product_id?.id
        : reviewData.product_id;

    const finalData = {
      ...reviewData,
      product_id: targetProductId,
      user_id: userId,
      is_approved: true,
    };

    dispatch(addReview(finalData));
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setIsSortOpen(false);
      }
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
      if (!event.target.closest("[data-action-menu]")) {
        setOpenActionId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const {
    orders = [],
    total = 0,
    loading,
  } = useSelector((state) => state.orders);
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  useEffect(() => {
    dispatch(fetchUserOrders({ page, limit }));
  }, [dispatch, page]);
  const filteredOrders = (orders || []).filter((order) => {
    const matchesSearch = JSON.stringify(order)
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesPayment =
      paymentFilter === "all" || order.payment_method === paymentFilter;
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesPayment && matchesStatus;
  });
  const statusOptions = [
    "pending",
    "completed",
    "processing",
    "packed",
    "ready_to_ship",
    "shipped",
    "in_transit",
    "cancelled",
  ];

  const totalPages = Math.ceil(total / limit);

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

  const handleCancelOrder = async () => {
    if (!selectedOrder?._id) {
      toast.error("Order not found");
      return;
    }

    if (!canCancelOrder(selectedOrder)) {
      toast.error("This order cannot be cancelled now");
      return;
    }

    if (!cancelReason.trim()) {
      toast.error("Please select a cancellation reason");
      return;
    }

    try {
      setCancelLoading(true);

      await dispatch(
        cancelOrder({orderId: selectedOrder._id, reason: cancelReason})
      ).unwrap();

      toast.success("Order cancelled successfully");

      setIsCancelOpen(false);
      setSelectedOrder(null);
      setCancelReason("");

      await dispatch(fetchUserOrders({ page, limit })).unwrap();
    } catch (error) {
      toast.error(
        typeof error === "string" ? error : error?.message || "Failed to cancel order"
      );
    } finally {
      setCancelLoading(false);
    }
  };

  const openCancelModal = (order) => {
    if (!canCancelOrder(order)) {
      toast.error("This order cannot be cancelled now");
      return;
    }

    setSelectedOrder(order);
    setCancelReason("");
    setIsCancelOpen(true);
  };

  const openViewModal = (order) => {
    setSelectedOrder(order);
    setIsViewOpen(true);
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setIsViewOpen(false);
    setIsCancelOpen(false);
    setCancelReason("");
  };
  if (loading) return <p className="text-center py-10">Loading orders...</p>;

 const downloadOrderPdf = (order) => {
  try {
    const orders = OrderPdf({
      order,
      getUserDetail,
      formatDate,
    });

    const success = orders.generateOrderPdf();

    if (success) {
      toast.success("Order Pdf downloaded successfully!", {
          position: "top-center",
        }
      );

      setOpenActionId(null);
    } else {
      toast.error("Failed to generate Pdf.", {
          position: "top-center",
        }
      );
    }
  } catch (error) {
    console.error("Download Pdf error:", error);
    toast.error("Failed to generate Pdf.", {
        position: "top-center",
      }
    );
  }
};
  return (
    <div>
      <Toaster position="top-center" />
      <div className="w-full flex flex-row items-center justify-between gap-3 sm:gap-5 mb-[18px]">
        <div className="w-[226px] flex items-center box-shadow rounded-[3px] px-[10px] py-[6px]">
          <Search className="text-[#BCBCBC] mr-[15px]" size={20} />
          <input
            type="text"
            placeholder="Search anything.."
            className="w-full outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-[10px] sm:gap-[17px]">
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => {
                setIsFilterOpen(!isFilterOpen);
                setIsSortOpen(false);
              }}
              className={`w-full md:w-[120px] flex items-center justify-between text-p box-shadow px-[10px] py-[6px] transition ${isFilterOpen ? "bg-[var(--secondary-color)] text-[var(--primary-color)]" : "bg-[var(--primary-color)] text-white hover:bg-[var(--secondary-color)] hover:text-[var(--primary-color)]"}`}
            >
              <span className="hidden md:inline capitalize">Filter by </span>
              <SlidersHorizontal size={18} />
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-50 max-h-[250px] overflow-y-auto no-scrollbar">
                <button
                  onClick={() => {
                    setStatusFilter("all");
                    setIsFilterOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-[var(--primary-color)] ${statusFilter === "all" ? "bg-[var(--theme-hover-color)] text-white" : "text-light hover:text-white"}`}
                >
                  All Status
                </button>
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status);
                      setIsFilterOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-[var(--primary-color)] capitalize ${statusFilter === status ? "bg-[var(--theme-hover-color)] text-white" : "text-light hover:text-white"}`}
                  >
                    {status.replace("_", " ")}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative" ref={sortRef}>
            <button
              onClick={() => {
                setIsSortOpen(!isSortOpen);
                setIsFilterOpen(false);
              }}
              className={`w-full md:w-[120px] flex items-center justify-between text-p box-shadow px-[10px] py-[6px] transition ${isSortOpen ? "bg-[var(--secondary-color)] text-[var(--primary-color)]" : "bg-[var(--primary-color)] text-white hover:bg-[var(--secondary-color)] hover:text-[var(--primary-color)]"}`}
            >
              <span className="hidden md:inline capitalize">Sort by</span>
              <SortDesc size={18} />
            </button>

            {isSortOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <button
                  onClick={() => {
                    setPaymentFilter("all");
                    setIsSortOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-[var(--theme-hover-color)] ${paymentFilter === "all" ? " bg-[var(--theme-hover-color)] text-white" : "text-light hover:text-white"}`}
                >
                  All Orders
                </button>
                <button
                  onClick={() => {
                    setPaymentFilter("Online");
                    setIsSortOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-[var(--theme-hover-color)] ${paymentFilter === "Online" ? " bg-[var(--theme-hover-color)] text-white" : "text-light hover:text-white"}`}
                >
                  Online Payment
                </button>
                <button
                  onClick={() => {
                    setPaymentFilter("COD");
                    setIsSortOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-[var(--theme-hover-color)] ${paymentFilter === "COD" ? "bg-[var(--theme-hover-color)] text-white" : "text-light hover:text-white"}`}
                >
                  Cash on Delivery
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <table className="hidden min-[980px]:table w-full box-shadow rounded-[10px] border-collapse">
        <thead className="light-color text-20px text-dark">
          <tr>
            <th className="p-[12px] px-[30px] py-[10px] text-left font-normal rounded-tl-[10px]">
              #
            </th>
            <th className="p-[12px] py-[10px] text-left flex gap-[7px] items-center font-normal">
              Order No.{" "}
              <img src={sortImg} className="h-[14px] w-[14px]" alt="sort" />
            </th>
            <th className="p-[12px] py-[10px] text-left font-normal">Date</th>
            <th className="p-[12px] py-[10px] text-left font-normal">Price</th>
            <th className="p-[12px] py-[10px] text-left font-normal">Paid</th>
            <th className="p-[12px] py-[10px] text-left font-normal">
              Address
            </th>
            <th className="p-[12px] py-[10px] text-left font-normal">Status</th>
            <th className="p-[12px] py-[10px] px-[30px] text-center font-normal rounded-tr-[10px]">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order, index) => (
              <tr
                key={order._id}
                className="border-b light-border border-0.5 text-p sec-text-color last:border-b-0 break"
              >
                <td className="p-3 px-[30px] h-[75px]">
                  {index + 1 + (page - 1) * limit}
                </td>
                <td className="p-3 h-[75px]">
                  {order.order_number || order._id}
                </td>
                <td className="p-3 h-[75px]">{formatDate(order.createdAt)}</td>
                <td className="p-3 h-[75px]">
                  ₹{order.total_price?.toLocaleString()}
                </td>

                <td className="p-3 h-[75px]">
                  <span
                    className={`flex justify-center items-center px-2 py-1 text-[12px] font-medium rounded-[3px] w-[60px] ${order.payment_method === "Online"
                        ? "bg-[rgba(62,232,99,10%)] text-[#3EE878]"
                        : "bg-[rgba(235,23,36,10%)] text-[#EB1724]"
                      }`}
                  >
                    {order.payment_method}
                  </span>
                </td>
                <td className="p-3 h-[75px]">
                  {order.shippingAddress?.address
                    ? `${order.shippingAddress.address.slice(0, 15)}...`
                    : "-"}
                </td>
                <td className="p-3 h-[75px]">
                  <span
                    className={`flex justify-center items-center px-2 py-2 text-[12px] font-medium rounded-[3px] w-[98px] ${order.status === "completed"
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
                </td>
                <td className="p-3 px-[30px] h-[75px] flex w-full justify-end">
                  <div className="inline-flex items-center gap-[5px] sec-text-color">
                    <button onClick={() => openReviewModal(order)}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-[#999] transition hover:bg-gray-100 hover:text-gray-700">
                      <MessageCircleMore size={20} />
                    </button>
                    <button onClick={() => openViewModal(order)}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-[#999] transition hover:bg-gray-100 hover:text-gray-700">
                      <Eye size={20} />
                    </button>
                    {canCancelOrder(order) && (
                      <button
                        type="button"
                        onClick={() => openCancelModal(order)}
                        title="Cancel Order"
                        className="flex h-8 w-8 items-center text-red-500 justify-center rounded-md text-[#999] transition hover:bg-gray-100 hover:text-gray-700"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                    <div className="relative" data-action-menu>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenActionId((prev) => prev === order._id ? null : order._id);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-[#999] transition hover:bg-gray-100 hover:text-gray-700"
                        title="More Actions"
                      >
                        <MoreVertical size={20} />
                      </button>

                      {openActionId === order._id && (
                        <div className="absolute right-0 top-[38px] z-[100] w-[220px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl">
                          <button
                            type="button"
                            onClick={() => openDetailModal(order, "customer")}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <User size={17} />
                            <span>Customer Details</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openDetailModal(order, "shipping")}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <MapPin size={17} />
                            <span>Shipping Details</span>
                          </button>

                          <div className="border-t border-gray-100">
                            <button
                              type="button"
                              onClick={() => downloadOrderPdf(order)}
                              className="flex w-full items-center gap-3 px-4 py-3 -left text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Download size={17} />
                              <span>Download Order PDF</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center py-6 text-gray-400">No results found.</td>
            </tr>
          )}

          {totalPages > 1 && (
            <tr>
              <td colSpan="8" className="px-[30px] py-[20px]">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-14 sec-text-color">
                  <p className="sec-text-color text-p">
                    Showing <span>{total === 0 ? 0 : start}</span> to{" "}
                    <span>{end}</span> of <span>{total}</span> entries
                  </p>
                  <div className="flex items-center gap-[10px]">
                    <button
                      className="flex gap-[8px] items-center text-light text-p mr-[10px]"
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeftIcon size={16} /> Back
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={`w-[34px] h-[34px] text-light p-1 text-14 rounded-[3px] ${page === i + 1 ? "light-color " : "box-shadow"}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      className="flex gap-[8px] items-center text-light text-p ml-[10px]"
                      onClick={() =>
                        setPage((p) => Math.min(p + 1, totalPages))
                      }
                      disabled={page === totalPages}
                    >
                      Next <ChevronRightIcon size={16} />
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
                    {isDetailOpen && selectedOrder && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
                        <div className="w-full max-w-[600px] max-h-[85vh] overflow-hidden rounded-xl bg-white shadow-2xl max-h-[65vh] overflow-y-auto no-scrollbar ">
                          <div className="flex items-center justify-between border-b p-5">
                            <div>
                              <h3 className="text-20px font-semibold text-black ">
                                {detailType === "customer" && "Customer Details"}
                                {detailType === "shipping" && "Shipping Details"}
                              </h3>

                            </div>

                            <button
                              type="button"
                              onClick={closeDetailModal}
                              className="rounded-full text-gray-500 transition hover:text-black"
                            >
                              <X size={22} />
                            </button>
                          </div>

                          <div className="p-6">

                            {detailType === "customer" && (
                              <div className="gap-4 grid grid-cols-2 text-black">
                                <div className="rounded-lg bg-gray-50 p-4">
                                  <p className="text-sm">
                                    Customer Name
                                  </p>

                                  <p className="mt-1 text-[14px]  sec-text-color">
                                    {selectedOrder.user_id?.name || selectedOrder.customer?.name ||
                                      selectedOrder.user?.name || getUserDetail("name")}
                                  </p>
                                </div>

                                <div className="rounded-lg bg-gray-50 p-4">
                                  <p className="text-sm ">
                                    Email
                                  </p>

                                  <p className="mt-1 text-[14px] sec-text-color">
                                    {selectedOrder.user_id?.email || selectedOrder.customer?.email ||
                                      selectedOrder.user?.email || getUserDetail("email")}
                                  </p>
                                </div>

                                <div className="rounded-lg bg-gray-50 p-4">
                                  <p className="text-sm ">
                                    Phone
                                  </p>

                                  <p className="mt-1 text-[14px] sec-text-color">
                                    {selectedOrder.shippingAddress?.phone || selectedOrder.user_id?.phone ||
                                      selectedOrder.customer?.phone || selectedOrder.user?.phone || getUserDetail("phone")}
                                  </p>
                                </div>

                              </div>
                            )}

                            {detailType === "shipping" && (
                              <div className="space-y-4 text-black">

                                <div className="rounded-lg bg-gray-50 p-4">
                                  <p className="text-sm">
                                    Address
                                  </p>
                                  <p className="mt-1 text-[14px]  sec-text-color">
                                    {selectedOrder.shippingAddress?.address ||
                                      "No address provided"}
                                  </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                  <div className="rounded-lg bg-gray-50 p-4">
                                    <p className="text-sm ">
                                      City
                                    </p>
                                    <p className="mt-1 text-[14px] sec-text-color">
                                      {selectedOrder.shippingAddress?.city || "N/A"}
                                    </p>
                                  </div>

                                  <div className="rounded-lg bg-gray-50 p-4">
                                    <p className="text-sm ">
                                      State
                                    </p>
                                    <p className="mt-1 text-[14px] sec-text-color">
                                      {selectedOrder.shippingAddress?.state || "N/A"}
                                    </p>
                                  </div>

                                  <div className="rounded-lg bg-gray-50 p-4">
                                    <p className="text-sm ">
                                      Pincode
                                    </p>
                                    <p className="mt-1 text-[14px] sec-text-color">
                                      {selectedOrder.shippingAddress?.pincode ||
                                        selectedOrder.shippingAddress?.zip ||
                                        "N/A"}
                                    </p>
                                  </div>

                                  <div className="rounded-lg bg-gray-50 p-4">
                                    <p className="text-sm">
                                      Country
                                    </p>
                                    <p className="mt-1 text-[14px] sec-text-color">
                                      {selectedOrder.shippingAddress?.country || "N/A"}
                                    </p>
                                  </div>

                                </div>

                              </div>
                            )}

                          </div>

                          <div className="flex justify-end border-t p-4">
                            <Button
                              type="button"
                              variant="common"
                              onClick={closeDetailModal}
                              className="!p-[10px]"
                            >
                              Close
                            </Button>
                          </div>

                        </div>
                      </div>
                    )}
      {isViewOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
          <div className="bg-white w-[90%] max-w-[600px] rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-300 overflow-y-auto max-h-[65vh] no-scrollbar">
            <div className="flex items-center justify-between p-5 border-b">
              <div>
                <h3 className="text-20px font-semibold text-black ">Order Details</h3>
                <p className="mt-1 text-[12px] sec-text-color">
                  OrderId: {selectedOrder.order_id || selectedOrder._id}
                </p>
                </div>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-black"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm ">Status</p>
                  {/* <p className="capitalize font-medium text-blue-600">
                    {selectedOrder.status}
                  </p> */}
                  <span
                    className={`inline-flex justify-center items-center mt-1 p-1 text-[12px] font-medium rounded-[5px] min-w-[80px] capitalize ${
                      selectedOrder.status === "completed"
                        ? "bg-[rgba(62,232,99,10%)] text-[#3EE878]"
                        : selectedOrder.status === "pending"
                          ? "bg-[rgba(235,23,36,10%)] text-[#EB1724]"
                          : selectedOrder.status === "cancelled"
                            ? "bg-[rgba(239,68,68,10%)] text-red-500"
                            : selectedOrder.status === "shipped"
                              ? "bg-purple-100 text-purple-700"
                              : selectedOrder.status === "ready_to_ship"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {selectedOrder.status?.replace("_", " ")}
                  </span>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm ">Total Price</p>
                  <p className="text-[14px] leading-6 sec-text-color mt-1">
                    ₹{selectedOrder.total_price?.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm">Total Price</p>
                  <p className="text-[14px] leading-6 sec-text-color mt-1">
                    ₹{(selectedOrder.total_price * 0.1).toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm ">Payment Method</p>
                  <p className="text-[14px] leading-6 sec-text-color mt-1">
                    {selectedOrder.payment_method || "N/A"}
                  </p>
                </div>
              </div>
               <div className=" rounded-lg bg-gray-50 p-4">
                  <p className="text-sm ">Shipping Address</p>
                  <p className="text-[14px] leading-6 sec-text-color mt-1">
                    {selectedOrder.shippingAddress?.address ||
                      "No address provided"}
                  </p>
                </div>
            </div>
            <div className="p-4 border-t flex justify-end">
              <Button
                variant="common"
                onClick={closeModal}
                className="!p-[10px]"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {isCancelOpen && selectedOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4">

          <div className="bg-white w-full max-w-[450px] rounded-xl p-6 shadow-2xl">

            <div className="text-red-500 flex justify-center mb-4">
              <Trash2 size={42} />
            </div>

            <h3 className="text-xl font-bold mb-2 text-center text-gray-800">
              Cancel Order?
            </h3>

            <p className="text-gray-500 mb-5 text-sm text-center">
              Are you sure you want to cancel this order?
            </p>

            <div className="bg-gray-50 rounded-lg p-3 mb-5 text-left">
              <p className="text-sm text-gray-500">Order Number</p>
              <p className="font-semibold text-gray-800">
                {selectedOrder.order_number || selectedOrder._id}
              </p>

              <p className="text-sm text-gray-500 mt-2">Payment Method</p>
              <p className="font-medium text-gray-800">
                {selectedOrder.payment_method || "N/A"}
              </p>
            </div>

            <div className="mb-5 text-left">
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Cancellation Reason *
              </label>

              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 outline-none"
              >
                <option value="">Select cancellation reason</option>

                {cancelReasons.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">

              <button
                type="button"
                disabled={cancelLoading}
                onClick={handleCancelOrder}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg
                hover:bg-red-700 disabled:bg-gray-400"
              >
                {cancelLoading ? "Cancelling..." : "Yes, Cancel"}
              </button>

              <button
                type="button"
                disabled={cancelLoading}
                onClick={closeModal}
                className="flex-1 px-4 py-3 border rounded-lg text-gray-600
                hover:bg-gray-50 disabled:opacity-50"
              >
                No, Keep it
              </button>

            </div>

          </div>
        </div>
      )}

      {isReviewOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-[480px] rounded-2xl p-0 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-5 border-b bg-gray-50">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  write reviews
                </h3>
              </div>
              <button
                onClick={() => setIsReviewOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="p-6 space-y-5">
              <div className="text-center py-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Rating
                </label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((num) => {
                    const isSelected = num <= reviewData.rating;
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() =>
                          setReviewData({ ...reviewData, rating: num })
                        }
                        className="transition-transform active:scale-90 duration-150"
                      >
                        <Star
                          size={36}
                          fill={isSelected ? "#FACC15" : "none"}
                          strokeWidth={1.5}
                          className={`${isSelected ? "text-yellow-400" : "text-gray-300"
                            } hover:text-yellow-400 transition-colors cursor-pointer`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
                  placeholder="write here title"
                  value={reviewData.title}
                  onChange={(e) =>
                    setReviewData({ ...reviewData, title: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Comment
                </label>
                <textarea
                  rows="4"
                  className="w-full border border-gray-300 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400 resize-none"
                  placeholder="write product reviews"
                  value={reviewData.comment}
                  onChange={(e) =>
                    setReviewData({ ...reviewData, comment: e.target.value })
                  }
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={reviewLoading}
                className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:bg-gray-400 disabled:shadow-none mt-2"
              >
                {reviewLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    submit
                  </span>
                ) : (
                  "Submit"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
      <OrderCardMobile
        orders={filteredOrders}
        total={filteredOrders.length}
        page={page}
        totalPages={totalPages}
        limit={limit}
        onPageChange={(newPage) => setPage(newPage)}
        downloadOrderPdf={downloadOrderPdf}
        onCancelOrder={openCancelModal}
        canCancelOrder={canCancelOrder}
      />
    </div>
  );
}
