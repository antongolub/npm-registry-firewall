import zlib from 'node:zlib'
import os from 'node:os'
import {promisify} from 'node:util'
import {Buffer} from 'node:buffer'

import { runWorker } from './worker/index.js'

const cpulen = os.cpus().length

export const gzip = cpulen === 1 ? promisify(zlib.gzip) : async (data) => runWorker('worker-zip.js', { method: 'gzip', args: [data] }).then(Buffer.from)
export const gunzip = cpulen === 1 ? promisify(zlib.gunzip) : async (data) => runWorker('worker-zip.js', { method: 'gunzip', args: [data] }).then(Buffer.from)
