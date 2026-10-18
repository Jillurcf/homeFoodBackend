# M13 — My Shop & Marketing Pages

**Goal:** Public shop preview + static trust/content screens, matching website `/myshop`, `/aboutus`, `/help`, `/trust-safety`, `/contact`.

## Website refs

`(common)/myshop/page.tsx`, `aboutus`, `help`, `trust-safety`, `contact` pages

## UI

`app/(stack)/seller/myshop.tsx`:

- No profile: pitch card ("Turn your home cooking into a small business") + 3 numbered steps + "Start selling" CTA → onboarding
- With profile: orange gradient header (avatar, shop name + verified badge, owner·area, bio, stat tiles: dishes / avg rating / orders delivered / total earned), quick-link cards (Add dishes, Manage orders), menu panel with dish tiles + "Edit menu"

Static screens under `app/(stack)/marketing/`:

- `about.tsx` — mission cards, dark ink "Our Founder" block, vision goals with check icons
- `help.tsx` — 4 topic cards, pill filters, accordion FAQ (reuse website's 12 FAQ strings)
- `trust.tsx` — 4 trust pillars, verification steps, ink buyer-protection block, gradient "Spot a problem?" CTA → contact
- `contact.tsx` — 4 contact info cards + form (name, email, mobile, topic select, message) with success state (store submissions locally for now)

Linked from Profile menu (M09) and seller dashboard.

## Done when

- [ ] Myshop renders real shop + dishes from API; pitch shown when no shop
- [ ] 4 marketing screens render with website copy, styled via UI kit
- [ ] `npm run lint` passes
