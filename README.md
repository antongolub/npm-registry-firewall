# npm-registry-firewall
nodejs-based npm registry proxy with on-the-fly filtering

## Motivation
Open Source is essential for modern software development. [According to various estimates](https://www.perforce.com/blog/vcs/using-open-source-code-in-proprietary-software), at least 60% of the resulting codebase is composed of open repositories, libraries and packages. And keeps growing. [Synopsys OSSRA 2021 report](https://www.synopsys.com/content/dam/synopsys/sig-assets/reports/rep-ossra-2021.pdf) found that 98% of applications have open source components.

But _open_ does not mean _free_. The price is the risk that you take:
* Availability
* Security 
* Legality / license

Let's consider these problems in the context of the JS universe.

### Availability
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
we just need to save and expose these assets from an alternative entry point. Luckily this has already happened.
The main repository for JS code is [registry.npmjs.org](https://registry.npmjs.org/). 
And at least 4 public replicas are always available as alternatives:
* [https://registry.yarnpkg.com](https://registry.yarnpkg.com/)
* [https://r.cnpmjs.org/](https://r.cnpmjs.org/)
* [https://skimdb.npmjs.com/registry/](https://skimdb.npmjs.com/registry/)
* [https://registry.npm.taobao.org/](https://registry.npm.taobao.org/)

If this reliability level is not enough, you easily run your own registry:
* [sonatype-nexus](https://help.sonatype.com/repomanager3/nexus-repository-administration/formats/npm-registry)
* [verdaccio.org](https://verdaccio.org/)

### Security 
