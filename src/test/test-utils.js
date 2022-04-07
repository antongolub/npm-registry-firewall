import {fileURLToPath} from 'node:url'
import {relative} from 'node:path'
import {promisify} from 'node:util'

export {strict as assert} from 'node:assert'

const sleep = promisify(setTimeout)

// https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
const Reset = "\x1b[0m",
  Reverse = "\x1b[7m",
  BgRed = "\x1b[41m",
  BgGreen = "\x1b[42m",
  BgYellow = "\x1b[43m"

let queued = 0
let passed = 0
let failed = 0
let total = 0
let skipped = 0
let focused = 0

const singleThread = (fn) => {
  let p = Promise.resolve()
  return async function (...args) {
    return (p = p.catch(_ => _).then(() => fn.call(this, ...args)))
  }
}

const run = singleThread((cb, ms) => timeout(cb(), ms))

const warmup = sleep(100)

const timeout = (promise, ms = 5000, exception = `TimeoutException: exec time exceeds ${ms}ms`) => {
  let timer
  return Promise.race([
    promise,
    new Promise((_r, rej) => timer = setTimeout(rej, ms, exception))
  ]).finally(() => clearTimeout(timer))
}

const log = (name, group, err, file = '') => {
  if (err) {
    console.log(err)
    console.log(file)
  }
  console.log(`${Reverse} ${group} ${Reset}${err ? BgRed : BgGreen } ${name} ${Reset}`)
}

export const test = async function (name, cb, ms, focus, skip) {
  const filter = RegExp(process.argv[3] || '.')
  const {group, meta} = this
  const file = meta ? relative(process.cwd(), fileURLToPath(meta.url)) : ''

  if (filter.test(name) || filter.test(group) || filter.test(file)) {
    focused += +!!focus
    queued++

    await warmup
    try {
      if (!focused === !focus && !skip) {
        await run(cb, ms)
        passed++
        log(name, group)
      } else {
        skipped ++
      }
    } catch (e) {
      log(name, group, e, file)
      failed++
    } finally {
      total++

      if (total === queued) {
        printTestDigest()
      }
    }
  }
}

export const only = async function (name, cb, ms) { return test.call(this, name, cb, ms, true, false) }

export const skip = async function (name, cb, ms) { return test.call(this, name, cb, ms, false, true) }

export const testFactory = (group, meta) => Object.assign(
  test.bind({group, meta}), {
    test,
    skip,
    only,
    group,
    meta
  })

export const printTestDigest = () => {
  console.log(
    `${BgGreen} 🍺 tests passed: ${passed} ${Reset}\n` +
    `${skipped ? `${BgYellow} 🚧 skipped: ${skipped} ${Reset}\n` : ''}` +
    `${failed ? `${BgRed} ❌  failed: ${failed} ${Reset}\n` : ''} `
  )
  failed && process.exit(1)
}
