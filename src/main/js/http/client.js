import http from 'node:http'
import https from 'node:https'
import { parse } from 'node:url'
import { Buffer } from 'node:buffer'
import zlib from 'node:zlib'

import { gzip, gunzip } from '../zip.js'
import { makeDeferred, normalizePath, dropNullEntries, time } from '../util.js'
import { httpError, OK, FOUND, MULTIPLE_CHOICES, PERMANENT_REDIRECT, REQUEST_TIMEOUT, TEMPORARY_REDIRECT } from './error.js'
import { getAgent } from './agent.js'
import { logger } from '../logger.js'
import { pushMetric } from '../metric.js'

export const request = async (opts) => {
  const {url, headers: _headers, method = 'GET', postData, data, body = postData || data, pipe, gzip: _gzip, skipUnzip, followRedirects, timeout = 30_000, authorization = null} = opts
  const {
    protocol,
    isSecure = protocol === 'https:',
    path = '/',
    host,
    hostname,
    port = isSecure ? 443 : 80,
  } = parse(normalizePath(url))
  const lib = isSecure ? https : http
  const agent = getAgent(isSecure)
  const {promise, resolve, reject} = makeDeferred()
  const _body = body && (_gzip ? await gzip(Buffer.from(body), {level: zlib.constants.Z_BEST_COMPRESSION}) : Buffer.from(body))
  const contentEncoding = _gzip && method === 'POST' ? 'gzip' : undefined
  const acceptEncoding = _gzip ? 'gzip' : '*'
  const contentLength = !contentEncoding && body ? '' + Buffer.byteLength(_body) + '' : undefined
  const headers = dropNullEntries({
    connection: 'keep-alive',
    ...pipe?.req?.headers,
    ..._headers,
    host,
    authorization,
    'Content-Encoding': contentEncoding,
    'content-length': contentLength,
    'Accept-Encoding': acceptEncoding
  })
  const params = {
    protocol,
    method,
    host: hostname,
    port,
    path,
    timeout,
    agent,
    headers
  }
  logger.debug('HTTP >', method, url)

  const s = Date.now()
  const req = lib.request(params, res => {
    res.req = req
    req.res = res
    res._latency = Date.now() - s
    pushMetric('http-time', res._latency)
    logger.debug('HTTP < latency', `${res._latency}ms`, method, url)

    const statusCode = res.statusCode
    const {location} = res.headers

    if ([FOUND, PERMANENT_REDIRECT, TEMPORARY_REDIRECT].includes(statusCode) && followRedirects && location) {
      return request({
        ...opts,
        url: location
      }).then(resolve, reject)
    }

    if (pipe) {
      pipe.res.writeHead(res.statusCode, res.headers)
      res.pipe(pipe.res, { end: true })
    }

    if (statusCode < OK || statusCode >= MULTIPLE_CHOICES) {
      return reject(httpError(statusCode, {url, method}))
    }

    const data = []

    res.on('error', () => reject(httpError(statusCode, {url, method})))
    res.on('data', chunk => data.push(chunk))
    res.on('end', async () => {
      const _buffer = Buffer.concat(data)
      const buffer = res.headers['content-encoding'] === 'gzip' && !skipUnzip
        ? await time(gunzip, `unzip ${url}`)(_buffer)
        : _buffer

      Object.assign(res, {
        _buffer,
        buffer,
        get body() { return this.buffer.toString('utf8') }
      })
      resolve(res)
    })
    res.on('error', (err) => logger.debug('HTTP RES ERROR <', statusCode, method, url, err))
    res.on('end', () => logger.debug('HTTP <', statusCode, method, url))
  })
  req.on('error', reject)
  req.on('error', (err) => logger.debug('HTTP REQ ERROR <', method, url, err))
  req.on('timeout', () => req.destroy(httpError(REQUEST_TIMEOUT, {url, method})))
  req.on('timeout', () => logger.debug('HTTP REQ TIMEOUT <', method, url))

  promise.req = req

  if (pipe) {
    pipe.req.on('error', reject)
    pipe.req.pipe(req, { end: true })//.pipe(pipe.res)

  } else {
    if (_body) {
      req.write(_body)
    }
    req.end()
  }

  return promise
}
