import { promisify } from 'node:util'
import { getConfig } from './config.js'
import {fromArrayBufferToBuffer} from "./util.js";

export const gzip = async(buf) =>
  promisify((await import(getConfig()?.zlib || 'node:zlib')).gzip)(new Uint8Array(buf)).then(fromArrayBufferToBuffer)

export const gunzip = async(buf) =>
  promisify((await import(getConfig()?.zlib || 'node:zlib')).gunzip)(new Uint8Array(buf)).then(fromArrayBufferToBuffer)
