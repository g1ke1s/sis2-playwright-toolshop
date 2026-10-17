import { test, expect } from '../fixtures/pages.fixture';
import { AccountPage } from '../pages/account.page';
import { RESET_PASSWORD, unknownEmail } from '../data/user.factory';

test.describe('TC-05 Reset a password', () => {
  test('a known e-mail gets the confirmation, and the reset password then works', async ({
    forgotPasswordPage, loginPage, registeredUser, page,
  }) => {
    await forgotPasswordPage.open();
    await forgotPasswordPage.requestReset(registeredUser.email);

    await expect(forgotPasswordPage.confirmation).toBeVisible();
    await expect(forgotPasswordPage.serverError).toHaveCount(0);

    // Prove the reset really happened: the Toolshop sets the password to a known value.
    await loginPage.open();
    await loginPage.signIn({ email: registeredUser.email, password: RESET_PASSWORD });
    await expect(page).toHaveURL(AccountPage.url);
  });

  test('an e-mail that belongs to no account is rejected with an error', async ({ forgotPasswordPage }) => {
    await forgotPasswordPage.open();
    await forgotPasswordPage.requestReset(unknownEmail());

    await expect(forgotPasswordPage.serverError).toBeVisible();
    await expect(forgotPasswordPage.confirmation).toHaveCount(0);
  });

  test('a malformed e-mail is blocked before reaching the server', async ({ forgotPasswordPage }) => {
    await forgotPasswordPage.open();
    await forgotPasswordPage.requestReset('not-an-email');

    await expect(forgotPasswordPage.emailError).toBeVisible();
    await expect(forgotPasswordPage.confirmation).toHaveCount(0);
  });
});
