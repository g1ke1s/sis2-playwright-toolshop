import { test, expect } from '../fixtures/pages.fixture';
import { RegisterPage } from '../pages/register.page';
import { AccountPage } from '../pages/account.page';
import { newUser } from '../data/user.factory';

test.describe('TC-01 Register a new customer', () => {
  test('a unique new customer can register and then sign in with the new account', async ({ registerPage, loginPage, accountPage, freshUser: user, page }) => {

    await registerPage.open();
    await registerPage.register(user);

    // Successful registration redirects to the login page …
    await expect(page).toHaveURL(RegisterPage.loginUrl);

    // … and the account really exists: its credentials open the account page.
    await loginPage.signIn(user);
    await expect(page).toHaveURL(AccountPage.url);
    await expect(accountPage.userMenu).toContainText(`${user.firstName} ${user.lastName}`);
  });

  test('registering with an e-mail that is already used is rejected', async ({ registerPage, registeredUser, page }) => {
    const duplicate = newUser({ email: registeredUser.email });

    await registerPage.open();
    await registerPage.register(duplicate);

    await expect(registerPage.error).toBeVisible();
    await expect(registerPage.error).toContainText(/already exists/i);
    await expect(page).not.toHaveURL(RegisterPage.loginUrl);
  });

  test('submitting an empty form shows required-field errors and creates nothing', async ({ registerPage, page }) => {
    await registerPage.open();
    await registerPage.submit.click();

    await expect(registerPage.firstNameError).toBeVisible();
    await expect(registerPage.emailError).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/register$/);
  });
});
