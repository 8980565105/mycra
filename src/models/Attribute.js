const mongoose = require("mongoose");
const slugify = require("slugify");

const attributeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      default: null,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  { timestamps: true },
);

attributeSchema.pre("validate", function (next) {
  if (!this.code && this.name) {
    this.code = slugify(this.name, { lower: true, strict: true });
  }
});

attributeSchema.index({ name: 1, storeId: 1 }, { unique: true });

module.exports =
  mongoose.models.Attribute || mongoose.model("Attribute", attributeSchema);
