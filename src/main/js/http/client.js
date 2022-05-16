import http from 'node:http'
import https from 'node:https'
import { parse } from 'node:url'
import { Buffer } from 'node:buffer'

import { makeDeferred, normalizePath, gunzip, gzip } from '../util.js'
import { httpError, REQUEST_TIMEOUT } from './error.js'

const agentOpts = {
  keepAliveMsecs: 500,
  keepAlive: true,
  maxSockets: 10000,
  timeout: 10000
}
const agentHttps = new https.Agent(agentOpts)
const agentHttp = new http.Agent(agentOpts)

export const request = async (opts) => {
  const {url, headers: _headers, method = 'GET', postData, pipe, gzip: _gzip, followRedirects, timeout = 30_000, authorization = null} = opts
  const {
    protocol,
    isSecure = protocol === 'https:',
    path = '/',
    host,
    hostname,
    port = isSecure ? 443 : 80,
    agent = isSecure ? agentHttps : agentHttp,
    lib = isSecure ? https : http
  } = parse(normalizePath(url))
  const {promise, resolve, reject} = makeDeferred()
  const data = postData && (_gzip ? await gzip(Buffer.from(postData)) : Buffer.from(postData))
  const encoding = _gzip ? 'gzip' : 'utf8'
  const headers = {
    ...pipe?.req?.headers,
    ..._headers,
    host,
    authorization,
    connection: 'keep-alive',
    'accept-encoding': encoding,
    'content-encoding': encoding
  }
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

  const req = lib.request(params, res => {
    res.req = req
    req.res = res
    const statusCode = res.statusCode

    if (statusCode === 302 && followRedirects && res.headers.location) {
      return request({
        ...opts,
        url: res.headers.location
      }).then(resolve, reject)
    }

    if (pipe) {
      pipe.res.writeHead(res.statusCode, res.headers)
      res.pipe(pipe.res, { end: true })
    }

    if (statusCode < 200 || statusCode >= 300) {
      return reject(httpError(statusCode, {url, method}))
    }

    const data = []

    res.on('error', () => reject(httpError(statusCode, {url, method})))
    res.on('data', chunk => data.push(chunk))
    res.on('end', async () => {
      const _buffer = Buffer.concat(data)
      const buffer = res.headers['content-encoding'] === 'gzip'
        ? await gunzip(_buffer)
        : _buffer

      Object.assign(res, {
        _buffer,
        buffer,
        get body() { return this.buffer.toString('utf8') }
      })
      resolve(res)
    })
  })
  req.on('error', reject)
  req.on('timeout', () => req.destroy(httpError(REQUEST_TIMEOUT, {url, method})))

  promise.req = req

  if (pipe) {
    pipe.req.on('error', reject)
    pipe.req.pipe(req, { end: true })//.pipe(pipe.res)

  } else {
    if (data) {
      req.write(data)
    }
    req.end()
  }

  return promise
}
