const normalizeRoute = ([m, p, cb]) => {
  if (typeof m === 'function') {
    return ['*', null, m]
  }

  if (typeof p === 'function') {
    return [m, null, p]
  }

  return [m, p, cb]
}

const matchMethod = (method, expected) =>
  method === expected || expected === '*' || expected === 'ALL'

const matchUrl = (url, pattern) => {
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
  const getNext = async () => {
    if (matched.length === 0) {
      return Promise.resolve()
    }

    const [, p, cb] = matched.shift()

    // req.params = pattern.match(url) || {}

    await cb(req, res, getNext)
  }

  await getNext()
}

const routes = [
  ['GET', /^\/(@\w+(?:%2f)?)(\w+)$/i, {org: 0, name: 1}, (req, res, next, params) => {

  }]
]
