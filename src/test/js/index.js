import crypto from 'node:crypto'
import { testFactory, assert, sleep, objectContaining } from '../test-utils.js'
import { createApp } from '../../main/js/index.js'
import { request } from '../../main/js/http/client.js'

const test = testFactory('app', import.meta)
const app = createApp({
  server: [{
    host: 'localhost',
    port: 3001,
  }],
  registry: 'https://registry.npmmirror.com'
})

await app.start()

;[
  [
    'returns healthcheck',
    { url: 'http://localhost:3001/status/', method: 'GET'},
    {}
  ],
  [
    '404 if not found',
    { url: 'http://localhost:3001/not-found/path/on/remote', method: 'GET'},
    { statusCode: 404 }
  ],
  [
    'gets tarball if allowed',
    { url: 'http://localhost:3001/@antongolub/git-root/-/git-root-1.5.6.tgz', method: 'GET'},
    { hash: 'uMs0P/SZUnoc+oF6E0VVPSnkXphOfg1GXRl+wnx/tElmLNPtNCuh2n7EVbSJU5hv73q96YK04bBVRQmS2p2Cjw==' }
  ]
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
        hash,
      }
    } catch ({res}) {
      result = {
        statusCode: res.statusCode
      }
    }

    objectContaining(result, expected)
  })
})

test('is stoppable', async () => {
  await app.stop()
})

// test('app ', () => {
//   assert.ok(false)
// })

// test('foo', () => {
//   assert.ok(false)
// })
//
// test.skip('foo', () => {
//   assert.ok(false)
// })
