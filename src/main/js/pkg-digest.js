import {request} from './client.js'

export const getPkgDigest = async ({name, registry}) =>
  request(`${registry}/${name}`).then(({body}) => JSON.parse(body))
