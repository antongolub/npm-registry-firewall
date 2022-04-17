import {semver} from '../../semver.js'
import {request} from '../../http/index.js'
import {createCache} from '../../cache.js'

const cache = createCache({
  ttl: 120_000
})

export const auditPlugin = async ({entry: {name, version}, options = {}, boundContext: {registry}}) => {
  const severityOrder = [ 'low', 'moderate', 'high', 'critical']
  const advisories = await getAdvisories(name, registry)

  const vulns = advisories.filter(({vulnerable_versions}) =>
    semver.satisfies(version, vulnerable_versions))

  const max = severityOrder[Math.max(...vulns.map(({severity}) => severityOrder.indexOf(severity)))]
  const directive = max && (options[max] || options['any'] || options['*'])

  return directive || false
}

const getAdvisories = async (name, registry) => {
  const cached = cache?.get(name)
  if (cached) {
    return cached
  }

  const postData = JSON.stringify({[name]: ['0.0.0']})
  const headers = {
    'user-agent': 'npm/8.5.0 node/v16.14.2 darwin x64 workspaces/false',
    'npm-command': 'audit',
    'content-type': 'application/json',
    // 'content-encoding': 'gzip',
    accept: '*/*',
    // 'content-length': '45',
    // 'accept-encoding': 'gzip,deflate',
  }

  const advisories = JSON.parse((await request({
    method: 'POST',
    url: `${registry}/-/npm/v1/security/advisories/bulk`,
    postData,
    headers
  })).body)[name] || []

  cache?.add(name, advisories)

  return advisories
}

export default auditPlugin
