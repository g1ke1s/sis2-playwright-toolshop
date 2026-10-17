import { Locator, Page } from '@playwright/test';

/** Elements shared by every screen: the top navigation bar. */
export abstract class BasePage {
  readonly userMenu: Locator;
  readonly cartBadge: Locator;
  readonly signInLink: Locator;

  constructor(protected readonly page: Page) {
    this.userMenu = page.getByTestId('nav-menu');
    this.cartBadge = page.getByTestId('cart-quantity');
    this.signInLink = page.getByTestId('nav-sign-in');
  }

  async openCart(): Promise<void> {
    await this.page.getByTestId('nav-cart').click();
  }
}
