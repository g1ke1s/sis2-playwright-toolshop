import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class AccountPage extends BasePage {
  readonly title: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId('page-title');
  }

  /** URL matcher, kept here so specs never hard-code routes. */
  static readonly url = /\/account$/;
}
