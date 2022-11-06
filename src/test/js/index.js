import {testFactory, assert} from '../test-utils.js'
import {
  getCtx,
  createLogger,
  createApp,
  createRoutes,
  getConfig,
  getCache,

  // middlewares
  healthcheck,
  errorBoundary,
  notFound,
  trace,
  proxy,
  ctx,
  timeout,
  firewall,
  metrics
} from '../../main/js/index.js'

const test = testFactory('index', import.meta)

test('has proper export', () => {
  const fns = [
    getCtx,
    createLogger,
    createRoutes,
    createApp,
    getConfig,
    getCache,
    healthcheck,
    errorBoundary,
    notFound,
    trace,
    proxy,
    ctx,
    timeout,
    firewall,
    metrics
  ]

  fns.forEach(fn => assert.ok(typeof fn === 'function', fn.name))
})

