const mongoose = require("mongoose");
const Settlement = require("../models/Settlement");
const Product = require("../models/Product");
const Payment = require("../models/Payment");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const ProductVariant = require("../models/ProductVariant");
const Cart = require("../models/Cart");
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
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

async function clearPurchasedCart(checkout) {
  if (!checkout?.cart_id || !checkout?.user_id) {
    console.warn("[Cart Clear] Missing cart_id or user_id", {
      hasCartId: Boolean(checkout?.cart_id),
      hasUserId: Boolean(checkout?.user_id),
    });
    return false;
  }

  const result = await Cart.updateOne(
    {
      _id: checkout.cart_id,
      user_id: checkout.user_id,
    },
    {
      $set: { items: [] },
    }
  );

  console.log("[Cart Clear]", {
    cartId: String(checkout.cart_id),
    userId: String(checkout.user_id),
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount,
  });

  if (result.matchedCount === 0) {
    console.error(
      "[Cart Clear] No matching cart found. Check cart_id and user_id."
    );
    return false;
  }

  return true;
}
async function finalizeOrderFromPaymentIntent(paymentIntentId) {
  const paymentIntent = await stripe.paymentIntents.retrieve(
    paymentIntentId
  );

  if (paymentIntent.status !== "succeeded") {
    throw new Error(
      `Cannot create order. Stripe status: ${paymentIntent.status}`
    );
  }


const existingOrder = await Order.findOne({
  transaction_id: paymentIntentId,
});

if (existingOrder) {
  payment.order_id = existingOrder._id;
  payment.status = "completed";
  payment.payment_date =
    payment.payment_date || new Date();
  payment._locked = false;

  await payment.save();

  try {
    await clearPurchasedCart(payment.checkout_data);
  } catch (error) {
    console.error(
      "[Cart Clear] Existing-order cleanup failed:",
      error.message
    );
  }

  return {
    order: existingOrder,
    payment,
    alreadyProcessed: true,
  };
}
  const payment = await Payment.findOneAndUpdate(
    {
      stripe_payment_intent_id: paymentIntentId,
      status: { $in: ["pending", "failed"] },
      order_id: null,
      _locked: { $ne: true },
    },
    { $set: { _locked: true } },
    { returnDocument: "after" }
  );

  if (!payment) {
    const existingPayment = await Payment.findOne({
      stripe_payment_intent_id: paymentIntentId,
    });

    if (existingPayment?.order_id) {
      const existingLinkedOrder = await Order.findById(
        existingPayment.order_id
      );

      if (existingLinkedOrder) {
        try {
          await clearPurchasedCart(existingPayment.checkout_data);
        } catch (error) {
          console.error("[Cart Clear] Existing order cleanup failed:", error.message);
        }

        return {
          order: existingLinkedOrder,
          payment: existingPayment,
          alreadyProcessed: true,
        };
      }
    }

    const existingOrder = await Order.findOne({
      transaction_id: paymentIntentId,
    });

    if (existingOrder && existingPayment) {
      existingPayment.order_id = existingOrder._id;
      existingPayment.status = "completed";
      existingPayment.payment_date =
        existingPayment.payment_date || new Date();
      existingPayment._locked = false;

      await existingPayment.save();

      try {
        await clearPurchasedCart(existingPayment.checkout_data);
      } catch (error) {
        console.error(
          "[Cart Clear] Recovery cleanup failed:",
          error.message
        );
      }

      return {
        order: existingOrder,
        payment: existingPayment,
        alreadyProcessed: true,
      };
    }

    return {
      order: null,
      payment: existingPayment,
      processing: true,
    };
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
    let store_owner_id = null;

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

      if (!store_owner_id) {
        store_owner_id = sellerId;
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

      variant.stock_quantity -= quantity;
      await variant.save();

      orderItems.push({
        product_id: product._id,
        variant_id: variant._id,
        quantity,
        price_at_order: price,
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
          // new: true,
          returnDocument: "after",
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

    try {
      const cleared = await clearPurchasedCart(checkout);

      if (!cleared) {
        console.error(
          "[Cart Clear] Order is confirmed, but cart cleanup needs retry.",
          {
            orderId: String(savedOrder._id),
            paymentIntentId,
          }
        );
      }
    } catch (error) {
      console.error(
        "[Cart Clear] Cleanup failed:",
        error.message
      );
    }

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