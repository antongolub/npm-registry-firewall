import {request} from '../http/client.js'
import {semver} from '../semver.js'

export const firewall = async (req, res, next) => {
  if (!req?.cfg?.registry) {
    throw new Error('firewall: req.cfg.registry is required')
  }

  const { name, org, version } = req.routeParams
  const rule = req.cfg.rules.find(r => r.org.test(org) && r.name.test(name))

  if (!rule || rule.policy !== 'deny') {
    return next()
  }

  const err = new Error('Access Denied')
  err.status = 403


  if (rule.dateRange || rule.version) {
    const { body, headers } = await request({url: `${req.cfg.registry}/${name}`})
    const packument = JSON.parse(body)
    const _packument = patchPackument(packument, rule, req.cfg)

    // Tarball request
    if (version) {
      return !_packument.versions[version] ? next(err) : next()
    }

    // Packument request
    const packumentBuffer = Buffer.from(JSON.stringify(_packument))
    res.writeHead(200, {
      ...headers,
      'content-length': packumentBuffer.length
    })
    res.write(packumentBuffer)
    res.end()

    return
  }

  next(err)
}

const patchPackument = (packument, rule, cfg) => {
  const versions = Object.values(packument.versions).reduce((m, v) => {
    const { version } = v
    const time = Date.parse(packument.time[version])

    if (rule.dateRange && time >= rule.dateRange[0] && time <= rule.dateRange[1]) {
      return m
    }

    if (rule.version && semver.satisfies(version, rule.version)) {
      return m
    }

    v.dist.tarball = v.dist.tarball.replace(cfg.registry, cfg.entrypoint)
    m[version] = v

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

  return {
    ...packument,
    time,
    versions
  }
}
