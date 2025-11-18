const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const teamRoutes = require('./routes/teams');
const adminRoutes = require('./routes/admin');

dotenv.config();
const app = express();

app.use(express.json());

// MongoDB Connect
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((e) => console.error(e));

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));
