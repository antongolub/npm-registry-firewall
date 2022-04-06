export const format = ({level = 'INFO', msgChunks = []}) => JSON.stringify({
  ...logger?.extra,
  level,
  timestamp: new Date(),
  message: msgChunks.map(c => c?.toString() || `${c}`).join(' '),
})

export const levels = ['info', 'warn', 'error']

export const logger = levels.reduce((m, l) => {
  m[l] = (...args) => console.log(format({
    level: l.toUpperCase(),
    msgChunks: args
  }))
  return m
}, {})

logger.log = logger.info
