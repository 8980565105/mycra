const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "store_owner", "store_user"],
      default: "store_user",
    },
    domain: { type: String, default: "", index: true },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      default: null,
      index: true,
    },
    mobile_number: { type: String },
    profile_picture: { type: String },
    // address: {
    //   street: String,
    //   city: String,
    //   state: String,
    //   country: String,
    //   zip_code: String,
    // },
    addresses: [
      {
        full_name: {
          type: String,
          required: true,
        },
        phone_number: {
          type: String,
          required: true,
        },

        house_no: String,
        apartment: String,

        street: String,
        landmark: String,

        city: String,
        state: String,
        country: String,

        zip_code: String,

        address_type: {
          type: String,
          enum: ["Home", "Apartment", "Business", "Other"],
          default: "Home",
        },

        is_default: {
          type: Boolean,
          default: false,
        },

        delivery_instruction: {
          type: String,
          default: "",
        },
      },
    ],
    gender: { type: String, enum: ["male", "female", "other"] },
    date_of_birth: { type: Date },
    onboardingStatus: {
      type: String,
      enum: ["not_started", "in_progress", "pending_approval", "approved", "rejected"],
      default: "not_started",
    },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true },
);
userSchema.index(
  { email: 1, storeId: 1 },
  { unique: true, name: "unique_email_per_store" },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
// });

module.exports = mongoose.model("User", userSchema);
