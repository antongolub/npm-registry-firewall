import { testFactory, assert, sleep, objectContaining } from '../test-utils.js'
import { createApp } from '../../main/js/index.js'
import { request } from '../../main/js/http/client.js'

const test = testFactory('bench', import.meta)

const app = createApp({
  server: [
    { host: 'localhost', port: 8080 },
  ],
  log: {level: 'error'},
  firewall: {
    registry: 'https://registry.npmjs.org',
    base: '/registry',
    rules: [],
    cache: {
      ttl: 10
    }
  }
})

const cases = [
  { url: '<url>/d', method: 'GET'},
  { url: '<url>/react', method: 'HEAD'},
  { url: '<url>/react', method: 'GET'},
  { url: '<url>/react/-/react-18.2.0.tgz', method: 'GET'},
  { url: '<url>/@antongolub/git-root/-/git-root-1.5.6.tgz', method: 'GET'},
]

const rand = (arr) => arr[arr.length * Math.random() | 0]
const requests = Array.from({length: 50}, () => rand(cases))

const bench = async (url) => {
  const start = Date.now()

  await Promise.all(requests.map(async (r) =>  request({...r, url: r.url.replace('<url>', url), noThrow: true, followRedirects: true})))

  const duration = Date.now() - start
  console.log(`host: ${url},  duration: ${duration}ms`)

  return duration
}

test('bench', async () => {
  await app.start()
  await bench('https://registry.npmjs.org')
  await bench('http://localhost:8080/registry')
  await app.stop()
}, 30_000)
