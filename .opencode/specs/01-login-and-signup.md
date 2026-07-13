# Spec: Login and Signup

## Overview

Implement full authentication — register and login — connecting the existing UI screens to the backend with JWT. The frontend screens are already built but stubbed; the backend auth module exists only as empty files. This feature wires them together, adds token persistence, and protects the main app behind authentication.

---

## Feature Type

Full Stack

---

## Depends On

None

---

## User Roles

- Guest
- Buyer
- Seller
- Admin

---

## App Screens

- Login Screen (exists, needs API integration)
- Registration Screen (exists, needs API integration)

---

## Navigation

- `app/index.tsx` redirects unauthenticated users to `/(auth)/login`.
- After successful login/signup, navigate to `/(drawer)/(tabs)`.
- Add a check in `app/(drawer)/_layout.tsx` or a root guard to redirect to login if no token exists.
- The existing logout button in the drawer should clear the token and redirect to `/(auth)/login`.

---

## Backend Modules

### auth (modified)

- Controller — implement register, login, getMe
- Service — business logic for register, login, getMe
- Repository — create user, find by email, find by id
- Model — User model already exists at `src/model/user/user.model.ts`; move it into the auth module or keep it shared
- Validation — Zod schemas for register and login
- Routes — mount POST /register, POST /login, GET /me
- Events — emit `auth.user.registered` on signup

---

## API Endpoints

### POST `/api/auth/register`

- Purpose: Register a new user
- Authentication: None
- Body: `{ name, username, email, password, phone? }`
- Response: `{ success: true, data: { user, token } }`

### POST `/api/auth/login`

- Purpose: Authenticate and return JWT
- Authentication: None
- Body: `{ email, password }`
- Response: `{ success: true, data: { user, token } }`

### GET `/api/auth/me`

- Purpose: Return current authenticated user
- Authentication: Bearer token
- Response: `{ success: true, data: { user } }`

### POST `/api/auth/check-username`

- Purpose: Check if a username is already taken (used by signup screen)
- Authentication: None
- Body: `{ username }`
- Response: `{ success: true, data: { available: boolean } }`

---

## Database Changes

- The User model (`src/model/user/user.model.ts`) needs `username`, `phone` fields added and `role` field for Buyer/Seller/Admin.
- Add unique index on `username`.

---

## State Management

### Create

- `src/store/authSlice.ts` — Redux Toolkit slice for auth state: `user`, `token`, `isAuthenticated`, `isLoading`, `error`
- `src/store/index.ts` — Redux store configuration

### Modify

- Wrap the app in Redux Provider (in `app/_layout.tsx`)

---

## Components

### Create

- `src/components/AuthGuard.tsx` — Wraps protected routes; redirects to login if no token

### Modify

- No existing components need modification.

---

## Validation

### Frontend

- Email format validation (already exists in Signup screen)
- Password minimum 6 characters (already exists)
- Username no spaces (already exists)
- Required field checks (already exists)

### Backend (Zod)

- `registerSchema`: `name` (min 1), `username` (min 1, alphanumeric), `email` (valid email), `password` (min 6), `phone` (optional)
- `loginSchema`: `email` (valid email), `password` (min 1)
- `checkUsernameSchema`: `username` (min 1)

---

## Permissions

- Register and Login are public (no auth required).
- `GET /api/auth/me` requires a valid JWT Bearer token.
- All other protected routes in the future will use the `auth.middleware.ts`.

---

## Error Handling

- **Loading**: Button shows "Wait..." / spinner during API calls.
- **Error**: Inline error messages displayed below form fields or as alerts.
- **Network failure**: Catch and display "Something went wrong. Please try again."
- **Token expiry**: `GET /me` returning 401 triggers logout + redirect to login.

---

## Files to Create

### Frontend

```
src/store/authSlice.ts
src/store/index.ts
src/api/clients.ts
src/components/AuthGuard.tsx
```

### Backend

```
src/modules/auth/auth.repository.ts
src/modules/auth/auth.events.ts
```

---

## Files to Modify

### Frontend

- `app/_layout.tsx` — wrap with Redux Provider
- `app/(auth)/login.tsx` — connect to real API, store token, navigate on success
- `app/(auth)/Signup.tsx` — connect to real API, store token, navigate on success
- `app/(drawer)/_layout.tsx` — add auth guard / logout clears token
- `app/index.tsx` — check for existing token on launch

### Backend

- `src/modules/auth/auth.controller.ts` — implement register, login, getMe, checkUsername
- `src/modules/auth/auth.service.ts` — implement business logic
- `src/modules/auth/auth.validation.ts` — Zod schemas
- `src/modules/auth/auth.routes.ts` — full routes setup
- `src/modules/auth/auth.middleware.ts` — JWT verification middleware
- `src/model/user/user.model.ts` — add `username`, `phone`, `role` fields
- `src/app.ts` — mount auth routes (already mounted)
- `src/bootstrap/events.ts` — register auth events

---

## New Dependencies

- `@reduxjs/toolkit`
- `react-redux`
- `expo-secure-store` (for token persistence)

---

## Rules for Implementation

Always follow the rules defined in `AGENT.md`.

Additionally:

- Use TypeScript.
- Follow the existing project structure.
- Keep business logic separate from UI.
- Use reusable components.
- Use RTK Query for API communication.
- Follow the backend module architecture.
- Add backend APIs only when required.
- Support Buyer and Seller roles where applicable.
- Handle loading, empty, and error states.
- Use proper TypeScript types.
- Avoid duplicate code.
- Keep components modular and reusable.
- Follow existing naming conventions.

---

## Definition of Done

The feature is complete when all of the following are true:

- Navigation works correctly.
- All new screens open successfully.
- Backend APIs function correctly.
- Database changes are applied.
- Forms validate correctly.
- Loading state is implemented.
- Empty state is implemented.
- Error state is implemented.
- Permissions work correctly.
- TypeScript has no errors.
- Expo application runs successfully.
- Backend starts successfully.
- Feature follows the conventions defined in `AGENT.md`.
