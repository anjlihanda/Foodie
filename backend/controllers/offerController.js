
const mongoose = require("mongoose");
const Offer = require("../models/offer");

// CREATE OFFER
const createOffer = async (req, res) => {
  try {
    const {
      title,
      description,
      couponCode,
      discountPercentage,
      minimumOrderAmount,
      expiryDate,
    } = req.body;

    if (
      !title ||
      !description ||
      !couponCode ||
      discountPercentage === undefined ||
      !expiryDate
    ) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    if (new Date(expiryDate) <= new Date()) {
      return res.status(400).json({
        message: "Expiry date must be in the future",
      });
    }

    const existingOffer = await Offer.findOne({
      couponCode: couponCode.trim().toUpperCase(),
    });

    if (existingOffer) {
      return res.status(400).json({
        message: "Coupon code already exists",
      });
    }

    const offer = await Offer.create({
      restaurant: req.user._id,
      title,
      description,
      couponCode,
      discountPercentage,
      minimumOrderAmount: minimumOrderAmount || 0,
      expiryDate,
    });

    return res.status(201).json({
      message: "Offer created successfully",
      offer,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// GET ACTIVE OFFERS
const getOffers = async (req, res) => {
  try {
    const offers = await Offer.find({
      isActive: true,
      expiryDate: { $gt: new Date() },
    })
      .populate("restaurant", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: offers.length,
      offers,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// UPDATE OFFER
const updateOffer = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid offer ID",
      });
    }

    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({
        message: "Offer not found",
      });
    }

    // Restaurant admin can update only their own offer
    if (
      req.user.role === "restaurantAdmin" &&
      offer.restaurant.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "You cannot update another restaurant's offer",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "couponCode",
      "discountPercentage",
      "minimumOrderAmount",
      "expiryDate",
      "isActive",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        offer[field] = req.body[field];
      }
    });

    await offer.save();

    return res.status(200).json({
      message: "Offer updated successfully",
      offer,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE OFFER
const deleteOffer = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid offer ID",
      });
    }

    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({
        message: "Offer not found",
      });
    }

    if (
      req.user.role === "restaurantAdmin" &&
      offer.restaurant.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "You cannot delete another restaurant's offer",
      });
    }

    await offer.deleteOne();

    return res.status(200).json({
      message: "Offer deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createOffer,
  getOffers,
  updateOffer,
  deleteOffer,
};
