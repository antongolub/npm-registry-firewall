import { createServer } from './server.js'
import { createRouter } from './router.js'
import { healthcheck } from './mwares/healthcheck.js'
import { errorBoundary } from './mwares/error-boundary.js'
import { notFound } from './mwares/not-found.js'
import {trace} from './mwares/trace.js'
import { config } from './config.js'

const router = createRouter([
  [ trace ],
  ['GET', '/status/', healthcheck],
  [ notFound ],
  [ errorBoundary ],
])
const servers = config.server.map(s => createServer({...s, router}))

await Promise.all(servers.map(s => s.start()))
