import zlib from 'node:zlib'
import os from 'node:os'
import {promisify} from 'node:util'
import {Buffer} from 'node:buffer'

import { getConfig } from './config.js'
import { runWorker } from './worker/index.js'

export const gzip = async (data) => (getConfig()?.workerConcurrency || os.cpus().length) === 1
  ? promisify(zlib.gzip)(data)
  : runWorker('worker-zip.js', { method: 'gzip', args: [data] }).then(Buffer.from)

export const gunzip = async (data) => (getConfig()?.workerConcurrency || os.cpus().length) === 1
  ? promisify(zlib.gunzip)(data)
  : runWorker('worker-zip.js', { method: 'gunzip', args: [data] }).then(Buffer.from)
