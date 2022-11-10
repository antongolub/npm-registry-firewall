import {httpError, REQUEST_TIMEOUT} from '../http/index.js'
import {getConfig} from '../config.js'

export const timeout = async (req, res, next) => {
  const t = getConfig().server.requestTimeout
  if (!t) {
    return next()
  }

  const timer = setTimeout(() => {
    next(httpError(REQUEST_TIMEOUT))
  }, t)
  const drop = () => clearTimeout(timer)

  res.on('close', drop)
  res.on('error', drop)
  req.on('error', drop)

  next()
}
