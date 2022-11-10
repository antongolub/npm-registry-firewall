import crypto from 'node:crypto'
import { testFactory, objectContaining } from '../test-utils.js'
import { createApp } from '../../main/js/index.js'
import { request } from '../../main/js/http/client.js'

const test = testFactory('app', import.meta)
const cfg = {
  server: {
    host: 'localhost',
    port: 3001
  },
  cache: {
    ttl: 1
  },
  firewall: {
    '/registry': {
      registry: 'https://registry.npmjs.org',
      rules: [
        {
          "policy": "deny",
          "name": "colors",
          "version": ">= v1.3.0"
        },
      ]
    },
    '/block-all': {
      registry: ['https://registry.yarnpkg.com', 'https://registry.npmjs.org'],
      rules: { policy: 'deny', name: '*' }
    },
    '/npm-proxy': {
      registry: 'https://registry.npmjs.org'
    },
    '/yarn-proxy': {
      registry: 'https://registry.yarnpkg.com',
    },
    '*': {
      registry: 'https://registry.yarnpkg.com',
    }
  }
}
const app = createApp(cfg)

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
    { statusCode: 302 }
  ],
  [
    'reads packument via GET',
    { url: 'http://localhost:3001/registry/d', method: 'GET'},
    { statusCode: 200, json: {name: 'd', description: 'Property descriptor factory'}}
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
  [
    'works as proxy',
    { url: 'http://localhost:3001/npm-proxy/d', method: 'GET'},
    { statusCode: 200 }
  ],
  [
    'uses default proxy if specified',
    { url: 'http://localhost:3001/unknown/d', method: 'GET'},
    { statusCode: 200 }
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
        json: JSON.parse(res.body || null),
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
