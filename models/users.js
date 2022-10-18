const mongoose=require('mongoose')
const Joi=require('joi');
const jwt=require('jsonwebtoken')
const config =require('config')
const { date } = require('joi');

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        minlength:3,
        maxlength: 250
    },
    email:{
        type:String,
        required:true,
        unique:true,
        minlength:3,
        maxlength: 255 
    },
    password:{
        type:String,
        required:true,
        minlength:3,
        maxlength:1024
    },
    isAdmin:Boolean
})

userSchema.methods.generateAuthToken=function(){
    const token=jwt.sign({_id:this._id,isAdmin:this.isAdmin},config.get('jwtPrivateKey'))
    return token
}

const User=mongoose.model('User',userSchema)

function validate(user){
    const schema=Joi.object({
        name:Joi.string().min(3).max(250).required(),
        email:Joi.string().min(3).max(255).required().email(), //*email() checks that the email is valid
        password:Joi.string().min(3).max(255).required()
    })
    return schema.validate(user) 
}

exports.User=User;
exports.validate=validate;
