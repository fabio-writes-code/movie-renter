const winston = require('winston')
require('winston-mongodb')
require('express-async-errors')
const config = require('config')

const mongoTransport = winston.add(new winston.transports.MongoDB({
    db: config.get('db'),
    level: 'error',
    options: { useUnifiedTopology: true }
}))

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'logfile.log', level: 'info' }),
        new winston.transports.Console({ colorize: true, prettyPrint: true }),
        // mongoTransport
    ],
    exceptionHandlers: [
        new winston.transports.File({ filename: 'exception.log' }),
        new winston.transports.Console({ colorize: true, prettyPrint: true })
    ],
    rejectionHandlers: [
        new winston.transports.File({ filename: 'rejection.log' }),
        new winston.transports.Console({ colorize: true, prettyPrint: true })
    ]
})
module.exports = logger