
const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/user");
const { authMiddleware, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// GET CUSTOMER FAVOURITES
router.get(
  "/",
  authMiddleware,
  allowRoles("customer"),
  async (req, res) => {
    try {
      const user = await User.findById(req.user._id)
        .populate("favourites");

      res.json({
        favourites: user.favourites || [],
      });
    } catch (error) {
      res.status(500).json({
        message: "Unable to fetch favourites",
      });
    }
  }
);

// ADD FAVOURITE
router.post(
  "/:foodId",
  authMiddleware,
  allowRoles("customer"),
  async (req, res) => {
    try {
      const { foodId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(foodId)) {
        return res.status(400).json({
          message: "Invalid food ID",
        });
      }

      await User.findByIdAndUpdate(
        req.user._id,
        { $addToSet: { favourites: foodId } }
      );

      res.json({
        message: "Food added to favourites",
      });
    } catch (error) {
      res.status(500).json({
        message: "Unable to add favourite",
      });
    }
  }
);

// REMOVE FAVOURITE
router.delete(
  "/:foodId",
  authMiddleware,
  allowRoles("customer"),
  async (req, res) => {
    try {
      const { foodId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(foodId)) {
        return res.status(400).json({
          message: "Invalid food ID",
        });
      }

      await User.findByIdAndUpdate(
        req.user._id,
        { $pull: { favourites: foodId } }
      );

      res.json({
        message: "Food removed from favourites",
      });
    } catch (error) {
      res.status(500).json({
        message: "Unable to remove favourite",
      });
    }
  }
);

module.exports = router;
