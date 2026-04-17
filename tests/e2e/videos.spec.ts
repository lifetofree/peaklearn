import { test, expect } from '@playwright/test'
import { loginWithDevBypass } from './helpers'

test.describe('Video Management', () => {
  test.beforeEach(async ({ page }) => {
    const ok = await loginWithDevBypass(page)
    if (!ok) test.skip()
  })

  test('videos page loads with collections and add buttons', async ({ page }) => {
    await page.goto('/videos')
    await expect(page.getByRole('heading', { name: /Video Collections/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Add Video/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /New Collection/i })).toBeVisible()
  })

  test('add video page loads with URL input', async ({ page }) => {
    await page.goto('/videos/add')
    await expect(page.getByRole('textbox', { name: /youtube url/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /fetch info/i })).toBeVisible()
  })

  test('fetch info button is disabled when URL is empty', async ({ page }) => {
    await page.goto('/videos/add')
    const fetchBtn = page.getByRole('button', { name: /fetch info/i })
    await expect(fetchBtn).toBeDisabled()
  })

  test('fetch info button enables when URL is typed', async ({ page }) => {
    await page.goto('/videos/add')
    const urlInput = page.getByRole('textbox', { name: /youtube url/i })
    await urlInput.fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    const fetchBtn = page.getByRole('button', { name: /fetch info/i })
    await expect(fetchBtn).toBeEnabled()
  })

  test('shows error toast for invalid YouTube URL', async ({ page }) => {
    await page.goto('/videos/add')
    const urlInput = page.getByRole('textbox', { name: /youtube url/i })
    await urlInput.fill('not-a-youtube-url')

    // Click fetch info (it'll be enabled since URL is not empty)
    const fetchBtn = page.getByRole('button', { name: /fetch info/i })
    await fetchBtn.click()

    // Error toast should appear
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 3_000 })
    await expect(page.getByText(/invalid youtube url/i)).toBeVisible()
  })

  test('new collection page loads', async ({ page }) => {
    await page.goto('/videos/new-collection')
    await expect(page.getByRole('textbox', { name: /title/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /create/i })).toBeVisible()
  })

  test('create a new collection', async ({ page }) => {
    await page.goto('/videos/new-collection')
    await page.getByRole('textbox', { name: /title/i }).fill('E2E Test Collection')
    await page.getByRole('button', { name: /create/i }).click()
    await page.waitForURL(/\/videos/, { timeout: 10_000 })
    await expect(page).toHaveURL(/\/videos/)
  })
})
