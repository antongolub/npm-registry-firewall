import { genId } from './util.js'
import { getCtx } from './als.js'

const caches = new Map()

const voidCache = {
  add() {},
  get() {},
  has() {return false},
  del() {}
}

const getCacheFactory = (opts) => typeof opts === 'function'
  ? opts
  : getCtx().cache || createCache

export const getCache = (opts = {}) => {
  // Custom cache impl
  if (typeof opts?.get === 'function') {
    return opts
  }

  if (opts === null || !opts.ttl) {
    return voidCache
  }

  const cacheFactory = getCacheFactory(opts)
  const name = opts.name || genId()

  if (caches.has(name)) {
    return caches.get(name)
  }

  const cache = cacheFactory(opts)
  caches.set(name, cache)

  return cache
}

export const createCache = ({ttl, evictionTimeout = ttl, warmup}) => {
  const store = new Map()
  const timer = setInterval(() => {
    const now = Date.now()
    store.forEach(({validTill, key}) => {
      if (now > validTill) {
        store.delete(key)
      }
    })
  }, evictionTimeout)

  return {
    add(key, value, _ttl) {
      store.set(key, {
        key,
        value,
        validTill: Date.now() + (_ttl || ttl)
      })
      return value
    },
    has(key) {
      return store.has(key)
    },
    get(key) {
      return store.get(key)?.value || null
    },
    del(key) {
      store.delete(key)
    },
    store,
    timer,
    ttl,
    warmup,
    evictionTimeout
  }
}
