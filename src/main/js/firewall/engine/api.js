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

export const assertPolicy = async ({org, name, version, rules, registry, token}, _policy) => {
  const boundContext = await getBoundContext({org, name, version, rules, registry, token})
  const {directives} = await getAssets(boundContext)
  const policy = getPolicy(directives, version)

  if (_policy && _policy !== policy) {
    throw new Error(`assert policy: ${policy} !== ${_policy}`)
  }
  return policy
}

export const getAssets = async (boundContext) => {
  const {name, org, version, registry, rules} = boundContext
  const url = `${name}/-/${name.slice(name.indexOf('/') + 1)}-${version}.tgz`
  const [
    { packument, packumentBufferZip, headers, etag, deps, directives },
    tarball
  ] = await Promise.all([
    getPackument({ boundContext, rules }),
    version ? checkTarball({registry, url}) : Promise.resolve(false)
  ])

  return {packument, packumentBufferZip, headers, etag, deps, directives, tarball}
}