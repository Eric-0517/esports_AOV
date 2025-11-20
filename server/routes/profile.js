const express = require('express');
const User = require('../models/User'); // 你的 User model
const router = express.Router();

// 取得個人資料
router.get('/', async (req, res) => {
  const discordId = req.query.discordId;
  if(!discordId) return res.status(400).json({ error: "No discordId" });

  try {
    const user = await User.findOne({ discordId });
    res.json(user || {});
  } catch(err){
    res.status(500).json({ error: err.message });
  }
});

// 更新個人資料
router.post('/', async (req, res) => {
  const { discordId, nickname, rank, realname, phone, email, birthday, taiwan, id } = req.body;
  if(!discordId) return res.status(400).json({ error: "No discordId" });

  try {
    const user = await User.findOneAndUpdate(
      { discordId },
      { nickname, rank, realname, phone, email, birthday, taiwan, id },
      { new: true, upsert: true }
    );
    res.json(user);
  } catch(err){
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
