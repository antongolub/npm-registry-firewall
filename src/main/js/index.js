import { createServer } from './server.js'
import { createRouter } from './router.js'
import { healthcheck } from './mwares/healthcheck.js'
import { config } from './config.js'

const router = createRouter([
  ['GET', '/status', healthcheck]
])
const servers = config.server.map(s => createServer({...s, router}))

await Promise.all(servers.map(s => s.start()))
