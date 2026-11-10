# CI-AI.md — AI use for the SIS 2 CI pipeline

## 1. Tool

| | |
|---|---|
| Tool | Claude (claude.ai mobile app, agent mode with code execution and repository access) |
| Model | Claude Opus 5.5 |
| Inputs | The course guide *"SIS 2: CI pipeline for Playwright — step-by-step guide"* (Google Doc) and this repository |
| AI level | Level 1: AI use is allowed and disclosed. I review and correct the output (section 5) |
| Date | November 2026 |

## 2. Prompts (exactly as sent)

**Prompt 1.** A link to the course guide (Google Doc), with no other text.

> Claude read the guide, listed the six requirements and the deadline, and
> offered to write the CI files for my repository.

**Prompt 2.**

```text
https://github.com/g1ke1s/sis2-playwright-toolshop
```

> Claude cloned the repository and read the existing config, workflow and
> tests. It wrote the changes, checked them in its sandbox, and returned a
> zip with the files and a patch.

**Prompt 3.**

```text
Напиши примерный мд с ai использованием
```

(*"Write a sample md about the AI use"*.) This file is the result.

**Prompt 4.**

```text
Все сам пушь
```

(*"Push everything yourself"*.) Claude pushed the branch and opened the PR.
It found why the tests failed on GitHub (item 4 in section 3) and fixed it,
then ran the timing runs. I then filled in section 5.

## 3. What the AI produced

| File | Change | Requirement |
|---|---|---|
| `.github/workflows/playwright.yml` | Runs on `push` and `pull_request` with no branch filter. `setup-node` with `cache: npm`, `npm ci`, `playwright install --with-deps`. A 4-shard matrix with `fail-fast: false`. A `Merge reports` job. Artefacts kept 14 days. `concurrency`. A `workflow_dispatch` input `shards` (1/4). | 1, 2, 3, 5 |
| `playwright.config.ts` | When `CI` is set: `forbidOnly`, `retries: 2`, `workers: 2`, reporters `list` + `blob` + `junit`. `trace: 'on-first-retry'`, video on failure. | 3, 4 |
| `merge.config.ts` | New file: HTML and JUnit reporters for the merged report. | 3, 5 |
| `README.md` | Badge for `main`, `## CI` section, a template for the timing table. | 5, 6 |
| `ci/toolshop.compose.yml`, `ci/nginx.conf`, `ci/wait-toolshop.sh` | New: every shard starts its own Toolshop in Docker (official prebuilt `sprint5` images), seeds the database and waits until the API and the UI answer. | 2 |
| `.gitignore` | Added `reports/`, `all-blob-reports/`, `.act-artifacts/`, `.secrets`. | — |

### Where the AI went beyond the guide, and why

1. **`||` instead of `??` for `BASE_URL` / `API_URL`.** The workflow passes
   `${{ vars.BASE_URL }}`. When that variable is not set, GitHub passes an
   empty string. `??` keeps the empty string, and every relative `goto()`
   breaks. `||` falls back to the public Toolshop.
2. **`npm ci --ignore-scripts`.** My `package.json` has
   `"postinstall": "playwright install chromium"`. With plain `npm ci`,
   Chromium would download twice in every shard, and once more in the merge
   job, which needs no browser at all. The AI first tried
   `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`. It found that this variable does not
   stop an explicit `playwright install`, and dropped it.
3. **A `shards` input on `workflow_dispatch`.** The guide says to edit the
   matrix by hand for the "before" run. With the input, the "before" (1 shard)
   and "after" (4 shards) runs come from the same commit, and nothing has to
   be reverted.
4. **The CI target is a local Toolshop in Docker, not the public site.**
   The first push ran the pipeline correctly: 4 shards, a merged report, and
   all the artefacts. But 3 tests were red, and the same 3 tests had failed on
   `main` since 17 October. To see why, the AI added a temporary step that
   printed `error-context.md` into the log. The page snapshot showed
   Cloudflare's *"Performing security verification"* page instead of the
   Toolshop: the public site blocks GitHub runners. The fix was to run the
   official prebuilt images in each shard. The prebuilt `web` image is
   arm64-only and failed with `exec format error`, so it was replaced with
   plain `nginx` and the upstream vhost. The debug step was then removed.
   After that, all 11 tests passed. Run locally, the tests still default to
   the public site.
5. **I kept the existing `tsc` type-check step** in the workflow.

## 4. What the AI checked (in its sandbox)

| Check | Result |
|---|---|
| `npx tsc -p .` | no errors |
| `actionlint .github/workflows/playwright.yml` | no errors |
| `CI=true npx playwright test --list --shard=i/4` | 3 + 3 + 3 + 2 = 11 tests. `fullyParallel` splits the tests, not the files. |
| `test(` changed to `test.only(` and run with `CI=true` | fails: *"item focused with '.only' is not allowed due to the 'forbidOnly' option"* |
| 2 shards → `merge-reports --config merge.config.ts` | `playwright-report/index.html` and `reports/junit-merged.xml` with `tests="11"` |

The sandbox could not download Chromium or reach practicesoftwaretesting.com,
so the AI pushed the branch itself and read the GitHub Actions logs and
results through the API:

| Check on GitHub | Result |
|---|---|
| Runs for push and for the PR | both appear in Actions |
| Second run, `setup-node` | `Cache restored from key: node-cache-Linux-x64-npm-…` |
| Tests after the switch to the local Toolshop | 3 + 3 + 3 + 2 passed, 0 failed, 0 flaky |
| Artefacts | `playwright-report`, `junit-report`, `test-results-1…4`, `blob-report-1…4` |
| Timing | 3 × `shards=1` and 3 × `shards=4` via `workflow_dispatch`, median in README |
| `forbidOnly` | branch `ci/forbid-only-demo` with one `test.only` → run fails |

## 5. My review and verification

| # | What I checked | How | Result |
|---|---|---|---|
| 1 | I read every changed line and compared it with the guide | `git diff main` | TODO |
| 2 | A run for a push to the feature branch, and a separate run for the PR | Actions tab | [push run](https://github.com/g1ke1s/sis2-playwright-toolshop/actions/runs/42751403712), [PR run](https://github.com/g1ke1s/sis2-playwright-toolshop/actions/runs/42751410495) |
| 3 | The npm cache is restored on the second run | `setup-node` log: *"Cache restored from key …"* | yes, from the second run on |
| 4 | 4 shards run in parallel, then `Merge reports` runs | Run graph | ![run graph](screenshots/ci-run-graph.png) |
| 5 | The artefacts are there: `playwright-report`, `test-results-1…4`, `junit-report` | Run page | ![artefacts](screenshots/ci-artifacts.png) |
| 6 | A trace opens | Downloaded `test-results-N` → trace.playwright.dev | TODO |
| 7 | `forbidOnly` fails CI | Branch `ci/forbid-only-demo` with one `test.only` | [failed run](https://github.com/g1ke1s/sis2-playwright-toolshop/actions/runs/42751438450): *"item focused with '.only' is not allowed…"* |
| 8 | Before/after timing | 3 × `Run workflow` with `shards=1`, 3 × with `shards=4`, median | table in README |
| 9 | The badge shows the status of `main` | After the PR was merged | README front page |

### What I changed myself

- TODO: e.g. *"none"*, or *"changed `workers` from 2 to N because…"*,
  or *"fixed a flaky test that failed only on the Linux runner: …"*.

## 6. What I learned

- TODO, 2–3 sentences. For example: why `fullyParallel` matters for
  `--shard`, why the blob reporter is needed to merge shards, and why
  4 shards do not give a 4× speed-up with 11 tests (each shard repeats about
  a minute of setup).
