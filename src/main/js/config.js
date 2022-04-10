import fs from 'node:fs'
import {strict as assert} from 'node:assert'

const populate = (config) => {
  assert.ok(config.registry, 'cfg: registry')

  const server = config.server.map(({host, port, secure: _secure} ) => {
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
      port
    }
  })

  return {
    server,
    rules: config.rules,
    registry: config.registry,
  }
}

export const getConfig = (file) => populate(JSON.parse(fs.readFileSync(file, 'utf8')))
