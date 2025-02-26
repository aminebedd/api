const routre= require('express').Router();
const kkk = require('../models/student.models')
const jwt = require('jsonwebtoken')


mykey = 'mohamed';

const verifytoken = (req, res, next) => {
   let token = req.headers.authorization;

   if (!token) {
       return res.status(401).json({ msg: 'Access rejected! No token provided.' });
   }
   try {
       const decoded = jwt.verify(token, mykey);
       console.log(decoded);
       next();
   } catch (err) {
       return res.status(401).json({ msg: 'Access rejected! Invalid token.', error: err.message });
   }
};

module.exports = verifytoken;



routre.get('/',(req,res)=>{
   kkk.testconact().then(()=>res.send('welcom to api'))
})

routre.post('/',(req,res)=>{
   kkk.creatcollaction(req.body.name,req.body.frstname,req.body.age)
   .then((msg)=>res.json(msg))
   .catch((err)=>res.status(400).json(err))
})
 
routre.get('/allstudent',(req,res)=>{
   kkk.getallstudent()
   .then((msg)=>res.json(msg))
   .catch((err)=>res.status(400).json(err))  
})

routre.get('/student/:name',verifytoken,(req,res)=>{
   kkk.getstudent(req.params.name)
   .then((msg)=>res.json(msg))
   .catch((err)=>res.status(400).json(err))     
})

routre.delete('/delete/:name',verifytoken,(req,res)=>{
   kkk.deletstudent(req.params.name)
   .then((msg)=>res.json(msg))
   .catch((err)=>res.status(400).json(err))
})

routre.put('/update/:name',verifytoken,(req,res)=>{
   kkk.updatestudent(req.params.name,req.body.name,req.body.frstname,req.body.age)
   .then((msg)=>res.json(msg))
   .catch((err)=>res.status(400).json(err))
})





module.exports = routre;