// routes/auth.js
const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

// Discord OAuth callback
router.get("/discord/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("No code in query");

  try {
    const redirectUri = "https://esportsmoba.dpdns.org/auth/discord/callback";

    const data = new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      scope: "identify",
    });

    console.log("Exchanging code for token...");

    // 交換 access token
    const tokenRes = await axios.post(
      "https://discord.com/api/oauth2/token",
      data.toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    if (!tokenRes.data || !tokenRes.data.access_token) {
      console.error("Token response error:", tokenRes.data);
      return res.redirect("/login.html?error=token_invalid");
    }

    const access_token = tokenRes.data.access_token;
    console.log("Access Token:", access_token);

    // 取得使用者資料
    const userRes = await axios.get("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const u = userRes.data;

    if (!u || !u.id) {
      console.error("User info error:", userRes.data);
      return res.redirect("/login.html?error=userinfo_invalid");
    }

    // 建立或更新
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

    console.log("Generated JWT:", token);

    // 導回前端
    return res.redirect(
      `https://esportsmoba.dpdns.org/register-system.html?token=${token}`
    );

  } catch (err) {
    console.error("Discord OAuth error:", err.response?.data || err.message || err);
    return res.redirect("/login.html?error=oauth_failed");
  }
});

module.exports = router;
