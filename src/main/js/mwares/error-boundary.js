import {INTERNAL_SERVER_ERROR, statusMessageMap} from '../http/index.js'

export const errorBoundary = async (err, req, res, next) => {
  const code = err.statusCode || res.statusCode || INTERNAL_SERVER_ERROR
  const message = err.statusMessage || res.statusMessage || err.message || statusMessageMap[code] || statusMessageMap[INTERNAL_SERVER_ERROR]

  req.log.error(err.message || message)

  res.writeHead(code, {
    'Content-Type': 'text/plain',
    'Connection': 'keep-alive',
    'Content-Length': Buffer.byteLength(message),
  })
    .end(message)
}
