import {testFactory, objectContaining} from '../test-utils.js'
import {loadConfig} from '../../main/js/index.js'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import https from 'node:https'
import os from 'node:os'

const __dirname = dirname(fileURLToPath(import.meta.url))

const test = testFactory('config', import.meta)

test('resolves `extends`', () => {
  const config = loadConfig({
    server: {port: 3000},
    firewall: {
      '/registry': {
        registry: 'https://registry.npmjs.org',
        rules: [{policy: 'deny', extends: resolve(__dirname, '../fixtures/custom-plugin.cjs')}]
      }
    }
  })
  objectContaining(config, {
    firewall: [{
      base: '/registry',
      rules: [{
        age: [5],
        policy: 'deny',
      }]
    }]
  })
})

test('resolves `preset`', () => {
  const config = loadConfig({
    server: {port: 3000},
    firewall: {
      '/foo': {
        registry: 'https://registry.npmjs.org',
        rules: [{policy: 'deny', preset: resolve(__dirname, '../fixtures/custom-plugin.cjs')}]
      }
    }
  })
  objectContaining(config, {
    firewall: [{
      base: '/foo',
      rules: [{
        age: [5],
        policy: 'deny',
      }]
    }]
  })
})

test('resolves `preset` as string[]', () => {
  const config = loadConfig({
    server: {port: 3000},
    firewall: {
      '/foo': {
        registry: 'https://registry.npmjs.org',
        preset: [
          resolve(__dirname, '../fixtures/deny-orgs.json'),
          resolve(__dirname, '../fixtures/deny-users.json')
        ]
      }
    }
  })
  objectContaining(config, {
    firewall: [{
      base: '/foo',
      rules: [{
        policy: 'deny',
        org: ["foo", "bar"],
      }, {
        policy: 'deny',
        username: ["baz", "qux"],
      }]
    }]
  })
})

test('handles `agent` opts', () => {
  const config1 = loadConfig({
    server: { port: 3000 },
    firewall: {
      '/foo': { registry: 'https://registry.npmjs.org' }
    },
    agent: {keepAliveMsecs: 1000 }
  })

  objectContaining(config1, {
    agent: {keepAliveMsecs: 1000 }
  })

  const agent = new https.Agent()
  const config2 = loadConfig({
    server: { port: 3000} ,
    firewall: {
      '/foo': { registry: 'https://registry.npmjs.org' }
    },
    agent
  })

  objectContaining(config2, {
    agent
  })
})

test('processes `logger` opts', () => {
  const config = loadConfig({
    server: {port: 3000},
    firewall: {
      '/foo': { registry: 'https://registry.npmjs.org' }
    },
    log: {level: 'trace' }
  })

  objectContaining(config, {
    log: {level: 'trace' }
  })
})

test('processes `workerConcurrency` && `warmup` opts', () => {
  objectContaining(loadConfig({
    workerConcurrency: 1,
    warmup: false,
    server: {port: 3000},
    firewall: {},
  }), {
    workerConcurrency: 1,
    warmup: 0,
  })

  objectContaining(loadConfig({
    server: {port: 3000},
    firewall: {},
  }), {
    workerConcurrency: os.cpus().length,
    warmup: Number.POSITIVE_INFINITY,
  })
})
