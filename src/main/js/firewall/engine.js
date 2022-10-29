import {asArray, mapValuesAsync} from '../util.js'

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

    const policy = await plugin({rule, entry, options, boundContext})
    return policy ? {...rule, policy} : false
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
