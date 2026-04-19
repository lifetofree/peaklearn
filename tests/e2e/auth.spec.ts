import { test, expect } from '@playwright/test'

// E2E Auth tests — require dev bypass env vars to be set:
//   NEXT_PUBLIC_ENABLE_DEV_BYPASS=true
//   NEXT_PUBLIC_DEV_BYPASS_EMAIL=dev@example.com
//   NEXT_PUBLIC_DEV_BYPASS_PASSWORD=password

const DEV_EMAIL = process.env.NEXT_PUBLIC_DEV_BYPASS_EMAIL || 'dev@example.com'
const DEV_PASSWORD = process.env.NEXT_PUBLIC_DEV_BYPASS_PASSWORD || 'password'

test.describe('Authentication', () => {
  test('login page loads and shows email form', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /PeakLearn/i })).toBeVisible()
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible()
  })

  test('shows magic link button', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('button', { name: /continue with email/i })).toBeVisible()
  })

  test('shows dev bypass form in development', async ({ page }) => {
    await page.goto('/')
    const devSection = page.getByText(/dev bypass/i)
    await expect(devSection).toBeVisible()
  })

  test('dev bypass login navigates to dashboard', async ({ page }) => {
    await page.goto('/')
    const devLoginBtn = page.getByRole('button', { name: /dev bypass/i })

    if (await devLoginBtn.isVisible()) {
      await devLoginBtn.click()
      await page.waitForURL('**/dashboard', { timeout: 10_000 })
      await expect(page).toHaveURL(/dashboard/)
    } else {
      test.skip()
    }
  })

  test('unauthenticated user is redirected from dashboard to login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/')
  })

  test('unauthenticated user is redirected from content to login', async ({ page }) => {
    await page.goto('/content')
    await expect(page).toHaveURL('/')
  })

  test('unauthenticated user is redirected from videos to login', async ({ page }) => {
    await page.goto('/videos')
    await expect(page).toHaveURL('/')
  })
})
