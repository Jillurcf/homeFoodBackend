# M15 — Notifications & Buyer Receipt Confirmation

**Goal:** Add an in-app notification system for buyers and sellers, surfaced from the website navbar and the mobile app headers, and complete the order lifecycle with buyer receipt confirmation.

## Locked decisions

| Decision | Choice |
|---|---|
| Delivery | In-app notifications only, polling every 30 seconds while the app/site is open |
| Push/email/SMS | Out of scope for this milestone |
| Buyer receipt | “I received my food” appears only after the seller marks the order `ON_THE_WAY` |
| Website checkout | Enable a minimal COD checkout so website buyers can place real orders |
| Storage | One notification document per recipient |
| Seller recipients | Every seller who owns at least one food item in the order |
| Failure handling | Notification failure must never fail order creation or status updates |

## Current-state gaps

1. **Website catalog is static.** `homeFoodWebsite/src/components/home/home-data.ts` uses numeric IDs, but `POST /api/orders` requires Mongo `_id` values. Website checkout cannot work until the website catalog and cart are aligned with `GET /api/foods`.
2. **No global mobile header.** `homeFood/app/(tabs)/_layout.tsx` uses `headerShown: false`; screens render their own headers. The bell must be added as a shared component to the existing screen headers.
3. **Seller currently marks `DELIVERED`.** The new lifecycle is seller → `ON_THE_WAY`, buyer → `DELIVERED`.
4. **Multi-seller orders are possible.** Seller recipients must be resolved per order item, not from a single `restaurantId`.

## Architecture

```
Order placed ──► notification service ──► sellers of every food in order
Seller accepts ──► buyer
Seller declines ──► buyer
Seller marks out for delivery ──► buyer
Buyer confirms received ──► all sellers in order
```

Notifications are **best-effort side effects**. Order writes remain successful even if notification creation fails; failures are logged only.

## Data model

New collection: `Notification`

```ts
{
  recipientId: ObjectId, // ref User, required, indexed
  actorId?: ObjectId,    // ref User
  orderId: ObjectId,     // ref Order, required
  type:
    | "ORDER_PLACED"
    | "ORDER_ACCEPTED"
    | "ORDER_DECLINED"
    | "ORDER_ON_THE_WAY"
    | "ORDER_RECEIVED"
    | "ORDER_CANCELLED",
  title: string,
  message: string,
  data: {
    orderId: string,
    foodIds: string[],
    totalAmount: number,
    buyerName?: string,
    shopName?: string
  },
  isRead: boolean,       // default false
  readAt?: Date,
  dedupeKey: string,     // unique, prevents duplicate notifications
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

```ts
{ recipientId: 1, isRead: 1, createdAt: -1 }
{ recipientId: 1, createdAt: -1 }
{ dedupeKey: 1 } // unique
```

### Relationships

```
User 1 ─── N Notification (recipientId)
User 1 ─── N Notification (actorId)
Order 1 ── N Notification (orderId)
Food.sellerId → resolved at event time to determine seller recipients
```

No join collection is required.

## Notification API

All endpoints require `authenticate`. Users can only access their own notifications.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/notifications?limit=20&cursor=&unreadOnly=true` | Paginated list + unread count |
| GET | `/api/notifications/unread-count` | Bell badge count |
| PATCH | `/api/notifications/:id/read` | Mark one notification as read |
| PATCH | `/api/notifications/read-all` | Mark all notifications as read |

Response follows the existing envelope:

```json
{
  "success": true,
  "data": {
    "items": [],
    "nextCursor": null,
    "unreadCount": 0
  }
}
```

### Cursor rules

- Cursor is encoded from `createdAt` + `_id` to keep pagination stable.
- Default limit: `20`; maximum: `50`.
- `unreadOnly=true` filters `isRead: false`.
- Mutation responses must verify `recipientId === req.user.id`.

## Order lifecycle

### Allowed transitions

| From | To | Actor |
|---|---|---|
| `PENDING` | `PREPARING` | Seller accept |
| `PENDING` | `CANCELLED` | Seller decline |
| `CONFIRMED` | `PREPARING` | Seller accept |
| `CONFIRMED` | `CANCELLED` | Seller decline |
| `PREPARING` | `ON_THE_WAY` | Seller |
| `PREPARING` | `CANCELLED` | Seller |
| `ON_THE_WAY` | `DELIVERED` | Buyer via new receive endpoint |
| `ON_THE_WAY` | `CANCELLED` | Admin only |

Remove the seller’s direct `PREPARING → DELIVERED` action. Keep the admin override.

### New buyer endpoint

```
POST /api/orders/:orderId/receive
```

Rules:

- Buyer only.
- Order must belong to the authenticated buyer.
- Current status must be `ON_THE_WAY`.
- Sets status to `DELIVERED`.
- Returns the updated order.
- Emits the normal `order.status.updated` event.

## Notification matrix

| Event | Actor | Recipients | Type |
|---|---|---|---|
| Order created | Buyer | Sellers of all food IDs in order | `ORDER_PLACED` |
| Seller accepts | Seller | Buyer | `ORDER_ACCEPTED` |
| Seller declines | Seller | Buyer | `ORDER_DECLINED` |
| Seller marks out for delivery | Seller | Buyer | `ORDER_ON_THE_WAY` |
| Buyer confirms received | Buyer | All sellers in order | `ORDER_RECEIVED` |
| Cancellation/admin override | Admin/Seller | Buyer and/or affected sellers | `ORDER_CANCELLED` |

Rules:

- Never notify the actor.
- One document per recipient per event.
- Use `dedupeKey` such as `ORDER_PLACED:<orderId>:<sellerId>` and `ORDER_ACCEPTED:<orderId>`.
- Resolve sellers with a single query: `Food.find({ _id: { $in: foodIds } }).distinct("sellerId")`.
- Store `buyerName` and `shopName` only as display snapshots; never rely on them for authorization.

## Milestones

### M15.1 — Notification backend foundation

- [ ] Create `homeFoodBackend/src/modules/notifications/`
  - `notification.model.ts`
  - `notification.repository.ts`
  - `notification.service.ts`
  - `notification.controller.ts`
  - `notification.routes.ts`
  - `notification.validation.ts`
- [ ] Implement list, unread count, mark one read, mark all read.
- [ ] Add cursor pagination and `unreadOnly`.
- [ ] Enforce `recipientId` ownership on every read and mutation.
- [ ] Mount `/api/notifications` in `src/app.ts`.
- [ ] Add notification tests to `homeFoodBackend/vitest.config.ts`.

**Done when:** an authenticated user can list only their notifications, unread count is accurate, and cross-user access is rejected.

### M15.2 — Order triggers + buyer receipt API

- [x] Update `order.service.ts` transitions: add `PREPARING → ON_THE_WAY`; remove seller direct `PREPARING → DELIVERED`.
- [x] Extend `order.status.updated` emission with `previousStatus` and `actorId` while keeping the existing first argument compatible.
- [x] Add `POST /api/orders/:orderId/receive` in controller/routes/service with buyer ownership and `ON_THE_WAY` guard.
- [x] Implement `notifyOrderPlaced(order)` and `notifyOrderStatusChange(order, previousStatus, actorId)`.
- [x] Register notification listeners in `bootstrap/events.ts` after the DB connection.
- [x] Wrap notification work in best-effort `try/catch` so order operations still succeed.
- [x] Resolve seller IDs in one query.

**Done when:** placing an order creates one notification per unique seller; accept/decline/out-for-delivery/receive create the correct recipient notifications exactly once.

### M15.3 — Mobile notification UI

- [ ] Add `homeFood/src/api/notifications.ts` with RTK Query endpoints and a `Notifications` tag.
- [ ] Register reducer/middleware in `src/store/index.ts`.
- [ ] Poll `unread-count` every 30 seconds only when authenticated.
- [ ] Create `src/components/notifications/NotificationBell.tsx` with badge and `99+` cap.
- [ ] Create `app/(stack)/notifications.tsx`:
  - List with unread styling
  - Mark one read
  - Mark all read
  - Pull-to-refresh
  - Empty state
- [ ] Add the bell to existing headers:
  - `app/(tabs)/index.tsx`
  - `app/(tabs)/orders.tsx`
  - `app/(tabs)/profile.tsx`
  - `app/(stack)/seller/dashboard.tsx`
  - `app/(stack)/seller/orders.tsx`
- [ ] Tapping a notification marks it read and routes buyer → order detail, seller → seller orders.

**Done when:** the bell badge updates within 30 seconds, opening the list marks notifications, and guests make no notification API calls.

### M15.4 — Mobile order receipt flow

- [x] Add a `receiveOrder` mutation to `src/api/orders.ts`.
- [x] Update `app/(stack)/order/[id].tsx`:
  - Add an `ON_THE_WAY` timeline step.
  - Show “I received my food” only when status is `ON_THE_WAY`.
  - Call the receive endpoint, show success, and invalidate orders/notifications.
- [x] Update `app/(stack)/seller/orders.tsx`: replace “Mark as delivered” with “Mark out for delivery” (`ON_THE_WAY`).
- [x] Update seller/dashboard copy that assumes seller-delivered.

**Done when:** the buyer can confirm only after out-for-delivery, the seller receives a receipt notification, and both sides see `DELIVERED`.

### M15.5 — Website notifications

- [x] Add `src/components/common/notifications-provider.tsx` inside `AppProviders`.
  - Poll unread count every 30 seconds.
  - Refresh on window focus; pause when hidden.
  - Expose `items`, `unreadCount`, `loading`, `markRead`, `markAllRead`, `refresh`.
- [x] Add `src/components/common/notification-bell.tsx`:
  - Bell + unread badge
  - Dropdown/panel with latest notifications
  - Mark all read
  - Empty state
  - Accessible labels, outside-click and Escape close
- [x] Add the bell to `Nav.tsx` desktop actions and the mobile right-side group.
- [x] Add `src/app/(common)/notifications/page.tsx` for full history.
- [x] Link buyer notifications to `/my-orders?orderId=...` and seller notifications to `/orders?orderId=...`.

**Done when:** the website bell works for buyer, seller, and admin sessions, unread counts clear correctly, and no polling occurs while logged out.

### M15.6 — Website checkout + receipt flow

**Prerequisite:** align the website catalog with the backend.

- [x] Replace the static catalog source in `src/lib/foods.ts` with `GET /api/foods`.
- [x] Change `FoodItem.id` and cart/favorites keys from numeric IDs to Mongo `_id` strings across cart, cards, and detail pages.
- [x] Use the public food fetch for browsing and authenticated order creation for checkout.

**Checkout**

- [x] Enable the disabled “Proceed to checkout” button in `(buyer)/cart/page.tsx`.
- [x] Require login; redirect guests to `/login?next=/cart`.
- [x] Add a minimal COD form: phone, address line, area, optional city/note.
- [x] Submit `POST /api/orders` with real `foodId`s, quantities, prices, delivery address, and `paymentMethod: "cod"`.
- [x] Clear the cart, redirect to `/my-orders`, and handle 401/validation errors.

**Receipt + seller actions**

- [x] In `(buyer)/my-orders/page.tsx`, add “I received my food” when status is `ON_THE_WAY`; call `POST /orders/:id/receive`.
- [x] Highlight the order selected via `?orderId=`.
- [x] In `seller/orders-view.tsx`, replace “Mark as delivered” with “Mark out for delivery”.
- [x] Refresh notifications after checkout, status updates, and receipt confirmation.

**Done when:** a website buyer can place a real COD order, the seller is notified, the seller accepts and marks out-for-delivery, the buyer confirms receipt, and the seller sees the delivery notification.

### M15.7 — Tests, verification, docs

**Backend**

- [x] Notification service creates one document per seller, skips the actor, and dedupes.
- [x] List/count/mark-read enforce recipient ownership.
- [x] Receive endpoint: 401 guest, 403 non-owner/seller, 400 wrong status, 200 owner.
- [x] Transition tests reject seller `PREPARING → DELIVERED` and allow buyer `ON_THE_WAY → DELIVERED`.
- [x] Route tests for notification endpoints.

**Mobile**

- [x] Notification and receipt API requests use the authenticated session and parse the receipt response.
- [ ] Badge renders the correct count.
- [ ] Notification screen renders unread/read states.
- [ ] Receive button visibility and mutation behavior.

**Commands**

```bash
cd homeFoodBackend && npx vitest run src/modules/orders/__tests__/order.service.test.ts src/modules/orders/__tests__/order.routes.test.ts src/modules/notifications/__tests__/notification.service.test.ts src/modules/notifications/__tests__/notification.routes.test.ts && npm run build
cd homeFood && npx vitest run src/api/__tests__/orders-notifications.test.ts && npm run lint
cd homeFoodWebsite && npm run lint && npx tsc --noEmit && npm run build
```

**Verification results (2026-10-25)**

- M15 backend tests: 50 passed; backend TypeScript build passed.
- Mobile M15 API tests: 2 passed; mobile lint passed with existing warnings.
- Website lint, TypeScript check, and production build passed. Website has no test runner configured.
- The full backend test run currently has 16 failures in auth tests (128 passed); the full mobile test run has unrelated existing test/Expo transform failures (107 passed, 34 failed). These do not fail the focused M15 test commands above.
- Mobile UI rendering checks remain open because the current Vitest/Expo setup fails to transform React Native screen dependencies. No mobile simulator UI run or authenticated cross-platform end-to-end run was performed.

**Manual end-to-end checklist**

- [ ] Buyer places an order from mobile and website.
- [ ] Every seller in the order gets one notification.
- [ ] Seller accepts; buyer gets `ORDER_ACCEPTED`.
- [ ] Seller marks out for delivery; buyer gets `ORDER_ON_THE_WAY`.
- [ ] Buyer sees and clicks “I received my food”.
- [ ] Order becomes `DELIVERED`; seller gets `ORDER_RECEIVED`.
- [ ] Mark one/all read; the badge resets.
- [ ] Buyer cannot read another buyer’s notifications; seller cannot mutate other recipients’ notifications.

## Risks & notes

- **Website catalog migration is the largest part of M15.6.** Without it, website checkout cannot create valid backend orders.
- **Multi-seller mobile seller view currently shows all order items**, while the website filters to the seller’s own items. Consider fixing this in M15.2/M15.4 so seller order details and notifications do not expose other sellers’ items.
- **Polling load** stays low by polling only unread count; full lists load when the panel/page opens.
- **Push/email/SMS** can reuse the notification records in a later milestone.
- **Existing tests** may need mock updates when `order.status.updated` gains extra arguments.
