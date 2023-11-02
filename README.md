# npm-registry-firewall   📦📦🔥
npm registry proxy with on-the-fly filtering 

[![CI](https://github.com/antongolub/npm-registry-firewall/workflows/CI/badge.svg)](https://github.com/antongolub/npm-registry-firewall/actions)
[![Maintainability](https://api.codeclimate.com/v1/badges/ed66fb48706b02e64f8e/maintainability)](https://codeclimate.com/github/antongolub/npm-registry-firewall/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/ed66fb48706b02e64f8e/test_coverage)](https://codeclimate.com/github/antongolub/npm-registry-firewall/test_coverage)
[![npm (tag)](https://img.shields.io/npm/v/npm-registry-firewall)](https://www.npmjs.com/package/npm-registry-firewall)

## Key Features
* Restricts access to remote packages by predicate: 
  * `name`
  * `org`
  * [`version` range](https://github.com/npm/node-semver#ranges)
  * `license` type
  * `dateRange`
  * `age`
  * `username`
  * custom `filter` function
  * vulnerability level via builtin [npm-registry-firewall/audit plugin](#npm-registry-firewallaudit)
* Flexible configuration: use [presets](#presets), [plugins](#plugins) and define as many [`server/context-path/rules`](#multi-config) combinations as you need.
* Extendable. [expressjs](https://expressjs.com/en/guide/using-middleware.html)-inspired server implementation is under the hood.
* Standalone. No clouds, no subscriptions.
* Linux / Windows / macOS compatible.
* Works with [Bun](https://github.com/Jarred-Sumner/bun). But `config.zlib:` [fflate](https://github.com/101arrowz/fflate) does not work because: `worker_threads.Worker option "eval" is not implemented.`
* Has no prod deps. Literally zero.

## Motivation

<details>
  <summary>To mitigate security and legal risks</summary>


Open Source is essential for modern software development. [According to various estimates](https://www.perforce.com/blog/vcs/using-open-source-code-in-proprietary-software), at least 60% of the resulting codebase is composed of open repositories, libraries and packages. And it keeps growing. [Synopsys OSSRA 2021 report](https://www.synopsys.com/content/dam/synopsys/sig-assets/reports/rep-ossra-2021.pdf) found that 98% of applications have open source dependencies.

But _open_ does not mean _free_. The price is the risk that you take:
* Availability
* Security 
* Legality / license

Let's consider these problems in the context of the JS universe.

### Availability risks
JS packages are distributed in various ways: git repos, cdns and package registries.
Regardless of the method, there are only two entry types that are finally resolved by any pkg manager: git-commit pointers and tarball links.

```json
"dependencies": {
  "yaf" : "git://github.com/antongolub/yarn-audit-fix.git#commit-hash",
  "yaf2": "antongolub/yarn-audit-fix",
  "yarn-audit-fix" : "*"
}
```
```yaml
yaf2@antongolub/yarn-audit-fix:
  version "9.2.1"
  resolved "https://codeload.github.com/antongolub/yarn-audit-fix/tar.gz/706646bab3b4c7209596080127d90eab9a966be2"
  dependencies:
    "@types/find-cache-dir" "^3.2.1"
    "@types/fs-extra" "^9.0.13"
```
```json
"node_modules/yaf": {
  "name": "yarn-audit-fix",
  "version": "9.2.1",
  "resolved": "git+ssh://git@github.com/antongolub/yarn-audit-fix.git#706646bab3b4c7209596080127d90eab9a966be2",
  "license": "MIT",
```
```json
"node_modules/yarn-audit-fix": {
  "version": "9.2.1",
  "resolved": "https://registry.npmjs.org/yarn-audit-fix/-/yarn-audit-fix-9.2.1.tgz",
  "integrity": "sha512-4biFNP4ZLOHboB2cNVuhYyelTFR/twlfmGMQ2TgJgGRORMDM/rQdQqhJdVLuKvfdMLFEPJ832z6Ws5OoCnFcfA==",
  "dependencies": {
```
So the implementation of mirroring is fundamentally quite simple:
we just need to save and expose these assets from an alternative ssh/https entry point. Luckily this has already happened.
The main repository for JS code is [registry.npmjs.org](https://registry.npmjs.org/). 
And at least 5 public replicas are always available as alternatives:
* [https://registry.yarnpkg.com](https://registry.yarnpkg.com/)
* [https://registry.npmmirror.com](https://registry.npmmirror.com)
* [https://r.cnpmjs.org](https://r.cnpmjs.org/)
* [https://skimdb.npmjs.com/registry](https://skimdb.npmjs.com/registry/)
* [https://registry.npm.taobao.org](https://registry.npm.taobao.org/)

If this reliability level is not enough, you can easily run one more registry:
* [sonatype-nexus](https://help.sonatype.com/repomanager3/nexus-repository-administration/formats/npm-registry)
* [verdaccio](https://verdaccio.org/)
* [nandu](https://github.com/taskforcesh/nandu)

### Security risks
Any code may not work properly. Due to error or malice. Keep in mind that most OSS licenses **exclude any liability for damages**. It's also important to always remember that oss code is **not verified** before being published.
These two circumstances sometimes give rise to dangerous incidents like [colors.js](https://security.snyk.io/vuln/SNYK-JS-COLORS-2331906) or [node-ipc](https://snyk.io/blog/peacenotwar-malicious-npm-node-ipc-package-vulnerability/).

The independent audit process is expensive, time consuming, so only setting a delay before using new pkg version might be effective countermeasure.

### Legal risks
License agreement is an attribute of the moment: it can suddenly change and affect the development process (for example, [husky-5](https://blog.typicode.com/husky-5/)).
Uncontrolled use of new versions may have legal and financial consequences. Therefore, automated license checks should be part of CI/CD pipeline or the registry's own feature.

</details>

## Implementation notes
The proxy intercepts packuments and tarball requests and applies the specified filters to them:
* [Removes all](https://github.com/antongolub/npm-registry-firewall/blob/137cf6f1f5a3bd979099c912a3357b2ea6ece402/src/main/js/firewall/packument.js#L57) forbidden entries from packuments.
* [Returns 404](https://github.com/antongolub/npm-registry-firewall/blob/master/src/main/js/firewall/middleware.js#L27) if the filtered packument `versions` are empty.
* [Returns 404](https://github.com/antongolub/npm-registry-firewall/blob/master/src/main/js/firewall/middleware.js#L23) if `registy/pkg-tarball@version.tgz` does not satisfy the policies.
* [Passes any other](https://github.com/antongolub/npm-registry-firewall/blob/master/src/main/js/app.js#L49) requests to the remote registry as is.

### Presentation
[npm vulnerabilities: challenge accepted](https://holyjs.ru/talks/703ae2781cbc46d49a007f16834d7c0b/?referer=/persons/15a4605d3664430ba116f38fc7d0613d/) at HolyJS 2022 Spring  
[slides](https://squidex.jugru.team/api/assets/srm/5f08d7c7-00d4-4387-bd22-370b7660d9d7/holyjs-2020-spring-slides-reforged.pptx)

## Requirements
Node.js >= 14  
Bun >= 1.0.6

## Install
```shell
# npm
npm i npm-registry-firewall

# yarn
yarn add npm-registry-firewall
```

## Usage
### CLI
```shell
npm-registry-firewall /path/to/config.json
```

### JS API
```js
import {createApp, assertPolicy} from 'npm-registry-firewall'

const app = createApp({
  server: {
    host: 'localhost',
    port: 3001,
  },
  firewall: {
    '/registry': {
      registry: 'https://registry.npmmirror.com',
      rules: [
        {
          policy: 'allow',
          org: '@qiwi'
        },
        {
          policy: 'deny',
          name: '@babel/*,react@^17'  // All @babel-scoped pkgs and react >= 17.0.0
        },
        {
          policy: 'allow',
          filter: ({name, org}) => org === '@types' || name === 'react'  // may be async
        },
        {
          plugin: [['npm-registry-firewall/audit', {
            critical: 'deny',
            moderate: 'warn'
          }]]
        },
      ]
    }
  }
})

await app.start()

// Checks the specified pkg version against the rules preset
await assertPolicy({
  name: 'eventsource',
  version: '1.1.0',
  registry: 'https://registry.npmjs.org',
  rules: [{
    plugin: [['npm-registry-firewall/audit', {
      critical: 'deny'
    }]]
  }]
}, 'allow') // Error: assert policy: deny !== allow
```

### TS libdefs

<details>
  <summary>Included</summary>

```ts
type LetAsync<T> = T | Promise<T>

type TApp = {
  start: () => Promise<void>
  stop: () => Promise<void>
}

type TLogger = typeof console

type TLogeLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error'

type TAgentConfig = {
  keepAliveMsecs?: number
  keepAlive?: number
  maxSockets?: number
  timeout?: number
}

type TServerConfig = {
  host?: string
  port?: string | number
  base?: string
  entrypoint?: string
  healthcheck?: string | null
  metrics?: string | null
  secure?: {
    key: string,
    cert: string
  }
  requestTimeout?: number
  headersTimeout?: number
  keepAliveTimeout?: number
  extend?: string
}

type TPolicy = 'allow' | 'deny' | 'warn'

type TRule = {
  policy?: TPolicy
  name?: string | RegExp | Array<string | RegExp>
  org?: string | RegExp | Array<string | RegExp>
  dateRange?: [string, string]
  age?: number | [number] | [number, number]
  version?: string,
  license?: string | RegExp | Array<string | RegExp>
  username?: string | RegExp | Array<string | RegExp>
  filter?: (entry: Record<string, any>) => LetAsync<boolean | undefined | null>
  extend?: string
  plugin?: TPluginConfig
}

type TPluginConfig = string | [string, any] | TPlugin | [TPlugin, any]

type TCacheConfig = {
  ttl: number
  evictionTimeout?: number
  limit?: number // in bytes
}

type TCacheImpl = {
  add(key: string, value: any, ttl?: number): LetAsync<any>
  has(key: string): LetAsync<boolean>
  get(key: string): LetAsync<any>
  del(key: string): LetAsync<void>
}

type TFirewallConfigEntry = {
  registry: string | string[]
  entrypoint?: string
  token?: string
  rules?: TRule | TRule[]
  extend?: string
}

type TFirewallConfig = Record<string, TFirewallConfigEntry>

type TConfig = {
  server: TServerConfig
  firewall: TFirewallConfig
  zlib?: string // ref to zlib implementation like `fflate`. Defaults to `node:zlib`
  extend?: string
  agent?: TAgentConfig
  log?: { level?: TLogeLevel }
  cache?: TCacheConfig | TCacheImpl
  warmup?: boolean | number
}

type TValidationContext = {
  options: any,
  rule: TRule,
  entry: Record<string, any>
  boundContext: {
    logger: TLogger
    registry: string
    authorization?: string
    entrypoint: string
    name: string
    org?: string
    version?: string
  }
}

type TPlugin = {
  (context: TValidationContext): LetAsync<TPolicy>
}

type TAppOpts = {
  logger?: TLogger
  cache?: TCacheImpl
}

export function createApp(config: string | TConfig, opts?: TAppOpts): Promise<TApp>

type TLoggerOptions = {
  extra?: Record<string, any>,
  formatter?: (logCtx: {level: string, msgChunks: string[], extra: Record<string, any>}) => string
}

export function createLogger(options: TLoggerOptions): TLogger

export function getPercentiles(name: string, percentiles: number[]): number[]

export function getMetricsDigest(): Record<string, any>
```

</details>

### Config
```json5
{
  "server": {
    "host": "localhost",        // Defaults to 127.0.0.1
    "port": 3000,               // 8080 by default
    "secure": {                 // Optional. If declared serves via https
      "cert": "ssl/cert.pem",
      "key": "ssl/key.pem"
    },
    "entrypoint": "https://r.qiwi.com/npm",  // Optional. Defaults to `${server.secure ? 'https' : 'http'}://${server.host}:${server.port}${server.base}`
    "base": "/",                // Optional. Defaults to '/'
    "healthcheck": "/health",   // Optional. Defaults to '/healthcheck'. Pass null to disable
    "metrics": "/metrics",      // Optional. Uptime, CPU and memory usage. Defaults to '/metrics'. null to disable
    "keepAliveTimeout": 15000,  // Optional. Defaults to 61000
    "headersTimeout": 20000,    // Optional. Defaults to 62000
    "requestTimeout": 10000     // Optional. Defaults to 30000
  },
  // Optional. See `http(s).Agent` docs for details. Defaults to:
  "agent": {
    "keepAliveMsecs": 5000,
    "keepAlive": true,
    "maxSockets": 10000,
    "timeout": 10000
  },
  "log": {
    "level": "info"           // Optional. Defaults to 'info'
  },
  "cache": {                  // Optional. Defaults to no-cache (null)
    "ttl": 5,                 // Time to live in minutes. Specifies how long resolved pkg directives will live.
    "evictionTimeout": 1,     // Cache invalidation period in minutes. Defaults to cache.ttl.
    "limit": 1000000          // Optional. Max cache size in bytes. Defaults to Infinity
  },
  "zlib": "fflate",           // Optional. Defined a custom zlib provider. Defaults to 'node:zlib'
  "warmup": true,             // Optional. Lets the prefetcher guess the next packages to load. Defaults to true (infinity). If set to a number, limits the fetching depth.
  "firewall": {
    "/foo": {                 // Context path
      "registry": "https://registry.npmmirror.com",  // Remote registry
      "token": "NpmToken.*********-e0b2a8e5****",    // Optional bearer token. If empty req.headers.authorization value will be used instead
      "entrypoint": "https://r.qiwi.com/npm",        // Optional. Defaults to `${server.secure ? 'https' : 'http'}://${server.host}:${server.port}${route.base}`
      "extends": "@qiwi/internal-npm-registry-firewall-rules",  // Optional. Populates the entry with the specified source contents (json/CJS module only)
      "rules": [
        {
          "policy": "allow",
          "org": "@qiwi"
        },
        {
          "policy": "allow",
          "name": ["@babel/*", "@jest/*", "lodash"] // string[] or "comma,separated,list". * works as .+ in regexp
        },
        {
          "policy": "warn",       // `warn` directive works like `allow`, but also logs if someone has requested a tarball matching the rule
          "name": "reqresnext"
        },
        {
          "policy": "deny",
          "extends": "@qiwi/nrf-rule",  // `extends` may be applied at any level, and should return a valid value for the current config section
        },
        {
          "plugin": ["npm-registry-firewall/audit", {"moderate": "warn", "critical": "deny"}]
        },
        {
          "policy": "deny",
          "name": "colors",
          "version": ">= v1.4.0"  // Any semver range: https://github.com/npm/node-semver#ranges
        },
        {
          "policy": "deny",
          "license": "dbad"       // Comma-separated license types or string[]
        },
        {
          "policy": "allow",
          "username": ["sindresorhus", "isaacs"] // Trusted npm authors.
        },
        {
          "policy": "allow",
          "name": "d",
          // `allow` is upper, so it protects `< 1.0.0`-ranged versions that might be omitted on next steps
          "version": "< 1.0.0"
        },
        {
          "policy": "deny",
          // Checks pkg version publish date against the range
          "dateRange": ["2010-01-01T00:00:00.000Z", "2025-01-01T00:00:00.000Z"]
        },
        {
          "policy": "allow",
          "age": 5    // Check the package version is older than 5 days. Like quarantine
        }
      ]
    }
  }
}
```

### Multi-config
You can declare as many separate firewall profiles as you need.

```json5
{
  "server": {
    "host": "localhost",
    "port": 3001
  },
  "cache": {
    "ttl": 1
  },
  "firewall": {
    "/registry": {
      "registry": "https://registry.npmjs.org",
      "rules": [{
        "policy": "deny",
        "name": "colors",
        "version": ">= v1.3.0"
      }]
    },
    "/block-all": {
      "registry": ["https://registry.yarnpkg.com", "https://registry.npmjs.org"],
      "rules": { "policy": "deny", "name": "*" }
    },
    "/npm-proxy": {
      "registry": "https://registry.npmjs.org"
    },
    "/yarn-proxy": {
      "registry": "https://registry.yarnpkg.com",
    },
    // fallback firewall
    "*": {
      "registry": "https://registry.yarnpkg.com",
    }
  }
}
```

[️More config examples](./examples)

### Cache
By default, _nrf_ uses a simple in-memory cache to store patched packuments.
```js
cache: {              // Optional. Defaults to no-cache (null)
  ttl: 5,             // Time to live in minutes. Specifies how long resolved pkg directives will live.
  evictionTimeout: 1, // Cache invalidation period in minutes. Defaults to cache.ttl.
  limit: 1000000      // Optional. Max cache size in bytes. Defaults to Infinity
}
```
You can also provide your own implementation instead, for example, to create [cassandra](https://cassandra.apache.org/_/index.html)-based distributed cache:

```js
import {createApp} from 'npm-registry-firewall'

const cache = {
  add() {}, // each method may be async
  has() {return false},
  get() {},
  del() {}
}

const app = createApp({
  server: {port: 5000},
  firewall: {
    '/registry': {
      registry: 'https://registry.npmjs.org',
      cache,
      rules: []
    }
  }
})
```
Or even a cache factory:
```js
const cache = () => {
  // ... init
  return {
    get() {},
    ...
  }
}
```

Pass `null` as `config.firewall.cache` to disable.

### Agent
Pass a custom implementation of `http(s).Agent` to control the number of concurrent requests to the remote registry.
This feature is useful if your service is working behind a proxy.
```js
// https://www.npmjs.com/package/https-proxy-agent
import HttpsProxyAgent from 'https-proxy-agent'

const agent = new HttpsProxyAgent('http://10.10.0.20:3128')
const app = createApp({
  server: {port: 5000},
  agent,
  firewall: {
    '/registry': {
      registry: 'https://registry.npmjs.org',
      rules: []
    }
  }
})
```

Or just set the `agent` option to create an agent:
```js
const app = createApp({
  server: {port: 5000},
  agent: {
    keepAliveMsecs: 5000,
    keepAlive: true,
    maxSockets: 10_000,
    timeout: 10_000
  },
  firewall: {
    '/registry': {
      registry: 'https://registry.npmjs.org',
      rules: []
    }
  }
})
```

### Extras
#### Presets
Introduce your own reusable snippets via `extends` or `preset`. This statement can be applied at any [config](#config) level and should return a valid value for the current section. The specified path will be loaded synchronously through `require`, so it must be a JSON or CJS module.
```js
const config = {
  // should return `firewall` and `servers`
  extends: '@qiwi/nrf-std-config',
  server: {
    port: 5000,
    extends: '@qiwi/nrf-server-config'
  },
  firewall: {
    '/registry': {
      // `rules`, `registry`, etc,
      extends: '@qiwi/nrf-firewall-config',
      // NOTE If you redefine `rules` the result will be contatenation of `[...rules, ...extends.rules]`
      rules: [{
        policy: 'deny',
        // `name`, `org`, `filter`, etc
        extends: '@qiwi/nrf-deprecated-pkg-list'
      }, {
        policy: 'allow',
        extends: '@qiwi/nrf-whitelisted-orgs'
      }, {
        extends: '@qiwi/nrf-all-in-one-filter'
      }]
    }
  }
}
```

For example, `extends` as a filter:
```js
// '@qiwi/nrf-all-in-one-filter'
module.exports = {
  filter({org, name, time, ...restPkgData}) {
    if (name === 'react') {
      return true
    }

    if (org === '@babel') {
      return false
    }

    if (restPkgData.license === 'dbad') {
      return false
    }
  }
}
```
#### Plugins
The plugin API is slightly different from presets:
* Async. It's loaded dynamically as a part of rule processing pipeline, so it may be an ESM.
* Configurable. Opts may be passed as the 2nd tuple arg.
* Composable. There may be more than one per `rule`.

```js
const rule1 = {
  plugin: ['@qiwi/nrf-plugin']
}

const rule2 = {
  plugin: [
    ['@qiwi/nrf-plugin', {foo: 'bar'}],
    '@qiwi/nrf-another-one'
  ]
}
```

The plugin interface is an (async) function that accepts `TValidationContext` and returns policy type value or `false` as a result:
```js
const plugin = ({
  rule,
  entry,
  options,
  boundContext
}) => entry.name === options.name ? 'deny' : 'allow'
```

### `npm-registry-firewall/audit`
Some registries do not provide audit API, that's why the plugin is disabled by default.
To activate, add a rule:
```js
{
  plugin: [['npm-registry-firewall/audit', {
    critical: 'deny',
    moderate: 'warn'
  }]]
}
```

You can also specify the `registry` option to override the inherited value.
```js
{
  plugin: [['npm-registry-firewall/audit', {
    critical: 'deny',
    registry: 'https://registry.yarnpkg.com'
  }]]
}
```

### `npm-registry-firewall/std`
Default plugin to filter packages by their fields. May be used directly or via shortcut as shown in examples above.
```js
// Allow only mit-licensed versions of the `foo` lib
{
  plugin: [['npm-registry-firewall/std', {
    policy: 'allow',
    name: 'foo',
    license: 'mit'
  }]]
}

// equals to:
{
  policy: 'allow',
  name: 'foo',
  license: 'mit'
}

// Allow any mit-licensed or `foo` lib or any `babel` package
{
  plugin: [['npm-registry-firewall/std', {
    policy: 'allow',
    name: 'foo',
    org: 'babel',
    license: 'mit',
    cond: 'or' // Optional. Defaults to `and`
  }]]
}
```

### Checks
To check the specified package version against the applied registry rules trigger its `_check` entrypoint.
For one package:
```bash
curl -X GET -k https://localhost:3000/registry/_check/eventsource/1.1.0
# {"eventsource@1.1.0":"deny"}
```
To inspect a bulk on entries at once:
```bash
curl -X POST -k https://localhost:3000/registry/_check/bulk -d '["eventsource@1.1.0"]'
# {"eventsource@1.1.0":"deny"}
```

### Monitoring
#### /healthcheck
```json
{"status":"OK"}
```
#### /metrics
```json
{
  "uptime": "00:00:47",
  "memory-usage-rss": 34320384,
  "memory-usage-heap-total": 6979584,
  "memory-usage-heap-used": 5632224,
  "memory-usage-external": 855222,
  "memory-usage-array-buffers": 24758,
  "cpu-usage-user": 206715,
  "cpu-usage-system": 51532,
  "http-time-p50": 285,
  "http-time-p75": 546,
  "http-time-p95": 1166,
  "http-time-p99": 1814,
  "response-time-p50": 395,
  "response-time-p75": 1497,
  "response-time-p95": 1523,
  "response-time-p99": 1902
}
```

You can also obtain the metrics programmatically:
```js
import { getPercentiles, getMetricsDigest } from 'npm-registry-firewall'

getPercentiles('response-time', [0.5, 0.9, 0.99]) // [234, 313, 701]
getMetricsDigest() // { uptime: '00:00:47', memory: { rss: 34320384, ... }, ... }
```

#### stdout
```shell
{"level":"INFO","timestamp":"2022-04-11T20:56:47.031Z","message":"npm-registry-firewall is ready for connections: https://localhost:3000"}
{"level":"INFO","timestamp":"2022-04-11T20:56:49.568Z","traceId":"44f21c050d8c6","clientIp":"127.0.0.1","message":"GET /d"}
{"level":"INFO","timestamp":"2022-04-11T20:56:50.015Z","traceId":"44f21c050d8c6","clientIp":"127.0.0.1","message":"HTTP 200 446ms"}
```

### logger
You can override the default implementation if needed: 
```js
import { createLogger, createApp } from 'npm-registry-firewall'

const logger = createLogger(
  {foo: 'bar'}, // extra to mix
  ({level, msgChunks, extra}) => JSON.stringify({
    msg: msgChunks.map(m => '' + m),
    mdc_trace: {spanId: extra.traceId, traceId: extra.traceId, bar: extra.foo},
    timestamp: new Date().toISOString(),
    level
  })
)

const app = createApp(cfg, {logger})
```

### Manual testing
**.npmrc**
```yaml
registry=https://localhost:3000
strict-ssl=false
```

**run**
```shell
# node src/main/js/cli.js config.json
yarn start 
```

**npm view**
```shell
npm-registry-firewall % npm view d versions                          
[ '0.1.0', '0.1.1' ]
```

**curl**
```shell
curl -k  https://localhost:3000/registry/minimist/-/minimist-1.2.6.tgz > minimist.tgz
curl -k  https://localhost:3000/registry/react > react.json
```

## Migration
### 1.x → 2.x
v1 configuration was definitely too flexible, too complex and too error-prone. v2 is aimed to simplify the config and make it more predictable:
* there's only one `server`, `cache`, `agent` and `logger` sections now
* `base` path cannot be `/` to avoid pkg name clashes with `/health` and `/metrics` endpoints.
* firewall `base` paths are defined as map keys, so they must be unique
* `cache` cannot be a factory. Pass cache opts of instance directly instead

In other words, `multi-server-config` is not supported anymore. But you can still use this scheme via JS API:
```js
import { createRoutes, createServer } from 'npm-registry-firewall'

const config = loadConfig('path/to/config.json')
const routes = createRoutes(config)
const routeMap = config.firewalls.reduce((acc, f, i) => {
  acc[f.base] = routes[i]
  return acc
}, {})

const serverFoo = createServer({port: 3000, router: routeMap['/foo']})
const serverBar = createServer({port: 3001, router: routeMap['/bar']})
```

Sum up, the prev config:
```js
{
  server: {port: 5000},
  agent: {
    keepAliveMsecs: 5000,
    keepAlive: true,
    maxSockets: 10_000,
    timeout: 10_000
  },
  firewall: [{
    base: '/foo',
    registry: 'https://registry.npmjs.org',
    rules: [],
    cache: {
      ttl: 5,
      evictionTimeout: 1,
      limit: 1_000_000
    }
  }, {
    base: '/bar',
    registry: 'https://registry.yarnpkg.com/',
  }]
}
```
comes to:
```js
{
  server: {port: 5000},
  agent: {
    keepAliveMsecs: 5000,
  },
  cache: {
    ttl: 5,
    evictionTimeout: 1,
    limit: 1_000_000
  },
  firewall: {
    '/foo': {
      registry: 'https://registry.npmjs.org',
      rules: [],
    },
    '/bar': {
      registry: 'https://registry.yarnpkg.com/',
    }
  }
}
```

## Contributing
Feel free to open any issues: bug reports, feature requests or questions.
You're always welcome to suggest a PR. Just fork this repo, write some code, put some tests and push your changes.
Any feedback is appreciated.

## License
[MIT](./LICENSE)
