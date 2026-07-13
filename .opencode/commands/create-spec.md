---
description: Create a specification and feature branch for the next Home Food feature.

argument-hint: "Step number and feature name (Example: 02 registration)"

allowed-tools: Read, Write, Glob, Bash(git:*)
---

You are a senior full-stack developer working on the **Home Food** project.

Always follow the conventions defined in `AGENT.md`.

User input:

`$ARGUMENTS`

---

# Step 1 — Parse Arguments

Extract the following values from `$ARGUMENTS`.

## 1. step_number

Convert to a two-digit number.

Examples:

- 2 → 02
- 11 → 11

## 2. feature_title

A human-readable feature title in **Title Case**.

Examples:

- Registration
- Seller Dashboard
- Food Details
- Shopping Cart

## 3. feature_slug

A lowercase kebab-case slug.

Rules:

- Only `a-z`
- Only `0-9`
- Hyphen (`-`) allowed
- Maximum 40 characters

Examples:

- registration
- seller-dashboard
- shopping-cart

## 4. branch_name

Format:

```text
feature/<feature_slug>
```

Example:

```text
feature/seller-dashboard
```

If any required value cannot be determined, ask the user before proceeding.

---

# Step 2 — Research the Project

Before creating the specification, read the following:

- `AGENT.md`
- `homeFood/AGENTS.md`
- Every specification inside `.opencode/specs/`

Review:

- Project roadmap
- Existing completed features
- Folder structure
- Naming conventions
- Navigation structure
- API conventions
- Backend architecture

If the requested feature already exists or is marked as completed, warn the user and stop.

Do **not** generate duplicate specifications.

---

# Step 3 — Generate the Specification

Create a Markdown document using **exactly** the following structure.

# Spec: <feature_title>

## Overview

Describe:

- What this feature does.
- Why it exists.
- Why it is needed at this stage of the Home Food project.

---

## Feature Type

Choose one:

- Frontend
- Backend
- Full Stack

---

## Depends On

List prerequisite features.

If none:

```text
None
```

---

## User Roles

Specify which roles can access this feature.

Examples:

- Guest
- Buyer
- Seller
- Admin

---

## App Screens

List every new Expo screen.

Example:

- Login Screen
- Registration Screen
- Home Screen
- Food Details Screen
- Seller Dashboard
- Shopping Cart
- Checkout Screen

If no screens are required:

```text
No new screens.
```

---

## Navigation

Describe any navigation updates.

Include changes to:

- Expo Router routes
- Stack navigation
- Bottom tabs
- Drawer navigation
- Protected routes
- Authentication flow

If unchanged:

```text
No navigation changes.
```

---

## Backend Modules

List every backend module that will be added or modified.

Example:

- auth
- users
- foods
- orders
- reviews
- favorites

For each module specify whether it requires:

- Controller
- Service
- Repository
- Model
- Validation
- Routes
- Events

If there are no backend changes:

```text
No backend changes.
```

---

## API Endpoints

List every required API endpoint.

For each endpoint include:

- HTTP Method
- Route
- Purpose
- Authentication
- Request Body
- Response

Example:

- GET `/api/foods`
- GET `/api/foods/:id`
- POST `/api/foods`
- PATCH `/api/foods/:id`
- DELETE `/api/foods/:id`

If no API changes:

```text
No API changes.
```

---

## Database Changes

Describe any database updates.

Examples:

- New collections
- New models
- Schema updates
- Indexes
- Relationships

If none:

```text
No database changes.
```

---

## State Management

Describe any updates to:

- RTK Query
- Redux Toolkit
- Context API
- Local State

If none:

```text
No state changes.
```

---

## Components

### Create

List every reusable component to create.

Examples:

- FoodCard
- SellerCard
- RatingStars
- QuantitySelector
- FoodImageCarousel

### Modify

List every existing component that requires updates.

---

## Validation

Describe:

- Form validation
- API validation
- Business rules

If none:

```text
No additional validation.
```

---

## Permissions

Describe:

- Authentication requirements
- Authorization rules
- Buyer/Seller/Admin permissions

If none:

```text
No additional permissions.
```

---

## Error Handling

Describe:

- Loading state
- Empty state
- Error state
- Retry behavior
- Offline handling (if applicable)

---

## Files to Create

List every new file.

Separate frontend and backend where applicable.

Typical frontend folders:

```text
app/
components/
features/
hooks/
services/
api/
constants/
types/
utils/
assets/
```

Typical backend folders:

```text
src/modules/
src/config/
src/middlewares/
src/bootstrap/
```

---

## Files to Modify

List every existing file that will be modified.

---

## New Dependencies

List any new npm packages.

Examples:

- react-hook-form
- zod
- expo-image-picker
- expo-location
- expo-notifications
- react-native-maps

If none:

```text
No new dependencies.
```

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

---

# Step 4 — Save the Specification

Save the specification to:

```text
.opencode/specs/<step_number>-<feature_slug>.md
```

Example:

```text
.opencode/specs/02-registration.md
```

---

# Step 5 — Create the Git Branch

Create and checkout the feature branch:

```text
feature/<feature_slug>
```

Example:

```text
feature/registration
```

---

# Step 6 — Report

Print **only** the following summary:

```text
Branch:    <branch_name>
Spec file: .opencode/specs/<step_number>-<feature_slug>.md
Title:     <feature_title>
```

Then print:

> Review the spec at `.opencode/specs/<step_number>-<feature_slug>.md`, then enter **Plan Mode** with **Shift + Tab twice** to begin implementation.

Do **not** print the full specification unless explicitly requested.