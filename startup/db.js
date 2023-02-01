// TODO: Starting all database related processes
const mongoose = require('mongoose')
const logger = require('./logger')
const config = require('config')


module.exports = function () {
    const db = config.get('db')
    console.log('db', db);
    mongoose.connect(db)
        .then(() => logger.log('info', `Connected to ${db} Database....`))
}
