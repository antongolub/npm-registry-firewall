import {asArray, tryQueue} from '../util.js'
import {request} from '../http/index.js'

export const getTarball = async ({registry, url}) => {
  const registries = asArray(registry)
  const args = registries.map(r => [{
    url: `${r}${url}`,
    method: 'GET',
    followRedirects: true
  }])

  return tryQueue(request, ...args)
}
