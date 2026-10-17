import { defineConfig, devices } from '@playwright/test';

/**
 * BASE_URL / API_URL can be overridden (e.g. to run against a local Toolshop
 * or the deliberately buggy build). Defaults point at the public site.
 */
export const BASE_URL = process.env.BASE_URL ?? 'https://practicesoftwaretesting.com';
export const API_URL = process.env.API_URL ?? 'https://api.practicesoftwaretesting.com';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,           // 4. retry in CI only
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: BASE_URL,                       // 1. relative goto()
    testIdAttribute: 'data-test',            // 2. getByTestId -> data-test
    trace: 'on-first-retry',                 // 3. a recording when it fails
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
