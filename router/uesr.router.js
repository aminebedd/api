const routre= require('express').Router();
const kkk = require('../models/uesr.model')
  

routre.post('/registr',(req,res)=>{
   kkk.register(req.body.username,req.body.email,req.body.password)
   .then((msg)=>res.json(msg))
   .catch((err)=>res.status(400).json(err))
})
 

routre.post('/login',(req,res)=>{
    kkk.login(req.body.email,req.body.password)
    .then((msg)=>res.json(msg))
    .catch((err)=>res.status(400).json(err))
 })



module.exports = routre;