import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export interface Credentials { email: string; password: string }

export class LoginPage extends BasePage {
  readonly email: Locator;
  readonly password: Locator;
  readonly submit: Locator;
  readonly error: Locator;
  readonly emailError: Locator;
  readonly passwordError: Locator;

  constructor(page: Page) {
    super(page);
    this.email = page.getByTestId('email');
    this.password = page.getByTestId('password');
    this.submit = page.getByTestId('login-submit');
    this.error = page.getByTestId('login-error');
    this.emailError = page.getByTestId('email-error');
    this.passwordError = page.getByTestId('password-error');
  }

  async open(): Promise<void> {
    await this.page.goto('/auth/login');
  }

  async signIn(user: Credentials): Promise<void> {
    await this.email.fill(user.email);
    await this.password.fill(user.password);
    await this.submit.click();
  }

  async submitEmpty(): Promise<void> {
    await this.submit.click();
  }
}
