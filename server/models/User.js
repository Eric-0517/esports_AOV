const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  discordId: { type: String, required: true, unique: true },
  username: String,
  discriminator: String,
  avatar: String,
  role: { type: String, default: "user" },

  // 個人資料欄位
  nickname: String,
  rank: String,
  realname: String,
  phone: String,
  email: String,
  birthday: String,
  taiwan: String,
  id: String
});

module.exports = mongoose.model('User', UserSchema);
