## [1.30.3](https://github.com/antongolub/npm-registry-firewall/compare/v1.30.2...v1.30.3) (2022-10-06)


### Bug Fixes

* targets proxying race ([6f60886](https://github.com/antongolub/npm-registry-firewall/commit/6f608867c051f4d7bdecef881740d3dcf28fafa1))

## [1.30.2](https://github.com/antongolub/npm-registry-firewall/compare/v1.30.1...v1.30.2) (2022-10-05)


### Bug Fixes

* log only stacktraces of 5xx errors ([43412ce](https://github.com/antongolub/npm-registry-firewall/commit/43412ce276a6391b7a3b980f1e2f939b24ddb378))
* use constant instead of 500 ([3a473a8](https://github.com/antongolub/npm-registry-firewall/commit/3a473a8f643f483e4ca4455d9096a44fb71c361d))

## [1.30.1](https://github.com/antongolub/npm-registry-firewall/compare/v1.30.0...v1.30.1) (2022-10-04)


### Bug Fixes

* do not log stacktrace on 404 ([70af1c0](https://github.com/antongolub/npm-registry-firewall/commit/70af1c06b7d39f709402d5ef1a9204d90b39288a))

# [1.30.0](https://github.com/antongolub/npm-registry-firewall/compare/v1.29.1...v1.30.0) (2022-10-04)


### Features

* support several target registries ([aa06883](https://github.com/antongolub/npm-registry-firewall/commit/aa0688309f541f409b544344ed5dc2c5d3d2d0a4)), closes [#62](https://github.com/antongolub/npm-registry-firewall/issues/62)

## [1.29.1](https://github.com/antongolub/npm-registry-firewall/compare/v1.29.0...v1.29.1) (2022-10-04)


### Bug Fixes

* set 3xx, 404 log level to info ([5028c87](https://github.com/antongolub/npm-registry-firewall/commit/5028c87b176724ffd576910fba4b9d71f1a91ffb))

# [1.29.0](https://github.com/antongolub/npm-registry-firewall/compare/v1.28.0...v1.29.0) (2022-10-02)


### Features

* export `getCtx` as a part of plugin api ([bde1fec](https://github.com/antongolub/npm-registry-firewall/commit/bde1fec31897039e2a50bee33782495a3959ac07))

# [1.28.0](https://github.com/antongolub/npm-registry-firewall/compare/v1.27.0...v1.28.0) (2022-10-02)


### Features

* support custom http agent ([da9c8c7](https://github.com/antongolub/npm-registry-firewall/commit/da9c8c7857a4c2bb27aa970c8a4d5fd1c2db4ebd))

# [1.27.0](https://github.com/antongolub/npm-registry-firewall/compare/v1.26.1...v1.27.0) (2022-10-01)


### Features

* assert http method in firewall mware ([5fb8c10](https://github.com/antongolub/npm-registry-firewall/commit/5fb8c10287b420cced93058864fc72d161d30b67))
* return 304 if etag matches if-none-match header ([ba8ea16](https://github.com/antongolub/npm-registry-firewall/commit/ba8ea16b20e70c1bac8d26c0ce56fa72f528885e))

## [1.26.1](https://github.com/antongolub/npm-registry-firewall/compare/v1.26.0...v1.26.1) (2022-09-30)


### Bug Fixes

* add dot to tarball/packument regexps ([6ccddc1](https://github.com/antongolub/npm-registry-firewall/commit/6ccddc1830496bc1ca72ff7e822eb27ea8e551aa))

# [1.26.0](https://github.com/antongolub/npm-registry-firewall/compare/v1.25.4...v1.26.0) (2022-09-28)


### Features

* log req.method and req.url on end event. ([c9f7a70](https://github.com/antongolub/npm-registry-firewall/commit/c9f7a70e62f82dbb2cc3a350a4377f06e9578d41))
* make log level configurable, add debug logs for http layer ([9231fb7](https://github.com/antongolub/npm-registry-firewall/commit/9231fb7ca2dfbd719495c559868fe4fd6bde938f))
* provide custom http(s) agent cfg ([df46e2f](https://github.com/antongolub/npm-registry-firewall/commit/df46e2f35cfbfce604184436bbb40e28d766e97f)), closes [#59](https://github.com/antongolub/npm-registry-firewall/issues/59)

## [1.25.4](https://github.com/antongolub/npm-registry-firewall/compare/v1.25.3...v1.25.4) (2022-08-04)


### Performance Improvements

* rm redundant regex chunks memo ([75aebc8](https://github.com/antongolub/npm-registry-firewall/commit/75aebc8d76b0f4f3dbd5ad1943ecc89ae2b3e330))

## [1.25.3](https://github.com/antongolub/npm-registry-firewall/compare/v1.25.2...v1.25.3) (2022-08-04)


### Bug Fixes

* handle url-encoded slashes case-insensitively ([ef9a937](https://github.com/antongolub/npm-registry-firewall/commit/ef9a93762dc7b347e3f3cb9034e1dbb6f8128664))

## [1.25.2](https://github.com/antongolub/npm-registry-firewall/compare/v1.25.1...v1.25.2) (2022-07-11)

## [1.25.1](https://github.com/antongolub/npm-registry-firewall/compare/v1.25.0...v1.25.1) (2022-07-09)

# [1.25.0](https://github.com/antongolub/npm-registry-firewall/compare/v1.24.0...v1.25.0) (2022-06-02)


### Features

* add registry option for audit plugin ([32266b5](https://github.com/antongolub/npm-registry-firewall/commit/32266b59c65c7221cc69ac1b880981426770f524))

# [1.24.0](https://github.com/antongolub/npm-registry-firewall/compare/v1.23.2...v1.24.0) (2022-06-02)


### Features

* pass req auth header as config token fallback ([3f8d053](https://github.com/antongolub/npm-registry-firewall/commit/3f8d0530af7ea8556ae3af0059dde7ae16a75eef))

## [1.23.2](https://github.com/antongolub/npm-registry-firewall/compare/v1.23.1...v1.23.2) (2022-05-28)

## [1.23.1](https://github.com/antongolub/npm-registry-firewall/compare/v1.23.0...v1.23.1) (2022-05-14)


### Bug Fixes

* **types:** fix `createLogger` iface ([9129f76](https://github.com/antongolub/npm-registry-firewall/commit/9129f7611b78e2ec8d7172c7b5d6c7f85dc4eae2))

# [1.23.0](https://github.com/antongolub/npm-registry-firewall/compare/v1.22.1...v1.23.0) (2022-04-30)


### Features

* provide cond option for std plugin ([d2e8e8b](https://github.com/antongolub/npm-registry-firewall/commit/d2e8e8b475fc8688ba65b9301dc16200a4183e20)), closes [#41](https://github.com/antongolub/npm-registry-firewall/issues/41)

## [1.22.1](https://github.com/antongolub/npm-registry-firewall/compare/v1.22.0...v1.22.1) (2022-04-29)

# [1.22.0](https://github.com/antongolub/npm-registry-firewall/compare/v1.21.0...v1.22.0) (2022-04-29)


### Features

* support `presets` as string[] ([f8ca3c0](https://github.com/antongolub/npm-registry-firewall/commit/f8ca3c075e45d3930edf1b3692a910e234cc03bd))

# [1.21.0](https://github.com/antongolub/npm-registry-firewall/compare/v1.20.3...v1.21.0) (2022-04-29)


### Features

* support `.c?js` for configs ([3cfad7d](https://github.com/antongolub/npm-registry-firewall/commit/3cfad7d40c7692ad5887bc7c2200b58cb8b6e581)), closes [#38](https://github.com/antongolub/npm-registry-firewall/issues/38)

## [1.20.3](https://github.com/antongolub/npm-registry-firewall/compare/v1.20.2...v1.20.3) (2022-04-29)

## [1.20.2](https://github.com/antongolub/npm-registry-firewall/compare/v1.20.1...v1.20.2) (2022-04-29)


### Bug Fixes

* **config:** normalize `registry` and `entrypoint` fields ([4b3c94c](https://github.com/antongolub/npm-registry-firewall/commit/4b3c94c45cb8b79df7845417487d79bc554ae549))

## [1.20.1](https://github.com/antongolub/npm-registry-firewall/compare/v1.20.0...v1.20.1) (2022-04-28)


### Bug Fixes

* handle packument CL and TE headers clash ([e11eebb](https://github.com/antongolub/npm-registry-firewall/commit/e11eebbc96a1b5ab61ceef758062f87682eea924))

# [1.20.0](https://github.com/antongolub/npm-registry-firewall/compare/v1.19.0...v1.20.0) (2022-04-27)


### Features

* provide configurable cacheFactory ([afb23c0](https://github.com/antongolub/npm-registry-firewall/commit/afb23c039795716f2d7e8564abc2bac05cda4fb7)), closes [#30](https://github.com/antongolub/npm-registry-firewall/issues/30) [#33](https://github.com/antongolub/npm-registry-firewall/issues/33)

# [1.19.0](https://github.com/antongolub/npm-registry-firewall/compare/v1.18.0...v1.19.0) (2022-04-21)


### Features

* add `preset` alias for `extends` ([41a50ac](https://github.com/antongolub/npm-registry-firewall/commit/41a50acd666fdef01c4700748a41e85deef82381)), closes [#22](https://github.com/antongolub/npm-registry-firewall/issues/22)

# [1.18.0](https://github.com/antongolub/npm-registry-firewall/compare/v1.17.0...v1.18.0) (2022-04-19)


### Features

* match org w/o @ prefix ([2faba25](https://github.com/antongolub/npm-registry-firewall/commit/2faba2555919c95625c9164aa28e2b8768a42f8d)), closes [#21](https://github.com/antongolub/npm-registry-firewall/issues/21)

# [1.17.0](https://github.com/antongolub/npm-registry-firewall/compare/v1.16.0...v1.17.0) (2022-04-18)


### Features

* support custom log formatters ([d9b9f3c](https://github.com/antongolub/npm-registry-firewall/commit/d9b9f3c67aa73f3922273394b71d8478ea9ccc05))

# [1.16.0](https://github.com/antongolub/npm-registry-firewall/compare/v1.15.0...v1.16.0) (2022-04-18)


### Features

* **config:** let version be part of name ([2e2bb91](https://github.com/antongolub/npm-registry-firewall/commit/2e2bb910020e8db3d9e3172a767b857ede160a14)), closes [#23](https://github.com/antongolub/npm-registry-firewall/issues/23)
* **config:** support regexp for username, license, name, org ([39188b3](https://github.com/antongolub/npm-registry-firewall/commit/39188b334875bd91f3faf5b5d168c6f760da39f6))

# [1.15.0](https://github.com/antongolub/npm-registry-firewall/compare/v1.14.2...v1.15.0) (2022-04-17)


### Features

* configurable `logger` ([7a2d4fb](https://github.com/antongolub/npm-registry-firewall/commit/7a2d4fbdef6af2ff8f186762318a042059554a96))


### Performance Improvements

* print error stacktrace ([dcab6f1](https://github.com/antongolub/npm-registry-firewall/commit/dcab6f15e72eab17d74ef1e7c3fe2d7f0365e6c9))

## [1.14.2](https://github.com/antongolub/npm-registry-firewall/compare/v1.14.1...v1.14.2) (2022-04-17)

## [1.14.1](https://github.com/antongolub/npm-registry-firewall/compare/v1.14.0...v1.14.1) (2022-04-17)


### Bug Fixes

* **audit:** fix severity range match ([39a6369](https://github.com/antongolub/npm-registry-firewall/commit/39a636923ee8b852716e95c72bfd452588b65a4f))

# [1.14.0](https://github.com/antongolub/npm-registry-firewall/compare/v1.13.1...v1.14.0) (2022-04-17)


### Features

* turn on `gzip` ([573d867](https://github.com/antongolub/npm-registry-firewall/commit/573d86760d5a7ff68ce31756dab9f8b82b7931d4)), closes [#25](https://github.com/antongolub/npm-registry-firewall/issues/25)

## [1.13.1](https://github.com/antongolub/npm-registry-firewall/compare/v1.13.0...v1.13.1) (2022-04-17)

# [1.13.0](https://github.com/antongolub/npm-registry-firewall/compare/v1.12.1...v1.13.0) (2022-04-17)


### Features

* add audit plugin ([f186feb](https://github.com/antongolub/npm-registry-firewall/commit/f186feb0542e413fc3eb71e412b7bd0e84e09caf)), closes [#20](https://github.com/antongolub/npm-registry-firewall/issues/20)
* provide plugin API ([9cc3f9b](https://github.com/antongolub/npm-registry-firewall/commit/9cc3f9b9cf7e2cb51cd8209d9463bd8a9f06c9d1))


### Performance Improvements

* cache improvements, share firewall instances between routes ([6361d6c](https://github.com/antongolub/npm-registry-firewall/commit/6361d6c6b59219fd7a84c117ec490b23473493d8))

## [1.12.1](https://github.com/antongolub/npm-registry-firewall/compare/v1.12.0...v1.12.1) (2022-04-16)

# [1.12.0](https://github.com/antongolub/npm-registry-firewall/compare/v1.11.0...v1.12.0) (2022-04-16)


### Bug Fixes

* update ts libdefs, support `extends` for config top level ([30a2324](https://github.com/antongolub/npm-registry-firewall/commit/30a23245702060d2f0d3de36b970ec7ccad4f0af))


### Features

* expose basic metrics — uptime, cpu, mem usage ([e40bdde](https://github.com/antongolub/npm-registry-firewall/commit/e40bdde7a3b55b12342be231f18c0bcf5fe240d7))

# [1.11.0](https://github.com/antongolub/npm-registry-firewall/compare/v1.10.0...v1.11.0) (2022-04-16)


### Features

* provide `extends` for configs ([187fa24](https://github.com/antongolub/npm-registry-firewall/commit/187fa242abc5e35acaf0758375c4f138c428b1cc)), closes [#12](https://github.com/antongolub/npm-registry-firewall/issues/12)

# [1.10.0](https://github.com/antongolub/npm-registry-firewall/compare/v1.9.2...v1.10.0) (2022-04-16)


### Bug Fixes

* fix cache config init ([e6f95d8](https://github.com/antongolub/npm-registry-firewall/commit/e6f95d8bf73ef1e6bab50442d2d332d2324d812e))
* fix rules resolver for multi-config ([f800a31](https://github.com/antongolub/npm-registry-firewall/commit/f800a31e6314be8bf9d4efb2ced0f9502b68c7fd))
* **type:** allow `warn` policy ([254029d](https://github.com/antongolub/npm-registry-firewall/commit/254029d6568cdea2b96aaac8985d89aef04c2a34))


### Features

* add cache for resolved directives ([836a4c4](https://github.com/antongolub/npm-registry-firewall/commit/836a4c46f852a3a61f76c1427c5bf4e674f3c54d)), closes [#14](https://github.com/antongolub/npm-registry-firewall/issues/14)

## [1.9.2](https://github.com/antongolub/npm-registry-firewall/compare/v1.9.1...v1.9.2) (2022-04-15)

## [1.9.1](https://github.com/antongolub/npm-registry-firewall/compare/v1.9.0...v1.9.1) (2022-04-14)

# [1.9.0](https://github.com/antongolub/npm-registry-firewall/compare/v1.8.0...v1.9.0) (2022-04-14)


### Bug Fixes

* fix run on windows ([74c29a0](https://github.com/antongolub/npm-registry-firewall/commit/74c29a0b690a3cc8e90c106f293989a265b1de72))


### Features

* add custom `filter` ([e6ef827](https://github.com/antongolub/npm-registry-firewall/commit/e6ef82734da4d2725e9e48a8dc6a0e82e38def7b)), closes [#11](https://github.com/antongolub/npm-registry-firewall/issues/11)
* let `filter` be acync ([6777474](https://github.com/antongolub/npm-registry-firewall/commit/6777474433778158efbb1035def821d0c38dd81a)), closes [#11](https://github.com/antongolub/npm-registry-firewall/issues/11)

# [1.8.0](https://github.com/antongolub/npm-registry-firewall/compare/v1.7.0...v1.8.0) (2022-04-13)


### Features

* introduce `warn` directive ([ceef817](https://github.com/antongolub/npm-registry-firewall/commit/ceef817b704cf9a1a8159b8ecf2cba45f979f8c3))

# [1.7.0](https://github.com/antongolub/npm-registry-firewall/compare/v1.6.0...v1.7.0) (2022-04-13)


### Features

* add token auth ([8c0606b](https://github.com/antongolub/npm-registry-firewall/commit/8c0606b8f640b44c17c3de2d138816f695c50728))

# [1.6.0](https://github.com/antongolub/npm-registry-firewall/compare/v1.5.0...v1.6.0) (2022-04-13)


### Features

* add configurable entrypoint for tarballs ([06784d7](https://github.com/antongolub/npm-registry-firewall/commit/06784d77687e849d5710841921a260189cce078b))

# [1.5.0](https://github.com/antongolub/npm-registry-firewall/compare/v1.4.6...v1.5.0) (2022-04-13)


### Bug Fixes

* **firewall:** fix filter by name ([6bbdbb0](https://github.com/antongolub/npm-registry-firewall/commit/6bbdbb04fca1351f907db2b9a38adac92ea6ddcd))


### Features

* add filter by age ([59a1c7b](https://github.com/antongolub/npm-registry-firewall/commit/59a1c7b211353c245b74217eba7b00d2aa548c3c))

## [1.4.6](https://github.com/antongolub/npm-registry-firewall/compare/v1.4.5...v1.4.6) (2022-04-12)


### Performance Improvements

* ci tweak ups ([e709abd](https://github.com/antongolub/npm-registry-firewall/commit/e709abde2f9c10da07bd7e47a9cc22ec429a7779))

## [1.4.5](https://github.com/antongolub/npm-registry-firewall/compare/v1.4.4...v1.4.5) (2022-04-12)


### Performance Improvements

* tech release ([301ebf3](https://github.com/antongolub/npm-registry-firewall/commit/301ebf39c9456a05dbadd114665eabae2a168968))

## [1.4.4](https://github.com/antongolub/npm-registry-firewall/compare/v1.4.3...v1.4.4) (2022-04-12)


### Performance Improvements

* tech release ([5c6ce4d](https://github.com/antongolub/npm-registry-firewall/commit/5c6ce4d9d328a7462f7da5d07ba2c38369796d9e))

## [1.4.3](https://github.com/antongolub/npm-registry-firewall/compare/v1.4.2...v1.4.3) (2022-04-12)

## [1.4.2](https://github.com/antongolub/npm-registry-firewall/compare/v1.4.1...v1.4.2) (2022-04-12)

## [1.4.1](https://github.com/antongolub/npm-registry-firewall/compare/v1.4.0...v1.4.1) (2022-04-12)
