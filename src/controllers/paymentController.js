const Payment = require("../models/Payment");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const ProductVariant = require("../models/ProductVariant");
const Product = require("../models/Product");
const transection = require("../models/Transactions")
const Cart = require("../models/Cart");
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const GiftCard = require("../models/giftCard");
const GiftCardTransaction = require("../models/GiftCardTransaction");
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
const { calculateCheckoutTotals } = require("../utils/checkoutCalculation");
const { buildCheckoutQuote } = require("../utils/buildCheckoutQuote");
const { finalizeOrderFromPaymentIntent } = require("../utils/finalizeOrderFromPayment");

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
    const { cart_id, coupon_id, shippingAddress, email, method, appliedGiftCardId, giftCardCode, useGiftCardBalance, requestedGiftCardAmount } = req.body;
    console.log("STRIPE REQUEST GIFT CARD DEBUG:", {
      appliedGiftCardId,
      giftCardCode,
      useGiftCardBalance,
      requestedGiftCardAmount,
    });
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

    const allowedTypes = method === "upi"
        ? ["upi"] : method === "card"
          ? ["card"] : null;

    if (!allowedTypes) {
      return sendResponse(res, false, null, "Unsupported Stripe payment method");
    }

    const shouldUseGiftCard = useGiftCardBalance === true || useGiftCardBalance === "true";

    const quote = await buildCheckoutQuote({
      userId,
      subtotal,
      couponId: coupon_id || null,
      shipping,
      tax: 0,

      giftCardId: shouldUseGiftCard
        ? appliedGiftCardId || null
        : null,

      giftCardCode: shouldUseGiftCard
        ? String(giftCardCode || "").trim() || null
        : null,

      requestedGiftCardAmount: shouldUseGiftCard
        ? Number(requestedGiftCardAmount || 0)
        : 0,
        
    });

    console.log("Stripe checkout quote:", {
      subtotal: quote.subtotal,
      coupon_discount: quote.coupon_discount,
      shipping: quote.shipping,
      platform_charge: quote.platform_charge,
      order_total: quote.order_total,
      gift_card_redeemed: quote.gift_card_redeemed,
      amount_payable: quote.amount_payable,
    });


// 3. Read calculated amounts only AFTER quote initialization
    const platformCharge = Number(
      quote.platform_charge ?? quote.platformCharge ?? 0
    );

    const orderTotal = Number(quote.order_total ?? 0);

    const discount = Number(quote.coupon_discount ?? 0);

    const giftCardRedeemed = Number(
      quote.gift_card_redeemed ?? 0
    );

    const amountPayable = Number(quote.amount_payable ?? 0);

    const finalShipping = Number(quote.shipping ?? shipping);

    // 4. Validate the final server-calculated amounts
    if (
      !Number.isFinite(orderTotal) ||
      !Number.isFinite(amountPayable) ||
      !Number.isFinite(giftCardRedeemed) ||
      orderTotal <= 0 ||
      amountPayable < 0 ||
      giftCardRedeemed < 0
    ) {
      return sendResponse(
        res,
        false,
        null,
        "Invalid checkout amount"
      );
    }

    // 5. Stripe cannot collect a zero amount
    if (amountPayable === 0) {
      return res.status(400).json({
        success: false,
        code: "GIFT_CARD_ONLY",
        message:
          "Gift Card covers the full order. Use the gift-card-only checkout flow.",
        quote,
      });
    }

    // 6. Create Stripe PaymentIntent using ONLY the backend quote
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amountPayable * 100),
      currency: "inr",
      payment_method_types: allowedTypes,
      receipt_email: email || undefined,
      metadata: {
        user_id: String(userId),
        cart_id: String(cart._id),
        gift_card_id: String(quote.gift_card_id || ""),
      },
    });

    const payment = new Payment({
      order_id: null,
      user_id: userId,
      payment_method: "Online",
      status: "pending",
      transaction_id: paymentIntent.id,
      stripe_payment_intent_id: paymentIntent.id,
      amount_paid: amountPayable,
      discount_amount: discount,
      coupon_id: quote.coupon_id || coupon_id || null,
      checkout_data: {
        user_id: userId,
        cart_id: cart._id,
        items: validatedItems,
       
        shippingAddress,
        email,

        subtotal: quote.subtotal,
        discount: quote.coupon_discount,
        coupon_discount: quote.coupon_discount,
        shipping: finalShipping,
        platform_charge: platformCharge,
        tax: quote.tax,
        order_total: orderTotal,
        total_price: orderTotal,
        gift_card_id: quote.gift_card_id || null,
        gift_card_code: quote.gift_card_code || "",
        gift_card_redeemed: giftCardRedeemed,
        amount_payable: amountPayable,
        coupon_id: quote.coupon_id || coupon_id || null,
      },
    });
    await payment.save();
    return sendResponse(
      res,
      true,
      {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        subtotal: quote.subtotal,
        discount,
        shipping: finalShipping,
        platformCharge,
        orderTotal,
        giftCardRedeemed,
        amount: amountPayable,
        amount_payable: amountPayable,
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
// const finalizeStripePayment = async (req, res) => {

//   let session;

//   try {
//     const userId = req.user?._id;
//     const { paymentIntentId } = req.body;

//     if (!userId) {
//       return sendResponse(res, false, null, "Unauthorized");
//     }

//     if (!paymentIntentId) {
//       return sendResponse(res, false, null, "Payment Intent ID is required");
//     }

//     const paymentIntent = await stripe.paymentIntents.retrieve(
//       paymentIntentId, {
//         expand: ["latest_charge"],
//       },
//     );
//     if (String(paymentIntent.metadata?.user_id) !== String(userId)) {
//       return sendResponse(res, false, null, "Payment user verification failed");
//     }

//     if (paymentIntent.status === "processing") {
//       return sendResponse(res, false, {
//           processing: true,
//           code: "PAYMENT_PROCESSING",
//         },
//         "Payment is still processing."
//       );
//     }

//     if (paymentIntent.status !== "succeeded") {
//       return sendResponse(
//         res,
//         false,
//         null,
//         `Payment is not successful. Current status: ${paymentIntent.status}`,
//       );
//     }

//     console.log("\n========== STRIPE FINALIZATION START ==========");
//     console.log("PaymentIntent ID:", paymentIntentId);

    

//     const payment = await Payment.findOne({
//       stripe_payment_intent_id: paymentIntent.id,
//       user_id: userId,
//     });

//     if (!payment) {
//       return sendResponse(res, false, null, "Payment record not found");
//     }

//     console.log("Payment record found:", {
//   paymentId: String(payment._id),
//   status: payment.status,
//   amount_paid: payment.amount_paid,
//   order_id: payment.order_id
// });
//     // if (payment.status === "failed") {
//     //   return sendResponse(res, false, null, "This payment has already been marked failed");
//     // }

//     if (
//       String(payment.checkout_data?.user_id) !== String(userId) ||
//       String(paymentIntent.metadata?.cart_id) !== String(payment.checkout_data?.cart_id)
//     ) {
//       return sendResponse(res, false, null, "Checkout ownership verification failed");
//     }

//     const expectedAmount = Math.round(Number(payment.amount_paid) * 100);
//     if (
//       !Number.isFinite(expectedAmount) ||
//       expectedAmount <= 0 ||
//       paymentIntent.amount_received !== expectedAmount ||
//       paymentIntent.amount !== expectedAmount ||
//       paymentIntent.currency !== "inr"
//     ) {
//       return sendResponse(res, false, null, "Stripe payment amount or currency does not match");
//     }
//     if (payment.order_id) {
//       const existingOrder = await Order.findById(payment.order_id);

//       if (!existingOrder) {
//         return sendResponse(res, false, null, "Existing order not found");
//       }
//       return sendResponse(
//         res,
//         true,
//         { order: existingOrder, payment }, "Order already created"
//       );
//     }

//     // if (payment.status !== "pending") {
//     //   return sendResponse(res, false, null, "Payment is not in a finalizable state");
//     // }
//     if (!["pending", "processing"].includes(payment.status)) {
//   return sendResponse(
//     res,
//     false,
//     null,
//     "Payment is not in a finalizable state"
//   );
// }
//     const checkout = payment.checkout_data;
//     const shippingAddress = checkout?.shippingAddress;

//     if (!shippingAddress) {
//       return sendResponse(
//         res,
//         false,
//         null,
//         "Shipping address is missing from checkout data"
//       );
//     }
//     if (!checkout || !Array.isArray(checkout.items) || checkout.items.length === 0) {
//       return sendResponse(res, false, null, "Invalid checkout data");
//     }
//     session = await mongoose.startSession();

//     let createdOrderId = null;

//   let redeemedGiftCardDoc = null;

// if (giftCardRedeemed > 0) {
//   if (!checkout.gift_card_id) {
//     throw new Error("Gift Card ID missing from checkout snapshot");
//   }

//   redeemedGiftCardDoc = await GiftCard.findOneAndUpdate(
//     {
//       _id: checkout.gift_card_id,
//       assignedTo: userId,
//       recordType: "Issued",
//       status: "Active",
//       remainingBalance: { $gte: giftCardRedeemed },
//       $or: [
//         { expiresAt: null },
//         { expiresAt: { $exists: false } },
//         { expiresAt: { $gt: new Date() } },
//       ],
//     },
//     {
//       $inc: {
//         remainingBalance: -giftCardRedeemed,
//       },
//     },
//     {
//       new: true,
//       session,
//       runValidators: true,
//     }
//   );

//   if (!redeemedGiftCardDoc) {
//     throw new Error("Gift Card balance unavailable");
//   }

//   if (Number(redeemedGiftCardDoc.remainingBalance) === 0) {
//     redeemedGiftCardDoc.status = "FullyRedeemed";
//     await redeemedGiftCardDoc.save({ session });
//   }
// }
//   await session.withTransaction(async () => {
//     const currentPayment = await Payment.findOne({
//       _id: payment._id,
//       user_id: userId,
//     }).session(session);

//     if (!currentPayment) {
//       throw new Error("Payment record not found");
//     }

//     if (currentPayment.order_id) {
//       createdOrderId = currentPayment.order_id;
//       return;
//     }

//     // if (currentPayment.status !== "pending") {
//     //   throw new Error("Payment is not in a finalizable state");
//     // }
//     if (!["pending", "processing"].includes(currentPayment.status)) {
//       throw new Error("Payment is not in a finalizable state");
//     }

//     let store_owner_id = null;
//     const orderItems = [];

//     for (const item of checkout.items) {
//       const quantity = Number(item.quantity);
//       const price = Number(item.price);

//       if (
//         !Number.isInteger(quantity) ||
//         quantity <= 0 ||
//         !Number.isFinite(price) ||
//         price < 0
//       ) {
//         throw new Error("Invalid checkout item");
//       }

//       const variant = await ProductVariant.findOneAndUpdate(
//         { _id: item.variant_id, stock_quantity: { $gte: quantity } },
//         { $inc: { stock_quantity: -quantity }},
//         // { new: true, session}
//         { returnDocument: "after", session }
//       ).populate("product_id");

//       if (!variant || !variant.product_id) {
//         throw new Error("Product is unavailable or stock is insufficient");
//       }

//       if (!store_owner_id) {
//         store_owner_id =
//           variant.product_id.storeId?._id ||
//           variant.product_id.storeId ||
//           variant.product_id.createdBy?._id ||
//           variant.product_id.createdBy ||
//           null;
//       }
//       orderItems.push({
//         product_id: variant.product_id._id,
//         variant_id: variant._id,
//         quantity,
//         price_at_order: price,
//       });
//       }

//     // const order = new Order({
//     //   user_id: userId,
//     //   total_price: Number(checkout.total_price),
//     //   coupon_id: checkout.coupon_id || null,
//     //   shippingAddress: checkout.shippingAddress,
//     //   payment_method: "Online",
//     //   payment_status: "paid",
//     //   transaction_id: paymentIntent.id,
//     //   status: "pending",
//     //   store_owner_id,
//     // });
//     // Payment documentમાંથી સાચી checkout values લો.
//     // const checkout = payment.checkout_data;

//     if (!checkout) {
//       throw new Error("Checkout data not found in Payment");
//     }

//     const orderTotal = Number(
//       checkout.order_total ?? checkout.total_price
//     );

//     const giftCardRedeemed = Number(
//       checkout.gift_card_redeemed ?? 0
//     );

//     const amountPayable = Number(
//       checkout.amount_payable ?? payment.amount_paid
//     );

//     // Order totals વચ્ચે consistency ચકાસો.
//     // if (
//     //   !Number.isFinite(orderTotal) ||
//     //   !Number.isFinite(giftCardRedeemed) ||
//     //   !Number.isFinite(amountPayable) ||
//     //   orderTotal < 0 ||
//     //   giftCardRedeemed < 0 ||
//     //   amountPayable < 0 ||
//     //   giftCardRedeemed > orderTotal
//     // ) {
//     //   throw new Error("Invalid order or Gift Card amounts");
//     // }

//     const calculatedPayable = Number(
//       (orderTotal - giftCardRedeemed).toFixed(2)
//     );

//     if (
//       Math.round(calculatedPayable * 100) !==
//       Math.round(amountPayable * 100)
//     ) {
//       throw new Error("Gift Card calculation does not match payment");
//     }

//     if (
//       Math.round(Number(payment.amount_paid) * 100) !==
//         Math.round(amountPayable * 100) ||
//       paymentIntent.amount_received !==
//         Math.round(amountPayable * 100) ||
//       paymentIntent.currency !== "inr"
//     ) {
//       throw new Error("Stripe payment amount or currency does not match");
//     }

//     // Stripeમાં ખરેખર ચૂકવેલી રકમ સાથે મેળ બેસાડો.
//     if (
//       Math.round(Number(payment.amount_paid) * 100) !==
//       Math.round(amountPayable * 100)
//     ) {
//       throw new Error("Stripe payable amount does not match Payment record");
//     }

//     const order = new Order({
//       user_id: userId,

//       subtotal: Number(checkout.subtotal || 0),
//       coupon_id: checkout.coupon_id || null,
//       coupon_discount: Number(
//         checkout.coupon_discount ?? checkout.discount ?? 0
//       ),
//       shipping_charge: Number(checkout.shipping || 0),
//       platform_charge: Number(checkout.platform_charge || 0),
//       tax: Number(checkout.tax || 0),

//       total_price: orderTotal,
//       order_total: orderTotal,
//       gift_card_redeemed: giftCardRedeemed,
//       amount_payable: amountPayable,
//       gift_card_id: checkout.gift_card_id || null,
//       gift_card_code: checkout.gift_card_code || "",
//       shippingAddress: checkout.shippingAddress,
//       payment_method: "Online",
//       payment_status: "paid",
//       transaction_id: paymentIntentId,
//       status: "pending",
//       store_owner_id: store_owner_id || null,
//     });

//     pushHistory(
//       order,
//       "pending",
//       "customer",
//       "Online payment successful - order placed",
//     );
//     const savedOrder = await order.save({ session });

//     if (redeemedGiftCardDoc && giftCardRedeemed > 0) {
//   const balanceAfter = Number(
//     redeemedGiftCardDoc.remainingBalance
//   );

//   await GiftCardTransaction.create(
//     [
//       {
//         giftCard: checkout.gift_card_id,
//         user: userId,
//         type: "Redeemed",
//         amount: giftCardRedeemed,
//         balanceBefore: Number(
//           (balanceAfter + giftCardRedeemed).toFixed(2)
//         ),
//         balanceAfter,
//         order: savedOrder._id,
//         referenceId: `GIFT_REDEEM_ORDER_${savedOrder._id}`,
//         description: `Gift Card redeemed for order ${savedOrder.order_number}`,
//       },
//     ],
//     { session }
//   );
// }

//     await OrderItem.insertMany(
//       orderItems.map((item) => ({
//         ...item,
//         order_id: savedOrder._id,
//       })),
//       { session }
//     );
//     const cart = await Cart.findOne({
//       _id: checkout.cart_id,
//       user_id: userId,
//     }).session(session);

//     if (cart) {
//       cart.items = [];
//       await cart.save({ session });
//     }
//     currentPayment.order_id = savedOrder._id;
//     currentPayment.status = "completed";
//     currentPayment.transaction_id = paymentIntent.id;
//     currentPayment.payment_date = new Date();

//     await currentPayment.save({ session });

//     createdOrderId = savedOrder._id;
//   });

// //   const result = await finalizeOrderFromPaymentIntent(
// //   paymentIntent.id
// // );
// // const savedOrder = await Order.findById(createdOrderId).populate(
//     //   "user_id", "name email"
//     // );

//     // if (!savedOrder) {
//     //   return sendResponse(res, false, null, "Order was not found after payment finalization");
//     // }

//     // const finalPayment = await Payment.findById(payment._id);
//     const orderId = createdOrderId || payment.order_id;

// if (!orderId) {
//   throw new Error(
//     "Payment succeeded, but the order ID was not saved"
//   );
// }


//     // const savedOrder = await Order.findById(result.order._id);

//     // if (!savedOrder) {
//     //   throw new Error("Finalized order could not be retrieved");
//     // }

//     // const finalPayment = result.payment;
//     const savedOrder = await Order.findById(orderId);

//     if (!savedOrder) {
//       throw new Error("Finalized order could not be retrieved");
//     }

//     const finalPayment = await Payment.findById(payment._id);

//     if (!finalPayment) {
//       throw new Error("Finalized payment record could not be retrieved");
//     }
//     // return sendResponse(
//     //   res,
//     //   true,
//     //   {
//     //     order: savedOrder,
//     //     payment: finalPayment,
//     //   },
//     //   "Payment successful and order created"
//     // );

// console.log("STRIPE ORDER FINALIZED:", {
//   orderId: String(savedOrder._id),
//   orderTotal: savedOrder.order_total,
//   giftCardRedeemed: savedOrder.gift_card_redeemed,
//   amountPayable: savedOrder.amount_payable,
//   paymentStatus: finalPayment.status,
//   paymentOrderId: String(finalPayment.order_id),
// });
//     await saveCheckoutTransaction({
//       payment: finalPayment,
//       paymentIntent,
//       orderId: savedOrder._id,
//     });

//     const { email: placedEmail, name: placedName } =
//       getCustomerInfo(savedOrder);

//     Promise.resolve()
//       .then(() => sendOrderPlaced(savedOrder, placedEmail, placedName))
//       .catch((emailError) => console.error("Order email error:", emailError)
//       );

//     Promise.resolve()
//       .then(() => sendAdminNewOrder(savedOrder, placedName, placedEmail))
//       .catch((emailError) => console.error("Admin email error:", emailError));

//     return sendResponse(
//       res,
//       true,
//       {
//         order: savedOrder,
//         payment: finalPayment,
//       },
//       "Payment successful and order created",
//     );
//   } catch (err) {
//     console.error("Finalize Stripe payment error:", err);

//     return sendResponse(res, false, null,
//       process.env.NODE_ENV === "production"
//         ? "Unable to finalize payment. Please check your order status before retrying."
//         : err.message
//     );
//   } finally {
//     if (session) {
//       await session.endSession();
//     }
//   }
// };

const finalizeStripePayment = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { paymentIntentId } = req.body;

    if (!userId) {
      return sendResponse(res, false, null, "Unauthorized");
    }

    if (!paymentIntentId) {
      return sendResponse(
        res, false, null, "Payment Intent ID is required"
      );
    }

    const payment = await Payment.findOne({
      stripe_payment_intent_id: paymentIntentId,
      user_id: userId,
    });

    if (!payment) {
      return sendResponse(res, false, null, "Payment record not found");
    }

    const result = await finalizeOrderFromPaymentIntent(
      paymentIntentId, { expectedUserId: userId, source: "frontend" }
    );

    if (result.processing) {
      return sendResponse(
        res,
        false,
        {
          processing: true,
          code: "PAYMENT_PROCESSING",
        },
        "Payment finalization is in progress. Please retry."
      );
    }

    if (!result.order) {
      return sendResponse(res, false, null, "Order could not be finalized");
    }

    return sendResponse(
      res,
      true,
      {
        order: result.order,
        payment: result.payment,
        alreadyProcessed: Boolean(result.alreadyProcessed),
      },
      result.alreadyProcessed
        ? "Payment already finalized"
        : "Payment successful and order created"
    );
  } catch (err) {
    console.error("[Stripe Finalize Controller Error]", err);

    return sendResponse(res, false, null,
      process.env.NODE_ENV === "production"
        ? "Unable to finalize payment. Please retry."
        : err.message
    );
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
