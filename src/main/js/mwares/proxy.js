import {request} from '../http/client.js'
import {asArray, tryQueue} from '../util.js'

export const proxy = (registry) => async (req, res) => {
  const registries = asArray(registry)
  const args = registries.map(r => [{
    url: `${r}${req.url}`,
    method: req.method,
    followRedirects: true
  }])

  const { statusCode, headers, buffer } = await tryQueue(request, ...args)

  res.writeHead(statusCode, headers)
  res.end(buffer)
}
