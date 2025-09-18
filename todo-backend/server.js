// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const User = require("./models/user"); // make sure this path is correct

const app = express();
const path = require("path");
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "..")));

// ✅ Connect to MongoDB (configurable via env)
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/todo_app";
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// ✅ Signup route
app.post("/api/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // save new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("🔥 Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Login route (with debug logs)
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("📥 Login attempt:", username, password);

    // find by username OR email
    const user = await User.findOne({
      $or: [{ username: username }, { email: username }]
    });

    if (!user) {
      console.log("❌ User not found");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("🔑 Password match:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // generate JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: { username: user.username, email: user.email }
    });
  } catch (err) {
    console.error("🔥 Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get logged-in user route
app.get("/api/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123");

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("🔥 /api/me error:", err);
    return res.status(401).json({ message: "Invalid token" });
  }
});

// ✅ Start server only when not under test
const PORT = process.env.PORT || 4000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

module.exports = app;
