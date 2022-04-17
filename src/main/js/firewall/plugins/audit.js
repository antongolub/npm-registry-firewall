import {semver} from '../../semver.js'
import {request} from '../../http/index.js'
import {createCache} from '../../cache.js'
import {makeDeferred} from '../../util.js'

const cache = createCache({
  ttl: 120_000
})

export const auditPlugin = async ({entry: {name, version}, options = {}, boundContext: {registry}}) => {
  options.any = options.any || options['*']
  const severityOrder = ['critical', 'high', 'moderate', 'low', 'any' ]
  const advisories = await getAdvisories(name, registry)
  const vulns = advisories.filter(({vulnerable_versions}) => semver.satisfies(version, vulnerable_versions))
  const worst = Math.min(...vulns.map(({severity}) => severityOrder.indexOf(severity)))
  const directive = worst !== -1 && options[severityOrder.slice(worst).find(l => options[l])]

  return directive || false
}

const getAdvisories = async (name, registry) => {
  const cached = cache?.get(name)
  if (cached) {
    return cached
  }
  const {promise, resolve, reject} = makeDeferred()
  cache?.add(name, promise)

  try {
    const postData = JSON.stringify({[name]: ['0.0.0']})
    const headers = {
      'user-agent': 'npm/8.5.0 node/v16.14.2 darwin x64 workspaces/false',
      'npm-command': 'audit',
      'content-type': 'application/json',
      accept: '*/*'
    }
    const {body} = await request({
      method: 'POST',
      url: `${registry}/-/npm/v1/security/advisories/bulk`,
      postData,
      headers,
      gzip: true
    })

    resolve(JSON.parse(body)[name] || [])

  } catch (e) {
    reject(e)
    cache.del(name)
  }

  return promise
}

export default auditPlugin
