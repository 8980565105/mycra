const mongoose = require("mongoose");

const socialLinkSchema = new mongoose.Schema(
  {
    platform: { type: String, required: true },
    url: { type: String, required: true },
  },
  { _id: false },
);

const settingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      default: null,
    },
    site_name: { type: String },
    logourl: { type: String },
    mobilelogoUrl: { type: String },
    favicon_url: { type: String },
    primary_color: { type: String },
    secondary_color: { type: String },
    button_color: { type: String },
    font_family: { type: String },
    meta_title: { type: String },
    meta_description: { type: String },
    meta_keyphrase: { type: String },
    seo_image: { type: String },
    footer_text: { type: String },
    copyright_text: { type: String },
    contact_email: { type: String },
    contact_phone: { type: String },
    platform_charge_type: {
      type: String,
      enum: ["free", "flat", "percentage"],
      default: "free",
    },
    platform_charge_value: {
      type: Number,
      default: 0,
      min: [0, "Platform charge cannot be negative"],
    },
    contact_address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      postal_code: { type: String },
    },
    social_links: [socialLinkSchema],
    custom_css: { type: String },
    custom_js: { type: String },
  },
  { timestamps: true },
);

settingSchema.index(
  { storeId: 1 },
  {
    unique: true,
    partialFilterExpression: { storeId: { $type: "objectId" } },
  },
);
settingSchema.index(
  { user: 1 },
  {
    unique: true,
    partialFilterExpression: { user: { $type: "objectId" } },
  },
);

const Setting = mongoose.model("Setting", settingSchema);
Setting.collection.dropIndex("storeId_1").catch(() => {});
Setting.collection.dropIndex("user_1").catch(() => {});

module.exports = Setting;
