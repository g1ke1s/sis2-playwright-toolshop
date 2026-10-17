import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { User } from '../data/user.factory';

/** Checkout steps 2–4: sign in, billing address, payment. */
export class CheckoutPage extends BasePage {
  readonly paymentSuccess: Locator;
  readonly orderConfirmation: Locator;

  constructor(page: Page) {
    super(page);
    this.paymentSuccess = page.getByTestId('payment-success-message');
    // The confirmation block has no data-test; its text is the most stable handle.
    this.orderConfirmation = page.getByText(/Thanks for your order/i);
  }

  async signIn(user: User): Promise<void> {
    await this.page.getByTestId('email').fill(user.email);
    await this.page.getByTestId('password').fill(user.password);
    await this.page.getByTestId('login-submit').click();
    await this.page.getByTestId('proceed-2').click();
  }

  /**
   * The billing step is pre-filled from the customer's saved address and then
   * refreshed by the async postcode lookup. Instead of typing over it (and racing
   * the lookup), wait until the form shows the customer's address, then continue.
   */
  async confirmAddress(user: User): Promise<void> {
    const p = this.page;
    await expect(p.getByTestId('postal_code')).toHaveValue(user.postalCode);
    await expect(p.getByTestId('street')).toHaveValue(user.street);
    await expect(p.getByTestId('city')).toHaveValue(user.city);
    await expect(p.getByTestId('state')).toHaveValue(user.state);
    await expect(p.getByTestId('postcode-lookup-loading')).toBeHidden();
    await p.getByTestId('proceed-3').click();
  }

  async payCashOnDelivery(): Promise<void> {
    await this.page.getByTestId('payment-method').selectOption('cash-on-delivery');
    await this.page.getByTestId('finish').click();
  }

  async confirmOrder(): Promise<void> {
    await this.page.getByTestId('finish').click();
  }
}
