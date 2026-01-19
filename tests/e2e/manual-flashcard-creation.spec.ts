import { test, expect } from '@playwright/test';

test.describe('Manual Flashcard Creation', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.waitForTimeout(2000)
    await page.fill('input[type="email"]', process.env.E2E_USERNAME!);
    await page.fill('input[type="password"]', process.env.E2E_PASSWORD!);
    await page.click('button[data-test-id="login-submit-button"]');
    await expect(page).toHaveURL('/dashboard', { timeout: 5000 });
  });

  test('user can create a flashcard manually', async ({ page }) => {
    // Step 1: Navigate to generate page (home)
    await page.goto('/generate');

    // Step 2: Click the "Dodaj ręcznie" tab
    await page.click('[data-test-id="manual-tab-trigger"]');

    // Step 3: Fill in the front of the flashcard (Spanish word)
    const guidFront = `hola-${Date.now()}`;
    const guidBack = `cześć-${Date.now()}`;
    await page.fill('[data-test-id="front-input"]', guidFront);

    // Step 4: Fill in the back of the flashcard (Polish translation)
    await page.fill('[data-test-id="back-input"]', guidBack);
    
    // Step 5: Click the "Dodaj fiszkę" button
    await page.click('[data-test-id="add-flashcard-button"]');

    // Verify success toast
    await expect(page.locator('text=/została dodana/i')).toBeVisible({
      timeout: 5000,
    });

    // Navigate to flashcards page
    await page.click('a[data-test-id="my-flashcards-nav-button"]');

    // Verify we are on the flashcards page
    await expect(page).toHaveURL('/flashcards', { timeout: 10000 });

    // Verify the new flashcard is in the list
    await page.waitForTimeout(2000);
    await expect(page.locator(`text=${guidFront}`)).toBeVisible({ timeout: 5000 });
    await expect(page.locator(`text=${guidBack}`)).toBeVisible({ timeout: 5000 });
  });
});
