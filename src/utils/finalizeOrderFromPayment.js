const mongoose = require("mongoose");
const Settlement = require("../models/Settlement");
const Product = require("../models/Product");
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
    // let store_owner_id = null;
    const sellerGroups = new Map();
    let orderStoreId = null;

    for (const item of items) {
      const variant = await ProductVariant.findById(
        item.variant_id
      ).populate("product_id");

      if (!variant || !variant.product_id) {
        throw new Error("Product variant or product not found");
      }

      if (variant.stock_quantity < Number(item.quantity)) {
        throw new Error(`Not enough stock for ${variant.sku}`);
      }

      const product = variant.product_id;
      const sellerId = product.createdBy?._id || product.createdBy;

      if (!sellerId || !mongoose.isValidObjectId(sellerId)) {
        throw new Error(`Valid seller not found for product ${product.name}`);
      }

      const quantity = Number(item.quantity);
      const price = Number(item.price);

      if (!Number.isFinite(price) || price < 0 || quantity <= 0) {
        throw new Error("Invalid order item price or quantity");
      }

      const lineTotal = Number((price * quantity).toFixed(2));
      const sellerKey = sellerId.toString();

      if (!sellerGroups.has(sellerKey)) {
        sellerGroups.set(sellerKey, {
          store_owner_id: sellerId,
          gross_amount: 0,
          items: [],
        });
      }

      const group = sellerGroups.get(sellerKey);
      group.gross_amount = Number(
        (group.gross_amount + lineTotal).toFixed(2)
      );
      group.items.push({ product, quantity, lineTotal });

      if (!orderStoreId && product.storeId) {
        orderStoreId = product.storeId._id || product.storeId;
      }

      variant.stock_quantity -= quantity;
      await variant.save();

      orderItems.push({
        product_id: product._id,
        variant_id: variant._id,
        quantity,
        price_at_order: price,
      });
    }

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
    const commissionRate = Number(
      process.env.SETTLEMENT_COMMISSION_RATE ?? 0
    );

    if (
      !Number.isFinite(commissionRate) ||
      commissionRate < 0 ||
      commissionRate > 100
    ) {
      throw new Error("Invalid SETTLEMENT_COMMISSION_RATE");
    }

    const availableAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    );

    for (const group of sellerGroups.values()) {
      const grossAmount = Number(group.gross_amount.toFixed(2));

      const commissionAmount = Number(
        ((grossAmount * commissionRate) / 100).toFixed(2)
      );

      const netAmount = Number(
        (grossAmount - commissionAmount).toFixed(2)
      );

      await Settlement.findOneAndUpdate(
        {
          order_id: savedOrder._id,
          store_owner_id: group.store_owner_id,
        },
        {
          $setOnInsert: {
            order_id: savedOrder._id,
            payment_id: payment._id,
            store_owner_id: group.store_owner_id,
            gross_amount: grossAmount,
            commission_rate: commissionRate,
            commission_amount: commissionAmount,
            shipping_amount: 0,
            tax_amount: 0,
            refund_amount: 0,
            other_expenses: 0,
            net_amount: netAmount,
            currency: "INR",
            transaction_id: paymentIntentId,
            status: "pending",
            available_at: availableAt,
          },
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );
    }

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
