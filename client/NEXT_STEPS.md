# VOLTA Client — Next Steps

> Generated: 2026-05-10
> Based on: `Plannnig.txt` (Phase 4) + `client/CLAUDE.md` (current status)

---

## Current Status Summary

### ✅ DONE — UI Scaffold (All Pages Built with Mock Data)

| Area | Status |
|------|--------|
| Root layout, fonts, globals.css (oklch tokens) | ✅ |
| Header (nav, search overlay, cart drawer) | ✅ |
| Footer (5-col grid, newsletter, FooterMinimal) | ✅ |
| Home page (hero, arrivals, tech, athletes, newsletter) | ✅ |
| Products listing (filters, sort, pagination) | ✅ |
| Product detail (gallery, selectors, specs, related) | ✅ |
| Cart page (empty state, full state, order summary) | ✅ |
| Checkout (4-step form, payment tabs, order summary) | ✅ |
| Search (query, tags, results, empty state) | ✅ |
| About, Contact, Policy pages | ✅ |
| Login page (sign in / create account) | ✅ |
| Cart state (React Context + localStorage) | ✅ |
| Axios client with token refresh | ✅ |
| Providers (QueryClient + CartProvider) | ✅ |

### ❌ NOT DONE — Everything Below

---

## Phase A: Extract Components from Pages (No Backend Needed)

All pages currently have components **inline**. Extract them into the empty component folders for reusability and maintainability.

### A1. Common Components (`src/components/common/`)

- [ ] `Badge.tsx` — "NEW ARRIVAL", "IN STOCK", "RECOMMENDED" badges
- [ ] `Breadcrumb.tsx` — reusable breadcrumb (used on PDP, cart, checkout)
- [ ] `NumberStepper.tsx` — `[-] [26] [+]` control (tension, quantity)
- [ ] `PriceSlider.tsx` — range slider for filter sidebar
- [ ] `PillToggle.tsx` — filter pill buttons (3U G4, 4U G5, skill level)
- [ ] `Pagination.tsx` — borderless pagination `< 1 2 3 >`
- [ ] `EmptyState.tsx` — dashed icon + message + action buttons
- [ ] `Skeleton.tsx` — loading skeletons for product cards, pages
- [ ] `Toast.tsx` — toast notification system (add to cart, errors, success)
- [ ] `Rating.tsx` — star rating display

### A2. Product Components (`src/components/product/`)

- [ ] `ProductCard.tsx` — image, series label, name, price, attribute pills, Quick View, wishlist
- [ ] `ProductGrid.tsx` — 3-column responsive grid
- [ ] `ProductFilter.tsx` — sidebar filters (skill level, play style, series, weight, price)
- [ ] `ProductSort.tsx` — sort dropdown (mono font, uppercase, custom arrow)
- [ ] `ProductGallery.tsx` — vertical thumbnails + large image
- [ ] `ProductInfo.tsx` — series, name, price, stock badge, variant selectors
- [ ] `VariantSelector.tsx` — string type, grip type dropdowns
- [ ] `TensionSelector.tsx` — number stepper for tension (lbs)
- [ ] `SpecsTable.tsx` — engineered specs grid (flex, frame, shaft, etc.)
- [ ] `TechSection.tsx` — technology deep-dive section
- [ ] `CompleteLoadout.tsx` — cross-sell related products

### A3. Home Components (`src/components/home/`)

- [ ] `HeroBanner.tsx` — full-width dark hero with product + CTAs
- [ ] `NewArrivals.tsx` — featured product + grid + tournament gear
- [ ] `EngineeredSection.tsx` — "Engineered to Dominate" tech showcase
- [ ] `TeamVolta.tsx` — athlete cards with name overlay
- [ ] `TechBlueprint.tsx` — racket configurator/specs section
- [ ] `Newsletter.tsx` — email signup CTA

### A4. Cart Components (`src/components/cart/`)

- [ ] `CartItem.tsx` — product image, name, specs, price, qty, remove
- [ ] `OrderSummary.tsx` — subtotal, shipping, tax, total
- [ ] `TrustBadges.tsx` — SSL Secure, Encrypted, Certified

### A5. Checkout Components (`src/components/checkout/`)

- [ ] `ShippingForm.tsx` — first/last name, address, city, postal code
- [ ] `ShippingMethod.tsx` — Standard Delivery / Express Velocity radio
- [ ] `PaymentTabs.tsx` — Credit Card / Bank / Wallet tabs
- [ ] `CardForm.tsx` — card number, expiry, CVC
- [ ] `ExecuteOrder.tsx` — "EXECUTE ORDER ⚡" button

### A6. Review Components (`src/components/review/`)

- [ ] `ReviewList.tsx` — list of reviews
- [ ] `ReviewItem.tsx` — single review card
- [ ] `ReviewForm.tsx` — write a review form
- [ ] `RatingStars.tsx` — interactive star rating input

---

## Phase B: TypeScript Types & Shared Contracts (`src/types/`)

Define types that match the Prisma schema so the frontend is ready when APIs come online.

- [ ] `product.ts` — Product, ProductSpec, ProductVariant, ProductImage
- [ ] `category.ts` — Category (tree structure with parent/children)
- [ ] `brand.ts` — Brand
- [ ] `user.ts` — User, Address
- [ ] `cart.ts` — Cart, CartItem (refine existing store types)
- [ ] `order.ts` — Order, OrderItem, ShippingMethod, PaymentMethod
- [ ] `review.ts` — Review
- [ ] `coupon.ts` — Coupon
- [ ] `common.ts` — PaginatedResponse, ApiResponse, SortOption, FilterParams
- [ ] `content.ts` — Banner, Athlete, Technology

---

## Phase C: API Service Layer (`src/services/`)

Build endpoint functions on top of the existing Axios client. Group by domain.

- [ ] `auth.service.ts` — register, login, logout, refreshToken, forgotPassword, resetPassword, getMe
- [ ] `product.service.ts` — getProducts (filters, pagination), getProductBySlug, getFeatured, getNewArrivals, search
- [ ] `category.service.ts` — getCategories (tree)
- [ ] `brand.service.ts` — getBrands
- [ ] `cart.service.ts` — getCart, addItem, updateItem, removeItem, clearCart (server-side cart for logged-in users)
- [ ] `order.service.ts` — createOrder, getOrders, getOrderById, cancelOrder
- [ ] `review.service.ts` — getProductReviews, createReview
- [ ] `coupon.service.ts` — verifyCoupon
- [ ] `wishlist.service.ts` — getWishlist, addToWishlist, removeFromWishlist
- [ ] `payment.service.ts` — createPayment, verifyPayment
- [ ] `content.service.ts` — getBanners, getAthletes, getTechnologies

---

## Phase D: React Query Hooks (`src/hooks/`)

Wrap each service call in TanStack Query hooks for caching, loading states, and error handling.

- [ ] `useAuth.ts` — useLogin, useRegister, useLogout, useMe, useRefreshToken
- [ ] `useProducts.ts` — useProducts, useProduct, useFeaturedProducts, useNewArrivals, useSearchProducts
- [ ] `useCategories.ts` — useCategories
- [ ] `useBrands.ts` — useBrands
- [ ] `useCart.ts` — refactor existing cart to optionally sync with server when authenticated
- [ ] `useOrders.ts` — useOrders, useOrder, useCreateOrder, useCancelOrder
- [ ] `useReviews.ts` — useProductReviews, useCreateReview
- [ ] `useCoupons.ts` — useVerifyCoupon
- [ ] `useWishlist.ts` — useWishlist, useToggleWishlist
- [ ] `useContent.ts` — useBanners, useAthletes, useTechnologies

---

## Phase E: Auth Flow & User Pages

### E1. Auth Infrastructure

- [ ] Auth store/context (current user state, tokens, isAuthenticated)
- [ ] ProtectedRoute wrapper (redirect to login if not authenticated)
- [ ] Wire login page to API (currently static form)
- [ ] Wire register form to API
- [ ] Forgot password page (`/forgot-password`)
- [ ] Reset password page (`/reset-password`)

### E2. Account Pages (New Routes)

- [ ] `/account` — account layout with sidebar nav
- [ ] `/account/profile` — edit name, email, phone, avatar
- [ ] `/account/password` — change password
- [ ] `/account/addresses` — CRUD shipping addresses
- [ ] `/account/orders` — order history list
- [ ] `/account/orders/[id]` — order detail view
- [ ] `/account/wishlist` — saved products
- [ ] `/account/notifications` — notification list

---

## Phase F: Wire Pages to Real APIs

Replace hardcoded mock data in each page with React Query hooks once backend APIs exist.

- [ ] Home page → useBanners, useNewArrivals, useFeaturedProducts, useAthletes, useTechnologies
- [ ] Products page → useProducts (with filters from URL params), useCategories
- [ ] Product detail → useProduct(slug), useProductReviews
- [ ] Search page → useSearchProducts(query)
- [ ] Cart page → merge localStorage cart with server cart on login
- [ ] Checkout page → useCreateOrder, useVerifyCoupon, payment integration
- [ ] Wishlist → useWishlist, useToggleWishlist on product cards

---

## Phase G: Polish & UX

- [ ] Loading skeletons on all data-fetching pages
- [ ] Toast notifications (add to cart, order placed, errors)
- [ ] Error pages: 404 (`not-found.tsx`), 500 (`error.tsx`)
- [ ] Responsive design audit (mobile hamburger menu, stacked layouts)
- [ ] SEO: dynamic meta tags per page, Open Graph, sitemap.xml
- [ ] Image optimization (next/image, proper sizes, WebP)
- [ ] Accessibility audit (focus states, ARIA labels, keyboard nav)

---

## Recommended Order of Work

```
1. Phase B (Types)           — Foundation, no dependencies
2. Phase A (Components)      — Refactor, no backend needed
3. Phase C (Services)        — Build API layer (can mock responses)
4. Phase D (Hooks)           — Wire services to React Query
5. Phase E (Auth + Account)  — Auth flow + user pages
6. Phase F (Wire pages)      — Replace mock data → real APIs
7. Phase G (Polish)          — Final UX pass
```

> **Note:** Phases A and B can be done in parallel.
> Phase C can start immediately — mock responses or work alongside backend development.
> Phase F depends on the backend (Phase 3 of Plannnig.txt) being ready.

---

## Backend Dependency Status

The server currently only has a `/health` endpoint. The Prisma schema and seed data are ready but no API modules exist yet. **Phases A, B, and partially C (with mock responses) can proceed independently.** Phase F requires backend Sprint 1–4 to be complete.
