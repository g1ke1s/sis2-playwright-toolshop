import { defineConfig, devices } from '@playwright/test';

/**
 * BASE_URL / API_URL can be overridden (e.g. to run against a local Toolshop
 * or the deliberately buggy build). Defaults point at the public site.
 * `||` (not `??`) so an empty value — what GitHub passes for an unset
 * `vars.BASE_URL` — also falls back to the default.
 */
export const BASE_URL = process.env.BASE_URL || 'https://practicesoftwaretesting.com';
export const API_URL = process.env.API_URL || 'https://api.practicesoftwaretesting.com';

/** All CI behaviour is switched on by one variable: GitHub Actions sets CI=true. */
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,                       // shards split tests, not whole files
  forbidOnly: isCI,                          // a forgotten test.only fails CI
  retries: isCI ? 2 : 0,                     // a flaky test is marked flaky, not red
  workers: isCI ? 2 : undefined,             // GitHub runners have 2–4 vCPUs
  reporter: isCI
    ? [
        ['list'],
        ['blob'],                                          // merged across shards
        ['junit', { outputFile: 'reports/junit.xml' }],
      ]
    : [['list'], ['html', { open: 'never' }]],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: BASE_URL,                       // relative goto()
    testIdAttribute: 'data-test',            // getByTestId -> data-test
    trace: 'on-first-retry',                 // trace of exactly the failed attempt
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
