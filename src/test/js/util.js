import {testFactory, assert} from '../test-utils.js'
import {flatten, expand} from '../../main/js/util.js'

const test = testFactory('util', import.meta)

test('flatten', () => {
  const obj = {
    foo: 'bar',
    baz: [{a: 'a'}, {b: {c: 'd'}}, 1]
  }
  assert.deepEqual(flatten(obj), {
    'foo': 'bar',
    'baz.0.a': 'a',
    'baz.1.b.c': 'd',
    'baz.2': 1
  })
})

test('expand', () => {
  assert.deepEqual(expand({
    'foo': 'bar',
    'baz.0.a': 'a',
    'baz.1.b.c': 'd',
    'baz.2': 1
  }), {
    foo: 'bar',
    baz: [{a: 'a'}, {b: {c: 'd'}}, 1]
  })
})
