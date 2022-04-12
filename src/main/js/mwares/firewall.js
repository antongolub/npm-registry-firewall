import {request, notFoundErr, accessDeniedErr} from '../http/index.js'
import {semver} from '../semver.js'
import {normalizePath} from '../util.js'

export const firewall = (registry, rules) => async (req, res, next) => {
  if (!registry) {
    throw new Error('firewall: req.cfg.registry is required')
  }

  const {name, version} = req.routeParams
  const {body, headers} = await request({url: `${registry}/${name}`})
  const packument = JSON.parse(body)
  const {cfg, routeParams, base} = req
  const entrypoint = normalizePath(`${cfg.server.entrypoint}${base}`)
  const _packument = patchPackument({packument, routeParams, entrypoint, rules, registry})

  // Tarball request
  if (version) {
    return !_packument.versions[version] ? next(accessDeniedErr) : next()
  }

  // Packument request
  if (Object.keys(_packument.versions).length === 0) {
    return next(notFoundErr)
  }

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

}, false)

const filterVersions = ({packument, routeParams, entrypoint, rules, registry}) => Object.values(packument.versions).reduce((m, v) => {
  if (getDirective(rules, packument.time, routeParams, v) === 'deny') {
    return m
  }

  v.dist.tarball = v.dist.tarball.replace(registry, entrypoint)
  m[v.version] = v
  return m
}, {})

const filterTime = (versions, time) => Object.entries(time).reduce((m, [k, v]) => {
  if (versions[k]) {
    m[k] = v
  }
  return m
}, {
  created: time.created,
  modified: time.modified,
})

const patchPackument = ({packument, routeParams, entrypoint, rules, registry}) => {
  const versions = filterVersions({packument, routeParams, entrypoint, registry, rules})
  const time = filterTime(versions, packument.time)

  const latestVersion = Object.keys(versions).reduce((m, v) => time[m] > time[v] ? m : v , null);
  const distTags = { latest: latestVersion }
  const latestEntry = versions[latestVersion] || {}

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

