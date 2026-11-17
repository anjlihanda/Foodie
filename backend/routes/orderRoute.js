
const express = require("express");
const router = express.Router();

const {
  placeOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/ordercontroller");

const {
  authMiddleware,
  allowRoles,
} = require("../middleware/authMiddleware");

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "Order route working!" });
});

// CUSTOMER ROUTES
router.post(
  "/",
  authMiddleware,
  allowRoles("customer"),
  placeOrder
);

router.get(
  "/my-orders",
  authMiddleware,
  allowRoles("customer"),
  getMyOrders
);

// RESTAURANT ADMIN ROUTES
router.get(
  "/all",
  authMiddleware,
  allowRoles("restaurantAdmin"),
  getAllOrders
);

router.put(
  "/:id/status",
  authMiddleware,
  allowRoles("restaurantAdmin"),
  updateOrderStatus
);

module.exports = router;
