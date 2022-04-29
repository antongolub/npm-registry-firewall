module.exports = [
  {
    server: [
      {port: 3001},
    ],
    firewall: {
      base: '/npmmirror',
      registry: 'https://registry.npmmirror.com',
    }
  },
  {
    server: [
      {port: 3002},
    ],
    firewall: {
      base: '/cnpmjs',
      registry: 'https://r.cnpmjs.org',
    }
  },
  {
    server: {port: 3003},
    firewall: [
      {base: '/npmjs', registry: 'https://registry.npmjs.org'},
      {base: '/yarnpkg', registry: '/https://registry.yarnpkg.com'}
    ]
  }
]
