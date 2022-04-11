export const timeout = async (req, res, next) => {
  if (!req?.cfg?.server?.requestTimeout) {
    return next()
  }

  const timer = setTimeout(() => {
    const err = new Error('Request Timeout ')
    err.status = 408

    next(err)
  }, req.cfg.server.requestTimeout)
  const drop = () => clearTimeout(timer)

  res.on('close', drop)
  res.on('error', drop)
  req.on('error', drop)

  next()
}
