import { createServer } from './http/server.js'
import { createRouter } from './http/router.js'
import { runInCtx, mixCtx } from './als.js'
import { logger as defaultLogger } from './logger.js'
import {
  healthcheck,
  errorBoundary,
  notFound,
  trace,
  proxy,
  ctx,
  timeout,
  firewall,
  metrics,
} from './mwares/index.js'
import { getConfig } from './config.js'

export const _createApp = (cfg, {
  cacheFactory,
  loggerFactory,
  logger: _logger,
  log
} = {}) => {
  const config = getConfig(cfg)
  const logger = _logger || loggerFactory ? loggerFactory(log) : defaultLogger
  mixCtx({
    logger,
    config,
    cacheFactory
  })

  const servers = config.profiles.reduce((m, p) => {
    const firewalls = p.firewall.map(({base, entrypoint, registry, token, rules, cache}) => {
      const f = firewall({registry, rules, entrypoint, token, ...cache})
      return createRouter([
        [
          '*',
          [
            /^\/(((@[a-z0-9\-]+)(%2f|\/))?[a-z0-9\-]+)\/-\/[a-z0-9\-]+-(\d+\.\d+\.\d+(-[+\-.a-z0-9]+)?)\.tgz$/,
            ['name', null, 'org', null, 'version']
          ],
          f
        ],
        [
          '*',
          [
            /^\/(((@[a-z0-9\-]+)(%2f|\/))?[a-z0-9\-]+)\/?$/,
            ['name', null, 'org']
          ],
          f
        ],
        proxy(registry),
        errorBoundary,
      ], base)
    })

    const servers = p.server.map(s => {
      const router = createRouter([
        ctx({...config, server: s}, logger),
        timeout,
        trace,
        ['GET', s.healthcheck, healthcheck],
        ['GET', s.metrics, metrics],
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

export const createApp = (...args) => {
  let app
  runInCtx({}, () => app = _createApp(...args))
  return app
}
