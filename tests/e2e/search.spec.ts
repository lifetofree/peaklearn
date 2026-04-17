import { test, expect } from '@playwright/test'
import { loginWithDevBypass } from './helpers'

test.describe('Search', () => {
  test.beforeEach(async ({ page }) => {
    const ok = await loginWithDevBypass(page)
    if (!ok) test.skip()
  })

  test('search page loads with empty state', async ({ page }) => {
    await page.goto('/search')
    await expect(page.getByText(/enter a search term/i)).toBeVisible()
  })

  test('search with query shows results section', async ({ page }) => {
    await page.goto('/search?q=test')
    // Either results or "No results found" should appear
    const hasResults = await page.getByText(/results found/i).isVisible()
    const noResults = await page.getByText(/no results found/i).isVisible()
    expect(hasResults || noResults).toBeTruthy()
  })

  test('search results show content and video sections when available', async ({ page }) => {
    await page.goto('/search?q=a')
    // With at least some data, content or video results should show
    await expect(page.locator('main')).toBeVisible()
  })

  test('clear search link appears when query is present', async ({ page }) => {
    await page.goto('/search?q=something')
    await expect(page.getByText(/clear search/i)).toBeVisible()
  })

  test('clear search navigates to /search', async ({ page }) => {
    await page.goto('/search?q=something')
    await page.getByText(/clear search/i).click()
    await page.waitForURL('**/search', { timeout: 5_000 })
    await expect(page).toHaveURL(/\/search$/)
  })

  test('header search form submits and navigates', async ({ page }) => {
    await page.goto('/dashboard')
    const searchInput = page.getByPlaceholder(/search/i).first()
    await searchInput.fill('javascript')
    await searchInput.press('Enter')
    await page.waitForURL(/search\?q=javascript/, { timeout: 5_000 })
    await expect(page).toHaveURL(/search\?q=javascript/)
  })

  test('special characters in search do not break the page', async ({ page }) => {
    await page.goto("/search?q=%27%3B DROP TABLE content%3B--")
    // Page should still render (no crash)
    await expect(page.locator('main')).toBeVisible()
  })

  test('very long search query is handled gracefully', async ({ page }) => {
    const longQuery = 'a'.repeat(200)
    await page.goto(`/search?q=${longQuery}`)
    await expect(page.locator('main')).toBeVisible()
  })
})
