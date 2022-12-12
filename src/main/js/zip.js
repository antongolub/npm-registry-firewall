import { promisify } from 'node:util'
import { getConfig } from './config.js'

export const gzip = async(...args) =>
  promisify((await import(getConfig()?.zlib || 'node:zlib')).gzip)(...args).then(Buffer.from)

export const gunzip = async(...args) =>
  promisify((await import(getConfig()?.zlib || 'node:zlib')).gunzip)(...args).then(Buffer.from)
