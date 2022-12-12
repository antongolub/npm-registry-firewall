import {strict as assert} from 'node:assert'
import fs from 'node:fs'
import os from 'node:os'
import process from 'node:process'

import {getCtx} from './als.js'
import {asArray, asStrOrRegexpArray, genId, load, normalizePath, mergeDeep, once} from './util.js'
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
  // assert.ok(config.firewall, 'cfg: firewall')

  const zlib = config.zlib || 'node:zlib'
  const warmup = config.warmup === true || config.warmup === undefined ? Number.POSITIVE_INFINITY : config.warmup | 0
  const agent = config.agent
  const cache = config.cache
    ? {
      name: config.cache.name || genId(),
      ttl: config.cache.ttl * 60_000,
      evictionTimeout: (config.cache.evictionTimeout || config.cache.ttl) * 60_000
    }
    : null
  const log = config.log || {
    log: {
      level: 'info'
    }
  }
  const server = (({
    host = '127.0.0.1',
    port = 8080,
    base = '/',
    healthcheck = '/healthcheck',
    metrics = '/metrics',
    secure: _secure,
    entrypoint = `${_secure ? 'https' : 'http'}://${host}:${port}`,
    keepAliveTimeout = 61_000,
    headersTimeout = 62_000,
    requestTimeout = 30_000
  }) => {
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
  })(populateExtra(config.server))

  const firewall = Object.entries(config.firewall)
    .map(([base, f]) => ({...populateExtra(f), base}))
    .map((f) => {
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
        registry: f.registry ? asArray(f.registry).map(normalizePath) : null,
        token: f.token,
        entrypoint: f.entrypoint ? normalizePath(f.entrypoint) : null,
        base: f.base
      }
    })

  return {
    agent,
    cache,
    firewall,
    log,
    server,
    warmup,
    zlib
  }
}

export const loadConfig = (file) => {
  assert.ok(file, 'cfg: config must be specified')

  return populate(typeof file === 'string'
    ? load(file)
    : file
  )
}

export const getConfig = () => getCtx().config
