import http from 'node:http'
import https from 'node:https'
import {getCtx} from '../als.js'

const agents = {
  http: new Map(),
  https: new Map()
}

const agentOpts = {
  keepAliveMsecs: 5000,
  keepAlive: true,
  maxSockets: 10_000,
  timeout: 10_000
}

export const getAgent = (secure) => {
  const opts = getCtx()?.cfg?.agent || agentOpts
  const map = secure ? agents.https : agents.http
  if (!map.has(opts)) {
    map.set(opts, new (secure ? https.Agent : http.Agent)(opts))
  }

  return map.get(opts)
}
