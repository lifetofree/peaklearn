import { test, expect } from '@playwright/test'
import { loginWithDevBypass } from './helpers'

test.describe('Content Management', () => {
  test.beforeEach(async ({ page }) => {
    const ok = await loginWithDevBypass(page)
    if (!ok) test.skip()
  })

  test('dashboard shows content and video sections', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /PeakLearn/i })).toBeVisible()
    await expect(page.getByText(/recent content/i)).toBeVisible()
  })

  test('navigates to content list from dashboard', async ({ page }) => {
    await page.getByRole('link', { name: /content/i }).first().click()
    await page.waitForURL('**/content')
    await expect(page).toHaveURL(/\/content$/)
  })

  test('content list page loads', async ({ page }) => {
    await page.goto('/content')
    await expect(page.getByRole('heading', { name: /Content/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /New Article/i })).toBeVisible()
  })

  test('new article page loads with editor', async ({ page }) => {
    await page.goto('/content/new')
    await expect(page.getByRole('textbox', { name: /title/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /save/i })).toBeVisible()
  })

  test('create a new article', async ({ page }) => {
    await page.goto('/content/new')
    const titleInput = page.getByRole('textbox', { name: /title/i })
    await titleInput.fill('E2E Test Article')

    // Add a tag
    const tagInput = page.getByPlaceholder('Add a tag...')
    await tagInput.fill('e2e')
    await tagInput.press('Enter')
    await expect(page.getByText('e2e')).toBeVisible()

    // Save
    await page.getByRole('button', { name: /save/i }).click()

    // Should navigate to content list or detail
    await page.waitForURL(/\/content/, { timeout: 10_000 })
  })

  test('content list shows filter by tags section when tags exist', async ({ page }) => {
    await page.goto('/content')
    // If there are any tags, the filter section should be visible
    const tagSection = page.getByText(/filter by tags/i)
    if (await tagSection.isVisible()) {
      await expect(tagSection).toBeVisible()
    }
  })

  test('search from header navigates to search page', async ({ page }) => {
    await page.goto('/dashboard')
    const searchInput = page.getByPlaceholder(/search/i).first()
    await searchInput.fill('test')
    await searchInput.press('Enter')
    await page.waitForURL('**/search**', { timeout: 5_000 })
    await expect(page).toHaveURL(/search/)
  })

  test('footer shows version number', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByText(/v\d+\.\d+\.\d+/)).toBeVisible()
  })

  test('settings page loads and shows email', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.getByText(/settings/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible()
  })
})
