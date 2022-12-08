import { Worker } from 'node:worker_threads'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'
import { pushMetric } from '../metric.js'
import { getConfig } from '../config.js'
import { once} from '../util.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const queue = []
let concurrency = 0

export const runWorker = (workerName, workerData) => new Promise((resolve, reject) => {
  queue.push({workerName, workerData, resolve, reject, timestamp: Date.now()})
  processQueue()
})

const getConcurrencyLimit = once(() => getConfig()?.workerConcurrency || os.cpus().length)

const processQueue = () => {
  const concurrencyLimit = getConcurrencyLimit()

  if (concurrency === concurrencyLimit || queue.length === 0) {
    return
  }
  concurrency += 1

  const {resolve, reject, workerName, workerData, timestamp} = queue.shift()
  pushMetric('worker-waiting-time', Date.now() - timestamp)
  const worker = new Worker(path.resolve(__dirname, workerName), { workerData })

  worker.on('message', ({err, result}) => {
    pushMetric('worker-total-time', Date.now() - timestamp)
    if (err) {
      reject(err)
    } else {
      resolve(result)
    }
  })
  worker.on('error', reject)
  worker.on('exit', (code) => {
    if (code !== 0) {
      reject(new Error(`stopped with  ${code} exit code`))
    }
    concurrency -= 1
    processQueue()
    worker.unref()
  })
}
