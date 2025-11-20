// server/app.js
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// 先載入環境變數
dotenv.config();

const app = express(); // 先宣告 app

// JSON 解析
app.use(express.json());

// --- 路由 ---
const authRoutes = require('./routes/auth');
const teamRoutes = require('./routes/teams');
const adminRoutes = require('./routes/admin');
const profileRoutes = require('./routes/profile');

// 使用路由
app.use('/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);

// --- MongoDB Connect ---
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => {
  console.error("❌ MongoDB connection error:", err);
  process.exit(1); // 連線失敗直接停止伺服器
});

// --- 靜態檔案服務 ---
app.use(express.static(path.join(__dirname, '../public')));

// --- 主頁（index.html）---
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// --- 404 頁面 ---
app.use((req, res) => {
  res.status(404).send("404 Not Found");
});

// --- 啟動 Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
