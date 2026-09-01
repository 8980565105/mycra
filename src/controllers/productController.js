const slugify = require("slugify");
const Product = require("../models/Product");
const { sendResponse } = require("../utils/response");
const ProductVariant = require("../models/ProductVariant");
const Type = require("../models/Type");
const mongoose = require("mongoose");
const ChildCategory = require("../models/ChildCategory");
const isOwnerOrAdmin = (req, product) => {
  if (req.user.role === "admin") return true;
  return product.storeId?.toString() === req.user.storeId?.toString();
};
const buildPipeline = ({
  productMatch,
  variantMatch,
  search,
  page,
  limit,
  download,
}) => {
  const pipeline = [
    { $match: productMatch },
    {
      $lookup: {
        from: "subcategories",
        localField: "category_id",
        foreignField: "_id",
        as: "category",
      },
    },
    { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "createdByUser",
      },
    },
    { $unwind: { path: "$createdByUser", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "stores",
        localField: "storeId",
        foreignField: "_id",
        as: "store",
      },
    },
    { $unwind: { path: "$store", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        storeId: {
          $cond: [
            { $ifNull: ["$store", false] },
            { _id: "$store._id", name: "$store.name", domain: "$store.domain" },
            "$storeId",
          ],
        },
      },
    },
    {
      $project: { store: 0 },
    },
  ];

  if (search) {
    pipeline.push({
      $match: {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { "createdByUser.name": { $regex: search, $options: "i" } },
          { "createdByUser.email": { $regex: search, $options: "i" } },
        ],
      },
    });
  }
  pipeline.push(
    {
      $lookup: {
        from: "productvariants",
        let: { productId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$product_id", "$$productId"] },
              ...variantMatch,
            },
          },

          {
            $lookup: {
              from: "types",
              localField: "type_id",
              foreignField: "_id",
              as: "type",
            },
          },
          {
            $addFields: {
              type_id: { $arrayElemAt: ["$type", 0] },
            },
          },
          {
            $addFields: {
              labels: {
                $map: { input: "$labels", as: "l", in: { $toObjectId: "$$l" } },
              },
            },
          },
          {
            $unwind: {
              path: "$attributes",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "attributes",
              localField: "attributes.attributeId",
              foreignField: "_id",
              as: "attributes.attributeId",
            },
          },
          {
            $unwind: {
              path: "$attributes.attributeId",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "attributevalues",
              localField: "attributes.valueId",
              foreignField: "_id",
              as: "attributes.valueId",
            },
          },
          {
            $unwind: {
              path: "$attributes.valueId",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $group: {
              _id: "$_id",
              product_id: { $first: "$product_id" },
              sku: { $first: "$sku" },
              price: { $first: "$price" },
              offerprice: { $first: "$offerprice" },
              mrp: { $first: "$mrp" },
              stock_quantity: { $first: "$stock_quantity" },
              images: { $first: "$images" },
              type_id: { $first: "$type_id" },
              type: { $first: "$type" },
              labels: { $first: "$labels" },
              labelsInfo: { $first: "$labelsInfo" },
              is_trending: { $first: "$is_trending" },
              is_best_seller: { $first: "$is_best_seller" },
              createdAt: { $first: "$createdAt" },
              updatedAt: { $first: "$updatedAt" },
              attributes: {
                $push: {
                  $cond: [
                    { $gt: ["$attributes", null] },
                    "$attributes",
                    "$$REMOVE",
                  ],
                },
              },
            },
          },
        ],
        as: "variants",
      },
    },
    { $match: { "variants.0": { $exists: true } } },
    {
      $lookup: {
        from: "customerreviews",
        let: { productId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$product_id", "$$productId"] },
                  { $eq: ["$is_approved", true] },
                ],
              },
            },
          },
          {
            $group: {
              _id: null,
              avgRating: { $avg: "$rating" },
              totalReviews: { $sum: 1 },
            },
          },
        ],
        as: "reviewStats",
      },
    },
    {
      $addFields: {
        averageRating: {
          $round: [
            { $ifNull: [{ $arrayElemAt: ["$reviewStats.avgRating", 0] }, 0] },
            1,
          ],
        },
        totalReviews: {
          $ifNull: [{ $arrayElemAt: ["$reviewStats.totalReviews", 0] }, 0],
        },
      },
    },
    { $project: { reviewStats: 0 } },
    { $sort: { createdAt: -1 } },
  );

  if (!download) {
    pipeline.push({ $skip: (page - 1) * limit }, { $limit: limit });
  }

  return pipeline;
};

const getPublicProducts = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 50,
      search = "",
      isDownload = "false",
      categories,
      childCategory,
      types,
      minPrice,
      maxPrice,
    } = req.query;

    const download = isDownload.toString().toLowerCase() === "true";
    page = parseInt(page);
    limit = parseInt(limit);

    const productMatch = { status: "active" };
    if (search) productMatch.name = { $regex: search, $options: "i" };

    if (childCategory && mongoose.Types.ObjectId.isValid(childCategory)) {
      productMatch.childCategory_id = new mongoose.Types.ObjectId(
        childCategory,
      );
    }

    if (categories) {
      const categoryArray = Array.isArray(categories)
        ? categories
        : String(categories).split(",");
      productMatch.category_id = {
        $in: categoryArray.map((id) => new mongoose.Types.ObjectId(id)),
      };
    }
    const variantMatch = {};
    if (types) {
      const typesArray = Array.isArray(types)
        ? types
        : String(types).split(",");
      variantMatch.type_id = {
        $in: typesArray.map((id) => new mongoose.Types.ObjectId(id)),
      };
    }
    if (minPrice || maxPrice) {
      variantMatch.price = {};
      if (minPrice) variantMatch.price.$gte = Number(minPrice);
      if (maxPrice) variantMatch.price.$lte = Number(maxPrice);
    }

    const pipeline = buildPipeline({
      productMatch,
      variantMatch,
      page,
      limit,
      download,
    });

    const products = await Product.aggregate(pipeline);

    const countPipeline = [
      { $match: productMatch },
      {
        $lookup: {
          from: "productvariants",
          let: { productId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$product_id", "$$productId"] },
                ...variantMatch,
              },
            },
          ],
          as: "variants",
        },
      },
      { $match: { "variants.0": { $exists: true } } },
      { $count: "total" },
    ];
    const countResult = await Product.aggregate(countPipeline);
    const totalCount = countResult[0]?.total || 0;

    const priceStatsPipeline = [
      { $match: productMatch },
      {
        $lookup: {
          from: "productvariants",
          let: { productId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$product_id", "$$productId"] },
              },
            },
          ],
          as: "variants",
        },
      },
      { $unwind: "$variants" },
      {
        $group: {
          _id: null,
          actualMin: { $min: "$variants.price" },
          actualMax: { $max: "$variants.price" },
        },
      },
    ];
    const filteredStatsPipeline = [
      { $match: productMatch },
      {
        $lookup: {
          from: "productvariants",
          let: { productId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$product_id", "$$productId"] },
                ...variantMatch,
              },
            },
          ],
          as: "variants",
        },
      },
      { $unwind: "$variants" },
      {
        $group: {
          _id: null,
          filteredMin: { $min: "$variants.price" },
          filteredMax: { $max: "$variants.price" },
        },
      },
    ];

    const [overallStatsRes, filteredStatsRes] = await Promise.all([
      Product.aggregate(priceStatsPipeline),
      Product.aggregate(filteredStatsPipeline),
    ]);

    const actualMin = overallStatsRes[0]?.actualMin ?? 0;
    const actualMax = overallStatsRes[0]?.actualMax ?? 5000;
    const filteredMin = filteredStatsRes[0]?.filteredMin ?? actualMin;
    const filteredMax = filteredStatsRes[0]?.filteredMax ?? actualMax;

    const priceRange = filteredMax - filteredMin;
    let step = 500;
    if (priceRange > 10000) step = 2000;
    else if (priceRange > 5000) step = 1000;
    else if (priceRange > 2000) step = 500;
    else step = 100;

    const displayMin = Math.max(0, Math.floor(filteredMin / step) * step);
    const displayMax =
      Math.ceil(filteredMax / step) * step || actualMax || 5000;

    const priceMetadata = {
      actualMin,
      actualMax,
      selectedMin: minPrice ? Number(minPrice) : actualMin,
      selectedMax: maxPrice ? Number(maxPrice) : actualMax,
      displayMin,
      displayMax,
      filteredMin,
      filteredMax,
    };

    res.json({
      success: true,
      data: {
        products,
        total: totalCount,
        page,
        pages: Math.ceil(totalCount / limit),
        price: priceMetadata,
      },
    });
  } catch (err) {
    console.error("❌ getPublicProducts error:", err);
    sendResponse(res, false, null, err.message);
  }
};

const getProducts = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 50,
      search = "",
      isDownload = "false",
      status,
      role,
      store,
    } = req.query;

    const download = isDownload.toString().toLowerCase() === "true";
    page = parseInt(page);
    limit = parseInt(limit);

    const productMatch = { ...req.storeFilter };
    if (status) productMatch.status = status;

    const variantMatch = {};

    const pipeline = buildPipeline({
      productMatch,
      variantMatch,
      search,
      page,
      limit,
      download,
    });

    if (role && ["admin", "store_owner"].includes(role)) {
      pipeline.push({
        $match: {
          "createdByUser.role": role,
        },
      });
    }
    if (store && store !== "all" && mongoose.Types.ObjectId.isValid(store)) {
      const storeObjId = new mongoose.Types.ObjectId(store);
      pipeline.push({
        $match: {
          $or: [
            { storeId: storeObjId },
            { "createdByUser._id": storeObjId },
            { "createdByUser.storeId": storeObjId },
          ],
        },
      });
    }

    const products = await Product.aggregate(pipeline);

    const countPipeline = [
      { $match: productMatch },
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdByUser",
        },
      },
      { $unwind: { path: "$createdByUser", preserveNullAndEmptyArrays: true } },
    ];

    if (search) {
      countPipeline.push({
        $match: {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { "createdByUser.name": { $regex: search, $options: "i" } },
            { "createdByUser.email": { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    if (role && ["admin", "store_owner"].includes(role)) {
      countPipeline.push({
        $match: {
          "createdByUser.role": role,
        },
      });
    }
    if (store && store !== "all" && mongoose.Types.ObjectId.isValid(store)) {
      const storeObjId = new mongoose.Types.ObjectId(store);
      countPipeline.push({
        $match: {
          $or: [
            { storeId: storeObjId },
            { "createdByUser._id": storeObjId },
            { "createdByUser.storeId": storeObjId },
          ],
        },
      });
    }
    countPipeline.push(
      {
        $lookup: {
          from: "productvariants",
          let: { productId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$product_id", "$$productId"] },
              },
            },
          ],
          as: "variants",
        },
      },
      { $match: { "variants.0": { $exists: true } } },
      { $count: "total" },
    );

    const countResult = await Product.aggregate(countPipeline);
    const totalCount = countResult[0]?.total || 0;
    sendResponse(
      res,
      true,
      {
        products,
        total: totalCount,
        page,
        pages: Math.ceil(totalCount / limit),
      },
      "Products retrieved successfully",
    );
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const getPublicProductById = async (req, res) => {
  try {
    const { id } = req.params;
    let product;
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id)
        .populate("category_id", "name")
        .lean();
    }
    if (!product) {
      product = await Product.findOne({ slug: id })
        .populate("category_id", "name")
        .lean();
    }
    if (!product) return sendResponse(res, false, null, "Product not found");
    const variants = await ProductVariant.find({ product_id: product._id })
      .populate("type_id", "name")
      .populate("attributes.attributeId", "name code")
      .populate("attributes.valueId", "value colorHex")
      .lean();

    sendResponse(
      res,
      true,
      { ...product, variants },
      "Product retrieved successfully",
    );
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category_id", "name")
      .lean();

    if (!product) return sendResponse(res, false, null, "Product not found");

    if (req.user.role === "store_owner") {
      if (!isOwnerOrAdmin(req, product)) {
        return sendResponse(res, false, null, "Forbidden: Not your product");
      }
    }
    const variants = await ProductVariant.find({ product_id: product._id })
      .populate("type_id", "name")
      .populate("attributes.attributeId", "name")
      .populate("attributes.valueId", "value")
      .lean();

    sendResponse(
      res,
      true,
      { ...product, variants },
      "Product retrieved successfully",
    );
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const createProduct = async (req, res) => {
  try {
    const {
      name,
      tag,
      description,
      mainCategory_id,
      category_id,
      type_id,
      status,
      shipping_type,
      shipping_value,
      variants,
    } = req.body;

    let childCategory_id = null;
    if (type_id) {
      const typeDoc = await Type.findById(type_id).select("childCategoryId");
      if (typeDoc?.childCategoryId?.length > 0) {
        childCategory_id = typeDoc.childCategoryId[0];
      }
    }

    let productImages = [];
    if (req.files && req.files.length > 0) {
      productImages = req.files.map((file) => `/uploads/${file.filename}`);
    } else if (req.body.images) {
      productImages = Array.isArray(req.body.images)
        ? req.body.images
        : [req.body.images];
    }

    const storeId =
      req.user.role === "admin" ? req.body.storeId || null : req.user.storeId;
    const product = new Product({
      name,
      tag,
      slug: slugify(name, { lower: true, strict: true }),
      description,
      mainCategory_id: mainCategory_id || null,
      category_id,
      childCategory_id,
      type_id: type_id || null,
      status: status || "active",
      is_featured: !!req.body.is_featured,
      is_best_seller: !!req.body.is_best_seller,
      is_trending: !!req.body.is_trending,
      shipping_type: shipping_type || "free",
      shipping_value: Number(shipping_value) || 0,
      images: productImages,
      createdBy: req.user._id,
      storeId,
    });

    const savedProduct = await product.save();
    let savedVariants = [];
    if (Array.isArray(variants) && variants.length > 0) {
      const variantDocs = variants.map((v, idx) => {
        let formattedAttributes = Array.isArray(v.attributes)
          ? [...v.attributes]
          : [];
        if (v.dynamicAttributes && typeof v.dynamicAttributes === "object") {
          const dynFormatted = Object.entries(v.dynamicAttributes)
            .filter(([_, valId]) => valId)
            .map(([attrId, valId]) => ({
              attributeId: attrId,
              valueId: valId,
            }));
          const existingAttrIds = new Set(
            formattedAttributes.map((a) =>
              (a.attributeId?._id || a.attributeId)?.toString(),
            ),
          );
          dynFormatted.forEach((item) => {
            if (!existingAttrIds.has(item.attributeId?.toString())) {
              formattedAttributes.push(item);
            }
          });
        }
        return {
          ...v,
          brand_id: v.brand_id || null,
          fabric_id: v.fabric_id || null,
          type_id: v.type_id || null,
          color_id: v.color_id || null,
          size_id: v.size_id || null,
          attributes: formattedAttributes,
          product_id: savedProduct._id,
          status: v.status || "active",
          images: Array.isArray(v.images) ? v.images : [],
          labels: Array.isArray(v.labels) ? v.labels : [],
          sku: v.sku || `SKU-${Date.now()}-${idx}`,
          description: v.description || "",
          price: Number(v.price),
          offerprice: Number(v.offerprice),
          stock_quantity: Number(v.stock_quantity),
          is_featured: !!v.is_featured,
          is_best_seller: !!v.is_best_seller,
          is_trending: !!v.is_trending,
        };
      });
      savedVariants = await ProductVariant.insertMany(variantDocs);
    }

    sendResponse(
      res,
      true,
      { product: savedProduct, variants: savedVariants },
      "Product created with variants successfully",
    );
  } catch (err) {
    console.error("Error creating product:", err);
    sendResponse(res, false, null, err.message);
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { variants, ...productData } = req.body;

    const product = await Product.findById(id);
    if (!product) return sendResponse(res, false, null, "Product not found");
    if (!isOwnerOrAdmin(req, product)) {
      return sendResponse(res, false, null, "Forbidden: Not your product");
    }

    if (productData.type_id) {
      const typeDoc = await Type.findById(productData.type_id).select(
        "childCategoryId",
      );
      if (typeDoc?.childCategoryId?.length > 0) {
        productData.childCategory_id = typeDoc.childCategoryId[0];
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, productData, {
      new: true,
    });

    if (Array.isArray(variants)) {
      const incomingIds = variants.filter((v) => v._id).map((v) => v._id);

      await ProductVariant.deleteMany({
        product_id: id,
        _id: { $nin: incomingIds },
      });

      for (const v of variants) {
        let formattedAttributes = Array.isArray(v.attributes)
          ? [...v.attributes]
          : [];
        if (v.dynamicAttributes && typeof v.dynamicAttributes === "object") {
          const dynFormatted = Object.entries(v.dynamicAttributes)
            .filter(([_, valId]) => valId)
            .map(([attrId, valId]) => ({
              attributeId: attrId,
              valueId: valId,
            }));
          const existingAttrIds = new Set(
            formattedAttributes.map((a) =>
              (a.attributeId?._id || a.attributeId)?.toString(),
            ),
          );
          dynFormatted.forEach((item) => {
            if (!existingAttrIds.has(item.attributeId?.toString())) {
              formattedAttributes.push(item);
            }
          });
        }
        const variantPayload = {
          brand_id: v.brand_id || null,
          fabric_id: v.fabric_id || null,
          type_id: v.type_id || null,
          color_id: v.color_id || null,
          size_id: v.size_id || null,
          attributes: formattedAttributes,
          status: v.status || "active",
          images: Array.isArray(v.images) ? v.images : [],
          labels: Array.isArray(v.labels) ? v.labels : [],
          sku: v.sku,
          description: v.description || "",
          price: Number(v.price),
          offerprice: Number(v.offerprice),
          stock_quantity: Number(v.stock_quantity),
          is_featured: !!v.is_featured,
          is_best_seller: !!v.is_best_seller,
          is_trending: !!v.is_trending,
          variantLabel: v.variantLabel || "",
        };
        if (v._id) {
          await ProductVariant.findByIdAndUpdate(v._id, variantPayload, {
            new: true,
          });
        } else {
          try {
            const newVariant = new ProductVariant({
              ...variantPayload,
              product_id: id,
              sku:
                v.sku ||
                `SKU-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            });
            await newVariant.save();
          } catch (err) {
            if (err.code === 11000) {
              const retryVariant = new ProductVariant({
                ...variantPayload,
                product_id: id,
                sku: `${v.sku || "SKU"}-${Date.now().toString(36).slice(-4).toUpperCase()}`,
              });
              await retryVariant.save();
            } else {
              throw err;
            }
          }
        }
      }
    } else {
      await ProductVariant.deleteMany({ product_id: id });
    }

    sendResponse(
      res,
      true,
      updatedProduct,
      "Product and variants updated successfully",
    );
  } catch (err) {
    console.error("❌ updateProduct error:", err);
    sendResponse(res, false, null, err.message);
  }
};

const updateProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return sendResponse(res, false, null, "Invalid status value");
    }

    const product = await Product.findById(id);
    if (!product) return sendResponse(res, false, null, "Product not found");
    if (!isOwnerOrAdmin(req, product)) {
      return sendResponse(res, false, null, "Forbidden: Not your product");
    }

    const updated = await Product.findByIdAndUpdate(
      id,
      { status },
      { returnDocument: "after" },
    );
    sendResponse(res, true, updated, `Product status updated to ${status}`);
  } catch (err) {
    console.error("❌ updateProductStatus error:", err);
    sendResponse(res, false, null, err.message);
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return sendResponse(res, false, null, "Product not found");
    if (!isOwnerOrAdmin(req, product)) {
      return sendResponse(res, false, null, "Forbidden: Not your product");
    }

    await Product.findByIdAndDelete(req.params.id);
    await ProductVariant.deleteMany({ product_id: req.params.id });
    sendResponse(
      res,
      true,
      null,
      "Product and its variants deleted successfully",
    );
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const bulkDeleteProducts = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
      return sendResponse(res, false, null, "No IDs provided");

    let deleteQuery = { _id: { $in: ids } };
    if (req.user.role === "store_owner") {
      deleteQuery.storeId = req.user.storeId;
    }

    const result = await Product.deleteMany(deleteQuery);
    await ProductVariant.deleteMany({ product_id: { $in: ids } });
    sendResponse(
      res,
      true,
      { deletedCount: result.deletedCount },
      "Products and their variants deleted successfully",
    );
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

module.exports = {
  getPublicProducts,
  getPublicProductById,
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
  updateProductStatus,
};
