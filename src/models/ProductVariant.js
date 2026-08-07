const mongoose = require("mongoose");

const productVariantSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    type_id: { type: mongoose.Schema.Types.ObjectId, ref: "Type" },
    attributes: [
      {
        attributeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Attribute",
        },
        valueId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "AttributeValue",
        },
        customValue: { type: String, default: null },
      },
    ],

    price: { type: Number, required: true },
    offerprice: { type: Number, required: true, default: 0 },
    stock_quantity: { type: Number, required: true },

    sku: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    images: [{ type: String }],

    labels: [{ type: mongoose.Schema.Types.ObjectId, ref: "ProductLabel" }],

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ProductVariant", productVariantSchema);
