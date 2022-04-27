import {strict as assert} from 'node:assert'
import { createRequire } from 'node:module'
import fs from 'node:fs'
import {asArray, asStrOrRegexpArray, genId, normalizePath} from './util.js'
import { semver } from './semver.js'

const require = createRequire(import.meta.url)
const populateExtra = (raw) => typeof raw === 'string' ? require(raw) : {}

const populate = (config) => {
  const profiles = asArray(config).map(_p => {
    const p = {...populateExtra(_p.extends || _p.preset), ..._p}

    assert.ok(p.server, 'cfg: server')
    assert.ok(p.firewall, 'cfg: firewall')

    const server = asArray(p.server).map(({
      host = '127.0.0.1',
      port = 8080,
      base = '/',
      healthcheck = '/healthcheck',
      metrics = '/metrics',
      secure: _secure,
      keepAliveTimeout = 61_000,
      headersTimeout = 62_000,
      requestTimeout = 30_000,
      preset,
      extends: _extends,
    }) => {
      const extra = populateExtra(_extends || preset)
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
        metrics,
        healthcheck,
        requestTimeout,
        headersTimeout,
        keepAliveTimeout,
      }
    })

    const firewall = asArray(p.firewall).map(f => {
      assert.ok(f.registry, 'cfg: firewall.registry')

      const extra = populateExtra(f.extends || f.preset)
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
          filter,
          plugin
        } = {...populateExtra(_raw.extends || _raw.preset), ..._raw}
        assert.ok(policy || plugin, 'cfg: firewall.rules.policy or firewall.rules.plugin')
        version && assert.ok(semver.validRange(version), 'cfg: firewall.rules.version semver')

        return {
          policy,
          org: asStrOrRegexpArray(org),
          name: asStrOrRegexpArray(name),
          version,
          license: asStrOrRegexpArray(license),
          username: asStrOrRegexpArray(username),
          dateRange: dateRange ? dateRange.map(d => typeof d === 'string' ? Date.parse(d) : d|0) : null,
          age: age ? asArray(age) : null,
          filter,
          plugin: plugin ? asArray(plugin).map(asArray) : null,
          _raw // For 'warn' output
        }
      })

      return {
        ...extra,
        rules,
        registry: f.registry,
        token: f.token,
        entrypoint: f.entrypoint || null,
        base: f.base || '/',
        cache: f.cache
          ? {
            name: f.cache.name || genId(),
            ttl: f.cache.ttl * 60_000,
            evictionTimeout: (f.cache.evictionTimeout || f.cache.ttl) * 60_000
          }
          : null
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
