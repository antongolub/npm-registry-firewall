import { createServer } from './server.js'
import { config } from './config.js'

await Promise.all(config.server.map(s => createServer(s).start()))
