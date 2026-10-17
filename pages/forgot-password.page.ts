import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class ForgotPasswordPage extends BasePage {
  readonly email: Locator;
  readonly submit: Locator;
  /** Validation message rendered by the form itself (client side). */
  readonly emailError: Locator;
  /**
   * Confirmation banner. It has no data-test, and its text is currently an untranslated
   * i18n key ("page.forgot-password.confirm" – an app bug, see Review.md), so we identify it
   * as "an alert that is not an error" instead of matching the wording.
   */
  readonly confirmation: Locator;
  /** Red banner with the message returned by the API. */
  readonly serverError: Locator;

  constructor(page: Page) {
    super(page);
    this.email = page.getByTestId('email');
    this.submit = page.getByTestId('forgot-password-submit');
    this.emailError = page.getByTestId('email-error');
    this.confirmation = page.getByRole('alert').filter({ hasNotText: /invalid|error/i });
    this.serverError = page.getByRole('alert').filter({ hasText: /invalid/i });
  }

  async open(): Promise<void> {
    await this.page.goto('/auth/forgot-password');
  }

  async requestReset(email: string): Promise<void> {
    await this.email.fill(email);
    await this.submit.click();
  }
}
