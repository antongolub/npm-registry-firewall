import { createServer } from './http/server.js'
import { createRouter } from './http/router.js'
import { runInCtx, mixCtx } from './als.js'
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
import { getCache } from './cache.js'

export const _createApp = (cfg, {
  cache,
  logger
} = {}) => {
  const config = getConfig(cfg)
  getCache(cache || config.cache) // init cache

  mixCtx({
    logger,
    config,
  })

  const firewalls = config.firewall.map(({base, entrypoint, registry, token, rules}) => {
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

  const router = createRouter([
    ctx(config),
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
    stop() { return this.server.stop() },
  }
}

export const createApp = (...args) => {
  let app
  runInCtx({}, () => app = _createApp(...args))
  return app
}
