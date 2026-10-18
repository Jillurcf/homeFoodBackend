# M12 — Seller Menu & Reviews

**Goal:** Dish CRUD with photo + reviews with seller replies, matching website `/add-food` and `/reviews`.

## Website refs

`add-food-view.tsx`, `reviews-view.tsx`

## Backend

Reviews module (`homeFoodBackend/src/modules/reviews/`, follow orders pattern):

- Model: foodId, orderId?, buyerId, rating 1–5, comment, sellerReply, repliedAt
- Routes: `GET /api/reviews?foodId=` (public), `GET /api/reviews/seller` (auth), `POST /api/reviews` (auth buyer, one per order item), `POST /api/reviews/:id/reply` (auth, shop owner)
- Keep food `rating`/`reviewCount` aggregates updated on create

Foods CRUD already exists (M04) — verify seller scoping works.

## UI

`app/(stack)/seller/menu.tsx`:

- Form: photo (expo-image-picker → upload or base64 data URL), name, category select, per-unit select, price ৳, prep time, max orders/day, availability segmented, description
- Validation matching website; Add/Edit/Cancel; delete with inline red confirm
- Dish list with thumb, availability pill, edit/delete

`app/(stack)/seller/reviews.tsx`:

- Avg rating summary card + segmented filter (All / 5★ / 4★ / 3 & below)
- Review cards: initials avatar, author, area·date, stars, dish pill, text
- Reply editor: "Reply to this review" textarea → Send; saved reply shown in tinted box
- "Why reply?" tip card

## Done when

- [ ] Create/edit/delete dish reflects on buyer browse/detail immediately
- [ ] Seller sees reviews for own foods; replies persist and show to buyers
- [ ] `npm run lint` passes
