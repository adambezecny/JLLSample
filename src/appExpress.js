'use strict'

const express = require('express')
const morganLogger = require('morgan')
const bodyParser = require('body-parser')
const ghRouter = require('./ghRouter')
const logger = require('./logger')

const app = express()

app.use(morganLogger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use('/ghapi/org-repos', ghRouter)

app.use((req, res, next) => {
  logger.info('error handler called ' + req.originalUrl)
  logger.info(req)
  var err = new Error('Not Found ' + req.originalUrl)
  err.status = 404
  next(err)
})

module.exports = app
