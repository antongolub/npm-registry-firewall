import { createRequire } from 'node:module'
import {spawnSync} from 'node:child_process'
const require = createRequire(import.meta.url)

const pkgRoot = spawnSync('npm', ['list', '--global', '--parseable', '--depth=1', 'semver'])
  .stdout.toString().trim().split('\n').sort()[0]

export const semver = require(`${pkgRoot}`)
