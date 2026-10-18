# M04 — Backend Foods API

**Goal:** Real foods module in `homeFoodBackend` so the app stops using hardcoded data.

## Backend (follow `src/modules/orders/` pattern)

Create `homeFoodBackend/src/modules/foods/`:

- `food.model.ts` — Mongoose schema: name, description, price, category, perUnit, prepTime, maxOrdersPerDay, availability (`available | low | sold_out`), imageUrl, dietaryTags[], sellerId (ref FoodMaker/User), area, rating aggregate, reviewCount, createdAt
- `food.validation.ts` — Zod: list query (category, search, area, minPrice, maxPrice, minRating, inStock, sort, page), create/update body
- `food.repository.ts` — list with filters + pagination, getById, create, update, delete (scoped to seller)
- `food.service.ts` — business logic + emits events
- `food.controller.ts` — HTTP handlers
- `food.routes.ts` — mount in `app.ts`:
  - `GET /api/foods` (public, filters)
  - `GET /api/foods/:id`
  - `POST /api/foods` (auth, seller)
  - `PATCH /api/foods/:id` (auth, owner)
  - `DELETE /api/foods/:id` (auth, owner)
  - `GET /api/foods/categories` (distinct categories + counts)
- Seed script (`npm run seed:foods`) — 8–12 Bengali dishes using `assets/images/HomeFoodImg/*.jpg` and a demo seller, so browse works immediately

## Done when

- [ ] `GET /api/foods` returns filtered/paginated list; `/:id` works
- [ ] Seller CRUD works with auth token
- [ ] Seed script populates DB
- [ ] Backend `npm run build` passes
