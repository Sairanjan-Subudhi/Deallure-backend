const express = require("express");
const { signupUser, loginUser } = require("../services/userOperations");

const router = express.Router();

// Signup route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const result = await signupUser(req.body);
    res.status(201).json({ message: result.message });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const response = await loginUser(req.body);
    res.status(200).json(response);
  } catch (err) {
    res.status(err.statusCode || 401).json({ error: err.message });
  }
});

module.exports = router;