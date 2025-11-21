const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Middleware: 驗證 JWT
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // payload
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
}

// 取得個人資料
router.get("/", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ discordId: req.user.sub });
    res.json(user || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 更新 / 建立個人資料
router.post("/", authMiddleware, async (req, res) => {
  try {
    const data = req.body;
    const user = await User.findOneAndUpdate(
      { discordId: req.user.sub },
      { ...data, username: req.user.username, discordId: req.user.sub },
      { new: true, upsert: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
