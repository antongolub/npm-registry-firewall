import {testFactory, objectContaining, assert, sleep} from '../test-utils.js'
import { createCache } from '../../main/js/cache.js'

const test = testFactory('cache', import.meta)

const cache = createCache({ttl: 1000, evictionTimeout: 200})
test('add entry', () => {
  cache.add('foo', 'bar', 1000)
  objectContaining(cache.store.get('foo'), {key: 'foo', value: 'bar'})
})

test('get entry', () => {
  assert.equal(cache.get('foo'), 'bar')
})

test('remove entry', () => {
  assert.equal(cache.get('foo'), 'bar')
  cache.del('foo')
  assert.equal(cache.get('foo'), null)
})

test('invalidate by ttl', async () => {
  cache.add('baz', 'quz', 100)
  assert.equal(cache.get('baz'), 'quz')
  await sleep(300)
  assert.equal(cache.get('baz'), null)
})
