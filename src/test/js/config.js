import {testFactory, objectContaining} from '../test-utils.js'
import {getConfig} from '../../main/js/config.js'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url));

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

test('resolves `extends`', () => {
  const config = getConfig([{
    server: {port: 3000},
    firewall: {
      registry: 'https://registry.npmjs.org',
      rules: [{policy: 'deny', extends: resolve(__dirname, '../fixtures/custom-plugin.cjs')}]
    }
  }])
  objectContaining(config, {
    profiles: [{
      firewall: [{
        base: '/',
        rules: [{
          age: [5],
          policy: 'deny',
        }]
      }]
    }]
  })
})
