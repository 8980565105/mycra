const mongoose = require("mongoose");

const festivalOfferSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      default: null,
    },

    description: {
      type: String,
      default: "",
    },

    start_date: {
      type: Date,
      required: true,
    },

    end_date: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

festivalOfferSchema.pre("validate", function () {
  if (
    this.start_date &&
    this.end_date &&
    this.end_date < this.start_date
  ) {
    throw new Error(
      "End date must be greater than or equal to start date"
    );
  }
});
module.exports = mongoose.model(
  "FestivalOffer",
  festivalOfferSchema
);
