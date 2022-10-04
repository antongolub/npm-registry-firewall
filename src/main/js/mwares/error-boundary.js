import {INTERNAL_SERVER_ERROR, NOT_FOUND, statusMessages} from '../http/index.js'
import {getCtx} from '../als.js'

export const errorBoundary = async (err, req, res, next) => {
  const code = err.statusCode || INTERNAL_SERVER_ERROR
  const message = err.statusMessage || err.message || statusMessages[code] || statusMessages[INTERNAL_SERVER_ERROR]
  const {logger = console} = getCtx()

  if (err.statusCode !== NOT_FOUND) {
    logger.error(err.stack)
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
