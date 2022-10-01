import {Buffer} from 'node:buffer'
import crypto from 'node:crypto'

import {httpError, NOT_FOUND, ACCESS_DENIED, METHOD_NOT_ALLOWED} from '../http/index.js'
import {getPolicy} from './engine.js'
import {getPackument} from './packument.js'
import {normalizePath, gzip} from '../util.js'
import {getCache} from '../cache.js'
import {getCtx} from '../als.js'

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
  const { packument, headers, directives } = await getPackument({ boundContext, rules })

  // Tarball request
  if (version) {
    const policy = getPolicy(directives, version)
    if (policy === 'warn') {
      logger.warn(`${name}@${version}`, 'directive=', directives[version]._raw)
    }
    return policy === 'deny' ? next(httpError(ACCESS_DENIED)) : next()
  }

  // Packument request
  if (Object.keys(packument.versions).length === 0) {
    return next(httpError(NOT_FOUND))
  }

  const tranferEncoding = headers['transfer-encoding']
  const _packumentBuffer = Buffer.from(JSON.stringify(packument))
  const packumentBuffer = tranferEncoding === 'gzip' ? await gzip(_packumentBuffer) : _packumentBuffer
  const contentLength = tranferEncoding ? null : {'content-length': '' + _packumentBuffer.length}
  const etag = 'W/' + JSON.stringify(crypto.createHash('sha256').update(packumentBuffer).digest('hex'))

  if (req.headers['if-none-match'] === etag) {
    res.writeHead(304).end()
    return
  }

  res.writeHead(200, {
    ...headers,
    ...contentLength,
    etag,
  })

  if (method === 'GET') {
    res.write(packumentBuffer)
  }
  res.end()
}
