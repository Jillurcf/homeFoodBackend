# M18 — Backend Acceptance & Seller Onboarding

**Goal:** Persist terms acceptance and require seller terms when a buyer becomes a seller.

## Locked decisions

| Decision | Choice |
|---|---|
| Storage | Nested `termsAcceptance` on User |
| Roles | `buyer` or `seller` only at registration |
| Version check | Must match backend `TERMS_VERSION` |
| Seller onboarding | Requires seller terms acceptance when creating a shop |
| Existing shops | Re-saving does not require re-acceptance |

## Data model

`User` adds:

```ts
termsAcceptance?: {
  buyer?: { version: string; acceptedAt: Date };
  seller?: { version: string; acceptedAt: Date };
};
```

Registration stores acceptance under the selected role. New shop creation stores seller acceptance.

## Backend changes

- `src/config/terms.ts` — export `TERMS_VERSION = "1.0"`
- `src/model/user/user.model.ts` — add `termsAcceptance` sub-schema (`_id: false`)
- `src/modules/auth/auth.validation.ts` — add `role`, required `acceptedTerms`, matching `termsVersion`
- `src/modules/auth/auth.service.ts` — create user with selected role and acceptance record
- `src/modules/foodMakers/foodMaker.validation.ts` — accept optional `acceptedTerms` / `termsVersion`
- `src/modules/foodMakers/foodMaker.service.ts` — require them for new shops; set `role: "seller"` and seller acceptance

## Seller onboarding UI

**Web** `src/components/seller/onboarding-wizard.tsx`
**Mobile** `app/(stack)/seller/onboarding.tsx`

- Add a required seller-terms checkbox on the review step.
- Link to the seller terms page.
- Send `acceptedTerms: true` and `termsVersion` with the shop payload.

## Done when

- [ ] Registration stores role, version, and acceptance timestamp
- [ ] Backend rejects missing acceptance and version mismatches
- [ ] New shop creation requires seller acceptance
- [ ] Existing seller shop updates still succeed
- [ ] Backend `npx vitest run` and `npm run build` pass
