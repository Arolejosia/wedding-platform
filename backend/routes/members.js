const express = require("express");
const router = express.Router();
const WeddingMember = require("../models/WeddingMember");

router.get("/:weddingId", async (req,res)=>{

  const members = await WeddingMember.find({
    weddingId: req.params.weddingId
  });

  res.json(members);

});

router.post("/", async (req,res)=>{

  const member = new WeddingMember(req.body);

  await member.save();

  res.json(member);

});

router.delete("/:id", async (req,res)=>{

  await WeddingMember.findByIdAndDelete(req.params.id);

  res.json({success:true});

});

module.exports = router;