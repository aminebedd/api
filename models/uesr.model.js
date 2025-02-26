const Joi = require('joi');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')



const vadishame = Joi.object({
    username: Joi.string().required(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
});


const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});


const User = mongoose.model('User', userSchema);


const url = 'mongodb+srv://mbeddani00:mohamedbeddani@cluster0.j6ag6.mongodb.net/invarsit';


exports.register = async (username, email, password) => {
    try {
     
        await mongoose.connect(url );

       
        const { error } = await vadishame.validateAsync({ username, email, password });
        if (error) {
            throw new Error(error.details[0].message); 
        }


        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return ('This email already exists');
        }

       
        const hashedPassword = await bcrypt.hash(password, 11);

      
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

       
        await newUser.save();

        return 'User registered successfully';
    } catch (error) {
        return error;
    } finally {
       
        await mongoose.disconnect();
    }
};

mykey = 'mohamed';

exports.login=(email,password)=>{
    return new Promise((resolve,reject)=>{
       mongoose.connect(url).then(()=>{
        return user.findOne({email:email})         
       }).then((doc)=>{
        if(doc){
        return bcrypt.compare(password,doc.password).then((same)=>{
            if(same){
               let token =jwt.sign({username:doc.username},mykey,{expiresIn : '1h'})
                mongoose.disconnect()
                resolve(token)
            }else{
                mongoose.disconnect()
                reject('invalid password !')
            }
        }).catch((err)=>{
            mongoose.disconnect()
            reject(err)
        })
        }else{
            mongoose.disconnect()
            reject('this email is not fond in databeas')
        }
    })
    })
}