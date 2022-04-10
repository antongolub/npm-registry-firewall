import fs from 'node:fs'
import {strict as assert} from 'node:assert'

const populate = (config) => {
  const server = config.server.map(({host, port, secure: _secure}) => {
    assert.ok(host, 'cfg: server host must be specified')
    assert.ok(port, 'cfg: server port must be specified')

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
  const rules = config.rules

  return {
    server,
    rules
  }
}

export const getConfig = (file) => populate(JSON.parse(fs.readFileSync(file, 'utf8')))
