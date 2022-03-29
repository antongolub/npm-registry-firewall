import https from 'node:https'
import http from 'node:https'
import url from 'node:url'

import {request} from './client.js'
import {logger} from './logger.js'
import {getPkgDigest} from './pkg-digest.js'

const remote = 'https://registry.npmmirror.com'
// const remote = 'https://registry.npm.taobao.org'
// const remote = 'https://r.cnpmjs.org'
// const remote = 'https://registry.npmjs.org'

export const createServer = ({host, port, secure, router}) => {
  const lib = secure ? https : http
  const options = {...secure}
  const server = lib.createServer(options, async (req, res) => {
    const dst = `${remote}${req.url}`

    // const pkgDigest = req.url.length === 1 || req.url.includes('/-/')
    //   ? null
    //   : await getPkgDigest({name: req.url.slice(1), registry: remote})

    try {
      await router(req, res)
      // logger.log(req.method, dst)
      // await request(dst, req.method, null, {req, res})

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
