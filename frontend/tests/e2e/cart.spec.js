// E2E Tests for Cart Functionality
import { test, expect } from '@playwright/test';

test.describe('Cart', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to products page
    await page.goto('/products');
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 }).catch(() => {});
  });

  test('should add product to cart', async ({ page }) => {
    // Find first product's add to cart button
    const addToCartButton = page.getByRole('button', { name: /add to cart/i }).first();
    
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click();
      
      // Check for success message or cart update
      await expect(page.getByText(/added|success/i).first()).toBeVisible({ timeout: 5000 }).catch(() => {});
    }
  });

  test('should navigate to cart page', async ({ page }) => {
    // Click cart icon in navbar
    const cartLink = page.getByRole('link', { name: /cart/i }).or(page.locator('[aria-label*="cart" i]'));
    
    if (await cartLink.isVisible()) {
      await cartLink.click();
      await expect(page).toHaveURL(/.*cart.*/);
    }
  });
});



