# M19 — Terms QA & Rollout

**Goal:** Verify consent flows on both platforms and deploy without breaking older clients.

## Test matrix

| Case | Expected |
|---|---|
| Buyer signs up with consent | Account role `buyer`; buyer acceptance stored |
| Seller signs up with consent | Account role `seller`; seller acceptance stored; routed to onboarding |
| Signup without consent | Submit blocked; inline error |
| Backend receives `acceptedTerms: false` | `400` |
| Backend receives stale `termsVersion` | `400` |
| Seller completes onboarding | Seller acceptance stored; role remains `seller` |
| Buyer/seller terms pages | All sections render in Bangla before login |

## Commands

```bash
# Backend
cd homeFoodBackend
npx vitest run
npm run build

# Mobile
cd homeFood
npm run lint
npx vitest run app/__tests__/signup-screen.test.tsx

# Web
cd homeFoodWebsite
npm run lint
npx tsc --noEmit
```

## Rollout

- Deploy backend and both clients together; `acceptedTerms` becomes required.
- If staged rollout is needed, keep backend acceptance optional temporarily and log missing consent.
- When legal copy changes, bump `TERMS_VERSION` in both apps and the backend in the same release.
- Update the existing stale mobile signup test if it no longer matches the current screen.

## Done when

- [ ] All matrix cases pass on web and mobile
- [ ] Consent records are visible in the database
- [ ] Older-client risk is documented or mitigated
- [ ] Lint, typecheck, build, and backend tests pass
