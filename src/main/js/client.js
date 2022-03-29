import http from 'node:http'
import https from 'node:https'
import {parse} from 'node:url'

const makeDeferred = () => {
  let resolve
  let reject
  const promise = new Promise((res, rej) => { resolve = res; reject = rej })

  return {resolve, reject, promise}
}

export const request = async (url, method = 'GET', postData, pipe) => {
  const {
    protocol,
    isSecure = protocol === 'https:',
    path = '/',
    host,
    port = isSecure ? 443 : 80,
    lib = isSecure ? https : http
  } = parse(url)

  const {promise, resolve, reject} = makeDeferred()

  const params = {
    method,
    host,
    port,
    path,
    headers: {...pipe?.req?.headers, host },
  }

  const req = lib.request(params, res => {
    res.req = req
    req.res = res

    if (res.statusCode < 200 || res.statusCode >= 300) {
      const err = new Error(`HTTP ${res.statusCode} ${host}${path}`)
      Object.defineProperty(err, 'res', {enumerable: false, value: res})

      return reject(err)
    }

    const data = []

    res.on('error', reject)
    res.on('data', chunk => data.push(chunk))
    res.on('end', () => {
      Object.assign(res, {
        buffer: Buffer.concat(data),
        get body() { return this.buffer.toString() }
      })
      resolve(res)
    })

    if (pipe) {
      pipe.res.writeHead(res.statusCode, res.headers);
      res.pipe(pipe.res, { end: true })
    }
  })
  req.on('error', reject)

  promise.req = req

  if (pipe) {
    pipe.req.on('error', reject)
    pipe.req.pipe(req, { end: true })// .pipe(pipe.res)

  } else {
    if (postData) {
      req.write(postData)
    }
    req.end()
  }

  return promise
}
