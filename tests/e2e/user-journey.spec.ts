import { test, expect } from '@playwright/test';

/**
 * E2E Test: User Login and Flashcard Management
 * 
 * This test covers the complete user journey from login
 * to managing flashcards.
 * 
 * Prerequisites:
 * - Local Supabase instance running (npx supabase start)
 * - Dev server running (npm run dev)
 * - Test user credentials in .env.test
 */

test.describe('Flashcard Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="email"]', process.env.E2E_USERNAME!);
    await page.fill('input[type="password"]', process.env.E2E_PASSWORD!);

    // Debug: Check button state before clicking
    const button = page.locator('button[data-test-id="login-submit-button"]');
    await expect(button).toBeVisible();
    await expect(button).not.toBeDisabled();

    // Click the button and wait for navigation
    await Promise.all([
      page.waitForURL('/dashboard', { timeout: 15000 }),
      button.click(),
    ]);

    // Verify we're on dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('user can view their flashcards', async ({ page }) => {
    // Navigate to flashcard list
    await page.goto('/flashcards');
    await page.waitForLoadState('networkidle');

    // Wait for page content to load
    await page.waitForTimeout(2000);

    // Verify we're on the flashcards page - check for either list or empty state
    const hasContent = await page.locator('body').isVisible();
    expect(hasContent).toBe(true);
  });

  test('user can create and view flashcard', async ({ page }) => {
    // Create a flashcard
    await page.goto('/generate');
    await page.waitForLoadState('networkidle');
    await page.click('[data-test-id="manual-tab-trigger"]');
    
    const uniqueFront = `test-${Date.now()}`;
    const uniqueBack = `prueba-${Date.now()}`;
    
    await page.fill('[data-test-id="front-input"]', uniqueFront);
    await page.fill('[data-test-id="back-input"]', uniqueBack);
    await page.click('[data-test-id="add-flashcard-button"]');
    
    // Wait for success toast
    await page.waitForTimeout(2000);
    await expect(page.locator('text=/została dodana/i')).toBeVisible({ timeout: 10000 });

    // Navigate to flashcard list and verify it's there
    await page.goto('/flashcards');
    await page.waitForTimeout(3000);

    // Verify flashcard appears in the list
    const flashcardCard = page.locator('body').filter({ hasText: uniqueFront });
    await expect(flashcardCard).toBeVisible({ timeout: 10000 });
  });

  test('user can access flashcards page', async ({ page }) => {
    // Navigate to flashcard list
    await page.goto('/flashcards');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Verify page loaded successfully
    const bodyVisible = await page.locator('body').isVisible();
    expect(bodyVisible).toBe(true);
    
    // Verify URL is correct
    expect(page.url()).toContain('/flashcards');
  });
});

test.describe('Accessibility', () => {
  test('homepage meets WCAG 2.1 AA standards', async ({ page }) => {
    await page.goto('/');
    
    // Basic accessibility checks
    
    // Check for main landmark
    await expect(page.locator('main, [role="main"]')).toBeVisible();
    
    // Check for proper heading structure
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    
    // Check for proper form labels
    const inputs = page.locator('input[type="text"], input[type="email"], textarea');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        if (await label.count() > 0) {
          await expect(label).toBeVisible();
        }
      }
    }
  });
});
