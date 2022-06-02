import {testFactory, assert} from '../test-utils.js'
import { auditPlugin } from '../../main/js/firewall/plugins/audit.js'

const test = testFactory('audit', import.meta)

;[
  [
    'maps `critical` to `deny`',
    {
      entry: {name: 'minimist', version: '1.2.5'},
      boundContext: {
        registry: 'https://registry.npmjs.org'
      },
      options: {
        'critical': 'deny'
      }
    },
    'deny'
  ],
  [
    'maps `low` to `warn`',
    {
      entry: {name: 'clean-css', version: '4.1.10'},
      boundContext: {
        registry: 'https://registry.npmjs.org'
      },
      options: {
        'low': 'warn'
      }
    },
    'warn'
  ],
  [
    'uses `any/*` as default mapping',
    {
      entry: {name: 'clean-css', version: '4.1.10'},
      boundContext: {
        registry: 'https://registry.npmjs.org'
      },
      options: {
        '*': 'deny'
      }
    },
    'deny'
  ],
  [
    'returns `false` if no audit issue found`',
    {
      entry: {name: '@antongolub/iso8601', version: '1.2.2'},
      boundContext: {
        registry: 'https://registry.npmjs.org'
      },
      options: {
        '*': 'deny'
      }
    },
    false
  ],
  [
    'overrides boundContext.registry with option if passed',
    {
      entry: {name: 'eventsource', version: '1.1.0'},
      boundContext: {
        registry: 'https://example.com'
      },
      options: {
        critical: 'deny',
        registry: 'https://registry.npmjs.org'
      }
    },
    'deny'
  ],
].forEach(([name, ctx, result]) => {
  test(name, async () => {
    assert.equal(await auditPlugin(ctx), result)
  })
})


