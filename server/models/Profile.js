const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
  discordId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  nickname: { type: String },
  rank: { type: String },
  realname: { type: String },
  phone: { type: String },
  email: { type: String },
  birthday: { type: String },
  taiwan: { type: String },
  idNumber: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Profile", ProfileSchema);
