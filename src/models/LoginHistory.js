const mongoose = require("mongoose");
const loginHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    ip: String,
    device_type: String,
    browser: String,
    os: String,
    location: {
      city: String,
      state: String,
      country: String,
      pincode: String,
      lat: Number,
      lng: Number,
    },
  },
  { timestamps: true },
);
module.exports = mongoose.model("LoginHistory", loginHistorySchema);
