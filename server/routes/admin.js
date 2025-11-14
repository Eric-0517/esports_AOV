
const express=require('express');
const jwt=require('jsonwebtoken');
const Team=require('../models/Team');
const axios=require('axios');
const router=express.Router();

function verifyAdmin(req){
  const header=req.headers.authorization;
  if(!header) return null;
  const token=header.split(' ')[1];
  try{const payload=jwt.verify(token,process.env.JWT_SECRET); return payload.role==='admin'?payload:null;}catch{return null;}
}

async function sendDm(botToken,userId,message){
  try{
    const ch=await axios.post('https://discord.com/api/v10/users/@me/channels',{recipient_id:userId},{headers:{Authorization:'Bot '+botToken}});
    await axios.post(`https://discord.com/api/v10/channels/${ch.data.id}/messages`,{content:message},{headers:{Authorization:'Bot '+botToken}});
  }catch(e){console.warn('DM failed',userId,e.message);}
}

router.get('/teams',async(req,res)=>{
  if(!verifyAdmin(req)) return res.status(401).json({message:'Unauthorized'});
  const teams=await Team.find();
  res.json(teams);
});

router.patch('/teams/:id/approve',async(req,res)=>{
  if(!verifyAdmin(req)) return res.status(401).json({message:'Unauthorized'});
  try{
    const team=await Team.findByIdAndUpdate(req.params.id,{status:'approved'},{new:true});
    if(!team) return res.status(404).json({message:'Not found'});
    for(const m of team.members){
      if(!m.discordId) continue;
      await sendDm(process.env.DISCORD_BOT_TOKEN,m.discordId,`你的報名（隊伍: ${team.name}）已被核准！`);
    }
    res.json({message:'Team approved and notifications attempted',team});
  }catch(e){console.error(e);res.status(500).json({message:'Server error'});}
});

module.exports=router;
