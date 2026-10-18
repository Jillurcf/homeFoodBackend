# M05 — Home Browse

**Goal:** Home screen identical in function to website `/` (browse page).

## Website ref

`homeFoodWebsite/src/app/page.tsx` + `src/components/browse/{browse-controls,food-card,empty-state,store}.tsx`

## UI

`app/(tabs)/index.tsx`:

- Header: Bengali eyebrow + title ("ঘরের খাবার / Discover homemade food near you")
- Search input (pill, leading icon) — debounced, hits `GET /api/foods?search=`
- Category chips row with counts (from `/api/foods/categories`)
- Toolbar: results count, Favourites toggle, Filters button (active count badge), Sort (recommended / top rated / most reviewed / price asc / desc)
- Filter panel (bottom sheet or collapsible): category, price tiers, min rating, area, dietary tags, in-stock only
- Active filter chips (removable) + Clear all
- 2-column grid of `FoodCard` (image 4:3, category tag, availability pill, favorite heart, seller + verified, stars, 2 tag pills, price + Add button)
- Skeletons while loading; context-aware `EmptyState`

## API

- `GET /api/foods` + query params (M04)
- Favorites: local store (M09 wires heart persistence; for now heart is local state)

## Done when

- [ ] Search, category chips, filters, sort all affect the list via API
- [ ] Cards match website look (pills, amber stars, availability tints)
- [ ] Loading skeletons + empty state shown correctly
- [ ] `npm run lint` passes
