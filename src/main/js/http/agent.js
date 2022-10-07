import http from 'node:http'
import https from 'node:https'
import {getCtx} from '../als.js'
import {isPlainObject} from '../util.js'

const agents = {
  http: new Map(),
  https: new Map()
}

const agentOpts = {
  keepAliveMsecs: 10_000,
  keepAlive: true,
  maxSockets: 100,
  timeout: 10_000
}

export const getAgent = (secure) => {
  const opts = getCtx()?.cfg?.agent || agentOpts
  const map = secure ? agents.https : agents.http
  if (!map.has(opts)) {
    const value = isPlainObject(opts) ? new (secure ? https.Agent : http.Agent)(opts) : opts
    map.set(opts, value)
  }

  return map.get(opts)
}
