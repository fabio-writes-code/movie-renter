// TODO Authentication methods

const express=require('express')
const router=express.Router()
const mongoose=require('mongoose');
const {User}=require('../models/users');
const _=require('lodash')
const bcrypt=require('bcrypt')
const Joi=require('joi')
const jwt=require('jsonwebtoken')
const config=require('config')

// POST
router.post('/', async (req,res)=>{
    const { error } =validate(req.body) //*Validate function is part of the route module
    if (error) return res.status(400).send(error.details[0].message)

    // *Validate the email and look for user in the database
    let user = await User.findOne({email:req.body.email})
    if (!user) return res.status(401).send('Invalid user or password')

    // *validating password with bcrypt
    const validPassword=await bcrypt.compare(req.body.password, user.password)
    if (!validPassword) return res.status(403).send('Invalid user or password')

    const token=user.generateAuthToken();
    res.send(token)

})

function validate(req){
    const schema=Joi.object({
        email:Joi.string().min(3).max(255).required().email(),
        password:Joi.string().min(3).max(255).required()
    })
    return schema.validate(req) 
}

module.exports=router;
