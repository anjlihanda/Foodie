const Food = require("../models/food");

// Get all foods (Customer)
const getFoods = async (req, res) => {
  try {
    const foods = await Food.find()
      .populate("restaurant", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(foods);
  } catch (error) {
    console.error("Fetch foods error:", error.message);

    res.status(500).json({
      message: "Failed to fetch foods",
    });
  }
};

// Add food (Restaurant Admin)
const addFood = async (req, res) => {
  try {
    const { name, price, category, image } = req.body;

    if (
      !name?.trim() ||
      price === undefined ||
      price === null ||
      price === "" ||
      !category?.trim()
    ) {
      return res.status(400).json({
        message: "Name, price and category are required",
      });
    }

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      return res.status(400).json({
        message: "Price must be a valid non-negative number",
      });
    }

    const food = await Food.create({
      name: name.trim(),
      price: numericPrice,
      category: category.trim(),
      image: image || "",
      restaurant: req.user._id,
    });

    res.status(201).json({
      message: "Food added successfully",
      food,
    });
  } catch (error) {
    console.error("Add food error:", error.message);

    res.status(500).json({
      message: "Failed to add food",
    });
  }
};

// Get only logged-in Restaurant Admin's foods
const getMyFoods = async (req, res) => {
  try {
    const foods = await Food.find({
      restaurant: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json(foods);
  } catch (error) {
    console.error("Fetch my foods error:", error.message);

    res.status(500).json({
      message: "Failed to fetch your foods",
    });
  }
};

module.exports = {
  getFoods,
  addFood,
  getMyFoods,
};