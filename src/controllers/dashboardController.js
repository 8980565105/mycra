const Category = require("../models/Category");
const SubCategory = require("../models/Subcategory");
const Product = require("../models/Product");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Payment = require("../models/Payment");
const User = require("../models/User");
const Store = require("../models/Store");
const Type = require("../models/Type");
const Coupon = require("../models/Coupon");
const { sendResponse } = require("../utils/response");

const getDashboard = async (req, res) => {
  try {
    const now = new Date();
    const isAdmin = req.user.role === "admin";
    const ownerId = req.user._id;
    const storeId = req.user.storeId || null;
    const storeOwnerIds = [ownerId];
    if (storeId) storeOwnerIds.push(storeId);
    const creatorFilter = isAdmin
      ? {}
      : {
          $or: [
            { createdBy: ownerId },
            ...(storeId ? [{ storeId: storeId }] : []),
          ],
        };
    const productFilter = isAdmin ? {} : creatorFilter;
    const orderFilter = isAdmin
      ? {}
      : { store_owner_id: { $in: storeOwnerIds } };
    const paymentFilter = isAdmin
      ? { status: "completed" }
      : { status: "completed", store_owner_id: { $in: storeOwnerIds } };
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999,
    );
    let totalUsers, prevMonthUsers, currMonthUsers;
    if (isAdmin) {
      totalUsers = await User.countDocuments({ role: "store_user" });
      prevMonthUsers = await User.countDocuments({
        role: "store_user",
        createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd },
      });
      currMonthUsers = await User.countDocuments({
        role: "store_user",
        createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd },
      });
    } else {
      const allCustomerIds = await Order.distinct("user_id", {
        store_owner_id: { $in: storeOwnerIds },
      });
      totalUsers = allCustomerIds.length;
      const prevCustomerIds = await Order.distinct("user_id", {
        store_owner_id: { $in: storeOwnerIds },
        createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd },
      });
      prevMonthUsers = prevCustomerIds.length;
      const currCustomerIds = await Order.distinct("user_id", {
        store_owner_id: { $in: storeOwnerIds },
        createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd },
      });
      currMonthUsers = currCustomerIds.length;
    }
    const totalProducts = await Product.countDocuments(productFilter);
    const prevMonthProducts = await Product.countDocuments({
      ...productFilter,
      createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd },
    });
    const currMonthProducts = await Product.countDocuments({
      ...productFilter,
      createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd },
    });
    const totalOrders = await Order.countDocuments(orderFilter);
    const prevMonthOrders = await Order.countDocuments({
      ...orderFilter,
      createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd },
    });
    const currMonthOrders = await Order.countDocuments({
      ...orderFilter,
      createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd },
    });
    const totalStores = isAdmin ? await Store.countDocuments() : 1;
    const activeStores = isAdmin
      ? await Store.countDocuments({ status: "active" })
      : 1;
    const totalCategories = await Category.countDocuments(
      isAdmin ? {} : creatorFilter,
    );
    const totalSubCategories = await SubCategory.countDocuments(
      isAdmin ? {} : creatorFilter,
    );
    const totalTypes = await Type.countDocuments(isAdmin ? {} : creatorFilter);
    const pendingOrders = await Order.countDocuments({
      ...orderFilter,
      status: "pending",
    });
    const deliveredOrders = await Order.countDocuments({
      ...orderFilter,
      status: "completed",
    });
    const cancelledOrders = await Order.countDocuments({
      ...orderFilter,
      status: "cancelled",
    });
    const returnOrders = await Order.countDocuments({
      ...orderFilter,
      status: "rto",
    });
    const refundOrders = await Order.countDocuments({
      ...orderFilter,
      status: "refunded",
    });
    const revenueAgg = await Payment.aggregate([
      { $match: paymentFilter },
      { $group: { _id: null, totalRevenue: { $sum: "$amount_paid" } } },
    ]);
    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;
    const prevRevenueAgg = await Payment.aggregate([
      {
        $match: {
          ...paymentFilter,
          payment_date: { $gte: prevMonthStart, $lte: prevMonthEnd },
        },
      },
      { $group: { _id: null, totalRevenue: { $sum: "$amount_paid" } } },
    ]);
    const prevMonthRevenue = prevRevenueAgg[0]?.totalRevenue || 0;
    const currRevenueAgg = await Payment.aggregate([
      {
        $match: {
          ...paymentFilter,
          payment_date: { $gte: currentMonthStart, $lte: currentMonthEnd },
        },
      },
      { $group: { _id: null, totalRevenue: { $sum: "$amount_paid" } } },
    ]);
    const currMonthRevenue = currRevenueAgg[0]?.totalRevenue || 0;
    const couponBaseFilter = isAdmin ? {} : creatorFilter;
    const couponFilter = {
      status: "active",
      ...couponBaseFilter,
      $and: [
        { $or: [{ start_date: { $lte: now } }, { start_date: null }] },
        { $or: [{ end_date: { $gte: now } }, { end_date: null }] },
      ],
    };
    const activeCoupons = await Coupon.countDocuments(couponFilter);
    const prevCouponFilter = {
      status: "active",
      ...couponBaseFilter,
      createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd },
    };
    const prevMonthCoupons = await Coupon.countDocuments(prevCouponFilter);
    const currCouponFilter = {
      status: "active",
      ...couponBaseFilter,
      createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd },
    };
    const currMonthCoupons = await Coupon.countDocuments(currCouponFilter);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const range = req.query.range || "day";
    let salesRangeStart = new Date();
    let dateFormat = "%Y-%m-%d";
    if (range === "day") {
      salesRangeStart = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFormat = "%Y-%m-%d";
    } else if (range === "month") {
      salesRangeStart = new Date(now.getFullYear(), 0, 1);
      dateFormat = "%Y-%m";
    } else if (range === "year") {
      salesRangeStart = new Date(now.getFullYear() - 4, 0, 1);
      dateFormat = "%Y";
    }
    const rawSalesOverview = await Payment.aggregate([
      {
        $match: {
          ...paymentFilter,
          payment_date: { $gte: salesRangeStart },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: "$payment_date" } },
          revenue: { $sum: "$amount_paid" },
          orders: { $sum: 1 },
        },
      },
    ]);
    const dataMap = {};
    rawSalesOverview.forEach((item) => {
      dataMap[item._id] = { revenue: item.revenue, orders: item.orders };
    });
    const salesOverview = [];
    if (range === "day") {
      const daysInMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
      ).getDate();
      for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(now.getFullYear(), now.getMonth(), d);
        const key = dateObj.toISOString().slice(0, 10);
        salesOverview.push({
          _id: key,
          revenue: dataMap[key]?.revenue || 0,
          orders: dataMap[key]?.orders || 0,
        });
      }
    } else if (range === "month") {
      for (let m = 0; m < 12; m++) {
        const key = `${now.getFullYear()}-${String(m + 1).padStart(2, "0")}`;
        salesOverview.push({
          _id: key,
          revenue: dataMap[key]?.revenue || 0,
          orders: dataMap[key]?.orders || 0,
        });
      }
    } else if (range === "year") {
      for (let y = now.getFullYear() - 4; y <= now.getFullYear(); y++) {
        const key = `${y}`;
        salesOverview.push({
          _id: key,
          revenue: dataMap[key]?.revenue || 0,
          orders: dataMap[key]?.orders || 0,
        });
      }
    }
    const ordersByStatus = await Order.aggregate([
      { $match: orderFilter },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    let topSellingProducts;
    if (isAdmin) {
      topSellingProducts = await OrderItem.aggregate([
        {
          $group: {
            _id: "$product_id",
            quantity: { $sum: "$quantity" },
            revenue: { $sum: { $multiply: ["$quantity", "$price_at_order"] } },
          },
        },
        { $sort: { quantity: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
        {
          $project: { _id: 0, name: "$product.name", quantity: 1, revenue: 1 },
        },
      ]);
    } else {
      const ownerOrderIds = await Order.distinct("_id", {
        store_owner_id: { $in: storeOwnerIds },
      });
      topSellingProducts = await OrderItem.aggregate([
        { $match: { order_id: { $in: ownerOrderIds } } },
        {
          $group: {
            _id: "$product_id",
            quantity: { $sum: "$quantity" },
            revenue: { $sum: { $multiply: ["$quantity", "$price_at_order"] } },
          },
        },
        { $sort: { quantity: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
        {
          $project: { _id: 0, name: "$product.name", quantity: 1, revenue: 1 },
        },
      ]);
    }
    const recentOrdersRaw = await Order.find(orderFilter)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user_id", "name email");
    const recentOrders = await Promise.all(
      recentOrdersRaw.map(async (order) => {
        const items = await OrderItem.find({ order_id: order._id })
          .populate("product_id", "name")
          .populate("variant_id", "sku price");
        return { ...order.toObject(), items };
      }),
    );
    return sendResponse(res, true, {
      totalProducts,
      totalCategories,
      totalSubCategories,
      refundOrders,
      deliveredOrders,
      cancelledOrders,
      returnOrders,
      pendingOrders,
      totalStores,
      activeStores,
      totalOrders,
      totalUsers,
      totalTypes,
      totalRevenue,
      activeCoupons,
      salesOverview,
      ordersByStatus,
      topSellingProducts,
      recentOrders,
      monthlyStats: {
        products: { current: currMonthProducts, previous: prevMonthProducts },
        orders: { current: currMonthOrders, previous: prevMonthOrders },
        users: { current: currMonthUsers, previous: prevMonthUsers },
        revenue: { current: currMonthRevenue, previous: prevMonthRevenue },
        coupons: { current: currMonthCoupons, previous: prevMonthCoupons },
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return sendResponse(res, false, null, error.message);
  }
};
module.exports = { getDashboard };
