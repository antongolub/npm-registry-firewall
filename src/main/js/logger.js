export const format = ({level = 'INFO', msgChunks = [], extra}) => JSON.stringify({
  level,
  timestamp: new Date(),
  ...extra,
  message: msgChunks.map(c => typeof c === 'object' ? JSON.stringify(c) : `${c}`).join(' '),
})

export const levels = ['trace', 'debug', 'info', 'warn', 'error']

export const createLogger = ({extra = {}, formatter = format, level = 'info'} = {}) => {
  const logger = levels
    .filter(l => levels.indexOf(l) >= levels.indexOf(level))
    .reduce((m, l) => {
      m[l] = (...args) => console[l](formatter({
        level: l.toUpperCase(),
        msgChunks: args,
        extra
      }))
      return m
    }, {})

  logger.log = logger.info
  logger.nest = (_extra) => createLogger({formatter, level, extra: {...extra, ..._extra}})

  return logger
}

export const logger = createLogger()

