const winston = require('winston')

const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console()
    // new winston.transports.File({ filename: 'combined.log' })
  ]
})

logger.trace = logger.silly
module.exports = logger
