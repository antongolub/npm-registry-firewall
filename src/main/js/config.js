import fs from 'node:fs'
import {strict as assert} from 'node:assert'
import {asRegExp, asArray, normalizePath} from './util.js'
import { semver } from './semver.js'

const populate = (config) => {
  assert.ok(config.registry, 'cfg: registry')

  const server = asArray(config.server).map(({
    host,
    port,
    base = '/',
    api = '/',
    healthcheck = '/healthcheck',
    secure: _secure,
    keepAliveTimeout = 61_000,
    headersTimeout = 62_000,
    requestTimeout = 30_000
  }) => {
    assert.ok(host, 'cfg: server.host')
    assert.ok(port, 'cfg: server.port')

    const secure = _secure
      ? {
        key: fs.readFileSync(_secure.key, 'utf8'),
        cert: fs.readFileSync(_secure.cert, 'utf8'),
      } : null
    const entrypoint = normalizePath(`${secure ? 'https' : 'http'}://${host}:${port}${base}${api}`)

    return {
      secure,
      host,
      port,
      base,
      healthcheck,
      api,
      entrypoint,
      requestTimeout,
      headersTimeout,
      keepAliveTimeout,
    }
  })

  const defaultPolicy = config.defaultPolicy || 'allow'
  const rules = (config.rules || []).map(({
    policy,
    name = '*',
    org = '*',
    dateRange,
    version,
    license
  }) => {
    assert.ok(policy, 'cfg: rules.policy')
    version && assert.ok(semver.validRange(version), 'cfg: rules.version semver')

    return {
      policy,
      org: asRegExp(org),
      name: asRegExp(name),
      version,
      license: license ? license.toLowerCase().split(',').map(s => s.trim()) : null, // split(/\s*,\s*/) seems unsafe
      dateRange: dateRange ? dateRange.map(d => typeof d === 'string' ? Date.parse(d) : d|0) : null
    }
  })

  return {
    server,
    rules,
    defaultPolicy,
    registry: config.registry,
  }
}

export const getConfig = (file) => {
  assert.ok(file, 'cfg: config must be specified')

  return populate(typeof file === 'string'
    ? JSON.parse(fs.readFileSync(file, 'utf8'))
    : file
  )
}
