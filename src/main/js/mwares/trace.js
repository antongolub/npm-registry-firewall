

export const trace = async (req, res, next) => {
  req.log = res.log = req.log.nest({ traceId: req.id })
  req.log.info(req.method, req.url, req.headers['x-forwarded-for'] || req.socket.remoteAddress)

  const end = res.end
  res.end = function (...args) {
    const { statusCode } = res
    const isErr = statusCode < 200 || statusCode >= 300

    req.log[isErr ? 'error' : 'info']('HTTP', statusCode)

    return end.call(this, ...args)
  }
  next()
}
