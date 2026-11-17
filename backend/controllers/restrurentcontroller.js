const Resturent = require("../models/restrurent");
// SAVE OR UPDATE RESTAURANT LOCATION
const saveRestaurantLocation = async (req, res) => {
  try {
    const { restaurantName, restaurantAddress, latitude, longitude } =
      req.body;

    if (
      !restaurantName ||
      !restaurantAddress ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        message: "Please provide all restaurant details",
      });
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return res.status(400).json({
        message: "Invalid restaurant coordinates",
      });
    }

    const restaurant = await Resturent.findOneAndUpdate(
      { owner: req.user._id },
      {
        owner: req.user._id,
        restaurantName: restaurantName.trim(),
        restaurantAddress: restaurantAddress.trim(),
        latitude: lat,
        longitude: lng,
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      message: "Restaurant location saved successfully",
      restaurant,
    });
  } catch (error) {
    console.error("Save restaurant location error:", error);

    res.status(500).json({
      message: "Unable to save restaurant location",
    });
  }
};

// GET LOGGED-IN RESTAURANT LOCATION
const getRestaurantLocation = async (req, res) => {
  try {
    const restaurant = await Resturent.findOne({
      owner: req.user._id,
    });

    if (!restaurant) {
      return res.status(404).json({
        message: "Restaurant location not found",
      });
    }

    res.status(200).json({ restaurant });
  } catch (error) {
    console.error("Get restaurant location error:", error);

    res.status(500).json({
      message: "Unable to get restaurant location",
    });
  }
};

module.exports = {
  saveRestaurantLocation,
  getRestaurantLocation,
};
