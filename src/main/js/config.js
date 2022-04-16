import {strict as assert} from 'node:assert'
import { createRequire } from 'node:module'
import fs from 'node:fs'
import {asRegExp, asArray, normalizePath, splitStr} from './util.js'
import { semver } from './semver.js'
import { createCache } from './cache.js'

const require = createRequire(import.meta.url)
const populateExtra = (raw) => typeof raw === 'string' ? require(raw) : {}

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
      requestTimeout = 30_000,
      extends: _extends
    }) => {
      const extra = populateExtra(_extends)
      const secure = _secure
        ? {
          key: fs.readFileSync(_secure.key, 'utf8'),
          cert: fs.readFileSync(_secure.cert, 'utf8'),
        } : null
      const entrypoint = normalizePath(`${secure ? 'https' : 'http'}://${host}:${port}`)

      return {
        ...extra,
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
          evictionTimeout: (f.cache.evictionTimeout || f.cache.ttl) * 60_000
        })
        : null

      const extra = populateExtra(f?.extends)
      const rules = [...asArray(f.rules || []), ...asArray(extra.rules || [])].map((_raw) => {
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
        } = {...populateExtra(_raw.extends), ..._raw}
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
        ...extra,
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
