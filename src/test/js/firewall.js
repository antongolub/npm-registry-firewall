import { testFactory, assert } from '../test-utils.js'
import { getDirective } from '../../main/js/firewall/index.js'

const test = testFactory('firewall', import.meta)

;[
  [
    'getDirective by name (pos)',
    {
      rules: [{
        policy: 'deny',
        name: [/.*/]
      }],
      name: 'react'
    },
    'deny'
  ],
  [
    'getDirective by name (neg)',
    {
      rules: [{
        policy: 'deny',
        name: [/pijma/]
      }],
      name: 'react'
    },
    false
  ],
  [
    'getDirective by org ',
    {
      rules: [{
        policy: 'allow',
        org: [/@qiwi/]
      }],
      org: '@qiwi'
    },
    'allow'
  ],
  [
    'getDirective by org (org is empty)',
    {
      rules: [{
        policy: 'allow',
        org: [/@qiwi/]
      }],
    },
    false
  ],
  [
    'getDirective by username',
    {
      rules: [{
        policy: 'allow',
        username: ['qiwibot']
      }],
      _npmUser: {name: 'qiwibot'}
    },
    'allow'
  ],
  [
    'getDirective by version (pos)',
    {
      rules: [{
        policy: 'allow',
        version: '>= 1.0'
      }],
      version: '1.2.3'
    },
    'allow'
  ],
  [
    'getDirective by version (neg)',
    {
      rules: [{
        policy: 'allow',
        version: '< 1.0'
      }],
      version: '1.2.3'
    },
    false
  ],
  [
    'getDirective by dateRange',
    {
      rules: [{
        policy: 'allow',
        dateRange: [new Date(1999, 0, 0), new Date(2001, 0, 0)]
      }],
      time: new Date(2000, 0, 0)
    },
    'allow'
  ],
  [
    'getDirective by age (pos)',
    {
      rules: [{
        policy: 'allow',
        age: [5]
      }],
      now: new Date(2000, 0, 10),
      time: new Date(2000, 0, 0)
    },
    'allow'
  ],
  [
    'getDirective by age (too young)',
    {
      rules: [{
        policy: 'allow',
        age: [15]
      }],
      now: new Date(2000, 0, 10),
      time: new Date(2000, 0, 0)
    },
    false
  ],
  [
    'getDirective by age (too old)',
    {
      rules: [{
        policy: 'allow',
        age: [0, 5]
      }],
      now: new Date(2000, 0, 10),
      time: new Date(2000, 0, 0)
    },
    false
  ],
  [
    'getDirective by filter (pos)',
    {
      rules: [{
        policy: 'deny',
        filter: () => false
      }, {
        policy: 'allow',
        filter: ({foo}) => foo === 'bar'
      }],
      foo: 'bar'
    },
    'allow'
  ],
  [
    'getDirective by filter (neg)',
    {
      rules: [{
        policy: 'allow',
        filter: async ({foo}) => foo === 'qux'
      }],
      foo: 'bar'
    },
    false
  ],

].forEach(([name, opts, expected]) => {
  test(name, async () => {
    const result = (await getDirective(opts))?.policy || false
    assert.equal(result, expected)
  })
})
