import {testFactory, assert} from '../test-utils.js'

const test = testFactory('foo', import.meta)

test('foo', () => {
  assert.ok(false)
})

test.skip('foo', () => {
  assert.ok(false)
})
