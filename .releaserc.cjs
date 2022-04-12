module.exports = {
  branch: 'master',
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'angular',
        releaseRules: [
          {type: 'docs', release: 'patch'},
          {type: 'refactor', release: 'patch'},
        ],
        parserOpts: {
          noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES']
        }
      }
    ],
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    [
      '@qiwi/semrel-metabranch',
      {
        publish: {
          action: 'push',
          branch: 'gh-pages',
          from: './docs',
          to: './',
          message: 'update docs ${nextRelease.gitTag}',
        }
      }
    ],
    '@semantic-release/npm',
    '@semantic-release/github',
    '@semantic-release/git'
  ]
}
