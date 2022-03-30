import { logger } from '../logger.js'
import { genId } from '../util.js'

export const trace = async (req, res, next) => {
  req.id = res.id = genId()

  logger.info(`[${req.id}]`, req.method, req.url, req.headers['x-forwarded-for'] || req.socket.remoteAddress)

  const end = res.end

  res.end = function (...args) {
    const { statusCode } = res
    const isErr = statusCode < 200 || statusCode >= 300

    logger[isErr ? 'error' : 'info'](`[${res.id}]`, 'HTTP', statusCode)

    return end.call(this, ...args)
  }
  next()
}
