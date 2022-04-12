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
  // // const entrypoint = normalizePath(`${secure ? 'https' : 'http'}://${host}:${port}${base}${api}`)
  const config = getConfig(cfg)
  const servers = config.profiles.reduce((m, p) => {
    const firewalls = p.firewall.map(({base, registry, rules}) => createRouter([
      [
        '*',
        [
          /^\/(((@[a-z0-9\-]+)(%2f|\/))?[a-z0-9\-]+)\/-\/[a-z0-9\-]+-(\d+\.\d+\.\d+(-[+\-.a-z0-9]+)?)\.tgz$/,
          ['name', null, 'org', null, 'version']
        ],
        firewall(registry, rules)
      ],
      [
        '*',
        [
          /^\/(((@[a-z0-9\-]+)(%2f|\/))?[a-z0-9\-]+)\/?$/,
          ['name', null, 'org']
        ],
        firewall(registry, rules)
      ],
      proxy(registry),
      errorBoundary,
    ], base))

    const servers = p.server.map(s => {
      const router = createRouter([
        ctx({...config, server: s}),
        timeout,
        trace,
        ['GET', s.healthcheck, healthcheck],
        ...firewalls,
        notFound,
        errorBoundary,
      ], s.base)

      return createServer({...s, router})
    })

    m.push(...servers)
    return m
  }, [])

  return {
    servers,
    config,
    start() { return Promise.all(servers.map(s => s.start())) },
    stop() { return Promise.all(servers.map(s => s.stop())) }
  }
}
