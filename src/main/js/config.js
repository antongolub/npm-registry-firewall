import fs from 'node:fs'
import {strict as assert} from 'node:assert'
import {asRegExp, asArray, normalizePath, splitStr} from './util.js'
import { semver } from './semver.js'
import { createCache } from './cache.js'

const populate = (config) => {
  const profiles = asArray(config).map(p => {
    assert.ok(p.server, 'cfg: server')
    assert.ok(p.firewall, 'cfg: firewall')

    const server = asArray(p.server).map(({
      host = '127.0.0.1',
      port = 8080,
      base = '/',
      healthcheck = '/healthcheck',
      secure: _secure,
      keepAliveTimeout = 61_000,
      headersTimeout = 62_000,
      requestTimeout = 30_000
    }) => {
      // assert.ok(host, 'cfg: server.host')
      // assert.ok(port, 'cfg: server.port')

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

      const cache = f.cache
        ? createCache({
          ttl: f.cache.ttl * 60_000,
          evictionTimeout: f.cache.evictionTimeout * 60_000
        })
        : null

      const rules = asArray((p.firewall.rules || [])).map((_raw) => {
        const {
          policy,
          name,
          org,
          dateRange,
          age,
          version,
          license,
          username,
          filter
        } = _raw
        assert.ok(policy, 'cfg: firewall.rules.policy')
        version && assert.ok(semver.validRange(version), 'cfg: firewall.rules.version semver')

        return {
          policy,
          org: org && splitStr(org).map(asRegExp),
          name: name && splitStr(name).map(asRegExp),
          version,
          license: splitStr(license),
          username: splitStr(username),
          dateRange: dateRange ? dateRange.map(d => typeof d === 'string' ? Date.parse(d) : d|0) : null,
          age: age ? asArray(age) : null,
          filter,
          _raw // For 'warn' output
        }
      })

      return {
        cache,
        rules,
        registry: f.registry,
        token: f.token,
        entrypoint: f.entrypoint || null,
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
