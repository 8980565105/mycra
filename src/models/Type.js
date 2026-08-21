const mongoose = require("mongoose");
const slugify = require("slugify");

const typeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String },
    image_url: { type: String, default: null },
    description: { type: String, default: "" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    subCategoryId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubCategory",
        index: true,
      },
    ],
    childCategoryId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ChildCategory",
        index: true,
      },
    ],
    allowedAttributes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attribute",
      },
    ],
    variantAttributes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attribute",
      },
    ],
    brandIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Brand",
      },
    ],
    brands: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Brand",
      },
    ],
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      default: null,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

typeSchema.index(
  { name: 1, storeId: 1, subCategoryId: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } },
);

module.exports = mongoose.model("Type", typeSchema);
