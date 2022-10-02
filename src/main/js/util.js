import zlib from 'node:zlib'
import path from 'node:path'
import {promisify} from 'node:util'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

export const makeDeferred = () => {
  let resolve
  let reject
  const promise = new Promise((res, rej) => { resolve = res; reject = rej })

  return {resolve, reject, promise}
}

export const genId = () => Math.random().toString(16).slice(2)

export const once = (fn) => (() => {
  let r
  return function (...args) { return r || (r = fn.call(this, ...args)) }
})()

export const isArray = Array.isArray

export const asArray = v => isArray(v) ? v : [v]

export const asRegExp = v => v instanceof RegExp
  ? v
  : new RegExp(`^${v.replace(/\*/g, '.+')}$`, 'i')

export const normalizePath = (url) =>
  (url + '/')
    .replace(/\/+/g, '/')
    .replace(':/', '://')
    .slice(0, -1)

export const asStrOrRegexpArray = (v) => v
  ? asArray(v)
    .map(_v => typeof _v === 'string'
      ? splitStr(_v)
      : _v instanceof RegExp ? _v : null
    )
    .filter(_ => _)
    .flat()
  : null

export const splitStr = v =>
  v.split(',').map(s => s.toLowerCase().trim()) // split(/\s*,\s*/) seems unsafe

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

// https://stackoverflow.com/a/61602592/13894191
export const flatten = (obj, roots = [], sep = '.') => Object
  .entries(obj)
  .reduce((memo, [k, v]) => Object.assign(
    memo,
    isArray(v) || Object.prototype.toString.call(v) === '[object Object]'
      ? flatten(v, [...roots, k], sep)
      : {[[...roots, k].join(sep)]: v}
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

export const noThrow = (cb) => (...args) => {
  try {
    return cb(...args)
  } catch (err) {
    return null
  }
}

export const load = (file) => noThrow(require)(path.resolve(file)) || require(file)

export const gunzip = promisify(zlib.gunzip)
export const gzip = promisify(zlib.gzip)

export const isPlainObject = (item) => item?.constructor === Object

export const mergeDeep = (target, ...sources) => {
  if (!sources.length) return target;
  const source = sources.shift()

  if (isPlainObject(target) && isPlainObject(source)) {
    for (const key in source) {
      if (isArray(source[key]) && isArray(target[key])) {
        target[key].push(...source[key])
      } else if (isPlainObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        mergeDeep(target[key], source[key])
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }

  return mergeDeep(target, ...sources)
}
