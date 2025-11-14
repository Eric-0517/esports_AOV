
const mongoose=require('mongoose');
const UserSchema=new mongoose.Schema({
  discordId:{type:String,required:true,unique:true},
  username:String,
  discriminator:String,
  avatar:String,
  role:{type:String,default:"user"}
},{timestamps:true});
module.exports=mongoose.models.User || mongoose.model('User',UserSchema);
