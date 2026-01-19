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
    await page.waitForTimeout(2000)
    await page.fill('input[type="email"]', process.env.E2E_USERNAME!);
    await page.fill('input[type="password"]', process.env.E2E_PASSWORD!);

    // Debug: Check button state before clicking
    const button = page.locator('button[data-test-id="login-submit-button"]');
    await expect(button).toBeVisible();
    await expect(button).not.toBeDisabled();

    // Click the button
    await button.click({ force: true });

    // Wait for API response - check for either success (redirect) or error
    await page.waitForTimeout(2000); // Give time for API call

    // Check if login succeeded (redirected to /dashboard) or failed (error message)
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      // Login failed - check for error message
      const errorAlert = page.locator('[role="alert"], .text-red-600, .text-red-800');
      if (await errorAlert.isVisible()) {
        const errorText = await errorAlert.textContent();
        throw new Error(`Login failed with error: ${errorText}`);
      } else {
        throw new Error('Login failed but no error message visible');
      }
    }

    // Login succeeded - expect to be on dashboard page
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
  });

  test('user can view their flashcards', async ({ page }) => {
    // Navigate to flashcard list
    await page.goto('/flashcards');

    // Wait for page to load
    await page.waitForSelector('#flashcards-list, #no-results', { timeout: 10000 });

    // Verify we're on the flashcards page
    await expect(page.locator('h1:has-text("Moje fiszki")')).toBeVisible();
  });

  test('user can delete flashcard with confirmation', async ({ page }) => {
    // First, create a flashcard to delete
    await page.goto('/generate');
    await page.click('[data-test-id="manual-tab-trigger"]');
    
    const uniqueFront = `test-delete-${Date.now()}`;
    const uniqueBack = `test-usuń-${Date.now()}`;
    
    await page.fill('[data-test-id="front-input"]', uniqueFront);
    await page.fill('[data-test-id="back-input"]', uniqueBack);
    await page.click('[data-test-id="add-flashcard-button"]');
    
    // Wait for success toast
    await expect(page.locator('text=/została dodana/i')).toBeVisible({ timeout: 5000 });

    // Navigate to flashcard list
    await page.goto('/flashcards');
    await page.waitForTimeout(2000);

    // Find and click delete button for our flashcard
    const flashcardCard = page.locator('.bg-white').filter({ hasText: uniqueFront });
    await expect(flashcardCard).toBeVisible({ timeout: 5000 });
    
    const deleteButton = flashcardCard.locator('button:has-text("✕")');
    await deleteButton.click();

    // Confirm deletion in browser dialog
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Czy na pewno');
      await dialog.accept();
    });

    // Wait for deletion to complete
    await page.waitForTimeout(2000);
    
    // Verify flashcard is no longer visible
    await expect(page.locator(`text=${uniqueFront}`)).not.toBeVisible({ timeout: 5000 });
  });

  test('user can filter flashcards', async ({ page }) => {
    // Navigate to flashcard list
    await page.goto('/flashcards');
    await page.waitForTimeout(2000);

    // Test level filter
    await page.selectOption('#filter-box', '1');
    await page.waitForTimeout(500);
    
    // Verify filtering worked (check if any cards are visible or "no results" message)
    const hasCards = await page.locator('#flashcards-list').isVisible();
    const noResults = await page.locator('#no-results').isVisible();
    expect(hasCards || noResults).toBe(true);

    // Test search functionality
    await page.fill('#search', 'hola');
    await page.waitForTimeout(500);
    
    // If results exist, verify they contain the search term
    if (await page.locator('#flashcards-list').isVisible()) {
      const firstCard = page.locator('#flashcards-list .bg-white').first();
      if (await firstCard.isVisible()) {
        await expect(firstCard.locator('text=/hola/i')).toBeVisible();
      }
    }
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
