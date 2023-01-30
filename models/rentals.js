const mongoose = require('mongoose');
const Joi = require('joi');
const { date } = require('joi');
const moment=require('moment')

const rentalSchema = new mongoose.Schema({
    customer: {
        type: new mongoose.Schema({
            name: {
                type: String,
                required: true,
                minlength: 5,
                maxlength: 50,
            },
            isGold: {
                type: Boolean,
                required: true,
            },
            phone: {
                type: String,
                required: true,
                minlength: 8,
                maxlength: 10,
            },
        }),
        required: true,
    },
    movie: {
        type: new mongoose.Schema({
            title: {
                type: String,
                required: true,
                trim: true,
                minlength: 3,
                maxlength: 255,
            },
            dailyRentalRate: {
                type: Number,
                required: true,
                min: 0,
                max: 255,
            },
        }),
        required: true,
    },
    dateOut: {
        type: Date,
        required: true,
        default: Date.now,
    },
    dayReturned: {
        type: Date, //* Not required
    },
    rentalFee: {
        type: Number,
        min: 0,
    },
});

// *Adding a static method to look and return a rental object
rentalSchema.statics.lookUp = function (customerId, movieId) {
    return this.findOne({
        'customer._id': customerId,
        'movie._id': movieId,
    });
};


// *Creating an instance method for rental fee processing.
rentalSchema.methods.returnProcessing = function(){
    this.dayReturned = new Date();

    const rentalDays = moment().diff(this.dateOut, 'days');
    this.rentalFee = rentalDays * this.movie.dailyRentalRate;
}

const Rental = mongoose.model('Rental', rentalSchema);

// Validate Input
function validate(rental) {
    const schema = Joi.object({
        customerId: Joi.objectId().required(),
        movieId: Joi.objectId().required(),
    });
    return schema.validate(rental);
}

exports.Rental = Rental;
exports.validate = validate;
exports.lookUp = this.lookUp;
