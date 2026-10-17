import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

/** Checkout step 1 — the cart table. */
export class CartPage extends BasePage {
  readonly productTitles: Locator;
  readonly quantities: Locator;
  readonly linePrices: Locator;
  readonly total: Locator;
  readonly proceed: Locator;

  constructor(page: Page) {
    super(page);
    this.productTitles = page.getByTestId('product-title');
    this.quantities = page.getByTestId('product-quantity');
    this.linePrices = page.getByTestId('line-price');
    this.total = page.getByTestId('cart-total');
    this.proceed = page.getByTestId('proceed-1');
  }

  async proceedToCheckout(): Promise<void> {
    await this.proceed.click();
  }
}
