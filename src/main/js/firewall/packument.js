import {getDirectives, getPolicy} from './engine.js'
import {request} from '../http/index.js'
import {asArray, makeDeferred, tryQueue} from '../util.js'

export const getPackument = async ({boundContext, rules}) => {
  const {cache, registry, authorization, entrypoint, name} = boundContext
  if (await cache.has(name)) {
    return cache.get(name)
  }
  const {promise, resolve, reject} = makeDeferred()
  cache.add(name, promise)

  try {
    const args = asArray(registry).map(r => [{
      url: `${r}/${name}`,
      authorization,
      'accept-encoding': 'gzip'
    }])
    const {body, headers} = await tryQueue(request, ...args)
    const packument = JSON.parse(body)
    const directives = await getDirectives({ packument, rules, boundContext})
    const _packument = patchPackument({ packument, directives, entrypoint, registry })

    resolve({
      directives,
      headers,
      packument: _packument
    })

  } catch (e) {
    reject(e)
    cache.del(name)
  }

  return promise
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
