import { createServer } from './server.js'
import { createRouter } from './router.js'
import { healthcheck } from './mwares/healthcheck.js'
import { errorBoundary } from './mwares/error-boundary.js'
import { notFound } from './mwares/not-found.js'
import { trace } from './mwares/trace.js'
import { proxy } from './mwares/proxy.js'
import { getConfig } from './config.js'

export const createApp = (cfg) => {
  const config = typeof cfg === 'string'
    ? getConfig(cfg)
    : cfg
  const router = createRouter([
    [ trace ],
    ['GET', '/status/', healthcheck],
    [ proxy ],
    [ notFound ],
    [ errorBoundary ],
  ])
  const servers = config.server.map(s => createServer({...s, router}))

  return {
    servers,
    config,
    router,
    start() { return Promise.all(servers.map(s => s.start())) },
    stop() { return Promise.all(servers.map(s => s.stop())) }
  }
}
