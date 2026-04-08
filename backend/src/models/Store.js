const mongoose = require("mongoose");
const { ref } = require("pdfkit");
const slugify = require("slugify");

const storeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    email: { type: String, required: true },
    phone: { type: String },
    website: { type: String },
    
    domain: {
      type: String,
      unique: true, 
      sparse: true, 
      lowercase: true, 
      trim: true,
      index: true,
    },
    logo: { type: String },
    banner: { type: String },
    description: { type: String },
    theme: {
      primaryColor: { type: String, default: "#000000" },
      secondaryColor: { type: String, default: "#ffffff" },
      buttonColor: { type: String, default: "#007bff" },
      faviconUrl: { type: String },
      logoUrl: { type: String },
      fontFamily: { type: String, default: "Roboto" },
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zip_code: String,
    },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true },
);

// Auto-generate slug
storeSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model("Store", storeSchema);
