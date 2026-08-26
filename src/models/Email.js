const mongoose = require("mongoose");

const emailSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Emails", emailSchema);
