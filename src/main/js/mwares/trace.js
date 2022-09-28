import { getCtx } from '../als.js'
import { genId } from '../util.js'
import { once } from '../util.js'

export const trace = async (req, res, next) => {
  req.id = res.id = genId()

  const ctx = getCtx()
  const {logger} = ctx
  ctx.logExtra = Object.assign(ctx.logExtra || {}, {
    traceId: req.id,
    clientIp: req.headers['x-forwarded-for'] || req.socket.remoteAddress
  })

  logger.info(req.method, req.url)

  const end = res.end
  const now = Date.now()
  // see http/client.js res.pipe(pipe.res, { end: true })
  res.end = once(function (...args) {
    const { statusCode } = res
    const isErr = statusCode < 200 || statusCode >= 300

    logger[isErr ? 'error' : 'info']('HTTP', statusCode, `${Date.now() - now}ms`, req.method, req.url)

    return end.call(this, ...args)
  })
  next()
}
