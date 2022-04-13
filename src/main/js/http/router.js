import {asArray, normalizePath, once} from '../util.js'

const normalizeRoute = (item) => {
  const [m, p, cb] = asArray(item)

  if (typeof m === 'function') {
    return ['*', [true], m]
  }

  if (typeof p === 'function') {
    return [m, [true], p]
  }

  return [m, asArray(p), cb]
}

const matchMethod = (method, expected) =>
  method === expected || expected === '*' || expected === 'ALL'

const matchUrl = (url, [pattern]) => {
  if (typeof pattern === 'string') {
    return url === pattern || url.startsWith(pattern) && url.charAt(pattern.length) === '/'
  }

  if (pattern instanceof RegExp) {
    return pattern.test(url)
  }

  return !!pattern
}

export const createRouter = (routes, base = '/') => async (req, res, next = () => {}) => {
  if (req.url.startsWith(base)) {
    req.base = (req.base || '' ) + base
    req.url = req.url.replace(base, '/')
  } else {
    return next()
  }

  const url = normalizePath(req.url)
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
        .reduce((m, v, k) => {
          const _k = rmap[k]
          if (_k) {
            m[_k] = v?.replace('%2f', '/')
          }
          return m
        }, {})
      : {}

    try {
      await cb(...args)
    } catch (e) {
      await getNext(e)
    }
  }

  await getNext()
}
