import {semver} from '../../semver.js'
import {asRegExp} from '../../util.js'

export const stdPlugin = async ({rule, entry, boundContext}) => {
  const filter = rule.filter || defaultFilter
  const matched = await filter({...entry, ...boundContext, rule})

  return !!matched && rule.policy
}

export const matchByOrg = ({rule, org}) =>
  rule.org
    ? rule.org.some(n => {
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
    : true


export const matchByName = ({name, version, rule}) =>
  rule.name
    ? rule.name.some(n => {
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
    : true

export const defaultFilter = ({rule, name, org, version, time, license, _npmUser, now = Date.now()}) => {
  const day = 24 * 3600 * 1000

  return matchByName({rule, name, version})
    && matchByOrg({rule, org})
    && (rule.license ? rule.license.includes(license?.toLowerCase()) : true)
    && (rule.username ? rule.username.includes(_npmUser?.name?.toLowerCase()) : true)
    && (rule.age ? time <= now - rule.age[0] * day && time >= now - (rule.age[1] * day || Infinity) : true)
    && (rule.dateRange ? time >= rule.dateRange[0] && time <= rule.dateRange[1] : true)
    && (rule.version ? semver.satisfies(version, rule.version) : true)
}

export default stdPlugin
