import https from 'node:https'
import http from 'node:https'

import {request} from './client.js'
import {logger} from './logger.js'

const remote = 'https://registry.npmmirror.com'
// const remote = 'https://registry.npm.taobao.org'
// const remote = 'https://r.cnpmjs.org'
// const remote = 'https://registry.npmjs.org'

export const createServer = ({host, port, secure}) => {
  const lib = secure ? https : http
  const options = {...secure}
  const server = lib.createServer(options, async (req, res) => {
    try {
      logger.log(req.method, `${remote}${req.url}`)
      await request(`${remote}${req.url}`, req.method, null, {req, res})

    } catch (e) {
      const message = e?.res?.statusMessage || 'Internal server error\n'
      const code = e?.res?.statusCode || 500

      res
        .writeHead(code)
        .end(message)

      logger.error(e)
    }
  })
  server.keepAliveTimeout = 61_000
  server.headersTimeout = 62_000

  server.start = async () => {
    await server.listen(port, host, () => {
      logger.info(`npm registry firewall is ready: ${secure ? 'https' : 'http'}://${host}:${port}`)
    })
  }

  return server
}
