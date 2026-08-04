const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User");
const { sendResponse } = require("../utils/response");

const getCarts = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "", isDownload = "false" } = req.query;
    const download = isDownload.toLowerCase() === "true";

    const userRole = req.user?.role;
    const userId = req.user?._id;

    if (userRole !== "store_owner" && userRole !== "admin") {
      return sendResponse(res, false, null, "Forbidden: Insufficient role");
    }

    page = parseInt(page);
    limit = parseInt(limit);

    const pipeline = [{ $unwind: "$items" }];

    if (userRole === "store_owner") {
      pipeline.push({
        $match: { "items.store_owner_id": new mongoose.Types.ObjectId(userId) },
      });
    }

    pipeline.push(
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user_id",
        },
      },
      { $unwind: "$user_id" },
    );

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { "user_id.name": { $regex: search, $options: "i" } },
            { "user_id.email": { $regex: search, $options: "i" } },
          ],
        },
      });
    }
    pipeline.push(
      {
        $lookup: {
          from: "products",
          localField: "items.product_id",
          foreignField: "_id",
          as: "items.product_id",
        },
      },
      {
        $unwind: {
          path: "$items.product_id",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "productvariants",
          localField: "items.variant_id",
          foreignField: "_id",
          as: "items.variant_id",
        },
      },
      {
        $unwind: {
          path: "$items.variant_id",
          preserveNullAndEmptyArrays: true,
        },
      },
      { $sort: { createdAt: -1 } },
    );

    if (download) {
      const rows = await Cart.aggregate(pipeline);
      const grouped = {};
      rows.forEach((r) => {
        const key = r._id.toString();
        if (!grouped[key]) {
          grouped[key] = { ...r, items: [] };
        }
        grouped[key].items.push(r.items);
      });
      return sendResponse(
        res,
        true,
        { carts: Object.values(grouped) },
        "All carts for download",
      );
    }

    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await Cart.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    pipeline.push({ $skip: (page - 1) * limit }, { $limit: limit });

    const rows = await Cart.aggregate(pipeline);

    const carts = rows.map((r) => ({
      _id: r._id,
      user_id: r.user_id,
      createdAt: r.createdAt,
      items: [r.items],
    }));

    sendResponse(res, true, {
      carts,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const getCartById = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.id)
      .populate("user_id", "name email")
      .populate({
        path: "items.product_id",
        select: "name price image images createdBy",
      })
      .populate("items.variant_id", "color size sku price image images");

    if (!cart) return sendResponse(res, false, null, "Cart not found");
    sendResponse(res, true, cart, "Cart retrieved successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const createCart = async (req, res) => {
  try {
    const cart = new Cart(req.body);
    const savedCart = await cart.save();
    sendResponse(res, true, savedCart, "Cart created successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const addCartItem = async (req, res) => {
  try {
    const { cart_id, product_id, variant_id, quantity } = req.body;

    const cart = await Cart.findById(cart_id);
    if (!cart) return sendResponse(res, false, null, "Cart not found");

    let store_owner_id = null;
    try {
      const product = await Product.findById(product_id).select("createdBy");
      if (product?.createdBy) {
        store_owner_id = product.createdBy;
      }
    } catch (e) {
      console.error("store_owner_id resolve failed:", e.message);
    }

    const existingItem = cart.items.find(
      (item) => item.variant_id.toString() === variant_id,
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      if (!existingItem.store_owner_id && store_owner_id) {
        existingItem.store_owner_id = store_owner_id;
      }
    } else {
      cart.items.push({ product_id, variant_id, quantity, store_owner_id });
    }

    await cart.save();
    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: "items.product_id",
        select: "name price image images createdBy",
      })
      .populate("items.variant_id", "color size sku price image images");

    sendResponse(res, true, populatedCart, "Item added to cart successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { cart_id, item_id, quantity } = req.body;

    const cart = await Cart.findById(cart_id);
    if (!cart) return sendResponse(res, false, null, "Cart not found");

    const item = cart.items.id(item_id);
    if (!item) return sendResponse(res, false, null, "Item not found");

    item.quantity = quantity;
    await cart.save();

    sendResponse(res, true, { item }, "Cart item updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const { cart_id, item_id } = req.body;

    const cart = await Cart.findById(cart_id);
    if (!cart) return sendResponse(res, false, null, "Cart not found");

    cart.items = cart.items.filter((item) => item._id.toString() !== item_id);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: "items.product_id",
        select: "name price image images",
      })
      .populate("items.variant_id", "color size sku price image images");

    sendResponse(res, true, populatedCart, "Cart item deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const deleteCart = async (req, res) => {
  try {
    const deletedCart = await Cart.findByIdAndDelete(req.params.id);
    if (!deletedCart) return sendResponse(res, false, null, "Cart not found");
    sendResponse(res, true, null, "Cart deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const bulkDeleteCartItems = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return sendResponse(res, false, null, "No item IDs provided");
    }

    const result = await Cart.updateMany(
      { "items._id": { $in: ids } },
      { $pull: { items: { _id: { $in: ids } } } },
    );

    if (result.modifiedCount === 0) {
      return sendResponse(res, false, null, "No matching cart items found");
    }

    sendResponse(res, true, result, "Selected cart items deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

module.exports = {
  getCarts,
  getCartById,
  createCart,
  addCartItem,
  updateCartItem,
  deleteCartItem,
  deleteCart,
  bulkDeleteCartItems,
};

