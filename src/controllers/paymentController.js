const Payment = require("../models/Payment");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const ProductVariant = require("../models/ProductVariant");
const Product = require("../models/Product");
const transection = require("../models/Transactions")
const Cart = require("../models/Cart");
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const { sendResponse } = require("../utils/response");
const {
  getPlatformCharge,
  getItemShipping,
} = require("../utils/calculateCharges");
const Coupon = require("../models/Coupon");

const {
  sendOrderPlaced,
  sendAdminNewOrder,
} = require("../utils/orderEmailService");
const mongoose = require("mongoose");

const saveCheckoutTransaction = async ({ payment, paymentIntent, orderId }) => {
  const charge =
    paymentIntent.latest_charge &&
    typeof paymentIntent.latest_charge === "object"
      ? paymentIntent.latest_charge
      : null;

  const gatewayMethod =
    charge?.payment_method_details?.type ||
    paymentIntent.payment_method_types?.[0];

  const paymentMode =
    gatewayMethod === "upi"
      ? "UPI"
      : gatewayMethod === "card"
        ? "Credit/Debit Card"
        : "Stripe";

  const amount = Number(payment.amount_paid);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Invalid payment amount for transaction history");
  }

  return transection.findOneAndUpdate(
    { referenceId: paymentIntent.id },
    {
      $setOnInsert: {
        user: payment.user_id,
        order_id: orderId,
        stripe_payment_intent_id: paymentIntent.id,
        stripe_charge_id: charge?.id || null,
        currency: paymentIntent.currency || "inr",
        amount,
        type: "Money sent",
        category: "Online Order",
        paymentMode,
        status: "Success",
        tab: "All",
        description: `Order ${orderId} paid via ${paymentMode}`,
        referenceId: paymentIntent.id,
      },
    },
    {
      upsert: true,
      returnDocument: "after",  
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  );
};

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

const getPayments = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search = "",
      isDownload = "false",
      status,
    } = req.query;

    const download = isDownload.toLowerCase() === "true";
    const userRole = req.user?.role;
    const userId = req.user?._id;
    const query = {};
    if (search) {
      query.$or = [{ transaction_id: { $regex: search, $options: "i" } }];
    }
    if (status && ["pending", "completed", "failed"].includes(status)) {
      query.status = status;
    }
    if (userRole === "admin") {
    } else if (userRole === "store_owner") {
      query.store_owner_id = userId;
    } else {
      return sendResponse(res, false, null, "Forbidden: Insufficient role");
    }
    if (download) {
      const payments = await Payment.find(query)
        .sort({ createdAt: -1 })
        .populate("order_id", "order_number total_price status payment_method")
        .populate("user_id", "name email")
        .populate("store_owner_id", "name email")
        .populate("coupon_id", "code discount_value");
      return sendResponse(res, true, { payments }, "All payments for download");
    }
    page = parseInt(page);
    limit = parseInt(limit);
    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate("order_id", "order_number total_price status payment_method")
      .populate("user_id", "name email")
      .populate("store_owner_id", "name email")
      .populate("coupon_id", "code discount_value");
    sendResponse(res, true, {
      payments,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate("order_id", "order_number total_price status payment_method")
      .populate("user_id", "name email")
      .populate("store_owner_id", "name email")
      .populate("coupon_id", "code discount_value");
    if (!payment) return sendResponse(res, false, null, "Payment not found");
    if (
      req.user?.role === "store_owner" &&
      payment.store_owner_id?._id?.toString() !== req.user._id.toString()
    ) {
      return sendResponse(res, false, null, "Forbidden: Not your payment");
    }
    sendResponse(res, true, payment, "Payment retrieved successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const createPayment = async (req, res) => {
  try {
    const {
      user_id,
      order_id,
      store_owner_id,
      items,
      payment_method,
      amount_paid,
      discount_amount = 0,
      coupon_id,
      status,
      subtotal,
      taxes,
      shipping,
      total,
    } = req.body;
    let resolvedStoreOwnerId = store_owner_id || null;
    if (!resolvedStoreOwnerId && order_id) {
      try {
        const orderItems = await OrderItem.find({ order_id }).populate({
          path: "product_id",
          select: "createdBy",
        });
        if (orderItems.length > 0) {
          const createdBy = orderItems[0]?.product_id?.createdBy;
          if (createdBy) {
            resolvedStoreOwnerId = createdBy;
          }
        }
      } catch (e) {
        console.error("store_owner_id auto-resolve failed:", e.message);
      }
    }
    if (
      !resolvedStoreOwnerId &&
      items &&
      Array.isArray(items) &&
      items.length > 0
    ) {
      const firstItem = items[0];
      const createdBy =
        firstItem?.product_id?.createdBy?._id ||
        firstItem?.product_id?.createdBy ||
        null;
      if (createdBy) {
        resolvedStoreOwnerId = createdBy;
      }
    }
    const payment = new Payment({
      user_id,
      order_id,
      store_owner_id: resolvedStoreOwnerId,
      payment_method,
      amount_paid,
      discount_amount,
      coupon_id: coupon_id || null,
      status: status || "pending",
    });
    const savedPayment = await payment.save();
    sendResponse(res, true, savedPayment, "Payment created successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updatePayment = async (req, res) => {
  try {
    const updatedPayment = await Payment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: "after" },
    );
    if (!updatedPayment)
      return sendResponse(res, false, null, "Payment not found");
    sendResponse(res, true, updatedPayment, "Payment updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const deletePayment = async (req, res) => {
  try {
    const deletedPayment = await Payment.findByIdAndDelete(req.params.id);
    if (!deletedPayment)
      return sendResponse(res, false, null, "Payment not found");
    sendResponse(res, true, null, "Payment deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const bulkDeletePayments = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
      return sendResponse(res, false, null, "No IDs provided");
    const result = await Payment.deleteMany({ _id: { $in: ids } });
    sendResponse(
      res,
      true,
      { deletedCount: result.deletedCount },
      "Payments deleted successfully",
    );
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const createStripePaymentIntent = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return sendResponse(res, false, null, "Unauthorized");
    }
    const { cart_id, coupon_id, shippingAddress, email, method } = req.body;

    if (!cart_id) {
      return sendResponse(res, false, null, "Cart ID is required");
    }

    const cart = await Cart.findOne({
      _id: cart_id,
      user_id: userId,
    });
    if (!cart) {
      return sendResponse(res, false, null, "Cart not found");
    }
    if (!Array.isArray(cart.items) || cart.items.length === 0) {
      return sendResponse(res, false, null, "Cart is empty");
    }

    let subtotal = 0;
    let shipping = 0;
    const validatedItems = [];

    for (const cartItem of cart.items) {
      const quantity = Number(cartItem.quantity);

      if (!Number.isInteger(quantity) || quantity <= 0) {
        return sendResponse(res, false, null, "Invalid product quantity");
      }

      const variant = await ProductVariant.findById(
        cartItem.variant_id,
      ).populate("product_id");

      if (!variant || !variant.product_id) {
        return sendResponse(res, false, null, "Product variant or product not found");
      }

      if (Number(variant.stock_quantity) < quantity) {
        return sendResponse(
          res,
          false,
          null,
          `Not enough stock for ${variant.sku}`,
        );
      }

      const price = Number(variant.offerprice);

      if (!Number.isFinite(price) || price < 0) {
        return sendResponse(res, false, null, "Invalid product price");
      }

      subtotal += price * quantity;
      shipping += getItemShipping(variant.product_id, price, quantity);

      validatedItems.push({
        variant_id: variant._id,
        product_id: variant.product_id._id,
        quantity,
        price,
      });
    }
    subtotal = Number(subtotal.toFixed(2));
    shipping = Number(shipping.toFixed(2));
    let discount = 0;
    if (coupon_id) {
      const coupon = await Coupon.findById(coupon_id);
      if (!coupon) {
        return sendResponse(res, false, null, "Coupon not found");
      }
      if (coupon.discount_type === "fixed") {
        discount = Math.min(Number(coupon.discount_value) || 0, subtotal);
      } else if (coupon.discount_type === "percentage") {
        const percentage = Number(coupon.discount_value) || 0;

        if (percentage < 0 || percentage > 100) {
          return sendResponse(res, false, null, "Invalid coupon percentage");
        }

        discount = (subtotal * percentage) / 100;
      }
      if (coupon.max_discount_amount) {
        discount = Math.min(discount, Number(coupon.max_discount_amount));
      }
    }
    discount = Number(discount.toFixed(2));

    const discountedTotal = subtotal - discount;
    const platformCharge = await getPlatformCharge(discountedTotal);
    const total = Number(
      (discountedTotal + shipping + Number(platformCharge || 0)).toFixed(2)
    );
    if (!Number.isFinite(total) || total <= 0) {
      return sendResponse(res, false, null, "Invalid payment amount");
    }
    const allowedTypes =
      method === "upi" ? ["upi"] :
      method === "card" ? ["card"] :
      null;

    if (!allowedTypes) {
      return sendResponse(res, false, null, "Unsupported Stripe payment method");
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: "inr",
      payment_method_types: allowedTypes,
      receipt_email: email || undefined,
      metadata: {
        user_id: String(userId),
        cart_id: String(cart_id),
      },
    });

    const payment = new Payment({
      order_id: null,
      user_id: userId,
      payment_method: "Online",
      status: "pending",
      transaction_id: paymentIntent.id,
      stripe_payment_intent_id: paymentIntent.id,
      amount_paid: total,
      discount_amount: discount,
      coupon_id: coupon_id || null,
      checkout_data: {
        user_id: userId,
        cart_id,
        items: validatedItems,
        subtotal,
        discount,
        shipping,
        platform_charge: platformCharge,
        total_price: total,
        coupon_id: coupon_id || null,
        shippingAddress,
        email,
      },
    });
    await payment.save();
    return sendResponse(
      res,
      true,
      {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        subtotal,
        discount,
        shipping,
        platformCharge,
        amount: total,
      },
      "Stripe payment initialized",
    );
  } catch (err) {
    console.error("Stripe create intent error:", err);
    return sendResponse(
      res,
      false,
      null,
      process.env.NODE_ENV === "production"
        ? "Unable to initialize payment"
        : err.message,
    );
  }
};

const finalizeStripePayment = async (req, res) => {
  let session;

  try {
    const userId = req.user?._id;
    const { paymentIntentId } = req.body;

    if (!userId) {
      return sendResponse(res, false, null, "Unauthorized");
    }

    if (!paymentIntentId) {
      return sendResponse(res, false, null, "Payment Intent ID is required");
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(
      paymentIntentId, {
        expand: ["latest_charge"],
      },
    );
    if (String(paymentIntent.metadata?.user_id) !== String(userId)) {
      return sendResponse(res, false, null, "Payment user verification failed");
    }

    if (paymentIntent.status === "processing") {
      return sendResponse(res, false, {
          processing: true,
          code: "PAYMENT_PROCESSING",
        },
        "Payment is still processing."
      );
    }

    if (paymentIntent.status !== "succeeded") {
      return sendResponse(
        res,
        false,
        null,
        `Payment is not successful. Current status: ${paymentIntent.status}`,
      );
    }

    const payment = await Payment.findOne({
      stripe_payment_intent_id: paymentIntent.id,
      user_id: userId,
    });

    if (!payment) {
      return sendResponse(res, false, null, "Payment record not found");
    }

    if (payment.status === "failed") {
      return sendResponse(res, false, null, "This payment has already been marked failed");
    }

    if (
      String(payment.checkout_data?.user_id) !== String(userId) ||
      String(paymentIntent.metadata?.cart_id) !== String(payment.checkout_data?.cart_id)
    ) {
      return sendResponse(res, false, null, "Checkout ownership verification failed");
    }

    const expectedAmount = Math.round(Number(payment.amount_paid) * 100);
    if (
      !Number.isFinite(expectedAmount) ||
      expectedAmount <= 0 ||
      paymentIntent.amount_received !== expectedAmount ||
      paymentIntent.currency !== "inr"
    ) {
      return sendResponse(res, false, null, "Stripe payment amount or currency does not match");
    }
    if (payment.order_id) {
      const existingOrder = await Order.findById(payment.order_id);

      if (!existingOrder) {
        return sendResponse(res, false, null, "Existing order not found");
      }
      return sendResponse(
        res,
        true,
        { order: existingOrder, payment }, "Order already created"
      );
    }

    if (payment.status !== "pending") {
      return sendResponse(res, false, null, "Payment is not in a finalizable state");
    }
    const checkout = payment.checkout_data;

    if (!checkout || !Array.isArray(checkout.items) || checkout.items.length === 0) {
      return sendResponse(res, false, null, "Invalid checkout data");
    }
    session = await mongoose.startSession();

    let createdOrderId = null;

  await session.withTransaction(async () => {
    const currentPayment = await Payment.findOne({
      _id: payment._id,
      user_id: userId,
    }).session(session);

    if (!currentPayment) {
      throw new Error("Payment record not found");
    }

    if (currentPayment.order_id) {
      createdOrderId = currentPayment.order_id;
      return;
    }

    if (currentPayment.status !== "pending") {
      throw new Error("Payment is not in a finalizable state");
    }

    let store_owner_id = null;
    const orderItems = [];

    for (const item of checkout.items) {
      const quantity = Number(item.quantity);
      const price = Number(item.price);

      if (
        !Number.isInteger(quantity) ||
        quantity <= 0 ||
        !Number.isFinite(price) ||
        price < 0
      ) {
        throw new Error("Invalid checkout item");
      }

      const variant = await ProductVariant.findOneAndUpdate(
        { _id: item.variant_id, stock_quantity: { $gte: quantity } },
        { $inc: { stock_quantity: -quantity }},
        { new: true, session}
      ).populate("product_id");

      if (!variant || !variant.product_id) {
        throw new Error("Product is unavailable or stock is insufficient");
      }

      if (!store_owner_id) {
        store_owner_id =
          variant.product_id.storeId?._id ||
          variant.product_id.storeId ||
          variant.product_id.createdBy?._id ||
          variant.product_id.createdBy ||
          null;
      }
      orderItems.push({
        product_id: variant.product_id._id,
        variant_id: variant._id,
        quantity,
        price_at_order: price,
      });
      }

    const order = new Order({
      user_id: userId,
      total_price: Number(checkout.total_price),
      coupon_id: checkout.coupon_id || null,
      shippingAddress: checkout.shippingAddress,
      payment_method: "Online",
      payment_status: "paid",
      transaction_id: paymentIntent.id,
      status: "pending",
      store_owner_id,
    });

    pushHistory(
      order,
      "pending",
      "customer",
      "Online payment successful - order placed",
    );
    const savedOrder = await order.save({ session });
    await OrderItem.insertMany(
      orderItems.map((item) => ({
        ...item,
        order_id: savedOrder._id,
      })),
      { session }
    );

    currentPayment.order_id = savedOrder._id;
    currentPayment.status = "completed";
    currentPayment.transaction_id = paymentIntent.id;
    currentPayment.payment_date = new Date();

    await currentPayment.save({ session });

    createdOrderId = savedOrder._id;
  });

    const savedOrder = await Order.findById(createdOrderId).populate(
      "user_id", "name email"
    );

    if (!savedOrder) {
      return sendResponse(res, false, null, "Order was not found after payment finalization");
    }

    const finalPayment = await Payment.findById(payment._id);

    await saveCheckoutTransaction({
      payment: finalPayment,
      paymentIntent,
      orderId: savedOrder._id,
    });

    const { email: placedEmail, name: placedName } =
      getCustomerInfo(savedOrder);

    Promise.resolve()
      .then(() => sendOrderPlaced(savedOrder, placedEmail, placedName))
      .catch((emailError) => console.error("Order email error:", emailError)
      );

    Promise.resolve()
      .then(() => sendAdminNewOrder(savedOrder, placedName, placedEmail))
      .catch((emailError) => console.error("Admin email error:", emailError));

    return sendResponse(
      res,
      true,
      {
        order: savedOrder,
        payment: finalPayment,
      },
      "Payment successful and order created",
    );
  } catch (err) {
    console.error("Finalize Stripe payment error:", err);

    return sendResponse(res, false, null,
      process.env.NODE_ENV === "production"
        ? "Unable to finalize payment. Please check your order status before retrying."
        : err.message
    );
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

const updateStripePaymentMethod = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return sendResponse(res, false, null, "Unauthorized");

    const { paymentIntentId, method } = req.body;
    if (!paymentIntentId) {
      return sendResponse(res, false, null, "paymentIntentId is required");
    }

    const payment = await Payment.findOne({
      stripe_payment_intent_id: paymentIntentId,
      user_id: userId,
    });
    if (!payment) {
      return sendResponse(res, false, null, "Payment not found");
    }

    const allowedTypes = method === "upi" ? ["upi"] : ["card"];

    const updatedIntent = await stripe.paymentIntents.update(paymentIntentId, {
      payment_method_types: allowedTypes,
    });

    return sendResponse(
      res,
      true,
      {
        paymentIntentId: updatedIntent.id,
        clientSecret: updatedIntent.client_secret,
        amount: payment.amount_paid,
      },
      "Payment method updated",
    );
  } catch (err) {
    console.error("Stripe update intent error:", err);
    return sendResponse(res, false, null, err.message);
  }
};

module.exports = {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  bulkDeletePayments,
  createStripePaymentIntent,
  updateStripePaymentMethod,
  finalizeStripePayment,
};
