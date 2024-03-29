import {httpError, NOT_FOUND, ACCESS_DENIED, METHOD_NOT_ALLOWED, NOT_MODIFIED, OK, FOUND} from '../http/index.js'
import {getPolicy, getPackument, getAssets, assertPolicy} from './engine/api.js'
import {dropNullEntries, time, jsonBuffer} from '../util.js'
import {gzip} from '../zip.js'
import {hasHit, hasKey, isNoCache} from '../cache.js'
import {logger} from '../logger.js'
import {getConfig} from '../config.js'
import {getBoundContext} from "./engine/common.js";

const warmupPipeline = (pipeline, opts, warmup = getConfig().warmup) => {
  if (warmup <= 0 || isNoCache()) return

  pipeline.forEach(([plugin, _opts]) => {
    try {
      plugin.warmup?.({...opts, ..._opts })
    } catch (e) {
      logger.error(`Error in plugin ${plugin.name} warmup`, e)
    }
  })
}

const warmupDepPackuments = (name, deps, boundContext, rules, warmup = getConfig().warmup) => {
  if (warmup <= 0 || isNoCache()) return

  const {registry, authorization, entrypoint, pipeline} = boundContext
  logger.debug(`warmup ${name} deps`, deps)

  deps.forEach(async (name) => {
    if (hasHit(`packument-${name}`) || await hasKey(`packument-${name}`)) {
      return
    }
    const org = name.charAt(0) === '@' ? name.slice(0, (name.indexOf('/') + 1 || name.indexOf('%') + 1) - 1) : null
    try {
      warmupPipeline(pipeline, {name, registry, org}, warmup--)

      const {deps: _deps} = await getPackument({ boundContext: {registry, authorization, entrypoint, name, org, pipeline}, rules })
      warmupDepPackuments(name, _deps, boundContext, rules, warmup--)
    } catch (e) {
      logger.warn('warmup error', e.message, e.stack)
    }
  })
}

export const advisory =  ({registry, rules, token}) => async (req, res, next) => {
  const {routeParams: {name, version}} = req
  const data = version
    ? [`${name}@${version}`]
    : await req.json()

  const result = Object.fromEntries(await Promise.all(data.map(async entry => {
    const atSepPos = entry.indexOf('@', 1)
    const name = entry.slice(0, atSepPos)
    const version = entry.slice(atSepPos + 1)

    return [entry, await assertPolicy({name, version, registry, rules, token})]
  })))

  req.timed = true
  res.json(result)
}

export const firewall = ({registry, rules, entrypoint, token}) => async (req, res, next) => {
  const {routeParams: {name, version, org}, method} = req
  req.timed = true

  if (method !== 'GET' && method !== 'HEAD') {
    return next(httpError(METHOD_NOT_ALLOWED))
  }

  const boundContext = await getBoundContext({org, name, version, rules, registry, token, entrypoint, req})
  const {pipeline} = boundContext

  warmupPipeline(pipeline, boundContext)
  const {packument, packumentBufferZip, headers, etag, deps, directives, tarball} = await getAssets(boundContext)

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
