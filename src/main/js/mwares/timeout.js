import {requestTimeoutErr} from '../http/index.js'

export const timeout = async (req, res, next) => {
  if (!req?.cfg?.server?.requestTimeout) {
    return next()
  }

  const timer = setTimeout(() => {
    next(requestTimeoutErr)
  }, req.cfg.server.requestTimeout)
  const drop = () => clearTimeout(timer)

  res.on('close', drop)
  res.on('error', drop)
  req.on('error', drop)

  next()
}
