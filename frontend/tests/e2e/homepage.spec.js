// E2E Tests for Homepage
import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/');
    
    // Check if page title is visible
    await expect(page).toHaveTitle(/Grocery|FreshCart/i);
  });

  test('should navigate to products page', async ({ page }) => {
    await page.goto('/');
    
    // Click on Products link (adjust selector based on your actual navbar)
    const productsLink = page.getByRole('link', { name: /products/i });
    if (await productsLink.isVisible()) {
      await productsLink.click();
      await expect(page).toHaveURL(/.*products.*/);
    }
  });

  test('should display featured products', async ({ page }) => {
    await page.goto('/');
    
    // Wait for products to load (adjust selector based on your actual component)
    const products = page.locator('[data-testid="product-card"]').or(page.locator('.product-card'));
    await expect(products.first()).toBeVisible({ timeout: 10000 });
  });
});



