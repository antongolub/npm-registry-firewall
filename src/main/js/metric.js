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
