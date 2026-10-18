# Review.md — AI output, my review and my corrections

## 1. What the AI gave me

The first draft followed the requested structure:

- `playwright.config.ts`
- 7 page objects
- a fixture file
- a user factory
- 5 spec files with **10** tests

The locators used `data-test` names, and the specs had no locators in them.

Two things the AI already got right, without me asking:

- **It avoided the seeded accounts.** It registered a fresh customer through
  the API instead of using `customer@practicesoftwaretesting.com`, for the
  reason the brief warns about: the reset-password flow sets that account's
  password to `welcome02`, which would break any other parallel run against
  the same account.
- Locators lived only in page objects, not in the specs.

I ran the draft before trusting it, and it **did not pass cleanly**. Most
tests shared one signed-in session: a `beforeAll` step registered one
customer and saved its `storageState`, and the other tests in a file reused
that session instead of signing in themselves. That broke the moment TC-05
(reset password) ran in the same file — it changes the shared account's
password mid-run, so the reused session stopped working for every test after
it, and the result depended on run order. Reading the code, the traces and
repeated parallel runs (`--repeat-each=5`) exposed the rest of the problems
below.

## 2. What I found and changed

| # | Problem | How I found it | My change and why |
|---|---|---|---|
| 1 | **The AI's "login once" setup shared a single `storageState` session across most tests in a file**, which assumes a fixed test order. TC-05 changes that shared account's password mid-run, so the reused session broke for every test after it. | I ran the draft; it failed depending on run order. | Removed the shared `storageState`/login-once setup. Added a `registeredUser` fixture that creates a fresh customer through the API for each test, so every test is independent and safe in any order or in parallel. Dropping the shared setup also removed one test case's coverage, so I added TC-01.3 (submit an empty registration form) to bring the suite back to 11 tests. |
| 2 | **The reset test only checked that some banner appeared.** That passes even if the reset did nothing. The trace also showed that the banner text is the raw key `page.forgot-password.confirm` (an app bug) and that it disappears after 3 s, so checking the text would not work either. | Reading the test, then the trace of a passing run. | The page object finds the banner as an alert that is not an error. The test then proves the reset worked by signing in with the new password. That is a stronger check than the banner text. |
| 3 | **Checkout typed the billing address, but the app re-fills it from the postcode lookup a moment later.** The order then failed with 422 ("city does not belong to country"), about 1 run in 6. | Flaky in parallel runs. I logged the API response. | The fixture builds the user's address from the same postcode lookup. The page object waits with `toHaveValue` until the form shows the saved address, then continues. No `waitForTimeout`. |
| 4 | **The buy test used a hard-coded product.** After repeated runs it went out of stock and the quantity field was disabled. On the public site every student buys from the same stock. | `--repeat-each=5` | The test picks the first in-stock product and asserts on the name and price it captures at runtime. |
| 5 | **TypeScript errors:** Node types were missing. | `npx tsc` | Added `@types/node` to the project and to tsconfig. |
| 6 | **A clean clone failed:** `npm install` does not download the browser. | Tried a fresh clone. | Added `"postinstall": "playwright install chromium"` to `package.json`. |

## 3. Things I kept on purpose

- **API for test data, UI for the behaviour under test.** Only TC-01
  registers through the UI, because registration is what it tests.
- **Extra negative cases** in TC-01, TC-02 and TC-05. A happy path alone proves
  little.

## 4. Final check against the grading criteria

| Criterion | Result |
|---|---|
| Clean clone → `npm install` → `npx playwright test` | ✅ 11/11 green |
| Page objects, no locator in specs | ✅ `grep "getByTestId\|locator(" tests/` finds nothing |
| At least one fixture | ✅ page-object fixtures + `registeredUser` |
| Unique data per run | ✅ timestamp + UUID e-mail |
| Meaningful assertions | ✅ every test asserts an outcome, not just clicks |
| No `waitForTimeout`, CSS classes or positional XPath | ✅ none |
| Any order, parallel | ✅ `--repeat-each=5 --workers=6` → 55/55 |

## 5. Bug found in the application

- **Forgot-password success banner:** it shows the untranslated key
  `page.forgot-password.confirm` instead of the message.
