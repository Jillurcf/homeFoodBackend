# M08 — Buyer Orders

**Goal:** Order history + status tracking using the existing backend orders API.

## Website ref

Website has no buyer order page — this is a mobile extension using the seller status vocabulary from `orders-view.tsx`.

## Backend

- Verify `GET /api/orders/my-orders` returns buyer's orders with items + status; `GET /api/orders/:orderId` for detail
- Ensure `userId` from auth middleware filters correctly

## UI

`app/(tabs)/orders.tsx`:

- Segmented filter: All / New / Preparing / Delivered / Cancelled
- Order cards: order id, `StatusPill` (new=amber, preparing=primary/10, delivered=emerald, cancelled=red), date, item count, total
- Tap → `app/(stack)/order/[id].tsx`: itemized lines with prices, delivery address, status timeline (placed → preparing → delivered), total
- Empty `EmptyState` ("No orders yet" + CTA → Home)

## Done when

- [ ] Placed orders (M07) appear in history with correct status
- [ ] Segmented filter works; detail screen shows lines + timeline
- [ ] `npm run lint` passes
