const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Rental, validate } = require('../models/rentals');
const moment = require('moment');
const { Movie } = require('../models/movies');
const validator = require('../middleware/validator');

router.post('/', [auth, validator(validate)], async (req, res) => {
    const rental =await Rental.lookUp(req.body.customerId, req.body.movieId)

    if (!rental) return res.status(404).send('No record for customer and movie');
    if (rental.dayReturned) return res.status(400).send('Rental has been previously processed');

    rental.returnProcessing();
    await rental.save();

    await Movie.updateOne({_id:rental.movie._id},{
        $inc:{numberInStock:1}
    })
    res.send(rental);
});

// PUT
// router.put('/:id', [auth, validateObjectId], async (req, res) => {});

// router.delete('/:id', [auth, admin, validateObjectId], async (req, res) => {});

module.exports = router;
