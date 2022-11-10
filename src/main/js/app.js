import { createServer } from './http/server.js'
import { createRouter } from './http/router.js'
import { runInCtx, mixCtx } from './als.js'
import {
  ctx,
  healthcheck,
  errorBoundary,
  notFound,
  trace,
  proxy,
  timeout,
  firewall,
  metrics,
} from './mwares/index.js'
import { loadConfig } from './config.js'
import { getCache, stopCache } from './cache.js'

export { getCache, stopCache }

export const _createApp = (cfg, {
  cache,
  logger
} = {}) => {
  const config = loadConfig(cfg)
  getCache(cache || config.cache) // init cache

  mixCtx({
    logger,
    config,
  })

  const firewalls = createRoutes(config)

  const router = createRouter([
    ctx({config, logger}),
    timeout,
    trace,
    ['GET', config.server.healthcheck, healthcheck],
    ['GET', config.server.metrics, metrics],
    ...firewalls,
    notFound,
    errorBoundary,
  ], config.server.base)

  const server = createServer({...config.server, router})

  return {
    server,
    config,
    start() { return this.server.start() },
    stop() {
      stopCache()
      return this.server.stop()
    },
  }
}

export const createRoutes = (config) =>
  config.firewall.map(({base, entrypoint, registry, token, rules}) => {
    const f = firewall({registry, rules, entrypoint, token})
    return createRouter([
      [
        'GET',
        [
          /^\/((?:(@[a-z0-9\-._]+)(?:%2[fF]|\/))?[a-z0-9\-._]+)\/-\/[a-z0-9\-._]+-(\d+\.\d+\.\d+(?:-[+\-.a-z0-9_]+)?)\.tgz$/,
          ['name', 'org', 'version']
        ],
        f
      ],
      [
        '*',
        [
          /^\/((?:(@[a-z0-9\-._]+)(?:%2[fF]|\/))?[a-z0-9\-._]+)\/?$/,
          ['name', 'org']
        ],
        f
      ],
      proxy(registry),
      errorBoundary,
    ], base)
  })

export const createApp = (...args) => {
  let app
  runInCtx({}, () => app = _createApp(...args))
  return app
}
