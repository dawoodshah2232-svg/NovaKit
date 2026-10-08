# DESIGN — PDFEdit (NovaKit)

Source of truth: `app/design-tokens.css` (imported via `app/globals.css`). Light = `:root` defaults; dark = `.dark` overrides (next-themes, class strategy).

## Brand

- **Accent: deep crimson red — premium, never neon.** `--pe-accent: #b91c1c` · hover `#991b1b` · soft `#fbe4e4` · focus ring `rgba(185,28,28,0.28)`.
- Logo (`components/logo.tsx`) used **raw — never on a card or background box**.
- Canvas selection is professional blue (`--pe-select: #1d4ed8`), never pink.

## Color system

| Token | Light | Dark (`.dark`) |
|---|---|---|
| Background | `--pe-bg: #faf9f7` | deep dark (see tokens file) |
| Surface | `--pe-surface: #ffffff`, `--pe-surface-2: #f4f2ed` | dark surfaces |
| Text | `--pe-text: #1c1a16` | light |
| Muted | `--pe-text-2: #66615a`, `--pe-text-3: #8a8478` | — |
| Border | `--pe-border: #e7e2d8`, strong `#d9d2c2` | — |
| Success | `#059669` / soft `#d1fae5` | — |
| Danger | `#dc2626` / soft `#fee2e2` | — |
| Studio ink panel | `#0f151c` (dark in **both** themes) | same |

Category tints (translucent, theme-safe): organize indigo, from-PDF blue, to-PDF teal, optimize amber, edit crimson, security rose, advanced violet.

## Typography

- **Current:** Inter via `next/font` (`--font-sans`), JetBrains Mono (`--font-mono`); body falls back to `system-ui, -apple-system, …`. Tight letter-spacing (`-0.011em`), tabular-ish feature settings.
- **Owner rule:** Apple font stack is the standard for his projects. Current Inter usage is grandfathered; flag before changing (see TASKS.md).
- Headings and hero copy: no emojis, no emoji-style glyphs anywhere.

## Buttons & components

- Primary CTAs: accent-red pill buttons ("Start" on tool cards — theme token `--pe-accent`, never hardcoded red).
- Radii: `--pe-radius-sm: 10px` · `md: 16px` · `lg: 24px`; pills `999px`.
- Shadows: `sm/md/lg` + `--pe-shadow-accent` (red glow) for primary actions.
- Focus: 2px `--pe-focus` outline; visible skip-to-content link.

## Spacing & layout

- Mobile-first; extra-small `xs` breakpoint at 480px for tool layouts (between base and `sm` 640px).
- Homepage hub + A-Z tool sections; tool pages use consistent dropzone → options → action flow.

## Icons & imagery

- **Current:** `lucide-react` inline icons. Owner rule says Heroicons inline SVG only — compliance item in TASKS.md.
- Blog covers: real JPG guides imagery in `public/blog/` (no AI-look renders per owner taste).
- Preview assets: `app/ui-preview/` (e.g. `studio-banner.webp`).

## Motion

- Apple-design standards: critically-damped, interruptible motion; respond on pointer-down; no jank. web-animations patterns for scroll reveals on marketing pages. Respect `prefers-reduced-motion`.
