# M03 — Auth Redesign

**Goal:** Login/signup look and behave like the website AuthShell; register collects website fields.

## UI (website refs: `(auth)/login`, `(auth)/register`, `auth-shell.tsx`)

- Shared `AuthShell`: centered white card on `bg-background`, logo (`assets/images/logo3.png`), title + subtitle
- Inputs via `ui/Input`; primary `PillButton` submit with loading state
- **Login:** email, password, show/hide, error text, link to signup
- **Signup:** full name, email, mobile, **NID number (10–17 digits)**, address — per-field validation matching website
- Delete dark-theme styling, `#003CFF` buttons, and `font-Robo*` usages

## Backend

- Extend register validation (`homeFoodBackend/src/modules/auth/`) to accept optional `nidNumber` + `address` (store on User model)
- NID image upload deferred (needs multipart) — not in UI yet

## Bugs fixed here

- Remove `EmailVerification.tsx` (runtime bug), `OtpVerification.tsx`, `ForgetPassword.tsx` — website has no forgot-password either
- Remove TOS/PP dead links + broken `HtmlToText` / `PrivacyPolicyHtmlToText` components

## Done when

- [ ] Login/signup render in light theme from UI kit only
- [ ] Register with NID + address succeeds against backend and restores session
- [ ] Old auth screens deleted
- [ ] `npm run lint` passes
