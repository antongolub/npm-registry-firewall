import {asArray, mapValuesAsync, normalizePath} from '../../util.js'
import {logger} from '../../logger.js'
import {getConfig} from '../../config.js'

const getAuth = (token, auth) => token
  ? token?.startsWith('Bearer')
    ? token
    :`Bearer ${token}`
  : auth

export const getBoundContext = async ({name, version, rules, registry, token, entrypoint: _entrypoint, req = {headers: {}, base: ''}}) => {
  const config = getConfig()
  const org = name.charAt(0) === '@' ? name.slice(0, (name.indexOf('/') + 1 || name.indexOf('%') + 1) - 1) : null
  const authorization = getAuth(token, req.headers['authorization'])
  const entrypoint = _entrypoint || normalizePath(`${config?.server?.entrypoint || ''}${req.base}`)
  const pipeline = await getPipeline(rules)

  return { registry, entrypoint, authorization, name, org, version, pipeline, rules }
}

export const getDirectives = ({packument, rules, boundContext}) =>
  mapValuesAsync(packument.versions, async (entry) =>
    getDirective({
      entry: {
        ...entry,
        time: Date.parse(packument.time[entry.version])
      },
      rules,
      boundContext
    })
  )

// `directive` is a matched `rule`
export const getDirective = async ({rules, entry, boundContext}) => {
  const pipeline = boundContext?.pipeline || await getPipeline(rules)

  return pipeline.reduce(async (_m, [plugin, options, rule]) => {
    if (await _m) {
      return _m
    }

    const pluginName = plugin.name

    try {
      const policy = await plugin({rule, entry, options, boundContext})
      return policy ? {rule, options, pluginName, policy} : false
    } catch (e){
      logger.error(`Error in plugin ${pluginName}`, e)
      return false
    }

  }, false)
}

export const getPolicy = (directives, version) => directives[version]?.policy

export const getPipeline = async (rules) =>
  Promise.all(normalizePipeline(rules).map(async ([_plugin, options]) => {
    const plugin = typeof _plugin === 'function'
      ? _plugin
      : (await import(_plugin)).default

    return [plugin, options]
  }))

export const normalizePipeline = (rules) =>
  rules.reduce((m, rule) => {
    m.push(...rule.plugin
      ? asArray(rule.plugin).map((v) => [...asArray(v), rule])
      : [['npm-registry-firewall/std', rule, rule]]
    )

    return m
  }, [])