# Forgot Password + OTP + Change Password

Password recovery for the website and mobile app, backed by shared REST
endpoints. OTP codes are delivered by email through SMTP.

## API endpoints (backend)

| Method | Path | Auth | Body | Response `data` |
| --- | --- | --- | --- | --- |
| POST | `/auth/forgot-password` | No | `{ email }` | `{ sent, expiresInMinutes, cooldownSeconds }` |
| POST | `/auth/resend-otp` | No | `{ email }` | same as above |
| POST | `/auth/verify-otp` | No | `{ email, otp }` | `{ resetToken, expiresInMinutes }` |
| POST | `/auth/reset-password` | No | `{ resetToken, newPassword }` | `{ message }` |
| POST | `/auth/change-password` | Bearer | `{ currentPassword, newPassword }` | `{ message }` |

- OTPs are 6 digits, hashed at rest, expire after `OTP_TTL_MINUTES`, and allow
  `OTP_MAX_ATTEMPTS` failed tries.
- `forgot-password` / `resend-otp` always return the same shape to avoid
  account enumeration.
- Resends are throttled by `OTP_RESEND_COOLDOWN_SECONDS`.
- `resetToken` is a short-lived JWT scoped to password resets.

## SMTP setup (backend `.env.local`)

`.env.local` is loaded before `.env`.

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM="HomeFood <your_email@gmail.com>"
SUPPORT_EMAIL=gharerkhabar.net@gmail.com
APP_NAME=HomeFood
OTP_TTL_MINUTES=10
OTP_MAX_ATTEMPTS=5
OTP_RESEND_COOLDOWN_SECONDS=60
```

For Gmail, set `SMTP_USER` to the full Gmail address, enable 2FA, and create an
App Password for `SMTP_PASS`. Configure the same sender address in `SMTP_FROM`.
Password reset requests now return an error if SMTP is missing or delivery
fails; failed sends do not leave a cooldown behind, so the user can retry.
Set these variables in the backend deployment environment as well as local
`.env.local`. Contact messages are saved for admins even when SMTP delivery is
unavailable; configure SMTP to send notifications to `SUPPORT_EMAIL`.

## Web screens

- `/login` — "Forgot password?" link.
- `/forgot-password` — email → 6-digit OTP (with resend timer) → new password
  → done.
- `/change-password` — for logged-in users; linked from the nav and footer.

The mobile app uses the same endpoints; implement matching screens there.

## Milestones

- [x] **M1 — Backend API.** OTP model/repository, mailer, service, controller,
      validation, routes.
- [x] **M2 — SMTP config.** `.env.local` / `.env.example` variables and
      explicit password-reset delivery failures.
- [x] **M3 — Web forgot-password flow.** Login link + email/OTP/reset steps.
- [x] **M4 — Change password.** Authenticated API + web page linked in nav and
      footer.
- [x] **M5 — Mobile app.** Add forgot-password and change-password screens using
      the same endpoints.
- [ ] **M6 — Hardening.** Optional token-version invalidation so existing
      sessions are revoked after a password change; add route-level tests.

## Files

**Backend**

- `src/config/env.ts`
- `src/utils/mailer.ts`
- `src/modules/auth/passwordReset.model.ts`
- `src/modules/auth/passwordReset.repository.ts`
- `src/modules/auth/passwordReset.service.ts`
- `src/modules/auth/passwordReset.controller.ts`
- `src/modules/auth/passwordReset.validation.ts`
- `src/modules/auth/auth.repository.ts`
- `src/modules/auth/auth.routes.ts`

**Website**

- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/forgot-password/page.tsx`
- `src/app/(common)/change-password/page.tsx`
- `src/components/common/Nav.tsx`
- `src/components/common/Footer.tsx`

**Mobile**

- `src/api/auth.ts`
- `app/(auth)/login.tsx`
- `app/(auth)/forgot-password.tsx`
- `app/(stack)/change-password.tsx`
- `app/(tabs)/profile.tsx`
