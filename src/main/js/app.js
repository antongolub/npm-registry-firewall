import { createServer } from './http/server.js'
import { createRouter } from './http/router.js'
import { healthcheck } from './mwares/healthcheck.js'
import { errorBoundary } from './mwares/error-boundary.js'
import { notFound } from './mwares/not-found.js'
import { trace } from './mwares/trace.js'
import { proxy } from './mwares/proxy.js'
import { getConfig } from './config.js'
import { ctx } from './mwares/ctx.js'
import { timeout } from './mwares/timeout.js'
import { firewall } from './mwares/firewall.js'

export const createApp = (cfg) => {
  const config = getConfig(cfg)
  const servers = config.server.map(s => {
    const router = createRouter([
      [ ctx({...config, server: s}) ],
      [ timeout ],
      [ trace ],
      ['GET', '/status/', healthcheck],
      [
        '*',
        [
          /^\/(((@[a-z0-9\-]+)(%2f|\/))?[a-z0-9\-]+)\/-\/[a-z0-9\-]+-(\d+\.\d+\.\d+(?:-.+)?)\.tgz$/,
          ['name', null, 'org', null, 'version']
        ],
        firewall
      ],
      [
        '*',
        [
          /^\/(((@[a-z0-9\-]+)(%2f|\/))?[a-z0-9\-]+)\/?$/,
          ['name', null, 'org']
        ],
        firewall
      ],
      [ proxy ],
      [ notFound ],
      [ errorBoundary ],
    ])
    return createServer({...s, router})
  })

  return {
    servers,
    config,
    start() { return Promise.all(servers.map(s => s.start())) },
    stop() { return Promise.all(servers.map(s => s.stop())) }
  }
}
