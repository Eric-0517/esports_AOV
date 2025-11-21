const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth.js"); // Discord OAuth
const profileRoutes = require("./routes/profile.js");

dotenv.config();
const app = express();

// JSON 解析
app.use(express.json());
app.use(cors());

// MongoDB 連線
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => {
  console.error("❌ MongoDB connection error:", err);
  process.exit(1);
});

// 靜態檔案
app.use(express.static(path.join(__dirname, "../public")));

// 主頁
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// API
app.use("/auth", authRoutes);
app.use("/api/profile", profileRoutes);

// 404
app.use((req, res) => res.status(404).send("404 Not Found"));

// 啟動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
