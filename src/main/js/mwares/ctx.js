import { genId } from '../util.js'

export const ctx = (cfg, logger) => async (req, res, next) => {
  req.cfg = res.cfg = cfg
  req.id = res.id = genId()
  req.log = res.log = logger
  next()
}
