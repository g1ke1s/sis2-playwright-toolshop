# Description — SIS 2: Test Automation with Playwright

**Application under test:** Toolshop — <https://practicesoftwaretesting.com>
**Stack:** TypeScript · `@playwright/test` 1.56 · Chromium
**Author:** Kenessary Garifulla

## Goal

I want to automate the five acceptance scenarios from the SIS 2 brief as a
suite that:

- runs from a clean clone with `npm install` and `npx playwright test`,
- uses page objects, so no locator appears in a spec file,
- passes page objects and test data to the tests through fixtures,
- generates unique data on every run, so no test depends on another one or on
  the order the tests run in,
- passes when run in parallel,
- asserts on outcomes (URLs, texts, values), so every test can actually fail.

## Approach

- **Locators:** I use `data-test` attributes (the config sets
  `testIdAttribute: 'data-test'`), ARIA roles and visible text. I don't use
  CSS classes, positional XPath or `waitForTimeout`.
- **Test data:** a factory creates a new customer with a unique e-mail and
  password on every call. Only the registration test registers through the UI.
  Every other test gets its customer from the REST API in a fixture. That is
  faster, and a broken registration page cannot break the other suites.
- **Seeded accounts:** I don't use them. The reset-password flow changes the
  account's password, so it would break any parallel test that uses the same
  account.

## Test cases to automate

| Suite | ID | Test case | Expected result |
|---|---|---|---|
| **TC-01 Register** | 01.1 | Register a unique new customer | Redirect to the login page. The new credentials then open `/account`, and the header shows the customer's name. |
| | 01.2 | Register with an e-mail that is already used | An "already exists" error is shown and there is no redirect. |
| | 01.3 | Submit an empty form | Required-field errors are shown and the page stays on `/auth/register`. |
| **TC-02 Log in** | 02.1 | Valid credentials | URL is `/account`, the page title is "My account", the header shows the first name. |
| | 02.2 | Wrong password | The error "Invalid email or password" is shown and the user is not signed in. |
| | 02.3 | Empty credentials | E-mail and password validation errors are shown. |
| **TC-03 Buy a product** | 03.1 | Add an in-stock product with quantity 2, then check out (sign in → address → Cash on Delivery → confirm) | Cart badge shows 2. The cart line has the right name, quantity 2 and price = 2 × unit price. "Payment was successful" is shown, then an invoice number `INV-…`. |
| **TC-04 Compare two products** | 04.1 | Open Combination Pliers and Pliers, capture name and price, add both to the comparison | Combination Pliers costs more than Pliers. The comparison table shows the same names and prices. |
| **TC-05 Reset a password** | 05.1 | Use the forgot-password form with a known e-mail | A confirmation is shown. The customer can then sign in with the reset password. |
| | 05.2 | Use an e-mail that belongs to no account | An error is shown and there is no confirmation. |
| | 05.3 | Use a malformed e-mail | A client-side validation error is shown. |

**Total:** 5 suites, 11 tests.

## Out of scope

- **Social login and 2FA:** they depend on third-party services or devices.
- **Other payment methods:** they follow the same flow as Cash on Delivery, so one payment path is enough to prove checkout works.
- **Admin, favourites and contact form:** they are not among the five required cases.
- **Cross-browser runs:** the suite uses Chromium only. Adding Firefox or WebKit is one line in the config.
