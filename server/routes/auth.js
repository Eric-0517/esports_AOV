const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

// ====================
//  Discord OAuth callback
// ====================
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

    // 交換 access token
    const tokenRes = await axios.post(
      "https://discord.com/api/oauth2/token",
      data.toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    if (!tokenRes.data?.access_token) {
      console.error("Token response error:", tokenRes.data);
      return res.redirect("/login.html?error=token_invalid");
    }

    const access_token = tokenRes.data.access_token;

    // 取得使用者資料
    const userRes = await axios.get("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const u = userRes.data;

    if (!u?.id) {
      console.error("User info error:", userRes.data);
      return res.redirect("/login.html?error=userinfo_invalid");
    }

    // 建立/更新資料
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

    // 生成 JWT Token
    const token = jwt.sign(
      {
        sub: user.discordId,
        username: user.username,
        role: user.role || "user",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 導回前端
    return res.redirect(
      `https://esportsmoba.dpdns.org/register-system.html?token=${token}`
    );

  } catch (err) {
    console.error("Discord OAuth error:", err.response?.data || err);
    return res.redirect("/login.html?error=oauth_failed");
  }
});

// ====================
//  驗證 token（前端用）
// ====================
router.get("/me", async (req, res) => {
  try {
    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith("Bearer ")) {
      return res.json({ ok: false, message: "No token" });
    }

    const token = auth.replace("Bearer ", "");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 從 DB 取資料（可選）
    const user = await User.findOne({ discordId: decoded.sub });

    return res.json({
      ok: true,
      username: user?.username || decoded.username,
      role: user?.role || "user",
    });

  } catch (err) {
    return res.json({ ok: false, message: "Token invalid" });
  }
});

module.exports = router;
