export const trace = async (req, res, next) => {
  req.log = res.log = req.log.nest({
    traceId: req.id,
    clientIp: req.headers['x-forwarded-for'] || req.socket.remoteAddress
  })
  req.log.info(req.method, req.url)

  const end = res.end
  const now = Date.now()
  res.end = function (...args) {
    const { statusCode } = res
    const isErr = statusCode < 200 || statusCode >= 300

    req.log[isErr ? 'error' : 'info']('HTTP', statusCode, `${Date.now() - now}ms`)

    return end.call(this, ...args)
  }
  next()
}
