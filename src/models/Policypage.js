const mongoose = require("mongoose");
const { Schema } = mongoose;

const PolicyPageSchema = new Schema(
  {
    page_name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
    },
    meta_title: {
      type: String,
      default: "",
    },
    meta_description: {
      type: String,
      default: "",
    },
    meta_keyphrase: {
      type: String,
      default: "",
    },
    seo_image: {
      type: String,
      default: "",
    },
    order: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

PolicyPageSchema.pre("validate", function (next) {
  if (this.page_name && !this.slug) {
    this.slug = this.page_name
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
});

module.exports = mongoose.model("Policypage", PolicyPageSchema);

