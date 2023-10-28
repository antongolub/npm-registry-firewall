import {INTERNAL_SERVER_ERROR, statusMessages} from '../http/index.js'
import {logger} from '../logger.js'

export const errorBoundary = async (err, req, res, next) => {
  const code = err.statusCode || INTERNAL_SERVER_ERROR
  const _message = err.statusMessage || err.message || statusMessages[code] || statusMessages[INTERNAL_SERVER_ERROR]
  const message = Object.values(statusMessages).includes(_message) ? _message : statusMessages[INTERNAL_SERVER_ERROR]

  if (!err.statusCode || err.statusCode >= INTERNAL_SERVER_ERROR) {
    logger.error(err.stack || err)
  }

  res.statusCode = code
  res.statusMessage = message
  res.writeHead(code, {
    'Content-Type': 'text/plain',
    'Connection': 'keep-alive',
    'Content-Length': Buffer.byteLength(message),
  })
    .end(message)
}
