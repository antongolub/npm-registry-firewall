import {testFactory, objectContaining} from '../test-utils.js'
import {getConfig} from '../../main/js/config.js'

const test = testFactory('config', import.meta)

test('multi-config', () => {
  const config = getConfig([{
    server: {port: 3000},
    firewall: {
      registry: 'https://registry.npmjs.org',
      rules: [{policy: 'deny', name: '*'}]
    }
  }])
  objectContaining(config, {
    profiles: [{
      firewall: [{
        base: '/',
        rules: [{
          policy: 'deny', _raw: {name: '*'}
        }]
      }]
    }]
  })
})
