const express = require("express");

const {
  registerUser,
  loginUser,
} = require("../controllers/authcontroller");

const router = express.Router();

// Signup
router.post("/signup", registerUser);

// Login
router.post("/login", loginUser);

module.exports = router;
