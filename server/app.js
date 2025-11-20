const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const teamRoutes = require('./routes/teams');
const adminRoutes = require('./routes/admin');
const profileRoutes = require('./routes/profile');
app.use('/api/profile', profileRoutes);

dotenv.config();
const app = express();

// JSON 解析
app.use(express.json());

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

// --- 靜態檔案（CSS / JS / images）---
app.use(express.static(path.join(__dirname, '../public')));

// --- 主頁（index.html）---
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// --- API Routes ---
app.use('/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/admin', adminRoutes);

// --- 404 頁面 ---
app.use((req, res) => {
  res.status(404).send("404 Not Found");
});

// --- Server 啟動 ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
