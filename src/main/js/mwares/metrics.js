import process from 'node:process'
import {reservoirs, getPercentiles} from '../metric.js'
import { getCache } from '../cache.js'

export const metrics = async (req, res) => {
  const formatUptime = (uptime) => {
    const pad = s => (s < 10 ? '0' : '') + s
    const hours = Math.floor(uptime / (60 * 60))
    const minutes = Math.floor(uptime % (60 * 60) / 60)
    const seconds = Math.floor(uptime % 60)

    return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds)
  }

  const metrics = [...reservoirs.keys()].reduce((acc, name) => {
    const percentiles = getPercentiles(name, [0.5, 0.75, 0.95, 0.99])

    return Object.assign(acc, {
      [`${name}-p50`]: percentiles[0],
      [`${name}-p75`]: percentiles[1],
      [`${name}-p95`]: percentiles[2],
      [`${name}-p99`]: percentiles[3],
    })
  }, {})

  const cache = getCache()

  res.json({
    ...metrics,
    cache: {
      size: cache.size?.(),
      byteLength: cache.byteLength?.(),
    },
    uptime: formatUptime(process.uptime()),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage()
  })
}
