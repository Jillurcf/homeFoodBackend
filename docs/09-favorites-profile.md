# M09 — Favorites & Profile

**Goal:** Favorites screen + full profile/settings (replaces stubs and lost drawer actions).

## Favorites

- Extend `homeFood/src/store/` with favorites store (Context + AsyncStorage, key `homefood:favorites`, id array — website `store.tsx` pattern)
- Heart on FoodCard/detail toggles + persists
- `app/(tabs)/favorites.tsx`: same 2-column `FoodCard` grid; empty `EmptyState` ("Nothing saved yet")

## Profile

`app/(tabs)/profile.tsx` (website ref: footer links + AuthShell styling):

- Avatar + name/email from Redux auth state
- Menu list (cards/rows): My orders →, Saved foods →, Help & Support →, Trust & Safety →, About us →, Contact →
- **Start Selling** primary pill → seller onboarding (M10) or seller dashboard if shop exists (`shopStore.isShopAdded`)
- Logout row (red text) with confirm `Modal` (port drawer's `NormalModal` logic) → `logoutThunk` → `(auth)/login`

## Done when

- [ ] Hearts persist across restart; favorites screen reflects toggles
- [ ] Profile menu navigates to all targets; logout clears token and returns to login
- [ ] Seller CTA routes correctly based on shop state
- [ ] `npm run lint` passes
