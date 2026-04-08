const mongoose = require("mongoose");

const aboutPageSchema = new mongoose.Schema(
  {
    heroTitle: { type: String, default: "" },
    heroDesc: { type: String, default: "" },
    heroImage: { type: String, default: "" },
    content: [
      {
        title: { type: String },
        desc: { type: String },
        image: { type: String },
        order: { type: Number, default: 0 },
        status: {
          type: String,
          enum: ["active", "inactive"],
          default: "active",
        },
      },
    ],
    features: [
      {
        icon: { type: String },
        title: { type: String },
        desc: { type: String },
        order: { type: Number, default: 0 },
      },
    ],
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      default: null,
      index: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("AboutPage", aboutPageSchema);
