require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");

// Routers
const authRouter = require("./routes/auth.js");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// 靜態 public 資料夾
app.use(express.static(path.join(__dirname, "../public")));

// ---- 連接 MongoDB ----
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB 連線成功"))
.catch(err => console.error("MongoDB 連線失敗:", err));


// ---- Router 註冊 ----
app.use("/auth", authRouter);


// ---- 預設首頁 index.html ----
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// ---- 🔥 最重要：註冊頁面（避免 404）----
app.get("/register-system.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/register-system.html"));
});

// ---- 其他所有前端頁面都給 public ----
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});


// ---- 啟動伺服器 ----
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
