const mongoose = require("mongoose");
const slugify = require("slugify");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    tag: { type: String, default: null },
    description: { type: String },

    mainCategory_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },
    type_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Type",
      default: null,
    },
    images: [{ type: String }],
    slug: { type: String, required: true },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    is_featured: { type: Boolean, default: false },
    is_best_seller: { type: Boolean, default: false },
    is_trending: { type: Boolean, default: false },
    shipping_type: {
      type: String,
      enum: ["free", "flat", "percentage"],
      default: "free",
    },
    shipping_value: { type: Number, default: 0 },
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

productSchema.pre("save", function (next) {
  if (this.isModified("name") || !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});
productSchema.index({ name: 1, storeId: 1 }, { unique: true });

module.exports = mongoose.model("Product", productSchema);
