import { logger } from '../logger.js'

export const errorBoundary = async (err, req, res, next) => {
  const message = err.message || err.res?.statusMessage || 'Internal server error'
  const code = err.status || err.res?.statusCode || 500

  logger.error(err)

  res
    .writeHead(code + '\n')
    .end(message + '\n')
}

