const config = {
  appId: 'com.focusdashboard.app',
  productName: '集中度ダッシュボード',
  directories: {
    output: 'release',
  },
  files: [
    'dist/**/*',
    'dist-electron/**/*',
    'node_modules/**/*',
    '!node_modules/**/test/**/*',
    '!node_modules/**/*.d.ts',
  ],
  extraResources: [
    {
      from: 'public',
      to: 'public',
      filter: ['**/*'],
    },
  ],
  mac: {
    category: 'public.app-category.productivity',
    target: [
      {
        target: 'dmg',
        arch: ['x64', 'arm64'],
      },
    ],
  },
  win: {
    target: [
      {
        target: 'nsis',
        arch: ['x64'],
      },
    ],
  },
  linux: {
    target: [
      {
        target: 'AppImage',
        arch: ['x64'],
      },
    ],
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
  },
};

module.exports = config;