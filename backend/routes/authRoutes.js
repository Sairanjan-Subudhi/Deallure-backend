const express = require("express");
const { signupUser } = require("../services/userOperations");
const { loginUser } = require("../services/userOperations");

const router = express.Router();

// Signup route
router.post("/signup", async (req, res) => {
  try {
    const message = await signupUser(req.body);
    res.status(201).json({ message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const response = await loginUser(req.body);
    res.status(200).json(response);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

module.exports = router;