# Changelogs

## 2026-04-17 — Theme overhaul + code cleanup

### Theme (duckstep.co-inspired)

- **Color palette**: Neutralized foreground and secondary tones (less blue-tinted), softened muted-foreground, subtler borders
- **Border radius**: Reduced from `0.75rem` to `0.5rem` for a tighter, more refined feel
- **Typography**: Body font-size set to `15px`, line-height `1.6`; headings use `font-weight: 600` and `letter-spacing: -0.025em`
- **Cards**: Added subtle `box-shadow` (`0 1px 4px 0 rgb(0 0 0 / 0.06)`) to lift cards off the page; `CardTitle` reduced from `text-lg` to `text-base`
- **Buttons**: Default height tightened to `h-9`; `font-medium` instead of `font-semibold`; explicit `duration-150` transitions
- **Inputs**: Focus ring changed to `ring-ring/20` (soft glow) with border color change on focus
- **Selection**: `::selection` styled with teal brand color at 12% opacity
- **Dashboard header**: Consolidated to a sticky header with backdrop blur; nav moved inline at desktop, collapses to sub-bar on mobile; heading scaled down to `text-2xl font-semibold`
- **Login page**: Logo and heading scaled down; input and button heights normalized to `h-11`

### Code quality

- **`globals.css`**: Merged duplicate `@layer base` blocks into one; merged split `body` selector
- **`button.tsx`**: Fixed `focus:outline-none` → `focus-visible:outline-none` to preserve keyboard accessibility
- **`page.tsx`**: Replaced raw `<input>` with `<Input>` component; replaced raw `<button>` elements with `<Button>` component
- **`dashboard/page.tsx`**:
  - Extracted `navLinks` array and `<NavLinks>` component — eliminated copy-pasted desktop/mobile nav markup
  - Parallelized three independent Supabase queries with `Promise.all` (reduces dashboard load time from sum-of-three to slowest-of-three)
  - Replaced `select('*')` with scoped column selects (`id,title,updated_at` etc.) to avoid over-fetching
  - Replaced raw search `<input>` with `<Input>` component
