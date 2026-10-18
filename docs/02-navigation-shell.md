# M02 — Navigation Shell

**Goal:** Replace drawer + 2 tabs with the website-aligned bottom-tab structure.

## Routes

```
app/
  (tabs)/
    _layout.tsx       5 tabs: Home, Favorites, Cart, Orders, Profile
    index.tsx         Home (placeholder until M05)
    favorites.tsx     placeholder
    cart.tsx          placeholder
    orders.tsx        placeholder
    profile.tsx       placeholder
  (stack)/
    _layout.tsx       Stack for pushed screens
    food/[id].tsx     placeholder (M06)
```

## Work

- Delete `app/(drawer)/` entirely (drawer layout, stubs, logout modal) — logout moves to Profile (M09)
- Tabs: icon + label, active tint `primary`, inactive `textFaint`, bar `bg-card`, hairline top border
- Cart tab shows badge count from cart store (0 until M07)
- Keep `AuthGuard` on tabs; root `app/index.tsx` splash flow unchanged
- Tab icons: reuse SVG strings in `assets/Icons/Icon.ts` or add equivalents

## Done when

- [ ] App boots: splash → login (if unauthed) → tabs
- [ ] All 5 tabs navigate; old drawer routes gone (no dead links)
- [ ] `npm run lint` passes
