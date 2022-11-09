import {semver} from '../../semver.js'
import {asRegExp, setFnName} from '../../util.js'

export const stdPlugin = async ({rule, entry, boundContext = {}, options = rule}) => {
  const filter = options.filter || defaultFilter
  const matched = await filter({
    ...entry, ...boundContext, rule, // legacy filter contract
    entry, boundContext, options     // new recommended
  })

  return !!matched && options.policy
}

setFnName(stdPlugin, 'std-plugin')

export const defaultFilter = ({options: opts, boundContext: {org}, entry: { name, version, time, license, _npmUser }, now = Date.now()}) => {
  const matches = [
    matchByName(opts, name, version),
    matchByOrg(opts, org),
    matchByLicense(opts, license),
    matchByUsername(opts, _npmUser),
    matchByAge(opts, time, now),
    matchByDateRange(opts, time),
    matchByVersion(opts, version)
  ]

  return opts.cond === 'or'
    ? matches.some(v => v === true)
    : !matches.some(v => v === false)
}

export const matchByOrg = (opts, org) =>
  opts.org?.some(n => {
      if (!org) {
        return false
      }

      const _org = org.charAt(0) === '@' ? org.slice(1) : org // replace(/^@/, '')
      if (n instanceof RegExp) {
        return n.test(_org) || n.test(org)
      }

      return _org.includes('*')
        ? asRegExp(_org).test(n) || asRegExp(org).test(n)
        : n === _org || n === org
    })


export const matchByName = (opts, name, version) =>
  opts.name?.some(n => {
      if (n === name) {
        return true
      }

      if (n instanceof RegExp) {
        return n.test(name)
      }

      const [,_name,,_version] = /^(@?[^@]+)(@(.+))?$/.exec(n) || []
      const nameMatch = _name.includes('*') ? asRegExp(_name).test(name) : name === _name
      const versionMatch = _version ? semver.satisfies(version, _version) : true

      return nameMatch && versionMatch
    })

export const matchByAge = (opts, time, now) => {
  const day = 24 * 3600 * 1000

  return opts.age && time <= now - opts.age[0] * day && time >= now - (opts.age[1] * day || Infinity)
}

export const matchByDateRange = (opts, time) => opts.dateRange && time >= opts.dateRange[0] && time <= opts.dateRange[1]

export const matchByLicense = (opts, license) => opts.license?.includes(license?.toLowerCase())

export const matchByUsername = (opts, _npmUser) => opts.username?.includes(_npmUser?.name?.toLowerCase())

export const matchByVersion = (opts, version) => opts.version && semver.satisfies(version, opts.version)

export default stdPlugin
