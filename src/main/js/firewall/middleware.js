import {Buffer} from 'node:buffer'
import crypto from 'node:crypto'

import {httpError, NOT_FOUND, ACCESS_DENIED, METHOD_NOT_ALLOWED, NOT_MODIFIED, OK, FOUND} from '../http/index.js'
import {getPolicy} from './engine.js'
import {getPackument} from './packument.js'
import {normalizePath, gzip, dropNullEntries} from '../util.js'
import {getCache} from '../cache.js'
import {getCtx} from '../als.js'
import {checkTarball} from './tarball.js'
import {semver} from '../semver.js'

const warmup = (packument, boundContext, rules) => {
  const {cache, registry, authorization, entrypoint} = boundContext
  const stable = Object.values(packument.versions).filter(p => !p.version.includes('-'))
  const majors = stable.reduce((m, p) => {
    const major = p.version.slice(0, p.version.indexOf('.') + 1)
    if (m.every((_p) => !_p.version.startsWith(major))) {
      m.push(p)
    }
    return m
  }, [])

  const deps = (majors.length > 1 ? majors : stable)
    .sort((a, b) => semver.compare(b.version, a.version))
    .slice(0, 2)
    .reduce((m, p) => {
      Object.keys(p.dependencies || {}).forEach(d => {
        if (!cache.has(d)) {
          m.add(d)
        }
      })

    return m
  }, new Set())

  deps.forEach(async (name) => {
    const org = name.charAt(0) === '@' ? name.slice(0, (name.indexOf('/') + 1 || name.indexOf('%') + 1) - 1) : null
    try {
      const {packument: _packument} = await getPackument({ boundContext: {cache, registry, authorization, entrypoint, name, org}, rules })
      warmup(_packument, boundContext, rules)
    } catch (e) {
      // ignore
    }
  })
}

const getAuth = (token, auth) => token
  ? token?.startsWith('Bearer')
    ? token
    :`Bearer ${token}`
  : auth

export const firewall = ({registry, rules, entrypoint: _entrypoint, token, cache: _cache}) => async (req, res, next) => {
  const {routeParams: {name, version, org}, base, method} = req

  if (method !== 'GET' && method !== 'HEAD') {
    return next(httpError(METHOD_NOT_ALLOWED))
  }

  const {cfg, logger} = getCtx()
  const cache = getCache(_cache)
  const authorization = getAuth(token, req.headers['authorization'])
  const entrypoint = _entrypoint || normalizePath(`${cfg.server.entrypoint}${base}`)
  const boundContext = { registry, entrypoint, authorization, name, org, version, logger, cache }
  const [
    { packument, headers, directives },
    tarball
  ] = await Promise.all([
    getPackument({ boundContext, rules }),
    version ? checkTarball({registry, url: req.url}) : Promise.resolve(false)
  ])

  if (cache.ttl) {
    warmup(packument, boundContext, rules)
  }

  // Tarball request
  if (tarball) {
    const policy = getPolicy(directives, version)
    if (policy === 'warn') {
      logger.warn(`${name}@${version}`, 'directive=', directives[version]._raw)
    }

    if (policy === 'deny') {
      return next(httpError(ACCESS_DENIED))
    }

    return res
      .writeHead(FOUND, {Location: tarball})
      .end()
  }

  // Packument request
  if (Object.keys(packument.versions).length === 0) {
    return next(httpError(NOT_FOUND))
  }

  const isGzip = req.headers['accept-encoding']?.includes('gzip')
  const _packumentBuffer = Buffer.from(JSON.stringify(packument))
  const packumentBuffer = isGzip ? await gzip(_packumentBuffer) : _packumentBuffer
  const cl = '' + packumentBuffer.length
  const etag = 'W/' + JSON.stringify(crypto.createHash('sha256').update(packumentBuffer.slice(0, 65_536)).digest('hex'))
  const extra = isGzip
    ? {'content-length': cl, 'transfer-encoding': null, 'content-encoding': 'gzip', etag}
    : {'content-length': cl, 'transfer-encoding': null, 'content-encoding': null, etag}

  if (req.headers['if-none-match'] === etag) {
    res.writeHead(NOT_MODIFIED).end()
    return
  }

  res.writeHead(OK, dropNullEntries({
    ...headers,
    ...extra,
  }))

  if (method === 'GET') {
    res.write(packumentBuffer)
  }
  res.end()
}
