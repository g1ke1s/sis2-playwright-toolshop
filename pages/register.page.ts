import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { User } from '../data/user.factory';

export class RegisterPage extends BasePage {
  readonly form: Locator;
  readonly submit: Locator;
  readonly error: Locator;
  readonly emailError: Locator;
  readonly firstNameError: Locator;

  constructor(page: Page) {
    super(page);
    this.form = page.getByTestId('register-form');
    this.submit = page.getByTestId('register-submit');
    this.error = page.getByTestId('register-error');
    this.emailError = page.getByTestId('email-error');
    this.firstNameError = page.getByTestId('first-name-error');
  }

  static readonly loginUrl = /\/auth\/login$/;

  async open(): Promise<void> {
    await this.page.goto('/auth/register');
  }

  async register(user: User): Promise<void> {
    const p = this.page;
    await p.getByTestId('first-name').fill(user.firstName);
    await p.getByTestId('last-name').fill(user.lastName);
    await p.getByTestId('dob').fill(user.dob);
    // Country + postcode + house number first: they trigger the postcode lookup,
    // which auto-fills street/city/state. We then type the same values ourselves.
    await p.getByTestId('country').selectOption(user.country);
    await p.getByTestId('postal_code').fill(user.postalCode);
    await p.getByTestId('house_number').fill(user.houseNumber);
    await p.getByTestId('street').fill(user.street);
    await p.getByTestId('city').fill(user.city);
    await p.getByTestId('state').fill(user.state);
    await p.getByTestId('phone').fill(user.phone);
    await p.getByTestId('email').fill(user.email);
    await p.getByTestId('password').fill(user.password);
    await this.submit.click();
  }
}
