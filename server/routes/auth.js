// routes/auth.js
const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // 你需要建立 User model
const router = express.Router();

// Discord OAuth callback
router.get("/discord/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("No code in query");

  try {
    const redirectUri = "https://esportsmoba.dpdns.org/auth/discord/callback"; // 與 Discord App 設定一致

    const data = new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      scope: "identify",
    });

    // 交換 access token
    const tokenRes = await axios.post(
      "https://discord.com/api/oauth2/token",
      data.toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const access_token = tokenRes.data.access_token;

    // 取得 Discord 使用者資料
    const userRes = await axios.get("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const u = userRes.data;

    // 建立或更新使用者資料
    const user = await User.findOneAndUpdate(
      { discordId: u.id },
      {
        discordId: u.id,
        username: u.username,
        discriminator: u.discriminator,
        avatar: u.avatar,
      },
      { upsert: true, new: true }
    );

    // 生成 JWT
    const token = jwt.sign(
      {
        sub: user.discordId,
        role: user.role || "user",
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 導回前端並帶上 token
    res.redirect(`https://esportsmoba.dpdns.org/register-system.html?token=${token}`);
  } catch (err) {
    console.error("Discord OAuth error:", err.response?.data || err.message || err);
    res.status(500).send("Discord OAuth error");
  }
});

module.exports = router;
