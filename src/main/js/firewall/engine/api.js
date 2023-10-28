import {getBoundContext, getPolicy, getPipeline, getDirective} from './common.js'
import {getPackument, guessDistTags} from './packument.js'
import {checkTarball} from './tarball.js'

export {
  getDirective,
  guessDistTags,
  getPackument,
  checkTarball,
  getPolicy,
  getPipeline,
}

export const assertPolicy = async ({org, name, version, rules, registry, authorization}) => {
  const boundContext = await getBoundContext({org, name, version, rules, registry, authorization})
}

export const getAssets = async (boundContext) => {
  const {name, org, version, registry} = boundContext
  const url = (org ? `${org}/` : '') + `${name}/-/${name}.tgz`
  const [
    { packument, packumentBufferZip, headers, etag, deps, directives },
    tarball
  ] = await Promise.all([
    getPackument({ boundContext, rules }),
    version ? checkTarball({registry, url}) : Promise.resolve(false)
  ])

  return {packument, packumentBufferZip, headers, etag, deps, directives, tarball}
}