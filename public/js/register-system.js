const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

// 解析 JWT 中間件
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ ok: false, msg: "No token" });

  const token = header.split(" ")[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, msg: "Invalid token" });
  }
}

// OAuth callback
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

    const tokenRes = await axios.post(
      "https://discord.com/api/oauth2/token",
      data.toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const access_token = tokenRes.data.access_token;

    const userRes = await axios.get("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const u = userRes.data;

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

    const jwtToken = jwt.sign(
      {
        sub: user.discordId,
        username: user.username,
        role: user.role || "user",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.redirect(
      `https://esportsmoba.dpdns.org/register-system.html?token=${jwtToken}`
    );
  } catch (err) {
    console.error("OAuth Error:", err.response?.data || err);
    res.status(500).send("Discord OAuth error");
  }
});

//提供前端檢查登入狀態用
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ discordId: req.user.sub });
    if (!user) return res.json({ ok: false });

    return res.json({
      ok: true,
      username: user.username,
      discordId: user.discordId
    });
  } catch {
    return res.json({ ok: false });
  }
});

module.exports = router;
