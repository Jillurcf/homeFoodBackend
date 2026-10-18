# M10 — Seller Onboarding

**Goal:** 3-step chef onboarding wizard + foodMakers shop API, matching website `/dashboard` onboarding.

## Website ref

`homeFoodWebsite/src/components/seller/onboarding-wizard.tsx` + seller store seed profile fields.

## Backend

Mount/finish `homeFoodBackend/src/modules/foodMakers/` (exists but not mounted):

- Model: fullName, photoUrl, phone, email, shopName, kitchenType (`home | shared | home_catering`), address, areas[], openHours, bio, nidNumber, verified (default false), userId
- Routes in `app.ts`: `POST /api/shops/me` (create/update), `GET /api/shops/me`, `GET /api/shops/:id` (public)
- Zod validation per step; auth middleware required

## UI

`app/(stack)/seller/onboarding.tsx` — progress bar + 3 steps:

1. **About you** — photo (skip upload for now, initials avatar), full name, phone, email, area segmented (Dhaka areas list from website)
2. **Your kitchen** — shop name, kitchen type select, address, delivery areas multi-select chips, open hours
3. **Review & go live** — summary card, note about verification, green `PillButton` "Finish & go live"

- On success: set `shopStore.isShopAdded = true` → navigate to seller dashboard (M11; placeholder route OK until then)
- Re-entry from Profile "Start Selling" resumes/edit existing profile via `GET /api/shops/me`

## Done when

- [ ] Wizard validates each step; submit persists shop to backend
- [ ] Revisiting shows edit mode with prefilled data
- [ ] `npm run lint` passes
