
const mongoose = require("mongoose");

const resturentSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    restaurantName: {
      type: String,
      trim: true,
      required: true,
    },

    restaurantAddress: {
      type: String,
      trim: true,
      required: true,
    },

    latitude: {
      type: Number,
      required: true,
    },

    longitude: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Resturent ||
  mongoose.model("Resturent", resturentSchema);
