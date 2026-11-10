// Used by `npx playwright merge-reports --config merge.config.ts <blob dir>`
// to build one HTML report and one JUnit file from all shards.
export default {
  testDir: './tests',
  reporter: [
    ['html', { open: 'never' }],
    ['junit', { outputFile: 'reports/junit-merged.xml' }],
  ],
};
