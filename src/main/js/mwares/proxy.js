import {request} from '../http/client.js'

export const proxy = async (req, res, next) => {
  if (!req?.cfg?.registry) {
    throw new Error('proxy-mware: req.cfg.registry is required')
  }

  const url = `${req.cfg.registry}${req.url}`

  await request({ url, method: req.method, pipe: {req, res}, followRedirects: true})
}
