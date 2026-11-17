
const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
      required: true,
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    stars: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
  },
  { timestamps: true }
);

// One customer can rate the same food only once per order
ratingSchema.index(
  { customer: 1, food: 1, order: 1 },
  { unique: true }
);

module.exports =
  mongoose.models.Rating ||
  mongoose.model("Rating", ratingSchema);
