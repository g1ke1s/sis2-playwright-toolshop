# Prompt.md

## Tool

| | |
|---|---|
| Tool | Claude (claude.ai, agent mode with code execution) |
| Model | Claude Opus 5.5 |
| Effort | Medium effort |
| Attachment | `Week_6_Masters_ST.pptx` (lecture slides with the SIS 2 brief) |
| AI level | Level 1: allowed and disclosed; I review and correct the output (see Review.md) |

## Prompt (exactly as sent)

```text
You are helping me with a university assignment in software testing.
I attached the lecture slides; slides 19–30 contain the rules and the grading criteria.

Task: build a Playwright test suite in TypeScript for https://practicesoftwaretesting.com
(the Toolshop: Angular UI + REST API at https://api.practicesoftwaretesting.com).

Automate these 5 test cases, one spec file each:
1. Register a new customer — a unique account is created and the user ends up signed in or on the login page
2. Log in — valid credentials reach the account page; invalid ones show the error and do not
3. Buy a product — add to cart → cart shows the right item and quantity → checkout completes
4. Compare two products — open two products, capture name and price, assert a stated comparison
5. Reset a password — known e-mail gets a confirmation, invalid e-mail gets an error
```

## Why I wrote the prompt this way

- **I attached the slides and pointed to slides 19–30.** That way the AI could
  read the rules and grading criteria itself instead of me paraphrasing them.
- **I named the stack and both URLs (UI + API).** The AI then knew it could use
  the REST API to set up test data.
- **I wrote each test case with its expected outcome.** That steers the AI
  towards real assertions, not just clicking through pages.
- **I asked for one spec file per case.** That keeps the 5 suites separate and
  easy to grade.
