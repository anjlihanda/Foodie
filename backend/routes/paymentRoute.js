
const express = require("express");
const router = express.Router();

const {
  createPaymentOrder,
  verifyPayment,
} = require("../controllers/paymentController");

const {
  authMiddleware,
  allowRoles,
} = require("../middleware/authMiddleware");

// Create Razorpay Test Payment
router.post(
  "/create-order",
  authMiddleware,
  allowRoles("customer"),
  createPaymentOrder
);

// Verify Payment
router.post(
  "/verify",
  authMiddleware,
  allowRoles("customer"),
  verifyPayment
);

module.exports = router;
