import { createServer } from './http/server.js'
import { createRouter } from './http/router.js'
import {
  healthcheck,
  errorBoundary,
  notFound,
  trace,
  proxy,
  ctx,
  timeout,
  firewall,
} from './mwares/index.js'

import { getConfig } from './config.js'

export const createApp = (cfg) => {
  const config = getConfig(cfg)
  const servers = config.server.map(s => {
    const api = createRouter([
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
      proxy,
      errorBoundary,
    ], s.api)

    const router = createRouter([
      ctx({...config, server: s}),
      timeout,
      trace,
      ['GET', s.healthcheck, healthcheck],
      api,
      notFound,
      errorBoundary,
    ], s.base)

    return createServer({...s, router})
  })
  return {
    servers,
    config,
    start() { return Promise.all(servers.map(s => s.start())) },
    stop() { return Promise.all(servers.map(s => s.stop())) }
  }
}
