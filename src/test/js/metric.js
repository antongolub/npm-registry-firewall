import {testFactory, assert} from '../test-utils.js'
import { getPercentiles, getPercentile, pushMetric, getMetricsDigest } from '../../main/js/metric.js'

const test = testFactory('metric', import.meta)

test('`getPercentiles` returns proper percentile values', async () => {
  const name = 'test-metric'
  const values = new Array(1000).fill(0).map((_, i) => i)
  values.forEach((value) => pushMetric(name, value))

  assert.equal(getPercentiles(name).join(), [500, 750, 950, 990].join())
  assert.equal(getPercentile(name, 0.66), 660)
})

test('`getMetricsDigest` returns proper digest', () => {
  const digest = getMetricsDigest()
  const keys = Object.keys(digest)
  assert.ok(keys.includes('cpu'))
  assert.ok(keys.includes('memory'))
})
