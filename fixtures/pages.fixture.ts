import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { RegisterPage } from '../pages/register.page';
import { AccountPage } from '../pages/account.page';
import { ForgotPasswordPage } from '../pages/forgot-password.page';
import { ProductPage } from '../pages/product.page';
import { CartPage } from '../pages/cart.page';
import { CheckoutPage } from '../pages/checkout.page';
import { newUser, User } from '../data/user.factory';
import { registerViaApi, withLookedUpAddress } from '../data/api';

type Fixtures = {
  loginPage: LoginPage;
  registerPage: RegisterPage;
  accountPage: AccountPage;
  forgotPasswordPage: ForgotPasswordPage;
  productPage: ProductPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  /** Unique customer data for this test — NOT registered yet (for the registration test). */
  freshUser: User;
  /** A brand-new customer that exists only for this test (created via the API). */
  registeredUser: User;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => { await use(new LoginPage(page)); },
  registerPage: async ({ page }, use) => { await use(new RegisterPage(page)); },
  accountPage: async ({ page }, use) => { await use(new AccountPage(page)); },
  forgotPasswordPage: async ({ page }, use) => { await use(new ForgotPasswordPage(page)); },
  productPage: async ({ page }, use) => { await use(new ProductPage(page)); },
  cartPage: async ({ page }, use) => { await use(new CartPage(page)); },
  checkoutPage: async ({ page }, use) => { await use(new CheckoutPage(page)); },

  freshUser: async ({ request }, use) => {
    await use(await withLookedUpAddress(request, newUser()));
  },

  registeredUser: async ({ request, freshUser }, use) => {
    await registerViaApi(request, freshUser);
    await use(freshUser);
  },
});

export { expect } from '@playwright/test';
