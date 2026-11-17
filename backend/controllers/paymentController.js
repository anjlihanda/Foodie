
const crypto = require("crypto");
const Razorpay = require("razorpay");

const mongoose = require("mongoose");
const Payment = require("../models/payment");
const Order = require("../models/order");
const Food = require("../models/food");
const Offer = require("../models/offer");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// CREATE RAZORPAY TEST ORDER
const createPaymentOrder = async (req, res) => {
  try {
    const {
      items,
      deliveryAddress,
      deliveryLocation,
      phone,
      couponCode,
    } = req.body;

    const cleanPhone = String(phone || "").trim();
    const cleanAddress = String(deliveryAddress || "").trim();
    const cleanCoupon = String(couponCode || "").trim().toUpperCase();

    if (
      !Array.isArray(items) ||
      items.length === 0 ||
      !cleanAddress
    ) {
      return res.status(400).json({
        message: "Food items and delivery address are required",
      });
    }

    if (!/^[6-9][0-9]{9}$/.test(cleanPhone)) {
      return res.status(400).json({
        message: "Invalid mobile number",
      });
    }

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
        message: "Invalid food ID. Refresh the menu",
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

    const restaurantId = foods[0].restaurant.toString();

    const sameRestaurant = foods.every(
      (food) => food.restaurant.toString() === restaurantId
    );

    if (!sameRestaurant) {
      return res.status(400).json({
        message: "Please order from one restaurant at a time",
      });
    }

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

    const subtotal = orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    let discount = 0;
    let appliedCoupon = "";

    if (cleanCoupon) {
      const offer = await Offer.findOne({
        couponCode: cleanCoupon,
        restaurant: restaurantId,
        isActive: true,
        expiryDate: { $gt: new Date() },
      });

      if (!offer) {
        return res.status(400).json({
          message: "Invalid or expired coupon",
        });
      }

      if (subtotal < offer.minimumOrderAmount) {
        return res.status(400).json({
          message: `Minimum order amount is ₹${offer.minimumOrderAmount}`,
        });
      }

      discount = Math.round(
        (subtotal * offer.discountPercentage) / 100
      );

      appliedCoupon = offer.couponCode;
    }

    const totalAmount = Math.max(0, subtotal - discount);

    if (totalAmount <= 0) {
      return res.status(400).json({
        message: "Online payment amount must be greater than zero",
      });
    }

    // Amount is converted from rupees to paise
    const amountInPaise = Math.round(totalAmount * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `foodie_${Date.now()}`,
    });

    await Payment.create({
      customer: req.user._id,
      restaurant: restaurantId,
      phone: cleanPhone,
      items: orderItems,
      subtotal,
      discount,
      couponCode: appliedCoupon,
      totalAmount,
      deliveryAddress: cleanAddress,
      deliveryLocation: savedLocation,
      razorpayOrderId: razorpayOrder.id,
    });

    return res.status(201).json({
      message: "Payment order created",
      key: process.env.RAZORPAY_KEY_ID,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });

  } catch (error) {
    console.error("Create payment error:", error);

    return res.status(500).json({
      message: error.message || "Unable to create payment",
    });
  }
};


// VERIFY RAZORPAY PAYMENT AND CREATE FOODIE ORDER
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        message: "Payment verification details are missing",
      });
    }

    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
      customer: req.user._id,
    });

    if (!payment) {
      return res.status(404).json({
        message: "Payment record not found",
      });
    }

    // Prevent duplicate order creation
    if (payment.foodieOrder) {
      const existingOrder = await Order.findById(payment.foodieOrder);

      if (existingOrder) {
        return res.status(200).json({
          message: "Payment already verified",
          order: existingOrder,
        });
      }
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      return res.status(500).json({
        message: "Razorpay secret is not configured",
      });
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const signatureBuffer = Buffer.from(expectedSignature, "hex");
    const receivedBuffer = Buffer.from(razorpay_signature, "hex");

    if (
      signatureBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, receivedBuffer)
    ) {
      payment.paymentStatus = "Failed";
      await payment.save();

      return res.status(400).json({
        message: "Payment signature verification failed",
      });
    }

    const order = await Order.create({
      customer: payment.customer,
      restaurant: payment.restaurant,
      phone: payment.phone,
      items: payment.items,
      subtotal: payment.subtotal,
      discount: payment.discount,
      couponCode: payment.couponCode,
      totalAmount: payment.totalAmount,
      deliveryAddress: payment.deliveryAddress,
      deliveryLocation: payment.deliveryLocation,
      paymentMethod: "Online",
      paymentStatus: "Paid",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      status: "Placed",
    });

    payment.razorpayPaymentId = razorpay_payment_id;
    payment.paymentStatus = "Paid";
    payment.foodieOrder = order._id;

    await payment.save();

    return res.status(200).json({
      message: "Payment verified and order placed successfully",
      order,
    });

  } catch (error) {
    console.error("Payment verification error:", error);

    return res.status(500).json({
      message: "Payment verification failed",
    });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
};
