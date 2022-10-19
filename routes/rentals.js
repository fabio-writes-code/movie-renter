const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { Movie } = require("../models/movies");
const { Customer } = require("../models/customer");
const { Rental, validate } = require("../models/rentals");
const auth = require("../middleware/auth");
const validateObjectId = require("../middleware/validateObjectId");
const admin = require("../middleware/admin");

// GET
router.get("/",auth, (req, res) => {
    const p = new Promise((resolve, reject) => {
        const rental = Rental.find().sort("-dateOut").select();
        resolve(rental);
    });
    p.then((resolve) => res.send(resolve));
});

router.get("/:id",[auth,validateObjectId], async (req, res) => {
    const rental = await Rental.findById(req.params.id);
    !rental
        ? res.status(404).send("Customer does not exist")
        : res.send(rental);
});

// POST
router.post("/",auth, async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // *Check customer and genre's id, and if movie in stock
    const movie = await Movie.findById(req.body.movieId);
    if (!movie) return res.status(404).send("Movie title does not exists");
    const customer = await Customer.findById(req.body.customerId);
    if (!customer) return res.status(404).send("Customer does not exists");
    if (movie.numberInStock === 0)
        return res.status(400).send("Movie not in stock");

    let rental = new Rental({
        customer: {
            _id: customer._id,
            name: customer.name,
            isGold: customer.isGold,
            phone: customer.phone,
        },
        movie: {
            _id: movie._id,
            title: movie.title,
            dailyRentalRate: movie.dailyRentalRate,
        },
    });

    // ! This code block should be treated as a transaction. Temporary brute force solution
    rental = await rental.save();
    movie.numberInStock--; //*Decrease the stock number
    await movie.save((err) => {
        if (err) {
            errRemoveRental(rental);
            return res.status(403).send("Internal Server Error");
        }
        return res.status(200).send(rental);
    });
});

//DELETE, admin only
router.delete('/:id',[auth,admin,validateObjectId],async(req,res)=>{
    const rental=await Rental.findByIdAndRemove(req.params.id)
    if(!rental) return res.status(404).send('Rental not in database')
    res.send(rental)
})

async function errRemoveRental(rental) {
    await Rental.findByIdAndDelete(rental._id);
}


module.exports = router;
