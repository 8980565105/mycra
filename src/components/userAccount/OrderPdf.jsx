import jsPDF from "jspdf";

const OrderPdf = ({ order, getUserDetail, formatDate }) => {
  const generateOrderPdf = () => {
    try {
      if (!order) {
        console.error("Order data is missing");
        return;
      }

      const doc = new jsPDF();

      const orderId = order.order_id || order._id || "N/A";

      const customerName =
        order.user_id?.name ||
        order.customer?.name ||
        order.user?.name ||
        getUserDetail?.("name") ||
        "Customer";

      const customerEmail =
        order.user_id?.email ||
        order.customer?.email ||
        order.user?.email ||
        getUserDetail?.("email") ||
        "N/A";

      const customerPhone =
        order.shippingAddress?.phone ||
        order.user_id?.phone ||
        order.customer?.phone ||
        order.user?.phone ||
        getUserDetail?.("phone") ||
        "N/A";

      const shippingAddress = order.shippingAddress?.address || "No address provided";
      const city = order.shippingAddress?.city || "";
      const state = order.shippingAddress?.state || "";
      const pincode = order.shippingAddress?.pincode || order.shippingAddress?.zip || "";
      const country = order.shippingAddress?.country || "";
      const paymentMethod = order.payment_method || "N/A";
      const orderStatus = order.status || "N/A";
      const totalPrice =  Number(order.total_price || 0);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.text("Oder", 20, 25);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      doc.text(`Order Date: ${formatDate?.(order.createdAt) || "-"}`, 140, 20);
      doc.text(`Order ID: ${orderId}`, 140, 27);

      doc.line(20, 35, 190, 35);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);

      doc.text("Customer Details", 20, 48);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      doc.text(`Name: ${customerName}`, 20, 57);
      doc.text(`Email: ${customerEmail}`, 20, 64);
      doc.text(`Phone: ${customerPhone}`, 20, 71);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);

      doc.text("Shipping Address", 20, 87);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      doc.text(`Address: ${shippingAddress}`, 20, 96);
      doc.text(`City: ${city}`, 20, 103);
      doc.text(`State: ${state}`, 20, 110);
      doc.text(`Pincode: ${pincode}`, 20, 117);
      doc.text(`Country: ${country}`, 20, 124);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);

      doc.text("Order Details", 20, 141);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      doc.text(`Payment Method: ${paymentMethod}`, 20, 150);
      doc.text(`Order Status: ${orderStatus}`, 20, 157);

      doc.line(20, 168, 190, 168);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);

      doc.text("Total Amount:", 120, 183);

      doc.text(`Rs. ${totalPrice.toLocaleString("en-IN")}`,
        185, 183, {
          align: "right",
        }
      );

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);

      doc.text("Thank you for your order.", 20, 205);
      doc.save(`Order-${orderId}.pdf`);

      return true;
    } catch (error) {
      console.error("Order generation error:", error);

      return false;
    }
  };

  return {
    generateOrderPdf,
  };
};

export default OrderPdf;