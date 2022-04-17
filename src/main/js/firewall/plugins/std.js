import {semver} from '../../semver.js'

export const stdPlugin = async ({rule, entry}) => {
  const filter = rule.filter || defaultFilter
  const matched = await filter({...entry, rule})

  return !!matched && rule.policy
}

export const defaultFilter = ({rule: r, name, org, version, time, license, _npmUser, now = Date.now()}) => {
  const day = 24 * 3600 * 1000
  return (r.org ? org && r.org.some(e => e.test(org)) : true)
    && (r.name ? r.name.some(e => e.test(name)) : true)
    && (r.license ? r.license.includes(license?.toLowerCase()) : true)
    && (r.username ? r.username.includes(_npmUser?.name?.toLowerCase()) : true)
    && (r.age ? time <= now - r.age[0] * day && time >= now - (r.age[1] * day || Infinity) : true)
    && (r.dateRange ? time >= r.dateRange[0] && time <= r.dateRange[1] : true)
    && (r.version ? semver.satisfies(version, r.version) : true)
}

export default stdPlugin
