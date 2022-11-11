import { testFactory, objectContaining } from '../test-utils.js'
import { guessDistTags } from '../../main/js/firewall/index.js'

const test = testFactory('packument', import.meta)

test('`guessDistTags` returns prev versions if exist in the packument', async () => {
  objectContaining(
    guessDistTags({
      latest: '1.0.0',
    }, {
      '1.0.0': true,
      '2.0.0': true
    }, {}),
    {
      latest: '1.0.0',
    }
  )
})

test('`guessDistTags` finds the latest version in the packument for each tag', async () => {
  objectContaining(
    guessDistTags({
      latest: '3.0.0',
      beta: '3.0.0-beta.1',
      rc: '3.0.0-rc.0',
    }, {
      '1.0.0-beta.0': {},
      '1.0.0-beta.1': {},
      '1.0.0-rc.0': {},
      '1.0.0': {},
      '1.0.1': {},
      '2.0.0-beta.0': {},
      '2.0.0': {}
    }, {
      '1.0.0-beta.0': 0,
      '1.0.0-beta.1': 1,
      '1.0.0-rc.0': 2,
      '1.0.0': 3,
      '1.0.1': 4,
      '2.0.0-beta.0': 5,
      '2.0.0': 6
    }),
    {
      latest: '2.0.0',
      beta: '2.0.0-beta.0',
      rc: '1.0.0-rc.0',
    }
  )
})
