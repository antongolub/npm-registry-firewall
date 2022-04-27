import {Buffer} from 'node:buffer'

import {httpError, NOT_FOUND, ACCESS_DENIED } from '../http/index.js'
import {getPolicy} from './engine.js'
import {getPackument} from './packument.js'
import {genId, normalizePath} from '../util.js'
import {getCache} from '../cache.js'

export const firewall = ({registry, rules, entrypoint: _entrypoint, token, evictionTimeout, ttl, cache: _cache, id = genId()}) => async (req, res, next) => {
  const {cfg, routeParams: {name, version, org}, base, log: logger} = req
  const cache = _cache || getCache({name: 'packument' + id, ttl, evictionTimeout})
  const authorization = token && `Bearer ${token}`
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

  const packumentBuffer = Buffer.from(JSON.stringify(packument))
  res.writeHead(200, {
    ...headers,
    'content-length': '' + packumentBuffer.length
  })
  res.write(packumentBuffer)
  res.end()
}
