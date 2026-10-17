import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export interface ProductInfo { name: string; price: number }

/** Catalogue (home page with search) + product detail + comparison screen. */
export class ProductPage extends BasePage {
  // detail page
  readonly name: Locator;
  readonly unitPrice: Locator;
  readonly quantity: Locator;
  readonly addToCartButton: Locator;
  readonly addToCompareButton: Locator;
  readonly comparisonBar: Locator;
  // comparison page
  readonly comparisonTable: Locator;
  readonly comparedNames: Locator;
  readonly comparedPrices: Locator;

  constructor(page: Page) {
    super(page);
    this.name = page.getByTestId('product-name');
    this.unitPrice = page.getByTestId('unit-price');
    this.quantity = page.getByTestId('quantity');
    this.addToCartButton = page.getByTestId('add-to-cart');
    this.addToCompareButton = page.getByTestId('add-to-compare');
    this.comparisonBar = page.getByTestId('comparison-bar');
    this.comparisonTable = page.getByTestId('comparison-table');
    this.comparedNames = this.comparisonTable.getByTestId('product-name');
    this.comparedPrices = this.comparisonTable.getByTestId('compare-price');
  }

  /** Search the catalogue and open the product whose name matches exactly. */
  async openByName(productName: string): Promise<void> {
    await this.page.goto('/');
    await this.page.getByTestId('search-query').fill(productName);
    await this.page.getByTestId('search-submit').click();
    await this.page
      .getByTestId('product-name')
      .filter({ hasText: new RegExp(`^\\s*${escapeRegExp(productName)}\\s*$`) })
      .click();
    await this.name.waitFor();
  }

  /**
   * Open the first catalogue product that is in stock. The shop is shared and its
   * stock goes down with every order anybody places, so a hard-coded product can
   * run out between nightly resets — the buy test must not depend on one.
   */
  async openFirstAvailable(): Promise<void> {
    await this.page.goto('/');
    const productCards = this.page
      .getByRole('link')
      .filter({ has: this.page.getByTestId('product-name') })
      .filter({ hasNot: this.page.getByTestId('out-of-stock') });
    await productCards.first().click();
    await this.name.waitFor();
  }

  /** Name and price as shown on the detail page. */
  async capture(): Promise<ProductInfo> {
    const name = (await this.name.innerText()).trim();
    const price = Number((await this.unitPrice.innerText()).replace(/[^0-9.]/g, ''));
    return { name, price };
  }

  async setQuantity(qty: number): Promise<void> {
    await this.quantity.fill(String(qty));
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }

  async addToComparison(): Promise<void> {
    await this.addToCompareButton.click();
  }

  async openComparison(): Promise<void> {
    await this.page.getByTestId('compare-link').click();
  }
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
