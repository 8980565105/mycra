const mongoose = require("mongoose");

const festivalBannerSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

     link_type: {
      type: String,
      enum: [
        "none",
        "category",
        "subcategory",
        "childcategory",
        "product",
        // "brand",
        // "collection",
        "shop",
        "custom",
      ],
      default: null,
    },
    link_id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    link_slug: {
      type: String,
      default: "",
      trim: true,
    },
    link_url: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: true,
  }
);

const festivalOfferSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    banners: {
      type: [festivalBannerSchema],
      default: [],
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    display_on: {
      type: String,
      enum: ["shop", "collection", "home"],
      default: "shop",
    },

    start_date: {
      type: Date,
      required: true,
    },

    end_date: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
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

module.exports = mongoose.model("FestivalOffer", festivalOfferSchema);