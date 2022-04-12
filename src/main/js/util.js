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