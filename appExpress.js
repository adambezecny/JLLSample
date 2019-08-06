'use strict'

const express = require('express')
const morganLogger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const testRouter = require('./testRouter')
const ghRouter = require('./ghRouter')

const app = express()

app.use(morganLogger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())

app.use('/test', testRouter)
app.use('/ghapi', ghRouter)


app.use((req, res, next) => {
    console.log('error handler called ' + req.originalUrl)
    console.log(req)
    var err = new Error('Not Found ' + req.originalUrl)
    err.status = 404
    next(err)
})

module.exports = app