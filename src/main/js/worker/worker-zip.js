import zlib from 'node:zlib'
import { workerData, parentPort } from 'node:worker_threads'

const { method, args } = workerData

zlib[method](...args, (err, result) => {
  parentPort.postMessage({ err, result })
})
