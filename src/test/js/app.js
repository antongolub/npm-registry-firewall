import crypto from 'node:crypto'
import { testFactory, assert, sleep, objectContaining } from '../test-utils.js'
import { createApp } from '../../main/js/index.js'
import { request } from '../../main/js/http/client.js'

const test = testFactory('app', import.meta)
const app = createApp([{
  server: [
    { host: 'localhost', port: 3001 },
    { host: 'localhost', port: 3002 },
  ],
  firewall: {
    registry: 'https://registry.npmjs.org',
    base: '/registry',
    rules: [
      {
        "policy": "deny",
        "name": "colors",
        "version": ">= v1.3.0"
      },
    ]
  }
}, {
  server: { port: 3003 },
  firewall: {
    registry: 'https://registry.yarnpkg.com',
    rules: { policy: 'deny', name: '*' }
  }
}])

test('is runnable', async () => {
  await app.start()
})

;[
  // [
  //   'returns healthcheck',
  //   { url: 'http://localhost:3001/healthcheck/', method: 'GET'},
  //   {statusCode: 200, body: '{"status":"OK"}' }
  // ],
  // [
  //   '404 if not found',
  //   { url: 'http://localhost:3001/registry/not-found/path/on/remote', method: 'GET'},
  //   { statusCode: 404 }
  // ],
  // [
  //   'gets tarball if allowed',
  //   { url: 'http://localhost:3001/registry/@antongolub/git-root/-/git-root-1.5.6.tgz', method: 'GET'},
  //   { hash: 'uMs0P/SZUnoc+oF6E0VVPSnkXphOfg1GXRl+wnx/tElmLNPtNCuh2n7EVbSJU5hv73q96YK04bBVRQmS2p2Cjw==' }
  // ],
  [
    'reads packument',
    { url: 'http://localhost:3001/registry/colors', method: 'GET'},
    { statusCode: 200 }
  ],
].forEach(([name, {url, method}, expected]) => {
  test(name, async () => {
    let result
    try {
      const res = await request({url, method})
      const hash = crypto
        .createHash('sha512')
        .update(res.buffer)
        .digest('base64')

      result = {
        statusCode: res.statusCode,
        body: res.body,
        hash,
      }
    } catch ({res}) {
      result = {
        statusCode: res?.statusCode
      }
    }

    objectContaining(result, expected)
  })
})

test('is stoppable', async () => {
  await app.stop()
})

