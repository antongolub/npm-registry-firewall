import { getByteLength} from './util.js'
import { once } from './util.js'

const voidCache = {
  add() {},
  get() {},
  has() {return false},
  del() {},
  size() {return 0},
  byteLength() {return 0}
}

const hits = new Map()

export const getCache = once((opts) => {
  if (!opts?.ttl) {
    return voidCache
  }

  // Custom cache implementation
  if (typeof opts.get === 'function') {
    return opts
  }

  return createCache(opts)
})

export const hasHit = (cache, name) => hits.has(name)

export const hasKey = (name) => getCache().has(name)

export const isNoCache = () => getCache() === voidCache

export const withCache = (name, cb, ttl) => {
  if (!hits.has(name)) {
    (() => {
      let p

      hits.set(name, async () => {
        if (p) {
          return p
        }

        p = (async () => {
          const cache = getCache()
          if (await cache.has(name)) {
            return cache.get(name)
          }

          const value = await cb()
          await cache.add(name, value, ttl)

          p = null
          return value
        })().finally(() => hits.delete(name))

        return p
      })
    })()
  }

  return hits.get(name)()
}

export const createCache = ({ttl, evictionTimeout = ttl, warmup, limit = Infinity}) => {
  const store = new Map()
  const timer = setInterval(() => {
    const now = Date.now()
    store.forEach(({validTill, key}) => {
      if (now > validTill) {
        store.delete(key)
      }
    })
  }, evictionTimeout)
  let totalByteLength = 0

  return {
    add(key, value, _ttl) {
      const byteLength = getByteLength(value)
      if (totalByteLength + byteLength <= limit) {
        totalByteLength += byteLength
        store.set(key, {
          key,
          value,
          validTill: Date.now() + (_ttl || ttl),
          byteLength
        })
      }
      return value
    },
    has(key) {
      return store.has(key)
    },
    get(key) {
      return store.get(key)?.value || null
    },
    del(key) {
      totalByteLength -= store.get(key)?.byteLength || 0
      store.delete(key)
    },
    size() {
      return store.size
    },
    byteLength () {
      return totalByteLength
    },
    store,
    timer,
    ttl,
    warmup,
    evictionTimeout
  }
}
