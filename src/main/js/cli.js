#!/usr/bin/env node

import {createApp} from './app.js'

const cfg = process.argv.slice(2)[0]
const app = createApp(cfg)

await app.start()
