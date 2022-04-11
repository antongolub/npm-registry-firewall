import fs from 'node:fs'
import {strict as assert} from 'node:assert'

const populate = (config) => {
  assert.ok(config.registry, 'cfg: registry')

  const server = config.server.map(({
    host,
    port,
    secure: _secure,
    keepAliveTimeout = 61_000,
    headersTimeout = 62_000,
    requestTimeout = 30_000
  }) => {
    assert.ok(host, 'cfg: server.host')
    assert.ok(port, 'cfg: server.port')

    const secure = _secure
      ? {
        key: fs.readFileSync(_secure.key, 'utf8'),
        cert: fs.readFileSync(_secure.cert, 'utf8'),
      } : null

    return {
      secure,
      host,
      port,
      requestTimeout,
      headersTimeout,
      keepAliveTimeout,
    }
  })

  return {
    server,
    rules: config.rules,
    registry: config.registry,
  }
}

export const getConfig = (file) => populate(JSON.parse(fs.readFileSync(file, 'utf8')))
