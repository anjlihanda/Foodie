
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const foodRoutes = require("./routes/foodRoute");
const orderRoutes = require("./routes/orderRoute");
const offerRoutes = require("./routes/offerRoute");
const ratingRoutes = require("./routes/ratingRoute");
const favouriteRoutes = require("./routes/favouriteRoute");
const resturentRoutes = require("./routes/resturentRoute");
const paymentRoutes = require("./routes/paymentRoute");

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// AUTH ROUTES
app.use("/api/auth", authRoutes);

// FOOD ROUTES
app.use("/api/foods", foodRoutes);

// ORDER ROUTES
app.use("/api/orders", orderRoutes);

//offer route
app.use("/api/offers", offerRoutes);
 
//rating route
app.use("/api/ratings", ratingRoutes);

//payment route
app.use("/api/payments", paymentRoutes);

// HOME ROUTE
app.get("/", (req, res) => {
  res.send("Foodie Backend is Running!");
});

//fav route
app.use("/api/favourites", favouriteRoutes);

// RESTAURANT ROUTES
app.use("/api/restaurants", resturentRoutes);

// SERVER TEST ROUTE
app.get("/api/orders/test-server", (req, res) => {
  res.json({
    message: "Server order test working!",
  });
});

// SERVER
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Foodie Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
