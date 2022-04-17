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
