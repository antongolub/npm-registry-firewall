import fs from 'node:fs'
import {strict as assert} from 'node:assert'
import {asRegExp, asArray, normalizePath} from './util.js'
import { semver } from './semver.js'

const populate = (config) => {
  const profiles = asArray(config).map(p => {
    assert.ok(p.server, 'cfg: server')
    assert.ok(p.firewall, 'cfg: server')

    const server = asArray(p.server).map(({
      host,
      port,
      base = '/',
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
      const entrypoint = normalizePath(`${secure ? 'https' : 'http'}://${host}:${port}`)

      return {
        secure,
        host,
        port,
        base,
        entrypoint,
        healthcheck,
        requestTimeout,
        headersTimeout,
        keepAliveTimeout,
      }
    })

    const firewall = asArray(p.firewall).map(f => {
      assert.ok(f.registry, 'cfg: firewall.registry')

      const rules = (p.firewall.rules || []).map(({
        policy,
        name = '*',
        org = '*',
        dateRange,
        version,
        license
      }) => {
        assert.ok(policy, 'cfg: firewall.rules.policy')
        version && assert.ok(semver.validRange(version), 'cfg: firewall.rules.version semver')

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
        rules,
        registry: f.registry,
        base: f.base || '/'
      }
    })

    return {
      server,
      firewall
    }
  })

  return {
    profiles,
  }
}

export const getConfig = (file) => {
  assert.ok(file, 'cfg: config must be specified')

  return populate(typeof file === 'string'
    ? JSON.parse(fs.readFileSync(file, 'utf8'))
    : file
  )
}
