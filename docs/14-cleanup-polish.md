# M14 — Cleanup & Polish

**Goal:** Remove all dead code, fix config gaps, final visual pass.

## Delete

- Broken/unused components in `src/components/`: `Header.tsx`, `SecondaryHeader.tsx` (broken imports), `Expend.tsx`, `HtmlToText.tsx`, `PrivacyPolicyHtmlToText.tsx`, `AddShopTabButton.tsx`, `Or.tsx`, `CustomAlert.tsx`, `SimpleButton.tsx`, `IwtButton.tsx`, `IButton.tsx`, `IconArrow.tsx` (keep only if used)
- Empty files: `src/constants/{color,config,endpoints}.ts`, `src/lib/storage.ts` (or fill `config.ts` — see below)
- Old `assets/Icons/Icon.ts` entries no longer referenced
- `SpaceMono-Regular copy.ttf` duplicate

## Config

- `src/constants/config.ts`: `BASE_URL` from `expo-constants` extra / `.env` (`EXPO_PUBLIC_API_URL`) — kill hardcoded `localhost:8080` in `src/api/clients.ts`; add `put`/`patch`/`delete` to api client
- Add `"test": "vitest run"` script; ensure 9 existing test files pass or update them
- Root `AGENTS.md`: fix `homeFood/AGENTS.md` reference (missing file) + tailwind config extension (`.js` not `.ts`)

## Polish pass

- Every screen: skeletons, empty states, error toasts/inline errors, disabled/loading buttons
- Prices all `৳` via shared `formatPrice`
- Bengali strings use `font-bengali`; headings `font-display`
- Scroll padding so content clears tab bar; safe-area insets on all screens
- Tap targets ≥ 44pt; `accessibilityLabel` on icon-only buttons

## Done when

- [ ] `npm run lint` and `npm test` pass
- [ ] No dead imports/exports; `rg "localhost:8080"` returns nothing
- [ ] Full manual pass: splash → auth → browse → detail → cart → order → seller flow works end-to-end
