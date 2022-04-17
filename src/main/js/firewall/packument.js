import { getPolicy } from './engine.js'

export const patchVersions = ({packument, directives, entrypoint, registry}) => Object.values(packument.versions).reduce((m, v) => {
  if (getPolicy(directives, v.version) === 'deny') {
    return m
  }
  v.dist.tarball = v.dist.tarball.replace(registry, entrypoint)
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
