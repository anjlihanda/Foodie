
const mongoose = require("mongoose");
const Order = require("../models/order");
const Food = require("../models/food");
const Offer = require("../models/offer");
const Resturent = require("../models/restrurent");

// PLACE NEW ORDER - CUSTOMER
const placeOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, deliveryLocation } = req.body;

    const phone = String(req.body.phone || "").trim();
    const couponCode = String(req.body.couponCode || "")
      .trim()
      .toUpperCase();

    if (
      !Array.isArray(items) ||
      items.length === 0 ||
      !deliveryAddress ||
      !deliveryAddress.trim()
    ) {
      return res.status(400).json({
        message: "Food items and delivery address are required",
      });
    }

    if (!/^[6-9][0-9]{9}$/.test(phone)) {
      return res.status(400).json({
        message: "Please enter a valid 10-digit mobile number",
      });
    }

    // Validate customer GPS coordinates if provided
    let savedLocation = {
      latitude: null,
      longitude: null,
    };

    if (deliveryLocation) {
      const latitude = Number(deliveryLocation.latitude);
      const longitude = Number(deliveryLocation.longitude);

      if (
        deliveryLocation.latitude == null ||
        deliveryLocation.longitude == null ||
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        return res.status(400).json({
          message: "Invalid customer location",
        });
      }

      savedLocation = { latitude, longitude };
    }

    const foodIds = items.map((item) => item.foodId);

    if (
      foodIds.some(
        (id) => !id || !mongoose.Types.ObjectId.isValid(String(id))
      )
    ) {
      return res.status(400).json({
        message: "Invalid food ID. Please refresh the menu",
      });
    }

    const foods = await Food.find({
      _id: { $in: foodIds },
    });

    if (foods.length !== new Set(foodIds.map(String)).size) {
      return res.status(400).json({
        message: "Some food items were not found",
      });
    }

    // Check all foods belong to the same restaurant
    const restaurantId = foods[0].restaurant.toString();

    const sameRestaurant = foods.every(
      (food) => food.restaurant.toString() === restaurantId
    );

    if (!sameRestaurant) {
      return res.status(400).json({
        message: "Please place separate orders for different restaurants",
      });
    }

    // Prepare order items using database prices
    const orderItems = items.map((item) => {
      const food = foods.find(
        (f) => f._id.toString() === String(item.foodId)
      );

      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        throw new Error("Invalid food quantity");
      }

      return {
        foodId: food._id,
        foodName: food.name,
        price: food.price,
        quantity,
      };
    });

    // Calculate subtotal
    const subtotal = orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    let discount = 0;
    let appliedCoupon = "";

    // Verify coupon from database
    if (couponCode) {
      const offer = await Offer.findOne({
        couponCode,
        restaurant: restaurantId,
        isActive: true,
        expiryDate: { $gt: new Date() },
      });

      if (!offer) {
        return res.status(400).json({
          message: "Invalid or expired coupon for this restaurant",
        });
      }

      if (subtotal < offer.minimumOrderAmount) {
        return res.status(400).json({
          message: `Minimum order amount for this coupon is ₹${offer.minimumOrderAmount}`,
        });
      }

      discount = Math.round(
        (subtotal * offer.discountPercentage) / 100
      );

      appliedCoupon = offer.couponCode;
    }

    const totalAmount = Math.max(0, subtotal - discount);

    const order = await Order.create({
      customer: req.user._id,
      restaurant: restaurantId,
      phone,
      items: orderItems,
      subtotal,
      discount,
      couponCode: appliedCoupon,
      totalAmount,
      deliveryAddress: deliveryAddress.trim(),
      deliveryLocation: savedLocation,
    });

    return res.status(201).json({
      message: "Order placed successfully",
      order,
    });

  } catch (error) {
    console.error("Place order error:", error.message);

    return res.status(400).json({
      message: error.message || "Failed to place order",
    });
  }
};


// GET CUSTOMER'S OWN ORDERS WITH RESTAURANT LOCATION
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      customer: req.user._id,
    })
      .populate("restaurant", "name")
      .sort({ createdAt: -1 });

    const restaurantIds = [
      ...new Set(
        orders
          .map((order) => order.restaurant?._id?.toString())
          .filter(Boolean)
      ),
    ];

    const restaurantLocations = await Resturent.find({
      owner: { $in: restaurantIds },
    });

    const updatedOrders = orders.map((order) => {
      const restaurantLocation = restaurantLocations.find(
        (location) =>
          location.owner.toString() === order.restaurant?._id?.toString()
      );

      return {
        ...order.toObject(),
        restaurantLocation: restaurantLocation
          ? {
              restaurantName: restaurantLocation.restaurantName,
              restaurantAddress: restaurantLocation.restaurantAddress,
              latitude: restaurantLocation.latitude,
              longitude: restaurantLocation.longitude,
            }
          : null,
      };
    });

    return res.status(200).json(updatedOrders);

  } catch (error) {
    console.error("Fetch customer orders error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch orders",
    });
  }
};


// GET RESTAURANT ADMIN'S ORDERS
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      restaurant: req.user._id,
    })
      .populate("customer", "name email phone")
      .sort({ createdAt: -1 });

    return res.status(200).json(orders);

  } catch (error) {
    console.error("Fetch restaurant orders error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch orders",
    });
  }
};


// UPDATE ORDER STATUS - RESTAURANT ADMIN ONLY
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Accepted",
      "Rejected",
      "Preparing",
      "Out for Delivery",
      "Delivered",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      restaurant: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found for your restaurant",
      });
    }

    const allowedTransitions = {
      Placed: ["Accepted", "Rejected"],
      Accepted: ["Preparing"],
      Preparing: ["Out for Delivery"],
      "Out for Delivery": ["Delivered"],
    };

    if (!allowedTransitions[order.status]?.includes(status)) {
      return res.status(400).json({
        message: `Cannot change status from ${order.status} to ${status}`,
      });
    }

    order.status = status;

    await order.save();

    return res.status(200).json({
      message: `Order status updated to ${status}`,
      order,
    });

  } catch (error) {
    console.error("Update order error:", error.message);

    return res.status(500).json({
      message: "Failed to update order status",
    });
  }
};


// EXPORT ALL FUNCTIONS
module.exports = {
  placeOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
};
