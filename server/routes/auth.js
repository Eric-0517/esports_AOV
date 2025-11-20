const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

router.get('/discord/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('No code');

  try {
    // Discord MUST match EXACTLY the redirect_uri registered in Dev Portal
    const redirectUri = "https://esportsmoba.dpdns.org/auth/discord/callback";

    const data = new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri, 
      scope: "identify"
    });

    // Exchange code for token
    const tokenRes = await axios.post(
      "https://discord.com/api/oauth2/token",
      data.toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      }
    );

    const access_token = tokenRes.data.access_token;

    // Fetch user info
    const userRes = await axios.get("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const u = userRes.data;

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

    // Create JWT
    const token = jwt.sign(
      {
        sub: user.discordId,
        role: user.role,
        username: user.username
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Redirect back with token
    res.redirect(`https://esportsmoba.dpdns.org/register-system.html?token=${token}`);

  } catch (e) {
    console.error(e.response?.data || e);
    res.status(500).send("OAuth error");
  }
});

module.exports = router;
