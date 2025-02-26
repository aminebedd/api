const express = require('express');
const app = express();
const mongoos = require('mongoose');
const testconact= require('./router/student.router')
const loginn= require('./router/uesr.router')

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin',"*")
    res.setHeader('Access-Control-Request-Method',"*")
    res.setHeader('Access-Control-Request-Headers',"*")
    next()
})

app.use('/',testconact)
app.use('/',loginn)


app.listen(8000 ,()=>{console.log('mri9laaa')})