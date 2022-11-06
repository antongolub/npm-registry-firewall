import {Buffer} from 'node:buffer'
import crypto from 'node:crypto'

import {getDirectives, getPolicy} from './engine.js'
import {request} from '../http/index.js'
import {asArray, gunzip, tryQueue, time} from '../util.js'
import {withCache} from '../cache.js'
import {semver} from '../semver.js'

export const getPackument = async ({boundContext, rules}) => {
  const { registry, authorization, entrypoint, name } = boundContext
  const {buffer, headers} = await withCache(`packument-${name}`, async () => {
    const args = asArray(registry).map(r => [{
      url: `${r}/${name}`,
      authorization,
      gzip: true,
      skipUnzip: true
    }])
    const {buffer, headers} = await tryQueue(request, ...args)
    return {buffer, headers}
  })

  const body = (await time(gunzip, `unzip packument ${name}`)(buffer)).toString('utf8')
  const packument = JSON.parse(body)
  const deps = getDeps(packument)
  const directives = await getDirectives({ packument, rules, boundContext})
  const _packument = patchPackument({ packument, directives, entrypoint, registry })

  if (Object.keys(_packument.versions).length === 0) {
    return {}
  }
  const packumentBuffer = Object.keys(_packument.versions).length === Object.keys(packument.versions).length
    ? buffer
    : Buffer.from(JSON.stringify(_packument))
  const etag = 'W/' + JSON.stringify(crypto.createHash('sha256').update(packumentBuffer.slice(0, 65_536)).digest('hex'))

  return {
    etag,
    deps,
    directives,
    headers,
    packument: _packument,
    packumentBuffer,
  }
}

export const patchVersions = ({packument, directives, entrypoint, registry}) => Object.values(packument.versions).reduce((m, v) => {
  if (getPolicy(directives, v.version) === 'deny') {
    return m
  }
  asArray(registry).forEach(r => {
    v.dist.tarball = v.dist.tarball.replace(r, entrypoint)
  })

  m[v.version] = v
  return m
}, {})

export const patchTime = (time, versions) => Object.entries(time).reduce((m, [k, v]) => {
  if (versions[k]) {
    m[k] = v
  }
  return m
}, {
  created: time.created,
  modified: time.modified,
})

export const patchPackument = ({packument, directives, entrypoint, registry}) => {
  const versions = patchVersions({packument, directives, entrypoint, registry})
  const time = patchTime(packument.time, versions)

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

export const getDeps = (packument) => {
  const stable = Object.values(packument.versions)
    .filter(p => !p.version.includes('-'))
    .sort((a, b) => semver.compare(b.version, a.version))

  const majors = stable.reduce((m, p) => {
    const major = p.version.slice(0, p.version.indexOf('.') + 1)
    if (m.every((_p) => !_p.version.startsWith(major))) {
      m.push(p)
    }
    return m
  }, [])

  return [...(majors.length > 1 ? majors : stable)
    .slice(0, 2)
    .reduce((m, p) => {
      Object.keys(p.dependencies || {}).forEach(d => m.add(d))
      return m
    }, new Set())]
}
