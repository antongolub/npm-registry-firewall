import {request} from '../client.js'

export const proxy = async (req, res, next) => {
  const remote = 'https://registry.npmmirror.com'
  // const remote = 'https://registry.npm.taobao.org'
  // const remote = 'https://r.cnpmjs.org'
  // const remote = 'https://registry.npmjs.org'
  const dst = `${remote}${req.url}`

  request(dst, req.method, null, {req, res})
}
