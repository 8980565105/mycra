const mongoose = require("mongoose");
const Payment = require("../models/Payment");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const ProductVariant = require("../models/ProductVariant");
const { sendOrderPlaced, sendAdminNewOrder } = require("./orderEmailService");
const getCustomerInfo = (order) => {
  const email = order.user_id?.email || null;
  const name =
    order.user_id?.name ||
    `${order.shippingAddress?.firstName || ""} ${order.shippingAddress?.lastName || ""}`.trim() ||
    "Customer";
  return { email, name };
};
const pushHistory = (order, status, changedBy = "admin", note = "") => {
  order.status_history.push({ status, changed_by: changedBy, note });
};
async function finalizeOrderFromPaymentIntent(paymentIntentId) {
  const payment = await Payment.findOneAndUpdate(
    {
      stripe_payment_intent_id: paymentIntentId,
      order_id: null,
      _locked: { $ne: true },
    },
    { $set: { _locked: true } },
    { new: true },
  );

  if (!payment) {
    const existing = await Payment.findOne({
      stripe_payment_intent_id: paymentIntentId,
    });
    if (existing?.order_id) {
      const order = await Order.findById(existing.order_id);
      return { order, payment: existing, alreadyProcessed: true };
    }
    return { order: null, payment: existing, processing: true };
  }
  try {
    const checkout = payment.checkout_data;
    if (!checkout) throw new Error("Checkout data not found");
    const { user_id, items, total_price, coupon_id, shippingAddress } =
      checkout;
    if (!user_id || !Array.isArray(items) || !items.length) {
      throw new Error("Invalid checkout data");
    }
    const orderItems = [];
    let store_owner_id = null;
    for (const item of items) {
      const variant = await ProductVariant.findById(item.variant_id).populate(
        "product_id",
      );
      if (!variant) throw new Error("Product variant not found");
      if (variant.stock_quantity < Number(item.quantity)) {
        throw new Error(`Not enough stock for ${variant.sku}`);
      }
      if (!store_owner_id && variant.product_id) {
        store_owner_id =
          variant.product_id.storeId?._id ||
          variant.product_id.storeId ||
          variant.product_id.createdBy?._id ||
          variant.product_id.createdBy;
      }

      variant.stock_quantity -= Number(item.quantity);
      await variant.save();

      orderItems.push({
        product_id: variant.product_id._id,
        variant_id: variant._id,
        quantity: Number(item.quantity),
        price_at_order: item.price,
      });
    }

    const order = new Order({
      user_id,
      total_price: Number(total_price),
      coupon_id: coupon_id || null,
      shippingAddress,
      payment_method: "Online",
      payment_status: "paid",
      transaction_id: paymentIntentId,
      status: "pending",
      store_owner_id: store_owner_id || null,
    });
    pushHistory(
      order,
      "pending",
      "customer",
      "Online payment successful - order placed",
    );
    const savedOrder = await order.save();

    await OrderItem.insertMany(
      orderItems.map((i) => ({ ...i, order_id: savedOrder._id })),
    );

    payment.order_id = savedOrder._id;
    payment.status = "completed";
    payment.payment_date = new Date();
    payment._locked = false;
    await payment.save();

    const populatedOrder = await Order.findById(savedOrder._id).populate(
      "user_id",
      "name email",
    );
    const { email, name } = getCustomerInfo(populatedOrder);
    sendOrderPlaced(populatedOrder, email, name);
    sendAdminNewOrder(populatedOrder, name, email);

    return { order: savedOrder, payment, alreadyProcessed: false };
  } catch (err) {
    payment._locked = false;
    await payment.save().catch(() => {});
    throw err;
  }
}

module.exports = { finalizeOrderFromPaymentIntent, getCustomerInfo };
