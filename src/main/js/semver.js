import { createRequire } from 'node:module'
import { execSync } from 'node:child_process'
import { join } from 'node:path'
const require = createRequire(import.meta.url)

export const semver = require(join(
  execSync('npm list -g --depth=0 --parseable npm', {timeout: 10000, shell: true}).toString().trim(),
  'node_modules',
  'semver'
))
