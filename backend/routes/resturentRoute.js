
const express = require("express");

const router = express.Router();
const {
  saveRestaurantLocation,
  getRestaurantLocation,
} = require("../controllers/restrurentcontroller");

const { authMiddleware, allowRoles } = require("../middleware/authMiddleware");

// SAVE / UPDATE RESTAURANT LOCATION
router.post(
  "/location",
  authMiddleware,
  allowRoles("restaurantAdmin"),
  saveRestaurantLocation
);

// GET RESTAURANT LOCATION
router.get(
  "/location",
  authMiddleware,
  allowRoles("restaurantAdmin"),
  getRestaurantLocation
);

module.exports = router;
