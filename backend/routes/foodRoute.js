const express = require("express");
const router = express.Router();

const {
  getFoods,
  addFood,
  getMyFoods,
} = require("../controllers/foodcontroller");

const {
  authMiddleware,
  allowRoles,
} = require("../middleware/authMiddleware");

// Customer: Get all restaurants' foods
router.get("/", getFoods);

// Restaurant Admin: Get only own restaurant's foods
router.get(
  "/my-foods",
  authMiddleware,
  allowRoles("restaurantAdmin"),
  getMyFoods
);

// Restaurant Admin: Add food
router.post(
  "/",
  authMiddleware,
  allowRoles("restaurantAdmin"),
  addFood
);

module.exports = router;