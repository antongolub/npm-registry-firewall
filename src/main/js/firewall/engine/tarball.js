import {asArray, tryQueue} from '../../util.js'
import {request} from '../../http/index.js'

export const checkTarball = async ({registry, url}) => {
  const registries = asArray(registry)
  if (registries.length === 1) {
    return `${registries[0]}/${url}`
  }

  const args = registries.map(r => [{
    url: `${r}${url}`,
    method: 'HEAD',
    followRedirects: true
  }])

  return tryQueue((opt) => request(opt).then(() => opt.url), ...args)
}
