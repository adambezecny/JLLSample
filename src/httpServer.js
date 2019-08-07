/* eslint-disable no-multiple-empty-lines */
/* eslint-disable no-fallthrough */
'use strict'

const app = require('./appExpress')
const http = require('http')
const port = normalizePort(process.env.PORT || '3000') // HTTP port
const logger = require('./logger')

let server // HTTP server

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort (val) {
  const port = parseInt(val, 10)

  if (isNaN(port)) {
    // named pipe
    return val
  }

  if (port >= 0) {
    // port number
    return port
  }

  return false
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError (error) {
  if (error.syscall !== 'listen') {
    throw error
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      logger.error(bind + ' requires elevated privileges')
      process.exit(1)
    case 'EADDRINUSE':
      logger.error(bind + ' is already in use')
      process.exit(1)
    default:
      throw error
  }
}

function onListening () {
  const addr = server.address()

  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port
  logger.info('Listening on ' + bind)
  logger.info('Listening addr ' + JSON.stringify(addr))
}

async function initApp () {
  logger.info('initializing the application...')
  app.set('port', port)

  server = http.createServer(app).listen(port)
  server.on('error', onError)
  server.on('listening', onListening)
  logger.info('HTTP server is up now')


  //
  // initialize other resources here, e.g. DB!
  //

  logger.info('application is up now')
}

async function shutdownApp () {
  logger.info('shutting down the application')

  await server.close()

  logger.info('server is down')

  //
  // shut down other resources here, e.g. DB!
  //
  logger.info('application is down now')
}

initApp()
process.on('SIGTERM', shutdownApp)
process.on('SIGINT', shutdownApp)
// In the future, promise rejections that are not handled will terminate
// the Node.js process with a non-zero exit code!
process.on('unhandledRejection', (reason, p) => {
  logger.info('Unahndled promise rejection detected!')
  logger.info('Unhandled Rejection at: Promise', p, 'reason:', reason)
  logger.info(reason.stack)
  logger.trace('Reason full details:')
  logger.trace(reason)
  logger.trace('Promise full details:')
  logger.trace(p)
})
