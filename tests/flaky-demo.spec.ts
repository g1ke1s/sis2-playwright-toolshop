import { test, expect } from '@playwright/test';

// DEMO ONLY (branch ci/trace-demo, not merged): fails on the first attempt and
// passes on the retry, so CI marks it "flaky" and records a trace of the retry.
test('demo: fails on the first attempt only → flaky + trace', async ({ page }, testInfo) => {
  await page.goto('/');
  expect(testInfo.retry, 'deliberate failure on the first attempt').toBeGreaterThan(0);
});
