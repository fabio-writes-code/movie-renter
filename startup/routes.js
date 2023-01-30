// TODO: Setting up all routes and middleware

const express = require("express");
const genres = require("../routes/genres");
const customers = require("../routes/customer");
const movies = require('../routes/movies');
const rentals = require("../routes/rentals");
const users = require("../routes/users");
const auth = require("../routes/auth");
const returns = require("../routes/returns");
const cors = require('cors')

const error = require("../middleware/error");

module.exports = function (app) {
    app.use(express.json());
    app.use(cors())
    app.use("/api/rentals", rentals);
    app.use("/api/genres", genres);
    app.use("/api/customer", customers);
    app.use("/api/movies", movies);
    app.use("/api/users", users);
    app.use("/api/returns", returns);
    app.use("/api/auth", auth);
    app.use(error);
};

