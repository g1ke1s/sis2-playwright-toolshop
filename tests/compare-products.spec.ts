import { test, expect } from '../fixtures/pages.fixture';

// Stated comparison: "Combination Pliers" is more expensive than plain "Pliers",
// and the comparison screen shows exactly the names and prices seen on the product pages.
const MORE_EXPENSIVE = 'Combination Pliers';
const CHEAPER = 'Pliers';

test.describe('TC-04 Compare two products', () => {
  test(`${MORE_EXPENSIVE} costs more than ${CHEAPER}, and the comparison table agrees`, async ({ productPage }) => {
    await productPage.openByName(MORE_EXPENSIVE);
    const first = await productPage.capture();
    await productPage.addToComparison();

    await productPage.openByName(CHEAPER);
    const second = await productPage.capture();
    await productPage.addToComparison();

    // What we captured is what we asked for, and the stated comparison holds.
    expect(first.name).toBe(MORE_EXPENSIVE);
    expect(second.name).toBe(CHEAPER);
    expect(first.price).toBeGreaterThan(second.price);

    // The comparison screen shows the same two products with the same prices.
    await expect(productPage.comparisonBar).toBeVisible();
    await productPage.openComparison();
    await expect(productPage.comparedNames).toHaveText([first.name, second.name]);
    await expect(productPage.comparedPrices).toHaveText([
      `$${first.price.toFixed(2)}`,
      `$${second.price.toFixed(2)}`,
    ]);
  });
});
