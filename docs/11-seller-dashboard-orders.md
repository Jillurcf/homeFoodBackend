# M11 — Seller Dashboard & Orders

**Goal:** Seller dashboard with stats + full order lifecycle, matching website `/dashboard` and `/orders`.

## Website refs

`dashboard-view.tsx`, `orders-view.tsx`, `StatusPill`, `StatCard`

## Backend

- `GET /api/orders/seller-orders` — seller's incoming orders (auth, role seller)
- `PATCH /api/orders/:orderId/status` — exists; enforce transitions: new→preparing (accept), new→cancelled (decline), preparing→delivered (mark delivered)
- `GET /api/shops/me/stats` — today's orders, pending, completed, today's earnings, total earnings, avg rating, popular foods (top 3 by qty)

## UI

`app/(stack)/seller/dashboard.tsx`:

- Greeting + shop name + "Kitchen is live" emerald pill (or verification-pending amber if `verified=false`)
- Gradient next-action banner (`bg-primary → primaryDark`): accept N orders / add first dish
- 4 `StatCard`s (Today's orders, Pending, Completed, Today's earnings — icon tints orange/amber/emerald/violet like website)
- Recent orders panel + quick actions (Add a dish, Manage orders, Settings)

`app/(stack)/seller/orders.tsx`:

- Segmented filter All/New/Preparing/Delivered/Cancelled + count chips
- Expandable order cards: id, StatusPill, customer·area, total, date; expanded: itemized lines, address, phone, customer note (amber box)
- Actions: **Accept** (→preparing), **Decline** (→cancelled) for new; **Mark as delivered** for preparing

## Done when

- [ ] Dashboard shows real stats from API
- [ ] Accept/decline/deliver updates status; buyer sees it in M08 history
- [ ] `npm run lint` passes
