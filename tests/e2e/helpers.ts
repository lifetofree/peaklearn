import { Page } from '@playwright/test'

/**
 * Logs in via the dev bypass button. Skips if dev bypass is not visible.
 * Returns true if login was successful.
 */
export async function loginWithDevBypass(page: Page): Promise<boolean> {
  await page.goto('/')
  const devLoginBtn = page.getByRole('button', { name: /dev bypass/i })

  if (!(await devLoginBtn.isVisible())) return false

  await devLoginBtn.click()
  await page.waitForURL('**/dashboard', { timeout: 10_000 })
  return true
}
