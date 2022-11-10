import { getCtx, runInCtx } from '../als.js'

export const ctx = (...extras) => async (req, res, next) =>
  runInCtx(Object.assign({...getCtx()}, ...extras), next)
