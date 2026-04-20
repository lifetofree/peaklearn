import { Page } from '@playwright/test'

const DEV_EMAIL = process.env.NEXT_PUBLIC_DEV_BYPASS_EMAIL || 'dev@example.com'
const DEV_PASSWORD = process.env.NEXT_PUBLIC_DEV_BYPASS_PASSWORD || 'password'

/**
 * Logs in via the dev bypass form. Skips if dev bypass is not visible.
 * Returns true if login was successful.
 */
export async function loginWithDevBypass(page: Page): Promise<boolean> {
  await page.goto('/')
  const devLoginBtn = page.getByRole('button', { name: /dev login/i })

  if (!(await devLoginBtn.isVisible())) return false

  const emailInputs = page.getByRole('textbox', { name: /email/i })
  const passwordInput = page.getByRole('textbox', { name: /password/i })

  await emailInputs.last().fill(DEV_EMAIL)
  await passwordInput.fill(DEV_PASSWORD)
  await devLoginBtn.click()
  await page.waitForURL('**/dashboard', { timeout: 10_000 })
  return true
}
