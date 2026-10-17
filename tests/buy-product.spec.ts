import { test, expect } from '../fixtures/pages.fixture';

const QUANTITY = 2;

test.describe('TC-03 Buy a product', () => {
  test('add to cart → cart shows the right item and quantity → checkout completes', async ({
    productPage, cartPage, checkoutPage, registeredUser,
  }) => {
    await productPage.openFirstAvailable();
    const product = await productPage.capture();

    await productPage.setQuantity(QUANTITY);
    await productPage.addToCart();
    await expect(productPage.cartBadge).toHaveText(String(QUANTITY));

    await productPage.openCart();
    await expect(cartPage.productTitles).toHaveCount(1);
    await expect(cartPage.productTitles).toHaveText(product.name);
    await expect(cartPage.quantities).toHaveValue(String(QUANTITY));
    await expect(cartPage.linePrices).toHaveText(`$${(product.price * QUANTITY).toFixed(2)}`);

    await cartPage.proceedToCheckout();
    await checkoutPage.signIn(registeredUser);
    await checkoutPage.confirmAddress(registeredUser);
    await checkoutPage.payCashOnDelivery();
    await expect(checkoutPage.paymentSuccess).toHaveText(/payment was successful/i);

    await checkoutPage.confirmOrder();
    await expect(checkoutPage.orderConfirmation).toContainText(/INV-\d+/);
  });
});
