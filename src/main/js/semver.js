import {resolve} from 'node:path'
import {spawnSync} from 'node:child_process'

const nm = resolve(spawnSync('npm', ['list', '-g', '--depth=0', 'npm']).stdout.toString().split('\n').shift(), 'node_modules')

export const semver = (await import(`${nm}/npm/node_modules/semver/index.js`)).default

