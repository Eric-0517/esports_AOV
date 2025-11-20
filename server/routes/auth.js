const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

router.get('/discord/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('No code in query');

  try {
    const redirectUri = "https://esportsmoba.dpdns.org/auth/discord/callback"; // 必須和 Discord 設定完全一致

    const data = new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      scope: "identify"
    });

    // 交換 access token
    const tokenRes = await axios.post(
      "https://discord.com/api/oauth2/token",
      data.toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const access_token = tokenRes.data.access_token;

    // 取得使用者資料
    const userRes = await axios.get("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const u = userRes.data;

    // 建立或更新資料庫
    const user = await User.findOneAndUpdate(
      { discordId: u.id },
      {
        discordId: u.id,
        username: u.username,
        discriminator: u.discriminator,
        avatar: u.avatar
      },
      { upsert: true, new: true }
    );

    // 建立 JWT
    const token = jwt.sign(
      {
        sub: user.discordId,
        role: user.role,
        username: user.username
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 導回前端，附帶 JWT
    res.redirect(`https://esportsmoba.dpdns.org/register-system.html?token=${token}`);

  } catch (e) {
    // 🔹 debug: 印出完整 Discord 回傳錯誤
    console.error("Discord OAuth error:", e.response?.data || e.message || e);
    res.status(500).send(`OAuth error: ${JSON.stringify(e.response?.data || e.message || e)}`);
  }
});

module.exports = router;
