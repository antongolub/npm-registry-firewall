export const makeDeferred = () => {
  let resolve
  let reject
  const promise = new Promise((res, rej) => { resolve = res; reject = rej })

  return {resolve, reject, promise}
}

export const genId = () => Math.random().toString(16).slice(2)

export const once = (fn) => (() => {
  let r
  return (...args) => r || (r = fn(...args))
})()

export const asArray = v => Array.isArray(v) ? v : [v]

export const asRegExp = v => v instanceof RegExp
  ? v
  : new RegExp(`^${v.replace(/\*/g, '.+')}$`, 'i')

export const normalizePath = (url) => url.length > 1
  ? (url + '/')
    .replace(/\/+/g, '/')
    .replace(':/', '://')
    .slice(0, -1)
  : url

export const splitStr = v => v
  ? Array.isArray(v)
    ? v
    : v.split(',').map(s => s.toLowerCase().trim())
  : null // split(/\s*,\s*/) seems unsafe

export const mapValuesAsync = async (obj, cb) =>
  (await Promise.all(Object.entries(obj).map(async ([k, v]) => ({
      k,
      v: await cb(v)
    })
  )))
    .reduce((m, {v, k}) => {
      m[k] = v
      return m
    }, {})

// export const mapValues = (obj, cb) =>
//   Object.entries(obj).map(([k, v]) => ({
//       k,
//       v: cb(v)
//     })
//   )
//     .reduce((m, {v, k}) => {
//       m[k] = v
//       return m
//     }, {})


// https://stackoverflow.com/a/61602592/13894191
export const flatten = (obj, roots = [], sep = '.') => Object
  .entries(obj)
  .reduce((memo, [k, v]) => Object.assign(
    memo,
    Array.isArray(v) || Object.prototype.toString.call(v) === '[object Object]'
      ? flatten(v, roots.concat([k]), sep)
      : {[roots.concat([k]).join(sep)]: v}
  ), {})

export const expand = (obj, sep = '.') => Object
  .entries(obj)
  .reduce((m, [k, v]) => {
    let root
    k.split(sep).reduce((_m, r, i, a) => {
      const parent = _m || (/\d+/.test(r) ? [] : {})
      const value = a.length === i + 1
        ? v
        : parent[r] || (/\d+/.test(a[i + 1]) ? [] : {})

      parent[r] = value
      if (!root) {
        root = parent
      }
      return value
    }, m)

    return m || root
  }, null)

export const processExtends = (obj, resolver) => {
  const flat = flatten(obj)
  return Object.entries(flat).reduce((m, [k, v]) => {
    if (k.endsWith('.extends')) { // endsWith?
      m[k.slice(0, -8)]= {...resolver(v)}
    } else {
      m[k] = v
    }
    return m
  }, {})
}
