import {request} from '../http/client.js'
import {semver} from '../semver.js'

export const firewall = async (req, res, next) => {
  if (!req?.cfg?.registry) {
    throw new Error('firewall: req.cfg.registry is required')
  }

  const {name, version} = req.routeParams
  const {body, headers} = await request({url: `${req.cfg.registry}/${name}`})
  const packument = JSON.parse(body)
  const _packument = patchPackument(packument, req.cfg, req.routeParams)

  // Tarball request
  if (version) {
    return !_packument.versions[version] ? next(err) : next()
  }

  // Packument request
  const packumentBuffer = Buffer.from(JSON.stringify(_packument))
  res.writeHead(200, {
    ...headers,
    'content-length': '' + packumentBuffer.length
  })
  res.write(packumentBuffer)
  res.end()
}

const getDirective = (rules, times, {name, org}, {version, license}) => rules.reduce((m, r) => {
  if (m) {
    return m
  }

  const time = Date.parse(times[version])
  const matched = r.org.test(org)
    && r.name.test(name)
    && (r.license ? r.license.includes(license?.toLowerCase()) : true)
    && (r.dateRange ? time >= r.dateRange[0] && time <= r.dateRange[1] : true)
    && (r.version ? semver.satisfies(version, r.version): true)

  return matched && r.policy

}, null)

const patchPackument = (packument, cfg, routeParams) => {
  const versions = Object.values(packument.versions).reduce((m, v) => {
    if (getDirective(cfg.rules, packument.time, routeParams, v) === 'deny') {
      return m
    }
    v.dist.tarball = v.dist.tarball.replace(cfg.registry, cfg.server.entrypoint)
    m[v.version] = v

    return m
  }, {})

  const time = Object.entries(packument.time).reduce((m, [k, v]) => {
    if (versions[k]) {
      m[k] = v
    }
    return m
  }, {
    created: packument.time.created,
    modified: packument.time.modified,
  })

  const latestVersion = Object.keys(versions).reduce((m, v) => time[m] > time[v] ? m : v );
  const latestEntry = versions[latestVersion]
  const distTags = {
    latest: latestVersion
  }

  return {
    ...packument,
    author: latestEntry.author,
    license: latestEntry.license,
    maintainer: latestEntry.maintainer,
    'dist-tags': distTags,
    time,
    versions
  }
}

