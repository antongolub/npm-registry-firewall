import http from 'node:http'
import https from 'node:https'

import { logger } from './logger.js'
import { makeDeferred } from './util.js'

export const createServer = ({host, port, secure, router, keepAliveTimeout, headersTimeout, requestTimeout}) => {
  const lib = secure ? https : http
  const options = {...secure}
  const server = lib.createServer(options, async (req, res) => {
    try {
      await router(req, res)

    } catch (e) {
      const message = e?.res?.statusMessage || 'Internal server error\n'
      const code = e?.res?.statusCode || 500

      res
        .writeHead(code)
        .end(message)

      logger.error(e)
    }
  })
  server.keepAliveTimeout = keepAliveTimeout
  server.headersTimeout = headersTimeout
  server.timeout = requestTimeout * 2 // Final bastion

  server.start = async () => {
    const {promise, resolve, reject} = makeDeferred()
    server.listen(port, host, (err) => {
      if (err) {
        return reject(err)
      }
      resolve()
      logger.info(`npm-registry-firewall is ready for connections: ${secure ? 'https' : 'http'}://${host}:${port}`)
    })

    return promise
  }

  server.stop = async () => {
    const {promise, resolve, reject} = makeDeferred()
    server.close((err) => {
      if (err) {
        return reject(err)
      }
      resolve()
    })

    return promise
  }

  return server
}
