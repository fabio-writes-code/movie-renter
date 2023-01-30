const mongoose=require('mongoose')
const Joi=require('joi')
const {genreSchema}=require('./genres');
const { boolean } = require('joi');


const movieSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true,
        minlength:3,
        maxlength:255
    },
    genre:{
        type:genreSchema,
        required:true
    },
    numberInStock:{
        type:Number,
        required:true,
        min:0,
        max:255
    },
    dailyRentalRate:{
        type:Number,
        required:true,
        min:0,
        max:255
    }
})

const Movie=mongoose.model('Movies',movieSchema);

// Validate Input
function validate(movie){
    const schema=Joi.object({
        title:Joi.string().min(3).max(255).required(),
        numberInStock:Joi.number().min(0).max(255).required(),
        dailyRentalRate:Joi.number().min(0).max(255).required(),
        genreId:Joi.objectId().required()
    })
    return schema.validate(movie) 
}

exports.Movie=Movie;
exports.movieSchema=movieSchema;
exports.validate=validate;
