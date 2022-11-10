import {httpError, NOT_FOUND, ACCESS_DENIED, METHOD_NOT_ALLOWED, NOT_MODIFIED, OK, FOUND} from '../http/index.js'
import {getPolicy, getPipeline} from './engine.js'
import {getPackument} from './packument.js'
import {normalizePath, dropNullEntries, time, jsonBuffer} from '../util.js'
import {gzip} from '../zip.js'
import {hasHit, hasKey, isNoCache} from '../cache.js'
import {getCtx} from '../als.js'
import {checkTarball} from './tarball.js'
import {logger} from '../logger.js'
import {getConfig} from '../config.js'

const warmupPipeline = (pipeline, opts) => pipeline.forEach(([plugin, _opts]) => {
  try {
    plugin.warmup?.({...opts, ..._opts })
  } catch (e) {
    logger.error(`Error in plugin ${plugin.name} warmup`, e)
  }
})

const warmupDepPackuments = (name, deps, boundContext, rules) => {
  if (isNoCache()) {
    return
  }

  const {registry, authorization, entrypoint, pipeline} = boundContext
  logger.debug(`warmup ${name} deps`, deps)

  deps.forEach(async (name) => {
    if (hasHit(`packument-${name}`) || await hasKey(`packument-${name}`)) {
      return
    }
    const org = name.charAt(0) === '@' ? name.slice(0, (name.indexOf('/') + 1 || name.indexOf('%') + 1) - 1) : null
    try {
      warmupPipeline(pipeline, {name, registry, org})

      const {deps: _deps} = await getPackument({ boundContext: {cache, registry, authorization, entrypoint, name, org, pipeline}, rules })
      warmupDepPackuments(name, _deps, boundContext, rules)
    } catch (e) {
      logger.warn('warmup error', e)
    }
  })
}

const getAuth = (token, auth) => token
  ? token?.startsWith('Bearer')
    ? token
    :`Bearer ${token}`
  : auth

export const firewall = ({registry, rules, entrypoint: _entrypoint, token}) => async (req, res, next) => {
  const {routeParams: {name, version, org}, base, method} = req

  if (method !== 'GET' && method !== 'HEAD') {
    return next(httpError(METHOD_NOT_ALLOWED))
  }

  const config = getConfig()
  const authorization = getAuth(token, req.headers['authorization'])
  const entrypoint = _entrypoint || normalizePath(`${config.server.entrypoint}${base}`)
  const pipeline = await getPipeline(rules)
  const boundContext = { registry, entrypoint, authorization, name, org, version, pipeline }

  warmupPipeline(pipeline, boundContext)
  const [
    { packument, packumentBufferZip, headers, etag, deps, directives },
    tarball
  ] = await Promise.all([
    getPackument({ boundContext, rules }),
    version ? checkTarball({registry, url: req.url}) : Promise.resolve(false)
  ])

  if (!packument) {
    return next(httpError(NOT_FOUND))
  }

  if (req.headers['if-none-match'] === etag) {
    res.writeHead(NOT_MODIFIED).end()
    return
  }
  warmupDepPackuments(name, deps, boundContext, rules)

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
  const buffer = isGzip
    ? packumentBufferZip || await time(gzip, `gzip packument ${name}`)(jsonBuffer(packument))
    : jsonBuffer(packument)
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
