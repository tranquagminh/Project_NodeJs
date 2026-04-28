# VOLTA Client — Session Context

> Last updated: 2026-04-28
> Reference design: `client/volta.html` (3143-line static HTML/CSS prototype)

---

## Project Overview

VOLTA is a premium badminton e-commerce storefront. The **client** is a Next.js 16 app (App Router, Turbopack) styled with Tailwind CSS, using a custom oklch-based design system extracted from `volta.html`.

### Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16.2.1, App Router |
| Styling | Tailwind CSS v4 with `@theme inline` (oklch tokens) |
| Fonts | Space Grotesk (`font-heading`), Inter (`font-sans`), JetBrains Mono (`font-mono`) |
| State | React Context for cart (`src/store/cart.tsx`), React Query for server state |
| UI Library | shadcn/ui (partial — `button.tsx`) |
| Icons | lucide-react |

### VOLTA Color System (oklch)

```
ink:         oklch(0.28 0.06 245)
ink-2/3/4:   lighter variants
accent:      oklch(0.62 0.17 145)   — green
accent-soft: oklch(0.92 0.06 145)
accent-ink:  oklch(0.38 0.12 155)
line:        oklch(0.88 0.02 90)
bg/bg-2/bg-3: warm off-white tones
signal:      oklch(0.65 0.22 25)    — red/warning
```

---

## File-by-File Status

### Core Infrastructure

| File | Status | Notes |
|------|--------|-------|
| `src/app/globals.css` | ✅ Done | VOLTA oklch color tokens, Tailwind theme, base styles |
| `src/app/layout.tsx` | ✅ Done | Root layout — fonts, metadata ("VOLTA — Precision Badminton"), Providers wrapper |
| `src/app/(main)/layout.tsx` | ✅ Done | Wraps Header + Footer around page content |
| `src/components/Providers.tsx` | ✅ Done | QueryClientProvider + CartProvider |
| `src/store/cart.tsx` | ✅ Done | Cart Context — items, add/remove/update/clear, drawer state, totals. **localStorage persistence added** — reads on mount (SSR-safe), writes on every items change. Key: `volta_cart`. |

### Layout Components

| File | Status | Notes |
|------|--------|-------|
| `src/components/layout/Header.tsx` | ✅ Done | Announcement bar + sticky nav + cart drawer panel. Cart drawer reads from shared cart store, shows real items with qty controls, attr pills, subtotal. Green badge on cart icon shows item count. **Search overlay added** — click search icon → dropdown panel slides down, shows popular tags before typing, live product results (max 4) with Pexels images while typing, "See all results →" navigates to `/search?q=...`, closes on ESC / X / click outside. |
| `src/components/layout/Footer.tsx` | ✅ Done | 5-column grid (`1.4fr 1fr 1fr 1fr 1fr`), email input with `flex-shrink-0`/`whitespace-nowrap` fix, pulsing green dot shipping status, `FooterMinimal` variant for auth pages. |

### Pages

| Page | Route | Status | Key Features |
|------|-------|--------|-------------|
| **Home** | `/` | ✅ Done | `'use client'`. Hero grid `1.1fr 1fr`. Product cards with Quick View hover button + wishlist heart. Features strip, arrival grid, tech section, athletes, newsletter CTA. |
| **Products (PLP)** | `/products` | ✅ Done | `'use client'`. Filter sidebar (category, price, balance, flex). 8 mock VOLTA products. Sort dropdown (mono font, uppercase, custom arrow). Quick View + wishlist on cards. Borderless pagination. |
| **Product Detail (PDP)** | `/products/[slug]` | ✅ Done | `'use client'`. Breadcrumb, thumbnail gallery, string/grip/tension selectors, **"ADD TO CART" button** (was "Buy Now") wired to shared cart store via `useCart().addItem()`. Spec bars, spec cards grid, related products. |
| **Cart** | `/cart` | ✅ Done | `'use client'`. Uses shared cart store (`useCart()`). Breadcrumb `HOME / CART`. "Your loadout" eyebrow. **Continue shopping ← / Empty cart** bar above items. Empty state: dashed icon, "Nothing in the cart yet.", Browse + Search buttons, "Recommended for you" 4-card grid. Full state: item cards, order summary sidebar, promo code, trust badges. |
| **Checkout** | `/checkout` | ✅ Done | `'use client'`. 4-step form: Contact → Shipping → Shipping Method → Payment. Payment tabs with SVG icons (Card/PayPal/Apple Pay). Order summary sidebar. |
| **About** | `/about` | ✅ Done | Hero, origin story, stats strip (4 metrics), values cards, timeline, CTA. |
| **Contact** | `/contact` | ✅ Done | Topic chips, form card (name/email/message), 3 support channels, FAQ accordion. |
| **Policy** | `/policy` | ✅ Done | Sidebar nav, 6 legal sections (Terms, Privacy, Returns, Warranty, Cookies, Accessibility). |
| **Login** | `/login` | ✅ Done | 2-column split layout. Left: auth tabs (sign in / create account), social login buttons. Right: dark panel with "V" watermark + perks list. Uses `FooterMinimal`. |
| **Search** | `/search` | ✅ Done | `'use client'`. Big search input (font-heading 28px), popular tag chips, result count meta bar, sort dropdown, product grid with Quick View + wishlist. "No matches" empty state. Client-side filtering over mock product data. **Now reads `?q=` URL param** — pre-fills query when arriving from header overlay. Product cards show Pexels badminton images. |

---

## Cart Flow (End-to-End)

```
PDP "ADD TO CART" click
  → useCart().addItem({id, name, series, slug, price, attrs}, quantity)
  → Item added to CartProvider state
  → Cart drawer auto-opens (drawerOpen = true)
  → Header badge count updates
  → /cart page reads same state
  → "Empty cart" button → clearCart() → empty state with recommendations
```

**Cart item ID format**: `{slug}-{string}-{grip}-{tension}` (e.g. `vector-x1-pro-BG80-G5-26`)

---

## Design Decisions & Fixes Applied

1. **Hero grid**: `1.1fr 1fr` (left slightly wider than right)
2. **Product cards**: Quick View slide-up on hover + wishlist heart top-right
3. **Footer email input**: `flex-shrink-0`, `min-w-0`, `whitespace-nowrap` to prevent "JOIN →" wrapping
4. **Footer grid**: `1.4fr 1fr 1fr 1fr 1fr` for brand column prominence
5. **Sort dropdown**: `font-mono`, `uppercase`, `appearance-none` with custom SVG chevron
6. **Pagination**: Borderless subtle style, no borders on inactive pages
7. **Cart drawer**: Slide-in panel from right with overlay, replaces Link to /cart on icon click
8. **Cart page layout**: Continue shopping / Empty cart bar positioned **above** item cards (between heading and items)
9. **Price vs X button spacing**: `top-4 right-4` on close button + `pt-6` on price column
10. **Payment icons**: Inline SVGs matching volta.html — credit card, PayPal "P", Apple logo
11. **Search overlay**: Positioned as `absolute top-full` inside the sticky `<header>` (z-50), so it slides from under the nav bar. Backdrop is a separate `fixed` div at z-40.
12. **Cart localStorage key**: `volta_cart` — lazy `useState` initializer guards against SSR with `typeof window === 'undefined'` check
13. **Product images**: All use `images.pexels.com` with Pexels IDs 8007173 / 8007421 / 10544231 / 19902436 / 35300321 (cycled across 8 products). Cart uses a `PRODUCT_IMAGES` slug→URL map with fallback.

---

## What's NOT Done Yet / Known Gaps

### UI Pages Missing
- [ ] **`/forgot-password`** — linked from login form, currently 404
- [ ] **`/account` dashboard** — account icon links to `/login`, no post-login state exists
- [ ] **Order confirmation page** (`/checkout/success`) — no destination after placing order
- [ ] **Category landing pages** — nav links (`/products?category=footwear` etc.) go to generic PLP, no dedicated pages

### UI Components Missing / Stubbed
- [ ] **Quick View modal** — hover button visible on all product cards but clicking does nothing
- [ ] **Checkout step gating** — all 4 steps visible at once, no next/back flow or validation
- [ ] **Checkout order summary** — sidebar shows hardcoded mock data, not live cart items
- [ ] **Filter applied tags** — selected PLP filters have no visible "active filter" chips above grid
- [ ] **Applied filter count badge** — mobile "Filters" button shows no count of active filters

### Functional Gaps
- [ ] **No real API integration** — all data is mock/hardcoded
- [ ] **No auth** — login page is UI-only, no actual authentication
- [ ] **Checkout not functional** — form doesn't submit anywhere
- [ ] **Wishlist not functional** — heart icon toggles locally only, no persistence
- [ ] **Promo code** — input in cart accepts text but "Apply" does nothing

### Server Integration (Future)
- [ ] Wire to server API (`/server` folder has Prisma schema, Express setup)
- [ ] Product data from database instead of mock arrays
- [ ] Order submission flow
- [ ] User authentication with JWT

---

## Completed This Session (2026-04-28)

| What | File(s) |
|------|---------|
| **Cart localStorage persistence** | `src/store/cart.tsx` — lazy init reads `volta_cart` from localStorage, `useEffect` writes on every change |
| **Pexels badminton images** | All product cards, hero, athletes, search, cart thumbnails — replaced picsum with `images.pexels.com` URLs. Added `images.pexels.com` + `images.unsplash.com` to `next.config.ts` remotePatterns |
| **Search header overlay** | `Header.tsx` — search icon now opens a slide-down dropdown with popular tags + live results (max 4) with images |
| **Search page URL param** | `search/page.tsx` — reads `?q=` from URL via `useSearchParams()`, pre-fills query on arrival from overlay |

---

## Project Structure (Client)

```
client/
├── volta.html              ← Reference design (source of truth for UI)
├── src/
│   ├── app/
│   │   ├── globals.css     ← VOLTA theme tokens
│   │   ├── layout.tsx      ← Root layout (fonts, Providers)
│   │   ├── (auth)/
│   │   │   ├── layout.tsx
│   │   │   └── login/page.tsx
│   │   └── (main)/
│   │       ├── layout.tsx  ← Header + Footer wrapper
│   │       ├── page.tsx    ← Home
│   │       ├── about/page.tsx
│   │       ├── cart/page.tsx
│   │       ├── checkout/page.tsx
│   │       ├── contact/page.tsx
│   │       ├── policy/page.tsx
│   │       ├── search/page.tsx    ← Search
│   │       └── products/
│   │           ├── page.tsx        ← PLP
│   │           └── [slug]/page.tsx ← PDP
│   ├── components/
│   │   ├── Providers.tsx   ← QueryClient + CartProvider
│   │   ├── layout/
│   │   │   ├── Header.tsx  ← Nav + cart drawer
│   │   │   └── Footer.tsx
│   │   └── ui/
│   │       └── button.tsx  ← shadcn
│   ├── store/
│   │   └── cart.tsx        ← Cart Context + useCart hook
│   └── ...
```

---

## Commands

```bash
# Dev server
cd client && npm run dev

# Build check
cd client && npx next build

# Server (Docker)
docker-compose up
```
