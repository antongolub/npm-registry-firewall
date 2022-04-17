import { stdPlugin } from './plugins/std.js'
import { mapValuesAsync } from '../util.js'

export const getDirectives = ({packument, rules, org}) =>
  mapValuesAsync(packument.versions, async (entry) =>
    getDirective({
      ...entry,
      rules,
      org,
      time: Date.parse(packument.time[entry.version])
    })
  )

// `directive` is a matched `rule`
export const getDirective = async ({rules, ...entry }) => rules.reduce(async (m, rule) => {
  if (await m) {
    return m
  }
  const policy = await (rule.plugin || [[stdPlugin]]).reduce(async (_m, [plugin, options]) => {
    if (await _m) {
      return _m
    }
    return plugin({rule, entry, options})
  }, false)

  return !!policy && {
    policy,
    ...rule
  }
}, false)

export const getPolicy = (directives, version) => directives[version]?.policy
