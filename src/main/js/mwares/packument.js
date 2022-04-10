import {request} from '../client.js'

export const packument = async (req, res, next) => {
  if (!req?.cfg?.registry) {
    throw new Error('packument-mware: req.cfg.registry is required')
  }
  req.packument = await request({url: `${req.cfg.registry}/${req.routeParams.name}`})
    .then(({body}) => JSON.parse(body))


  next()
}
