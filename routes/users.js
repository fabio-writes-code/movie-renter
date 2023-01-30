const express = require('express')
const router = express.Router()
const mongoose = require('mongoose');
const { User, validate } = require('../models/users');
const _ = require('lodash')
const bcrypt = require('bcrypt');
const { route } = require('./rentals');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validateObjectId = require('../middleware/validateObjectId');

// GET
router.get('/', [auth, admin], (req, res) => {
    const p = new Promise((resolve, reject) => {
        const user = User
            .find()
            .select();
        resolve(user)
    })
    p.then(resolve => res.send(resolve))
})

router.get('/me', auth, async (req, res) => {
    const user = await User.findById(req.user._id).select('-password')
    res.send(user)
})

router.get('/:id', [auth, admin, validateObjectId], async (req, res) => {
    const user = await User.findById(req.params.id)
    !user ? res.status(404).send('User does not exist') : res.send(user)
})

// POST
router.post('/', async (req, res) => {
    const { error } = validate(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    // *Validate email for email registration
    let user = await User.findOne({ email: req.body.email })
    if (user) return res.status(400).send('User already registered.')

    user = new User(_.pick(req.body, ['name', 'email', 'password']))

    // *Hashing user password
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(user.password, salt)

    await user.save()

    // *Automating user authentication upon user creation.
    const token = user.generateAuthToken();

    // const token=jwt.sign({_id:user._id},config.get('jwtPrivateKey'))
    res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email']))
})

//PUT
router.put('/:id', [validateObjectId, auth, admin], async (req, res) => {
    const { error } = validate(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    const salt = await bcrypt.genSalt(10)

    const user = await User.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        email: req.body.email,
        password: await bcrypt.hash(req.body.password, salt)
    }, { new: true }
    )

    if (!user) return res.status(404).send('User not found')
    res.send(user)

})

//DELETE
router.delete('/:id', [validateObjectId, auth, admin], async (req, res) => {
    const user = await User.findByIdAndRemove(req.params.id)
    if (!user) return res.status(404).send('User does not exists')
    res.send(user)
})
module.exports = router;