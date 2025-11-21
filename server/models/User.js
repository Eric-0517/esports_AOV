const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  discordId: { type: String, required: true, unique: true },
  username: { type: String, required: true },       // Discord 名稱
  nickname: { type: String },                        // 遊戲暱稱
  rank: { type: String },                            // 遊戲排位
  realname: { type: String },
  phone: { type: String },
  email: { type: String },
  birthday: { type: Date },
  taiwan: { type: String },
  idNumber: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
