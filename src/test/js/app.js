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
    registry: ['https://registry.yarnpkg.com', 'https://registry.npmjs.org'],
    rules: { policy: 'deny', name: '*' }
  }
}])

test('is runnable', async () => {
  await app.start()
})

;[
  [
    'returns healthcheck',
    { url: 'http://localhost:3001/healthcheck/', method: 'GET'},
    { statusCode: 200, body: '{"status":"OK"}' }
  ],
  [
    'returns metrics',
    { url: 'http://localhost:3001/metrics/', method: 'GET'},
    { statusCode: 200}
  ],
  [
    '404 if not found',
    { url: 'http://localhost:3001/registry/not-found/path/on/remote', method: 'GET'},
    { statusCode: 404 }
  ],
  [
    'gets tarball if allowed',
    { url: 'http://localhost:3001/registry/@antongolub/git-root/-/git-root-1.5.6.tgz', method: 'GET'},
    { hash: 'uMs0P/SZUnoc+oF6E0VVPSnkXphOfg1GXRl+wnx/tElmLNPtNCuh2n7EVbSJU5hv73q96YK04bBVRQmS2p2Cjw==' }
  ],
  [
    'reads packument via GET',
    { url: 'http://localhost:3001/registry/d', method: 'GET'},
    { statusCode: 200 }
  ],
  [
    'reads packument via HEAD',
    { url: 'http://localhost:3001/registry/d', method: 'HEAD'},
    { statusCode: 200 }
  ],
  [
    '405 if not allowed',
    { url: 'http://localhost:3001/registry/d', method: 'PUT'},
    { statusCode: 405 }
  ],
  [
    '304 if etag matches if-none-match',
    {
      url: 'http://localhost:3001/registry/d',
      method: 'GET',
      headers() {
        return request({url: 'http://localhost:3001/registry/d'})
          .then(({headers: {etag}}) => ({
            'if-none-match': etag
          }))
      }
    },
    { statusCode: 304 }
  ],
].forEach(([name, {url, method, headers: _headers = {}}, expected]) => {
  test(name, async () => {
    let result
    const headers = typeof _headers === 'function' ? await _headers() : _headers

    try {
      const res = await request({url, method, headers})
      const hash = crypto
        .createHash('sha512')
        .update(res.buffer)
        .digest('base64')

      result = {
        statusCode: res.statusCode,
        body: res.body,
        hash,
      }
    } catch ({statusCode}) {
      result = {
        statusCode
      }
    }

    objectContaining(result, expected)
  })
})

test('is stoppable', async () => {
  await app.stop()
})

