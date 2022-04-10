import {asArray, once} from './util.js'

const normalizeRoute = ([m, p, cb]) => {
  if (typeof m === 'function') {
    return ['*', [null], m]
  }

  if (typeof p === 'function') {
    return [m, [null], p]
  }

  return [m, asArray(p), cb]
}

const matchMethod = (method, expected) =>
  method === expected || expected === '*' || expected === 'ALL'

const matchUrl = (url, [pattern]) => {
  if (typeof pattern === 'string') {
    return url.startsWith(pattern)
  }

  if (pattern instanceof RegExp) {
    return pattern.test(url)
  }

  return true
}

export const createRouter = (routes) => async (req, res) => {
  const url = req.url
  const matched = routes
    .map(normalizeRoute)
    .filter(([method, pattern]) => matchMethod(req.method, method) && matchUrl(url, pattern))

  let i = 0
  const getNext = async (err) => {
    i = matched.findIndex(([,,cb], _i) => _i >= i && !!err  === (cb.length === 4))

    if (i === -1) {
      return Promise.resolve()
    }

    const next = once(getNext)
    const args = err ? [err, req, res, next] : [req, res, next]
    const [, [pattern, rmap], cb] = matched[i++]

    req.routeParams = rmap && pattern instanceof RegExp
      ? pattern.exec(url)
        .slice(1)
        .reduce((m, v, k) => { m[rmap[k]] = v; return m }, {})
      : {}

    try {
      await cb(...args)
    } catch (e) {
      await getNext(e)
    }
  }

  await getNext()
}

const routes = [
  ['GET', /^\/(@\w+(?:%2f)?)(\w+)$/i, {org: 0, name: 1}, (req, res, next, params) => {

  }]
]
