const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Profile = require("../models/Profile");

// Middleware 驗證 JWT
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "未授權" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "未授權" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token 無效" });
  }
}

// GET 個人資料
router.get("/", verifyToken, async (req, res) => {
  try {
    let profile = await Profile.findOne({ discordId: req.user.sub });
    if (!profile) return res.json({});
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: "伺服器錯誤" });
  }
});

// POST 更新或新增個人資料
router.post("/", verifyToken, async (req, res) => {
  try {
    const data = req.body;
    let profile = await Profile.findOne({ discordId: req.user.sub });
    if (!profile) {
      profile = new Profile({
        discordId: req.user.sub,
        username: req.user.username,
        ...data
      });
    } else {
      // nickname / rank 只能寫一次
      if (!profile.nickname) profile.nickname = data.nickname;
      if (!profile.rank) profile.rank = data.rank;

      // 其他欄位可更新
      profile.realname = data.realname;
      profile.phone = data.phone;
      profile.email = data.email;
      profile.birthday = data.birthday;
      profile.taiwan = data.taiwan;
      profile.idNumber = data.idNumber;
    }

    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "伺服器錯誤" });
  }
});

module.exports = router;
