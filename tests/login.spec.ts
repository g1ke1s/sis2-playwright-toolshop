import { test, expect } from '../fixtures/pages.fixture';
import { AccountPage } from '../pages/account.page';

test.describe('TC-02 Log in', () => {
  test('valid credentials open the account page', async ({ loginPage, accountPage, registeredUser, page }) => {
    await loginPage.open();
    await loginPage.signIn(registeredUser);

    await expect(page).toHaveURL(AccountPage.url);
    await expect(accountPage.title).toHaveText('My account');
    await expect(accountPage.userMenu).toContainText(registeredUser.firstName);
  });

  test('a wrong password shows an error and does not sign in', async ({ loginPage, registeredUser, page }) => {
    await loginPage.open();
    await loginPage.signIn({ email: registeredUser.email, password: 'Wrong!Password1' });

    await expect(loginPage.error).toHaveText(/invalid email or password/i);
    await expect(page).not.toHaveURL(AccountPage.url);
    await expect(loginPage.signInLink).toBeVisible();
  });

  test('empty credentials are blocked by client-side validation', async ({ loginPage, page }) => {
    await loginPage.open();
    await loginPage.submitEmpty();

    await expect(loginPage.emailError).toBeVisible();
    await expect(loginPage.passwordError).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/login$/);
  });
});
