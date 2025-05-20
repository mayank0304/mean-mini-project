const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");

// Register a new user
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const user = new User({
      username,
      password: hashedPassword
    });
    
    await user.save();
    
    // Set user session
    req.session.userId = user._id;
    
    res.json({ success: true, username: user.username });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    
    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    
    // Set user session
    req.session.userId = user._id;
    
    res.json({ success: true, username: user.username });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

// Get current user
router.get("/user", async (req, res) => {
  if (!req.session.userId) {
    return res.json({ authenticated: false });
  }
  
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.json({ authenticated: false });
    }
    
    res.json({
      authenticated: true,
      username: user.username
    });
  } catch (err) {
    res.status(500).json({ error: "Error getting user" });
  }
});

// Logout
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.json({ success: true });
  });
});

module.exports = router;