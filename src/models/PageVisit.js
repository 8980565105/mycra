const mongoose = require("mongoose");
const pageVisitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    page: { type: String, required: true },
  },
  { timestamps: true },
);
module.exports = mongoose.model("PageVisit", pageVisitSchema);
