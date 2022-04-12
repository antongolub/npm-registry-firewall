import {request} from '../http/client.js'

export const proxy = (registry) => async (req, res, next) => {
  if (!registry) {
    throw new Error('proxy-mware: registry is required')
  }

  const url = `${registry}${req.url}`

  await request({ url, method: req.method, pipe: {req, res}, followRedirects: true})
}
