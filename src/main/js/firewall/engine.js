import { mapValuesAsync } from '../util.js'

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
export const getDirective = async ({rules, entry, boundContext}) => rules.reduce(async (m, rule) => {
  if (await m) {
    return m
  }
  const policy = await (rule.plugin || [['npm-registry-firewall/std']]).reduce(async (_m, [_plugin, options]) => {
    if (await _m) {
      return _m
    }
    const plugin = typeof _plugin === 'function'
      ? _plugin
      : (await import(_plugin)).default

    return plugin({rule, entry, options, boundContext})
  }, false)

  return !!policy && {
    ...rule,
    policy,
  }
}, false)

export const getPolicy = (directives, version) => directives[version]?.policy
