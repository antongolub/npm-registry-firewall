export const createCache = ({ttl, evictionTimeout = ttl}) => {
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
    get(key) {
      return store.get(key)?.value || null
    },
    del(key) {
      store.delete(key)
    },
    store,
    timer,
    ttl,
    evictionTimeout
  }
}
