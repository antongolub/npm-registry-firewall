import { getCtx } from './als.js'

export const format = ({level = 'INFO', msgChunks = [], extra}) => JSON.stringify({
  level,
  timestamp: new Date(),
  ...extra,
  message: msgChunks.map(c => typeof c === 'object' ? JSON.stringify(c) : `${c}`).join(' '),
})

export const levels = ['trace', 'debug', 'info', 'warn', 'error']

export const createLogger = ({extra = {}, formatter = format, level = 'info'} = {}) => {
  const logger = levels
    .reduce((m, l) => {
      m[l] = (...args) => {
        const ctx = getCtx()
        const _level = ctx?.config?.log?.level || level

        if (levels.indexOf(l) < levels.indexOf(_level)) {
          return
        }

        console[l](formatter({
          level: l.toUpperCase(),
          msgChunks: args,
          extra: {...extra, ...ctx.logExtra}
        }))
      }
      return m
    }, {})

  logger.log = logger.info

  return logger
}

export const _logger = createLogger()

export const logger = levels
  .reduce((m, l) => {
    m[l] = (...args) => (getCtx().logger || _logger)[l](...args)
    return m
  }, {})

