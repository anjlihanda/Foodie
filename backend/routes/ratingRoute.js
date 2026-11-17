
const express = require("express");
const router = express.Router();

const {
  addRating,
  getFoodRatings,
} = require("../controllers/ratingController");

const {
  authMiddleware,
  allowRoles,
} = require("../middleware/authMiddleware");

// CUSTOMER SUBMITS RATING
router.post(
  "/",
  authMiddleware,
  allowRoles("customer"),
  addRating
);

// GET RATINGS OF A FOOD
router.get("/food/:foodId", getFoodRatings);

module.exports = router;
