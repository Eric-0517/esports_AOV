
const mongoose=require('mongoose');
const TeamSchema=new mongoose.Schema({
  name:{type:String,required:true},
  members:[{discordId:String,username:String}],
  status:{type:String,default:"pending"},
  createdBy:String
},{timestamps:true});
module.exports=mongoose.models.Team || mongoose.model('Team',TeamSchema);
