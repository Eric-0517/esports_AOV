
const express=require('express');
const jwt=require('jsonwebtoken');
const Team=require('../models/Team');
const router=express.Router();

function auth(req){
  const header=req.headers.authorization;
  if(!header) return null;
  const token=header.split(' ')[1];
  try{return jwt.verify(token,process.env.JWT_SECRET);}catch{return null;}
}

router.post('/register',async(req,res)=>{
  const user=auth(req);
  if(!user) return res.status(401).json({message:"Unauthorized"});
  try{
    const {name,members}=req.body;
    const team=await Team.create({name,members,status:'pending',createdBy:user.sub});
    res.json(team);
  }catch(e){console.error(e);res.status(500).json({message:"Server error"});}
});

module.exports=router;
