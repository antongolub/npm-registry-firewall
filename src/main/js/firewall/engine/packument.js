import crypto from 'node:crypto'

import {getDirectives, getPolicy} from './common.js'
import {request} from '../../http/index.js'
import {logger} from '../../logger.js'
import {asArray, tryQueue, time, replaceAll} from '../../util.js'
import {withCache} from '../../cache.js'
import {semver} from '../../semver.js'
import {gunzip} from '../../zip.js'

export const getPackument = async ({boundContext, rules = boundContext.rules}) => {
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
  const directives = await getDirectives({ packument, rules, boundContext})
  const _packument = patchPackument({ packument, directives, entrypoint, registry })
  const vkeys = Object.keys(_packument.versions)

  logDenied(packument.name, directives)

  if (vkeys.length === 0) {
    return {}
  }
  const deps = getDeps(_packument)
  const packumentBufferZip = vkeys.length === Object.keys(packument.versions).length && buffer
  const etag = 'W/' + JSON.stringify(crypto.createHash('sha256').update(`${packument.name}${vkeys.join(',')}`).digest('hex'))

  return {
    etag,
    deps,
    directives,
    headers,
    packument: _packument,
    packumentBufferZip,
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

export const guessDistTags = (distTags, versions, time) => {
  const _versions = Object.keys(versions).sort((a, b) => Date.parse(time[b]) - Date.parse(time[a]))

  return Object.entries(distTags)
    .reduce((m, [tag, v]) => {
      if (_versions.includes(v)) {
        m[tag] = v
      } else if (tag === 'latest') {
        m[tag] = _versions.find(v => !v.includes('-')) || _versions[0]
      } else {
        m[tag] = _versions.find(v => v.includes(`-${tag}.`))
      }

      return m
    }, {})
}

export const patchPackument = ({packument, directives, entrypoint, registry}) => {
  const versions = patchVersions({packument, directives, entrypoint, registry})
  const time = patchTime(packument.time, versions)
  const distTags = guessDistTags(packument['dist-tags'], versions, time)
  const latestEntry = versions[distTags.latest]

  return {
    ...packument,
    author: latestEntry?.author,
    license: latestEntry?.license,
    maintainer: latestEntry?.maintainer,
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

const logDenied = (name, directives) => {
  const denied = Object.entries(directives).reduce((m, [v, {policy, pluginName, options}]) => {
    if (policy === 'deny') {
      const snap = JSON.stringify({pluginName, policy, options})
      if (!m[snap]) {
        m[snap] = []
      }
      m[snap].push(v)
    }

    return m
  }, {})

  if (Object.keys(denied).length > 0) {
    const formatted = Object.entries(denied).reduce((m, [snap, versions]) =>
      m + `${versions.join(',')} by ${replaceAll(snap, '\"', '')} `
    , '')
    logger.info(`denied ${name} versions: ${formatted}`)
  }
}
