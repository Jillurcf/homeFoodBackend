# homeFood App Redesign — Milestone Plan

Redesign the Expo mobile app (`homeFood/`) to match `homeFoodWebsite/` in **features, colors, and design**.

## Locked decisions

| Decision | Choice |
|---|---|
| Data source | Real backend API (`homeFoodBackend/`) — new foods/reviews/shop modules; cart & favorites client-persisted |
| Theme | Light only (website warm cream theme); dark mode deferred |
| Admin | Skipped — web only |
| Navigation | Bottom tabs (drawer removed) |

## Design source of truth

Copy from the website, do not invent:

- **Colors** — `homeFoodWebsite/src/app/globals.css`
  - `primary #F36C26`, `primary-dark #D84E16`, `background #FFF5E8`, `textmain/ink #3A2E2A`, `card #FFFFFF`, `accent #4CAF50`
  - Status: emerald = available/delivered, amber = low stock/pending, red = sold out/cancelled, `primary/10` tint = preparing
- **UI primitives** — `homeFoodWebsite/src/components/seller/seller-ui.tsx`
  - Pill buttons (`rounded-full`), inputs (`rounded-xl`, focus `border-primary + ring`), cards (`rounded-2xl border-textmain/10 shadow-sm`), chips, `StatusPill`, `Stars` (amber), `EmptyState` (dashed border), skeletons (`animate-pulse bg-textmain/10`)
- **Typography** — Fraunces (display), AvenirLTProBook/system (body), Noto Sans Bengali (Bengali strings)

## App navigation target

```
app/
  index.tsx                  Splash + session check
  (auth)/                    login, signup  (restyled AuthShell)
  (tabs)/
    _layout.tsx              Bottom tabs
    index.tsx                Home / browse
    favorites.tsx            Favorites
    cart.tsx                 Cart + checkout
    orders.tsx               Buyer orders
    profile.tsx              Profile / settings
  (stack)/
    _layout.tsx              Stack for pushed screens
    food/[id].tsx            Meal detail
    seller/…                 Seller area (onboarding, dashboard, orders, menu, reviews, myshop)
    marketing/…              About, Help, Trust & Safety, Contact
```

## Milestone index

### Phase A — Foundation
1. **[01 Design system](01-design-system.md)** — theme tokens, fonts, UI kit components
2. **[02 Navigation shell](02-navigation-shell.md)** — bottom tabs, stack routes, remove drawer
3. **[03 Auth redesign](03-auth-redesign.md)** — restyle login/signup, NID fields

### Phase B — Buyer core
4. **[04 Backend foods API](04-backend-foods-api.md)** — foods module, seed data
5. **[05 Home browse](05-home-browse.md)** — search, chips, filters, sort
6. **[06 Food detail](06-food-detail.md)** — full detail screen with reviews
7. **[07 Cart & checkout](07-cart-checkout.md)** — cart + real order placement
8. **[08 Buyer orders](08-buyer-orders.md)** — order history + tracking
9. **[09 Favorites & profile](09-favorites-profile.md)** — favorites, profile screens

### Phase C — Seller
10. **[10 Seller onboarding](10-seller-onboarding.md)** — 3-step wizard + shop API
11. **[11 Seller dashboard & orders](11-seller-dashboard-orders.md)** — stats + order lifecycle
12. **[12 Seller menu & reviews](12-seller-menu-reviews.md)** — dish CRUD + review replies
13. **[13 My shop & marketing pages](13-myshop-marketing.md)** — shop preview + static pages

### Phase D — Finish
14. **[14 Cleanup & polish](14-cleanup-polish.md)** — delete dead code, env config, lint

## Rules

- Every milestone ends with `npm run lint` passing in `homeFood/`
- New backend code follows the existing module pattern (`src/modules/orders/`)
- No new UI without matching website reference (page/component named in the doc)
- Hardcoded hex is banned after M01 — use theme tokens
