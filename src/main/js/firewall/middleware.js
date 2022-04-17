import Buffer from 'node:buffer'

import { request, httpError, NOT_FOUND, ACCESS_DENIED } from '../http/index.js'
import { getDirectives, getPolicy } from './engine.js'
import { patchPackument } from './packument.js'
import { normalizePath} from '../util.js'

export const firewall = ({registry, rules, entrypoint: _entrypoint, token, cache}) => async (req, res, next) => {
  const {cfg, routeParams: {name, version, org}, base, log: logger} = req
  const authorization = token && `Bearer ${token}`
  const boundContext = { registry, authorization, org, version, logger, cache }
  const {body, headers} = await request({
    url: `${registry}/${name}`,
    authorization
  })
  const packument = JSON.parse(body)
  const directives = cache?.get(name) || await getDirectives({ packument, rules, boundContext})

  // Tarball request
  if (version) {
    const policy = getPolicy(directives, version)
    if (policy === 'warn') {
      logger.warn(`${name}@${version}`, 'directive=', directives[version]._raw)
    }
    return policy === 'deny' ? next(httpError(ACCESS_DENIED)) : next()
  }

  // Packument request
  const entrypoint = _entrypoint || normalizePath(`${cfg.server.entrypoint}${base}`)
  const _packument = patchPackument({ packument, directives, entrypoint, registry })

  if (Object.keys(_packument.versions).length === 0) {
    return next(httpError(NOT_FOUND))
  }

  const packumentBuffer = Buffer.from(JSON.stringify(_packument))
  res.writeHead(200, {
    ...headers,
    'content-length': '' + packumentBuffer.length
  })
  res.write(packumentBuffer)
  res.end()
}
