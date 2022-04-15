import {httpError, REQUEST_TIMEOUT} from '../http/index.js'

export const timeout = async (req, res, next) => {
  if (!req?.cfg?.server?.requestTimeout) {
    return next()
  }

  const timer = setTimeout(() => {
    next(httpError(REQUEST_TIMEOUT))
  }, req.cfg.server.requestTimeout)
  const drop = () => clearTimeout(timer)

  res.on('close', drop)
  res.on('error', drop)
  req.on('error', drop)

  next()
}
