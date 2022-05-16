import { getCtx, runInCtx } from '../als.js'

export const ctx = (cfg, logger) => async (req, res, next) =>
  runInCtx({...getCtx(), logger, cfg}, next)
