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
const GiftCard = require("../models/giftCard");
const GiftCardTransaction = require("../models/GiftCardTransaction");
const Transection = require("../models/Transactions");

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
async function saveStripeTransaction({
  paymentIntent,
  payment,
  order,
}) {
  if (!paymentIntent || !payment || !order) {
    throw new Error("Stripe transaction details are missing");
  }

  const stripeAmount =
    Number(paymentIntent.amount_received || 0) / 100;

  if (!Number.isFinite(stripeAmount) || stripeAmount <= 0) {
    throw new Error("Invalid Stripe transaction amount");
  }

  const charge = typeof paymentIntent.latest_charge === "object"
      ? paymentIntent.latest_charge?.id
      : paymentIntent.latest_charge;

  const paymentType = paymentIntent.payment_method_types?.[0] || "card";

  const paymentMode =
    paymentType === "upi"
      ? "UPI"
      : paymentType === "card"
      ? "Credit/Debit Card"
      : "Stripe";

  const transactionData = {
    user: payment.user_id,
    order_id: order._id,

    amount: stripeAmount,
    currency: (paymentIntent.currency || "inr").toUpperCase(),

    category: "Online Order",
    type: "Money sent",
    paymentMode,
    status: "Success",

    referenceId: paymentIntent.id,
    stripe_payment_intent_id: paymentIntent.id,
    stripe_charge_id: charge || null,

    description: `Stripe payment for order ${
      order.order_number || order._id
    }`,
  };

  const transaction = await Transection.findOneAndUpdate(
    {
      stripe_payment_intent_id: paymentIntent.id,
    },
    {
      $setOnInsert: transactionData,
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

  console.log("[Stripe Transaction Saved]", {
    transactionId: transaction._id,
    paymentIntentId: paymentIntent.id,
    orderId: order._id,
    amount: stripeAmount,
    paymentMode,
  });

  return transaction;
}
async function redeemGiftCardForStripe({
  giftCardId,
  giftCardCode,
  userId,
  orderId,
  amount,
  paymentIntentId,
  session,
}) {
  const redeemAmount = Number(amount || 0);

  if (redeemAmount <= 0) {
    return { redeemed: false };
  }

  const referenceId = `STRIPE:${paymentIntentId}:GIFT_CARD_REDEEM`;

  const existing = await GiftCardTransaction.findOne({
    referenceId,
  }).session(session);

  if (existing) {
    return {
      redeemed: true,
      alreadyProcessed: true,
    };
  }

  const giftCard = await GiftCard.findOneAndUpdate(
    {
      _id: giftCardId,
      cardNumber: giftCardCode,
      assignedTo: userId,
      status: "Active",
      remainingBalance: { $gte: redeemAmount },
    },
    {
      $inc: {
        remainingBalance: -redeemAmount,
      },
    },
    {
      returnDocument: "before",
      session,
    }
  );

  if (!giftCard) {
    throw new Error("Gift Card invalid or insufficient balance");
  }

  const balanceBefore = Number(giftCard.remainingBalance);

  const balanceAfter = Number(
    (balanceBefore - redeemAmount).toFixed(2)
  );

  await GiftCardTransaction.create(
    [
      {
        giftCard: giftCard._id,
        user: userId,
        type: "Redeemed",
        amount: redeemAmount,
        balanceBefore,
        balanceAfter,
        order: orderId,
        referenceId,
        description: "Gift Card redeemed for Stripe order",
      },
    ],
    { session }
  );

  return {
    redeemed: true,
    amount: redeemAmount,
    balanceBefore,
    balanceAfter,
  };
}

async function finalizeOrderFromPaymentIntent(paymentIntentId,
  { expectedUserId = null, source = "unknown" } = {}
) {
  let payment = null;

  try {
    console.log("========== STRIPE FINALIZATION START ==========");
    console.log({
      paymentIntentId,
      expectedUserId,
      source,
    });

    if (!paymentIntentId) {
      throw new Error("Payment Intent ID is required");
    }

  // const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
    expand: ["latest_charge"],
  });
  console.log("[Stripe Intent Status]:", {
    id: paymentIntent.id,
    status: paymentIntent.status,
    amount: paymentIntent.amount,
    amountReceived: paymentIntent.amount_received,
    currency: paymentIntent.currency,
  });

  if (paymentIntent.status !== "succeeded") {
    throw new Error(
      `Cannot create order. Stripe status: ${paymentIntent.status}`
    );
  }

    const paymentRecord = await Payment.findOne({
      stripe_payment_intent_id: paymentIntentId,
    });

    if (!paymentRecord) {
      throw new Error("Stripe Payment record not found");
    }


    if (
      expectedUserId &&
      String(paymentRecord.user_id) !== String(expectedUserId)
    ) {
      throw new Error("Payment does not belong to this user");
    }

const existingOrder = await Order.findOne({
  transaction_id: paymentIntentId,
});

if (existingOrder) {
  paymentRecord.order_id = existingOrder._id;
  paymentRecord.status = "completed";
  paymentRecord.payment_method = "Online";
  paymentRecord.transaction_id = paymentIntentId;
  paymentRecord.payment_date = paymentRecord.payment_date || new Date();
  paymentRecord.last_payment_error = null;
  paymentRecord._locked = false;

  await paymentRecord.save();
  await saveStripeTransaction({
    paymentIntent,
    payment: paymentRecord,
    order: existingOrder,
  });
  try {
    await clearPurchasedCart(paymentRecord.checkout_data);
  } catch (cartError) {
    console.error(
      "[Cart Clear] Existing order recovery failed:", cartError.message
    );
  }

  return {
    order: existingOrder,
    payment: paymentRecord,
    alreadyProcessed: true,
  };
}

  payment = await Payment.findOneAndUpdate(
    {
      _id: paymentRecord._id,
      stripe_payment_intent_id: paymentIntentId,

      status: {
        $in: ["pending", "failed", "processing"],
      },

      order_id: null,
      _locked: { $ne: true },
    },
    {
      $set: {
        _locked: true,
      },
    },
    {
      returnDocument: "after",
      runValidators: true,
    }
  );

  if (!payment) {
    const latestPayment = await Payment.findById(paymentRecord._id);

    if (latestPayment?.order_id) {
      const linkedOrder = await Order.findById(
        latestPayment.order_id
      );

      if (linkedOrder) {
        await saveStripeTransaction({
          paymentIntent,
          payment: latestPayment,
          order: linkedOrder,
        });
        return {
          order: linkedOrder,
          payment: latestPayment,
          alreadyProcessed: true,
        };
      }
    }

    const recoveredOrder = await Order.findOne({
      transaction_id: paymentIntentId,
    });

    if (recoveredOrder && latestPayment) {
      latestPayment.order_id = recoveredOrder._id;
      latestPayment.status = "completed";
      latestPayment.payment_method = "Online";
      latestPayment.transaction_id = paymentIntentId;
      latestPayment.last_payment_error = null;
      latestPayment._locked = false;

      await latestPayment.save();
      await saveStripeTransaction({
        paymentIntent,
        payment: latestPayment,
        order: recoveredOrder,
      });
      try {
        await clearPurchasedCart(latestPayment.checkout_data);
      } catch (cartError) {
        console.error(
          "[Cart Clear] Recovery failed:", cartError.message
        );
      }

      return {
        order: recoveredOrder,
        payment: latestPayment,
        alreadyProcessed: true,
      };
    }

    console.log("[Stripe Finalize] Another request is processing:", {
      paymentIntentId,
      status: latestPayment?.status,
      locked: latestPayment?._locked,
      orderId: latestPayment?.order_id,
    });

    return {
      order: null,
      payment: latestPayment,
      processing: true,
    };
  }

    const checkout = payment.checkout_data;

    if (!checkout) {
      throw new Error("Checkout data not found");
    }

    const {
      user_id,
      items,
      coupon_id,
      shippingAddress,
    } = checkout;

    if (
      !user_id ||
      String(user_id) !== String(payment.user_id) ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      throw new Error("Invalid checkout data");
    }
    const orderItems = [];
    const sellerGroups = new Map();
    let store_owner_id = null;

    for (const item of items) {
      const quantity = Number(item.quantity);
      const price = Number(item.price);

      if (
        !Number.isFinite(quantity) ||
        quantity <= 0 ||
        !Number.isFinite(price) ||
        price < 0
      ) {
        throw new Error("Invalid order item price or quantity");
      }

      const variant = await ProductVariant.findById(
        item.variant_id
      ).populate("product_id");

      if (!variant || !variant.product_id) {
        throw new Error("Product variant or product not found");
      }

      const product = variant.product_id;

      const sellerId =
        product.createdBy?._id || product.createdBy;

      if (
        !sellerId ||
        !mongoose.isValidObjectId(sellerId)
      ) {
        throw new Error(
          `Valid seller not found for product ${product.name}`
        );
      }

      const updatedVariant = await ProductVariant.findOneAndUpdate(
        {
          _id: variant._id,
          stock_quantity: { $gte: quantity },
        },
        {
          $inc: {
            stock_quantity: -quantity,
          },
        },
        {
          new: true,
        }
      );

      if (!updatedVariant) {
        throw new Error(
          `Not enough stock for ${variant.sku}`
        );
      }

      if (!store_owner_id) {
        store_owner_id = sellerId;
      }

      const lineTotal = Number(
        (price * quantity).toFixed(2)
      );

      const sellerKey = String(sellerId);

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

      group.items.push({
        product, quantity, lineTotal,
      });

      orderItems.push({
        product_id: product._id,
        variant_id: variant._id,
        quantity,
        price_at_order: price,
      });
    }

    const orderTotal = Number(
      checkout.order_total ?? checkout.total_price
    );

    const giftCardRedeemed = Number(
      checkout.gift_card_redeemed ?? 0
    );

    const amountPayable = Number(
      checkout.amount_payable ?? payment.amount_paid
    );

    const paymentAmount = Number(payment.amount_paid);

    console.log("========== STRIPE ORDER AMOUNT CHECK ==========");

    console.log({
      subtotal: checkout.subtotal,
      couponDiscount:
        checkout.coupon_discount ?? checkout.discount ?? 0,
      shipping: checkout.shipping,
      platformCharge: checkout.platform_charge,
      tax: checkout.tax,
      orderTotal,
      giftCardRedeemed,
      amountPayable,
      paymentAmount,
      giftCardId: checkout.gift_card_id,
      giftCardCode: checkout.gift_card_code,
    });

    if (
      !Number.isFinite(orderTotal) ||
      !Number.isFinite(giftCardRedeemed) ||
      !Number.isFinite(amountPayable) ||
      !Number.isFinite(paymentAmount) ||
      orderTotal < 0 ||
      giftCardRedeemed < 0 ||
      giftCardRedeemed > orderTotal ||
      amountPayable < 0
    ) {
      throw new Error("Invalid order or Gift Card amount");
    }

    const expectedPayable = Number(
      (orderTotal - giftCardRedeemed).toFixed(2)
    );

    if (Math.abs(expectedPayable - amountPayable) > 0.01) {
      throw new Error("Gift Card amount calculation mismatch");
    }

    if (Math.abs(paymentAmount - amountPayable) > 0.01) {
      throw new Error("Payment amount does not match checkout payable amount");
    }
    
    const stripeReceivedAmount = Number(paymentIntent.amount_received || 0) / 100;

    if (
      Math.abs(stripeReceivedAmount - paymentAmount) > 0.01 ||
      paymentIntent.currency?.toLowerCase() !== "inr"
    ) {
      throw new Error("Stripe payment amount or currency does not match");
    }

    const order = new Order({
      user_id,
      subtotal: Number(checkout.subtotal || 0),
      coupon_id: coupon_id || null,
      coupon_discount: Number(
        checkout.coupon_discount ?? checkout.discount ?? 0
      ),
      shipping_charge: Number(checkout.shipping || 0),
      platform_charge: Number(checkout.platform_charge || 0),
      tax: Number(checkout.tax || 0),
      total_price: orderTotal,
      order_total: orderTotal,
      gift_card_redeemed: giftCardRedeemed,
      amount_payable: amountPayable,
      gift_card_id: checkout.gift_card_id || null,
      gift_card_code: checkout.gift_card_code || "",
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
    await saveStripeTransaction({
      paymentIntent,
      payment,
      order: savedOrder,
    });
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
          returnDocument: "after",
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );
    }

    let giftCardResult = null;

    if (giftCardRedeemed > 0) {
      giftCardResult = await redeemGiftCardForStripe({
        giftCardId: checkout.gift_card_id,
        giftCardCode: checkout.gift_card_code,
        userId: user_id,
        orderId: savedOrder._id,
        amount: giftCardRedeemed,
        paymentIntentId,
      });
    }

    payment.order_id = savedOrder._id;
    payment.status = "completed";
    payment.payment_method = "Online";
    payment.transaction_id = paymentIntentId;
    payment.payment_date =
      payment.payment_date || new Date();
    payment.last_payment_error = null;
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

    try {
      const populatedOrder = await Order.findById(
        savedOrder._id
      ).populate("user_id", "name email");

      const { email, name } = getCustomerInfo(populatedOrder);

      await sendOrderPlaced(populatedOrder, email, name);

      await sendAdminNewOrder(populatedOrder, name, email);
    } catch (emailError) {
      console.error(
        "[Stripe Order Email Error]:",
        emailError.message
      );
    }

    console.log("========== STRIPE FINALIZATION SUCCESS ==========");

    return {
      order: savedOrder,
      payment,
      alreadyProcessed: false,
    };

  } catch (err) {
    console.error(
      "[Stripe Finalize Error]:", err.message, err.stack
    );

    if (payment?._id) {
      await Payment.updateOne(
        {
          _id: payment._id,
          order_id: null,
        },
        {
          $set: {
            _locked: false,
            status: "processing",
            last_payment_error: err.message,
          },
        }
      ).catch((unlockError) => {
        console.error("[Payment Unlock Error]:", unlockError.message);
      });
    }

    throw err;
  }
}

module.exports = { finalizeOrderFromPaymentIntent, getCustomerInfo };
