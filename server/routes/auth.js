const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

//  Discord OAuth callback
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

    const access_token = tokenRes.data?.access_token;
    if (!access_token) return res.redirect("/login.html?error=token_invalid");

    // 取得使用者資料
    const userRes = await axios.get("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const u = userRes.data;
    if (!u?.id) return res.redirect("/login.html?error=userinfo_invalid");

    // 建立或更新使用者
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

    // 產生 JWT
    const token = jwt.sign(
      {
        sub: user.discordId,
        username: user.username,
        role: user.role || "user",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    //存入 Cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
    });

    // 成功跳回系統首頁
    return res.redirect("https://esportsmoba.dpdns.org/register-system.html");

  } catch (err) {
    console.error("Discord OAuth error:", err.response?.data || err);
    return res.redirect("/login.html?error=oauth_failed");
  }
});

//  驗證登入狀態
router.get("/me", async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.json({ ok: false, message: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ discordId: decoded.sub });

    return res.json({
      ok: true,
      username: user?.username || decoded.username,
      role: user?.role || "user",
      discordId: decoded.sub,
    });

  } catch (err) {
    return res.json({ ok: false, message: "Token invalid" });
  }
});

// 登出
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  res.json({ ok: true });
});

module.exports = router;
