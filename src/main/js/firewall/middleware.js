import {httpError, NOT_FOUND, ACCESS_DENIED, METHOD_NOT_ALLOWED, NOT_MODIFIED, OK, FOUND} from '../http/index.js'
import {getPolicy, getPipeline} from './engine.js'
import {getPackument} from './packument.js'
import {normalizePath, gzip, dropNullEntries, gunzip} from '../util.js'
import {getCache, hasHit} from '../cache.js'
import {getCtx} from '../als.js'
import {checkTarball} from './tarball.js'
import {logger} from '../logger.js'

const warmupPipeline = (pipeline, opts) => pipeline.forEach(([plugin]) => plugin.warmup?.(opts))

const warmupDepPackuments = (name, deps, boundContext, rules) => {
  const {cache, registry, authorization, entrypoint, pipeline} = boundContext
  logger.debug(`warmup ${name} deps`, deps)

  deps.forEach(async (name) => {
    if (hasHit(cache, name) || await cache.has(name)) {
      return
    }
    const org = name.charAt(0) === '@' ? name.slice(0, (name.indexOf('/') + 1 || name.indexOf('%') + 1) - 1) : null
    try {
      warmupPipeline(pipeline, {name, registry, org})

      const {deps: _deps} = await getPackument({ boundContext: {cache, registry, authorization, entrypoint, name, org, pipeline}, rules })
      warmupDepPackuments(name, _deps, boundContext, rules)
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

  const {cfg} = getCtx()
  const cache = getCache(_cache)
  const authorization = getAuth(token, req.headers['authorization'])
  const entrypoint = _entrypoint || normalizePath(`${cfg.server.entrypoint}${base}`)
  const pipeline = await getPipeline(rules)
  const boundContext = { registry, entrypoint, authorization, name, org, version, cache, pipeline }

  warmupPipeline(pipeline, boundContext)
  const [
    { packumentZip, headers, directives, deps, etag },
    tarball
  ] = await Promise.all([
    getPackument({ boundContext, rules }),
    version ? checkTarball({registry, url: req.url}) : Promise.resolve(false)
  ])

  if (!packumentZip) {
    return next(httpError(NOT_FOUND))
  }

  if (req.headers['if-none-match'] === etag) {
    res.writeHead(NOT_MODIFIED).end()
    return
  }

  if (cache.ttl) {
    warmupDepPackuments(name, deps, boundContext, rules)
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
  const isGzip = req.headers['accept-encoding']?.includes('gzip')
  const buffer = isGzip ? packumentZip : await gunzip(packumentZip)
  const cl = '' + buffer.length
  const extra = isGzip
    ? {'content-length': cl, 'transfer-encoding': null, 'content-encoding': 'gzip', etag}
    : {'content-length': cl, 'transfer-encoding': null, 'content-encoding': null, etag}

  res.writeHead(OK, dropNullEntries({
    ...headers,
    ...extra,
  }))

  if (method === 'GET') {
    res.write(buffer)
  }
  res.end()
}
