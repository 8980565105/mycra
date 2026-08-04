const mongoose = require("mongoose");

const attributeValueSchema = new mongoose.Schema(
  {
    attributeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attribute",
      required: true,
      index: true,
    },
    value: { type: String, required: true, trim: true },
    colorHex: { type: String, default: null },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

attributeValueSchema.index({ attributeId: 1, value: 1, storeId: 1 }, { unique: true });

module.exports =
  mongoose.models.AttributeValue ||
  mongoose.model("AttributeValue", attributeValueSchema);
