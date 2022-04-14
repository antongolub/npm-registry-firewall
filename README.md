# npm-registry-firewall   📦📦🔥🔥🔥
npm registry proxy with on-the-fly filtering 

[![CI](https://github.com/antongolub/npm-registry-firewall/workflows/CI/badge.svg)](https://github.com/antongolub/npm-registry-firewall/actions)
[![Maintainability](https://api.codeclimate.com/v1/badges/ed66fb48706b02e64f8e/maintainability)](https://codeclimate.com/github/antongolub/npm-registry-firewall/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/ed66fb48706b02e64f8e/test_coverage)](https://codeclimate.com/github/antongolub/npm-registry-firewall/test_coverage)
[![npm (tag)](https://img.shields.io/npm/v/npm-registry-firewall)](https://www.npmjs.com/package/npm-registry-firewall)

## Motivation
To mitigate security and legal risks

<details>
  <summary>Details</summary>

Open Source is essential for modern software development. [According to various estimates](https://www.perforce.com/blog/vcs/using-open-source-code-in-proprietary-software), at least 60% of the resulting codebase is composed of open repositories, libraries and packages. And keeps growing. [Synopsys OSSRA 2021 report](https://www.synopsys.com/content/dam/synopsys/sig-assets/reports/rep-ossra-2021.pdf) found that 98% of applications have open source components.

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

## Key Features
* Restricts access to remote packages by predicate: `name`, `org`, `version` ([semver range](https://github.com/npm/node-semver#ranges)), `license`, `dateRange`, `username`, `age` or custom `filter` function.
* Multi-configuration: define as many `port/context-path/rules` combinations as you need.
* [Expressjs](https://expressjs.com/en/guide/using-middleware.html)-inspired server implementation.
* Has no deps. Literally zero.

## Requirements
Node.js >= 14

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
import {createApp} from 'npm-registry-firewall'

const app = createApp({
  server: {
    host: 'localhost',
    port: 3001,
  },
  firewall: {
    registry: 'https://registry.npmmirror.com',
    rules: [
      {
        policy: 'allow',
        org: '@qiwi'
      },
      {
        policy: 'deny',
        name: '@babel/*'
      },
      {
        policy: 'allow',
        filter: ({name, org}) => org === '@types' || name === 'react'  // may be async
      },
    ]
  }
})

await app.start()
```

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
    "base": "/",                // Optional. Defaults to '/'
    "healthcheck": "/health",   // Optional. Defaults to '/healthcheck'. Pass null to disable
    "keepAliveTimeout": 15000,  // Optional. Defaults 61000
    "headersTimeout": 20000,    // Optional. Defaults 62000
    "requestTimeout": 10000     // Optional. Defaults 30000
  },
  "firewall": {
    "registry": "https://registry.npmmirror.com",  // Remote registry
    "token": "NpmToken.*********-e0b2a8e5****",    // Optional bearer token
    "entrypoint": "https://r.qiwi.com/npm",        // Optional. Defaults to `${server.secure ? 'https' : 'http'}://${server.host}:${server.port}${route.base}`
    "base": "/",                // Optional. Defaults to '/'
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
        "policy": "warn",       // `warn` directive works like `allow`, but also logs if someone has requested a tarball matchin the rule
        "name": "reqresnext"
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
```

### Multi-config
```json5
// Array at the top level
[
  // Two servers (for example, http and https) share the same preset
  {
    "server": [
      {"port": 3001},
      {"port": 3002},
    ],
    "firewall": {
      "registry": "https://registry.yarnpkg.com",
      "rules": {"policy": "deny", "org": "@qiwi"}
    }
  },
  // One server has a pair of separately configured endpoints
  {
    "server": {"port": 3003},
    "firewall": [
      {"base": "/foo", "registry": "https://registry.npmjs.org", "rules": {"policy": "deny", "org": "@qiwi"}},
      {"base": "/bar", "registry": "https://registry.yarnpkg.com", "rules": {"policy": "deny", "org": "@babel"}}
    ]
  }
]

```
**.npmrc**
```yaml
registry=https://localhost:3000
strict-ssl=false
```
**npm view**
```shell
npm-registry-firewall % npm view d versions                          
[ '0.1.0', '0.1.1' ]
```
**output**
```shell
$ node src/main/js/cli.js config.json
{"level":"INFO","timestamp":"2022-04-11T20:56:47.031Z","message":"npm-registry-firewall is ready for connections: https://localhost:3000"}
{"level":"INFO","timestamp":"2022-04-11T20:56:49.568Z","traceId":"44f21c050d8c6","clientIp":"127.0.0.1","message":"GET /d"}
{"level":"INFO","timestamp":"2022-04-11T20:56:50.015Z","traceId":"44f21c050d8c6","clientIp":"127.0.0.1","message":"HTTP 200 446ms"}
```

## Contributing
Feel free to open any issues: bug reports, feature requests or questions.
You're always welcome to suggest a PR. Just fork this repo, write some code, put some tests and push your changes.
Any feedback is appreciated.

## License
[MIT](./LICENSE)
