# M07 — Cart & Checkout

**Goal:** Working cart + real order placement (website cart is localStorage-only; checkout disabled — mobile goes further via backend).

## Cart (client-persisted, website ref: `browse/store.tsx` + `cart/page.tsx`)

Create `homeFood/src/store/cartStore.tsx` (Context + AsyncStorage, key `homefood:cart`):

- `items: { foodId, qty }[]`, `addItem`, `setQty`, `removeItem`, `clear`, `totalItems`
- `app/(tabs)/cart.tsx`: line items (thumb, name, verified seller, per-line qty stepper disabled if sold out, trash, line total), clear cart, order summary card (subtotal, "Delivery calculated at checkout", total, primary "Place order" button), empty `EmptyState`
- Cart tab badge reads `totalItems`

## Checkout → backend

- `POST /api/orders` already exists — extend order model/validation to accept `items: [{ foodId, qty, price }]` + delivery address snapshot + payment method (`cod` only for now; bKash/NAGAD later)
- Validate foods are available; compute server-side total
- On success: clear cart, navigate to order confirmation (M08 detail screen or simple success screen)
- Website's "Checkout coming soon" disabled button is intentionally surpassed here

## Done when

- [ ] Add-to-cart from cards/detail updates cart + tab badge; persists across app restart
- [ ] Qty stepper + remove work; sold-out items not purchasable
- [ ] Place order creates a real order via API and clears cart
- [ ] `npm run lint` passes
