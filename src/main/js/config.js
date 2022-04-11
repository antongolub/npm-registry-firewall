import fs from 'node:fs'
import {strict as assert} from 'node:assert'
import {asRegExp} from './util.js'

const populate = (config) => {
  assert.ok(config.registry, 'cfg: registry')

  const server = config.server.map(({
    host,
    port,
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

    return {
      secure,
      host,
      port,
      requestTimeout,
      headersTimeout,
      keepAliveTimeout,
    }
  })

  const rules = (config.rules || []).map(({
    policy,
    name = '*',
    org = '*',
    dateRange
  }) => {
    assert.ok(policy, 'cfg: rules.policy')

    return {
      org: asRegExp(org),
      name: asRegExp(name),
      dateRange: dateRange ? dateRange.map(d => typeof d === 'string' ? Date.parse(d) : d|0) : null,
      policy
    }
  })

  return {
    server,
    rules,
    registry: config.registry,
  }
}

export const getConfig = (file) => populate(typeof file === 'string'
  ? JSON.parse(fs.readFileSync(file, 'utf8'))
  : file
)
