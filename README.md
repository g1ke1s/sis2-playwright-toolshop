# SIS 2 — Playwright tests for the Toolshop

[![Playwright Tests](https://github.com/g1ke1s/sis2-playwright-toolshop/actions/workflows/playwright.yml/badge.svg?branch=main)](https://github.com/g1ke1s/sis2-playwright-toolshop/actions/workflows/playwright.yml)

Automated acceptance tests for <https://practicesoftwaretesting.com>, written in
TypeScript with Playwright Test.

- **What is tested and why:** [Description.md](Description.md)
- **AI prompt and tool:** [Prompt.md](Prompt.md)
- **AI review and corrections:** [Review.md](Review.md)
- **AI use for the CI part:** [CI-AI.md](CI-AI.md)
- **Screenshots:** [screenshots/](screenshots)

## Run it

```bash
npm install            # also installs Chromium (postinstall)
npx playwright test    # 5 suites, 11 tests, parallel
npx playwright show-report
```

Other targets:

```bash
# a local Toolshop (docker / source) — or any other build, e.g. the with-bugs one
# (set API_URL to the API that build uses)
BASE_URL=http://localhost:4200 API_URL=http://localhost:8091 npx playwright test
```

## Results

![HTML report](screenshots/html-result.png)

## CI

[![Playwright Tests](https://github.com/g1ke1s/sis2-playwright-toolshop/actions/workflows/playwright.yml/badge.svg?branch=main)](https://github.com/g1ke1s/sis2-playwright-toolshop/actions/workflows/playwright.yml)

**CI system:** GitHub Actions. The repository already lives on GitHub, so it
needs no server of its own, it is free for public repositories, and its job
matrix gives sharding with a few lines of YAML.

**Pipeline** (`.github/workflows/playwright.yml`):

- runs on every push and every pull request (no branch filter), plus manual
  runs (`workflow_dispatch`) for the timing below;
- **target:** a local Toolshop started in Docker inside every shard
  (`ci/toolshop.compose.yml`, official prebuilt `sprint5` images, freshly seeded
  by `ci/wait-toolshop.sh`). The public site is behind a Cloudflare bot check:
  from GitHub runners every test that signs in landed on *"Performing security
  verification"* and failed (the old single-job workflow on `main` was red for
  this reason). A local copy also gives every shard its own clean data;
- `actions/setup-node` with `cache: npm`, then `npm ci`, then
  `npx playwright install --with-deps chromium`, then `tsc` type-check;
- the full suite with no filters, split into 4 shards (`--shard=i/4`)
  running in parallel (`fail-fast: false`, so one red shard does not cancel the others);
- the `Merge reports` job merges the shards' blob reports into one HTML
  report and one JUnit file;
- artefacts, uploaded even when tests fail: `playwright-report` (HTML),
  `test-results-N` (traces, screenshots, videos, per-shard JUnit),
  `junit-report` (merged JUnit); kept for **14 days**.
- a newer push to the same branch cancels the outdated run (`concurrency`).

**CI settings** (`playwright.config.ts`, when `CI=true`): `forbidOnly: true`,
`retries: 2`, `workers: 2`, reporters `list` + `blob` + `junit`
(`reports/junit.xml`); `trace: 'on-first-retry'`, screenshot and video on failure.
Locally (no `CI`) the config keeps the `html` reporter and no retries.
`merge.config.ts` builds the merged report.

Locally the tests still default to the public site; `BASE_URL` / `API_URL`
point them anywhere else (e.g. the same Docker Toolshop:
`docker compose -f ci/toolshop.compose.yml up -d && bash ci/wait-toolshop.sh`,
then `BASE_URL=http://localhost:4200 API_URL=http://localhost:8091 npx playwright test`).

Green runs have no traces (`on-first-retry`); [this demo run](https://github.com/g1ke1s/sis2-playwright-toolshop/actions/runs/42754081413) from
branch `ci/trace-demo` has a flaky test with a trace in `test-results-1`.
To open a trace: download `test-results-N`, then
`npx playwright show-trace <path>/trace.zip`, or drop the file on
<https://trace.playwright.dev>.

### Runtime

"Before" = the same workflow with 1 shard, "after" = 4 shards. Both come from
GitHub Actions: *Actions → Playwright Tests → Run workflow*, `shards` = `1` or `4`.

| Configuration | Total run time | Run tests step (slowest shard) | Run |
| --- | --- | --- | --- |
| 1 job, no sharding | 1 min 39 s | 12 s | [run](https://github.com/g1ke1s/sis2-playwright-toolshop/actions/runs/42753169583) |
| 4 shards + merge | 1 min 47 s | 9 s | [run](https://github.com/g1ke1s/sis2-playwright-toolshop/actions/runs/42753360393) |

Median of 3 `workflow_dispatch` runs per configuration (10 Nov 2026).
All runs: 1 shard — 5 min 24 s, [1 min 39 s](https://github.com/g1ke1s/sis2-playwright-toolshop/actions/runs/42753169583), [1 min 34 s](https://github.com/g1ke1s/sis2-playwright-toolshop/actions/runs/42753584569);
4 shards — 6 min 26 s, [1 min 47 s](https://github.com/g1ke1s/sis2-playwright-toolshop/actions/runs/42753360393), [1 min 31 s](https://github.com/g1ke1s/sis2-playwright-toolshop/actions/runs/42753783059).
The two first runs were slow because the browser download took up to 5 minutes on
one runner; the median ignores that outlier.

**Conclusion:** sharding cut the test step itself from 12 s to 9 s, but the total
run time did not drop (1 min 39 s → 1 min 47 s): the 11 tests take about 12 s, while
every shard repeats ~1 min of setup (Toolshop containers, `npm ci`, Chromium) and the
merge job adds ~15 s. For a suite this small one job is enough; sharding pays off
once the tests themselves take several minutes.

### Running the CI mode locally

```bash
npm ci
npx playwright install --with-deps chromium
CI=true npx playwright test                 # PowerShell: $env:CI="true"; npx playwright test

# shards + merge, as in CI
mkdir -p all-blob-reports
CI=true npx playwright test --shard=1/2; cp blob-report/*.zip all-blob-reports/
CI=true npx playwright test --shard=2/2; cp blob-report/*.zip all-blob-reports/
npx playwright merge-reports --config merge.config.ts ./all-blob-reports
npx playwright show-report
```
