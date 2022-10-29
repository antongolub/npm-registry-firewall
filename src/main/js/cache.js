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

  const name = opts.name || genId()

  if (caches.has(name)) {
    return caches.get(name)
  }

  const cacheFactory = getCacheFactory(opts)
  const cache = cacheFactory(opts)
  caches.set(name, cache)

  return cache
}

const hitmap = new Map()

export const withCache = (cache, name, cb) => {
  if (!hitmap.has(cache)) {
    hitmap.set(cache, new Map())
  }
  const hits = hitmap.get(cache)
  if (!hits.has(name)) {
    (() => {
      let p

      hits.set(name, async () => {
        if (p) {
          return p
        }

        p = (async () => {
          if (await cache.has(name)) {
            return cache.get(name)
          }

          const value = await cb()
          await cache.add(name, value)

          p = null
          return value
        })()

        return p
      })
    })()
  }

  return hits.get(name)()
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
