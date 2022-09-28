import {strict as assert} from 'node:assert'
import fs from 'node:fs'

import {asArray, asStrOrRegexpArray, genId, load, normalizePath, mergeDeep} from './util.js'
import { semver } from './semver.js'

const populateExtra = (target) => {
  const preset = target.extends || target.preset
  const res = preset
    ? mergeDeep({}, ...asArray(preset).map(load), target)
    : target

  res._raw = {...target}
  return res
}

const populate = (config) => {
  const profiles = asArray(config).map(populateExtra).map(p => {
    assert.ok(p.server, 'cfg: server')
    assert.ok(p.firewall, 'cfg: firewall')

    const agent = p.agent
    const server = asArray(p.server).map(populateExtra).map(({
      host = '127.0.0.1',
      port = 8080,
      base = '/',
      healthcheck = '/healthcheck',
      metrics = '/metrics',
      secure: _secure,
      keepAliveTimeout = 61_000,
      headersTimeout = 62_000,
      requestTimeout = 30_000,
    }) => {
      const entrypoint = normalizePath(`${_secure ? 'https' : 'http'}://${host}:${port}`)
      const secure = _secure
        ? {
          key: fs.readFileSync(_secure.key, 'utf8'),
          cert: fs.readFileSync(_secure.cert, 'utf8'),
        } : null

      return {
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

    const firewall = asArray(p.firewall).map(populateExtra).map(f => {
      assert.ok(f.registry, 'cfg: firewall.registry')

      const rules = asArray(f.rules || []).map(populateExtra).map(({
        policy,
        name,
        org,
        dateRange,
        age,
        version,
        license,
        username,
        filter,
        plugin,
        _raw
      }) => {

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
        rules,
        registry: normalizePath(f.registry),
        token: f.token,
        entrypoint: f.entrypoint ? normalizePath(f.entrypoint) : null,
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
      agent,
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
    ? load(file)
    : file
  )
}
