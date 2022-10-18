const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Genre, validate } = require('../models/genres');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validateObjectId = require('../middleware/validateObjectId');

// GET
router.get('/', (req, res) => {
    //*Using promises
    const p = new Promise((resolve) => {
        const genres = Genre.find().select();
        resolve(genres);
    });
    p.then((resolve) => res.send(resolve));
});

router.get('/:id', validateObjectId, async (req, res, next) => {
    const genre = await Genre.findById(req.params.id);
    !genre ? res.status(404).send('Genre does not exist') : res.send(genre);
});

// POST

router.post('/', auth, async (req, res) => {
    // *Genres should only modified by auth users

    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let genre = new Genre({ name: req.body.name });
    genre = await genre.save();
    res.send(genre);
});

// PUT
router.put('/:id', [auth, validateObjectId], async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const genre = await Genre.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
        },
        { new: true }
    );
    if (!genre) return res.status(404).send('Genre does not exist');
    res.send(genre);
});

//DELETE
router.delete('/:id', [auth, admin, validateObjectId], async (req, res) => {
    const genre = await Genre.findByIdAndRemove(req.params.id);
    if (!genre) return res.status(404).send('Genre does not exist');
    res.send(genre);
});

module.exports = router;