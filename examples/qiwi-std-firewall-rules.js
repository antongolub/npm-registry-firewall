export default [
  { policy: 'deny', 'name': 'node-ipc', 'version': '>=10.1.1' },  // https://snyk.io/vuln/npm%3Anode-ipc
  { policy: 'deny', 'name': 'colors', 'version': '>1.4.0' },      // https://snyk.io/vuln/npm%3Acolors
  { policy: 'deny', 'name': 'faker', 'version': '>5.5.3' },       // https://blog.sonatype.com/npm-libraries-colors-and-faker-sabotaged-in-protest-by-their-maintainer-what-to-do-now
  { policy: 'allow', org: ['@qiwi', '@types'] },
  { policy: 'allow', username: ['antongolub', 'qiwibot'] },       // Trusted npm authors.
  { policy: 'deny', age: [0, 60] },
  { plugin: ['npm-registry-firewall/audit', { 'moderate': 'warn', critical: 'deny' }] },
]
