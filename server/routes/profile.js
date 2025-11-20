const express = require('express');
const router = express.Router();
const User = require('../models/User'); // 假設使用同一個 User 模型

// 取得使用者資料
router.get('/:discordId', async (req, res) => {
  try {
    const user = await User.findOne({ discordId: req.params.discordId });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 更新使用者資料（Upsert）
router.post('/:discordId', async (req, res) => {
  try {
    const update = req.body;
    const user = await User.findOneAndUpdate(
      { discordId: req.params.discordId },
      { ...update },
      { upsert: true, new: true }
    );
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
