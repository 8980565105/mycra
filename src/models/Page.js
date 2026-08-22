const mongoose = require("mongoose");

const slideSchema = new mongoose.Schema({
  title: { type: String },
  description: { type: String },
  image_url: { type: String },
  background_image_url: { type: String },
  is_button: { type: Boolean, default: false },
  button_name: { type: String },
  button_link: { type: String },
  order: { type: Number, default: 1 },
});

const itemSchema = new mongoose.Schema({
  image_url: { type: String },
  title: { type: String },
  description: { type: String },
  order: { type: Number, default: 1 },
});

const faqItemSchema = new mongoose.Schema({
  question: { type: String },
  answer: { type: String },
  order: { type: Number, default: 1 },
});

// const faq1ItemSchema = new mongoose.Schema({
//   category: {
//     type: String,
//     required: true,
//     trim: true,
//   },

//   question: {
//     type: String,
//     required: true,
//     trim: true,
//   },

//   answer: {
//     type: String,
//     required: true,
//     trim: true,
//   },

//   order: {
//     type: Number,
//     default: 1,
//   },
// });

const faq1ItemSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      trim: true,
    },

    question: {
      type: String,
      required: true,
      trim: true,
    },

    answer: {
      type: String,
      required: true,
      trim: true,
    },

    order: {
      type: Number,
      default: 1,
    },
  },
  { _id: true },
);
const faqCategorySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    label: {
      type: String,
      required: true,
      trim: true,
    },

    order: {
      type: Number,
      default: 1,
    },
  },
  { _id: true },
);
const sectionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["hero_slider", "content", "feature", "banner", "faqs", "faqs1"],
      default: "content",
      required: true,
    },
    title: { type: String },
    description: { type: String },
    image_url: { type: String },
    background_image_url: { type: String },
    rs: { type: Number, default: 0 },
    order: { type: Number, default: 1 },
    is_button: { type: Boolean, default: false },
    button_name: { type: String },
    button_link: { type: String },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    slides: [slideSchema],
    items: [itemSchema],
    faqs: [faqItemSchema],
    faqs1: [faq1ItemSchema],
    faqCategories: [faqCategorySchema],
  },
  { timestamps: true },
);

const pageSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      default: null,
    },
    page_name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true },
    description: { type: String },
    sections: [sectionSchema],
    meta_title: { type: String },
    meta_description: { type: String },
    meta_keyphrase: { type: String },
    seo_image: { type: String },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    order: { type: Number, default: 1 },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

pageSchema.index(
  { slug: 1, storeId: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { storeId: { $type: "objectId" } },
  },
);

pageSchema.pre("validate", function (next) {
  if (!this.slug && this.page_name) {
    this.slug = this.page_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }
  // next();
});

module.exports = mongoose.model("Page", pageSchema);
