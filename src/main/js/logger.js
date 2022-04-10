export const format = ({level = 'INFO', msgChunks = [], extra}) => JSON.stringify({
  level,
  timestamp: new Date(),
  ...extra,
  message: msgChunks.map(c => JSON.stringify(c)).join(' '),
})

export const levels = ['info', 'warn', 'error']

export const createLogger = (extra = {}) => {
  const logger = levels.reduce((m, l) => {
    m[l] = (...args) => console.log(format({
      level: l.toUpperCase(),
      msgChunks: args,
      extra
    }))
    return m
  }, {})

  logger.log = logger.info
  logger.nest = (_extra) => createLogger({...extra, ..._extra})

  return logger
}

export const logger = createLogger()

