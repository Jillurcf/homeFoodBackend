# M17 — Registration Role & Consent

**Goal:** Let users choose Buyer or Seller at signup, read the matching Bangla terms, and accept them before creating an account.

## Locked decisions

| Decision | Choice |
|---|---|
| Role selector | Buyer / Seller toggle on both signup screens |
| Default role | Buyer |
| Consent | Required checkbox with a link to the selected role’s terms |
| Terms link | Opens the terms page without losing form state |
| Buyer landing | Home / tabs |
| Seller landing | Seller onboarding |

## API contract

`POST /api/auth/register` adds:

```json
{
  "role": "buyer | seller",
  "acceptedTerms": true,
  "termsVersion": "1.0"
}
```

Backend rejects missing/false acceptance or a stale version.

## Files

**Web**
- `src/app/(auth)/register/page.tsx` — role toggle, consent checkbox, routing
- `src/components/common/auth-provider.tsx` — extend `RegisterInput`

**Mobile**
- `app/(auth)/Signup.tsx` — role toggle, consent checkbox, routing
- `src/store/authSlice.ts` — extend register payload

## UI and validation

- Role toggle uses accessible radio/segmented controls.
- Checkbox label is in Bangla and links to `/terms/buyer` or `/terms/seller`.
- Submit is disabled until the checkbox is checked.
- Submitting without consent shows an inline error.
- The checkbox and role selector expose `accessibilityRole` / `accessibilityState`.
- After success: buyer → home, seller → seller onboarding.

## Done when

- [ ] Both platforms offer Buyer/Seller selection
- [ ] Users can open the matching Bangla terms before registering
- [ ] Registration is blocked until consent is checked
- [ ] Seller signup routes to onboarding; buyer signup routes home
- [ ] `npm run lint` passes in both frontend projects
