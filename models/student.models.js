const mongoose=require('mongoose')
const joi = require('joi')


const vlidshame = joi.object({
   name : joi.string().required(),
   frstname : joi.string().required(),
   age : joi.number().required(),
})


var schame = {
   name :String,
   frstname :String,
   age :Number,
 }

  var student = mongoose.model('student',schame)

var url = 'mongodb+srv://mbeddani00:mohamedbeddani@cluster0.j6ag6.mongodb.net/invarsit'


exports.testconact=()=>{
   return new Promise((resolve,reject)=>{
mongoose.connect(url).then(()=>{
  mongoose.disconnect()
  resolve('hiyy')
}).catch((err)=>reject(err))
   })
}


exports.creatcollaction=(name,frstname,age)=>{
   return new Promise((resolve,reject)=>{
      mongoose.connect(url).then(()=>{
         const err = vlidshame.validate({name:name,frstname:frstname,age:age})
         if(err){
            mongoose.disconnect()
            reject(err)
         }
      student.insertMany(({
         name : name,
         frstname : frstname,
         age : age,
      })).then((douc)=>{
            mongoose.disconnect()
            resolve(douc)
         }).catch((err)=>reject(err))
      })
   })
}


exports.getallstudent=()=>{
   return new Promise((resolve,reject)=>{
      mongoose.connect(url).then(()=>{
      return student.find()
      }).then((doc)=>{
         mongoose.disconnect()
         resolve(doc)
      }).catch((err)=>{
         mongoose.disconnect()
         reject(err)
      })
   })
}


exports.getstudent=(name)=>{
   return new Promise((resolve,reject)=>{
      mongoose.connect(url).then(()=>{
      return student.find({name:name})
      }).then((doc)=>{
         mongoose.disconnect()
         resolve(doc)
      }).catch((err)=>{
         mongoose.disconnect()
         reject(err)
      })
   })
}



exports.deletstudent=(name)=>{
   return new Promise((resolve,reject)=>{
      mongoose.connect(url).then(()=>{
        student.deleteOne({name:name}).then((dco)=>{
         resolve(dco)
        })
         }).catch((err)=>reject(err))
      })
   }


   exports.updatestudent=(nam,name,frstname,age )=>{
      return new Promise((resolve,reject)=>{
         mongoose.connect(url).then(()=>{
           student.updateMany({name:nam},{name:name,frstname:frstname,age:age}).then((dco)=>{
            resolve(dco)
           })
            }).catch((err)=>reject(err))
         })
      }
   
    
 
   

