import {getMetricsDigest} from '../metric.js'

export const metrics = async (req, res) => {
  res.json(getMetricsDigest())
}
