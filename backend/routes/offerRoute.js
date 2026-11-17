
const express = require("express");
const router = express.Router();

const {
  createOffer,
  getOffers,
  updateOffer,
  deleteOffer,
} = require("../controllers/offerController");

const {
  authMiddleware,
  allowRoles,
} = require("../middleware/authMiddleware");

// GET ALL OFFERS (Public)
router.get("/", getOffers);

// CREATE OFFER (Admin and Restaurant Admin)
router.post(
  "/",
  authMiddleware,
  allowRoles("admin", "restaurantAdmin"),
  createOffer
);

// UPDATE OFFER
router.put(
  "/:id",
  authMiddleware,
  allowRoles("admin", "restaurantAdmin"),
  updateOffer
);

// DELETE OFFER
router.delete(
  "/:id",
  authMiddleware,
  allowRoles("admin", "restaurantAdmin"),
  deleteOffer
);

module.exports = router;
