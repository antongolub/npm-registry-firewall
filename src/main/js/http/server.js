import http from 'node:http'
import https from 'node:https'

import { logger } from '../logger.js'
import { makeDeferred } from '../util.js'

export const createServer = ({host, port, secure, router, entrypoint, keepAliveTimeout, headersTimeout, requestTimeout}) => {
  const lib = secure ? https : http
  const options = {...secure}
  const sockets = new Set()
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

  server.on('connection', socket => {
    sockets.add(socket);
    socket.on('close', () => sockets.delete(socket))
  })

  server.start = async () => {
    const {promise, resolve, reject} = makeDeferred()
    server.listen(port, host, (err) => {
      if (err) {
        return reject(err)
      }
      resolve()
      logger.info(`npm-registry-firewall is ready for connections: ${entrypoint}`)
    })

    return promise
  }

  server.stop = async () => {
    const {promise, resolve, reject} = makeDeferred()
    for (const socket of sockets.values()) {
      socket.destroy()
    }
    server.close((err) => {
      if (err) {
        return reject(err)
      }

      logger.info(`npm-registry-firewall has been stopped: ${entrypoint}`)
      resolve()
    })

    return promise
  }

  return server
}
