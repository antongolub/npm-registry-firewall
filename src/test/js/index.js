import { testFactory, assert, sleep } from '../test-utils.js'
import { createApp } from '../../main/js/index.js'
import { request } from '../../main/js/client.js'

const test = testFactory('foo', import.meta)
const app = createApp({
  server: [{
    host: 'localhost',
    port: 3001,
  }],
  "rules": [
    {
      "policy": "deny",
      "provider": "publish-date",
      "options": {
        "from": "2022-02-24T00:00:00.000Z"
      },
      "final": true
    }
  ]
})

await app.start()

;[
  [
    'app returns healthcheck',
    { url: 'http://localhost:3001/status/', method: 'GET'}
  ],
  // [
  //   'app gets tarball if allowed',
  //   { url: 'http://localhost:3001/@antongolub/git-root/-/git-root-1.5.6.tgz', method: 'GET'}
  // ]
].forEach(([name, {url, method}]) => {
  test(name, async () => {
    console.log('url', url)
    await request(url, method)

  })
})

test('app is stoppable', async () => {
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
