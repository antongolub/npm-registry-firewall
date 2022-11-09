import {getCache} from './cache.js'

export const reservoirs = new Map()

// https://javadoc.io/doc/io.dropwizard.metrics/metrics-core/4.0.5/com/codahale/metrics/ExponentiallyDecayingReservoir.html
class MetricReservoir {
  constructor(limit = 1024) {
    this.limit = limit
  }
  data = []
  push(value = null, date = Date.now()) {
    if (this.data.length >= this.limit) {
      this.data.shift()
    }
    this.data.push({ value, date })
  }
}

export const getReservoir = (name, limit) => {
  if (!reservoirs.has(name)) {
    reservoirs.set(name, new MetricReservoir(limit))
  }

  return reservoirs.get(name)
}

export const pushMetric = (name, value, date) =>
  getReservoir(name).push(value, date)

export const getPercentiles = (name, percentiles = [0.5, 0.75, 0.95, 0.99]) => {
  const data = getReservoir(name).data.map((d) => d.value).sort((a, b) => a - b)
  const length = data.length

  return percentiles.map((p) => data[Math.floor(length * p)])
}

export const getPercentile = (name, percentile = 0.5) => getPercentiles(name, [percentile])[0]

export const getMetricsDigest = () => {
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
  const memUsage = process.memoryUsage()
  const cpuUsage = process.cpuUsage()

  return {
    ...metrics,
    'memory-usage-rss': memUsage.rss,
    'memory-usage-heapTotal': memUsage.heapTotal,
    'memory-usage-heapUsed': memUsage.heapUsed,
    'memory-usage-external': memUsage.external,
    'memory-usage-array-buffers': memUsage.arrayBuffers,
    'cpu-usage-user': cpuUsage.user,
    'cpu-usage-system': cpuUsage.system,
    'cache-size': cache.size?.(),
    'cache-byte-length': cache.byteLength?.(),
    uptime: formatUptime(process.uptime()),
  }
}
