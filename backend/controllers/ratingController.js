
const mongoose = require("mongoose");
const Rating = require("../models/rating");
const Food = require("../models/food");
const Order = require("../models/order");

// ADD FOOD RATING
const addRating = async (req, res) => {
  try {
    const { food, stars, comment, order } = req.body;

    if (!food || !order || stars === undefined) {
      return res.status(400).json({
        message: "Food, order and stars are required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(food) ||
      !mongoose.Types.ObjectId.isValid(order)
    ) {
      return res.status(400).json({
        message: "Invalid food or order ID",
      });
    }

    const numericStars = Number(stars);

    if (
      !Number.isInteger(numericStars) ||
      numericStars < 1 ||
      numericStars > 5
    ) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    const foodExists = await Food.findById(food);

    if (!foodExists) {
      return res.status(404).json({
        message: "Food not found",
      });
    }

    // Find customer's own order
    const orderExists = await Order.findOne({
      _id: order,
      customer: req.user._id,
    });

    if (!orderExists) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Only delivered orders can be rated
    if (orderExists.status !== "Delivered") {
      return res.status(400).json({
        message: "You can rate food only after order delivery",
      });
    }

    // Food must belong to this order
    const foodInOrder = orderExists.items.some(
      (item) =>
        item.foodId &&
        item.foodId.toString() === food.toString()
    );

    if (!foodInOrder) {
      return res.status(400).json({
        message: "This food does not belong to this order",
      });
    }

    const rating = await Rating.create({
      customer: req.user._id,
      food,
      order,
      stars: numericStars,
      comment: comment || "",
    });

    return res.status(201).json({
      message: "Rating submitted successfully",
      rating,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "You have already rated this food for this order",
      });
    }

    return res.status(500).json({
      message: error.message,
    });
  }
};

// GET FOOD RATINGS
const getFoodRatings = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.foodId)) {
      return res.status(400).json({
        message: "Invalid food ID",
      });
    }

    const ratings = await Rating.find({
      food: req.params.foodId,
    })
      .populate("customer", "name")
      .sort({ createdAt: -1 });

    const totalRatings = ratings.length;

    const averageRating =
      totalRatings === 0
        ? 0
        : ratings.reduce((sum, item) => sum + item.stars, 0) /
          totalRatings;

    return res.status(200).json({
      totalRatings,
      averageRating: Number(averageRating.toFixed(1)),
      ratings,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  addRating,
  getFoodRatings,
};
