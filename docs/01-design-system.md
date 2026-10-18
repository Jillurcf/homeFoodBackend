# M01 — Design System

**Goal:** One theme + reusable UI kit matching the website. Every later screen builds from these only.

## Theme

Create `homeFood/src/constants/theme.ts`:

```ts
export const colors = {
  primary: "#F36C26",
  primaryDark: "#D84E16",
  background: "#FFF5E8",
  text: "#3A2E2A",
  textMuted: "rgba(58,46,42,0.60)",
  textFaint: "rgba(58,46,42,0.40)",
  border: "rgba(58,46,42,0.10)",
  borderStrong: "rgba(58,46,42,0.15)",
  card: "#FFFFFF",
  ink: "#3A2E2A",
  white: "#FFFFFF",
  success: "#4CAF50",
  emerald: { bg: "#ECFDF5", text: "#047857" },
  amber: { bg: "#FFFBEB", text: "#B45309" },
  red: { bg: "#FEF2F2", text: "#DC2626" },
  star: "#FBBF24",
  starEmpty: "#FCD34D",
};
```

Update `tailwind.config.js`: replace old tokens (`title`, `subT`, `backgroundColor`, `secondary`, off-brand blues) with these names so `tw()` utilities match (`bg-background`, `text-textMuted`, …). Delete dead tokens.

## Fonts

- Install `@expo-google-fonts/fraunces` + `@expo-google-fonts/noto-sans-bengali`
- Load in `app/_layout.tsx`: `Fraunces_600SemiBold` (display), `NotoSansBengali_500Medium` (Bengali), keep AvenirLTProBook as body
- Map in tailwind config: `font-display`, `font-bengali`, `font-body`

## UI kit

Create `homeFood/src/components/ui/` — port classes from website `seller-ui.tsx`:

| Component | Website ref |
|---|---|
| `PillButton.tsx` (primary/secondary/danger/ghost, `loading`, `disabled`) | `buttonClasses` |
| `Chip.tsx` (active = `bg-primary text-white`) | `browse-controls.tsx` |
| `Input.tsx` (rounded-xl, focus ring, label + placeholder) | `inputClass` |
| `Card.tsx` (`rounded-2xl border bg-card p-4 shadow-sm`) | `Panel` |
| `StatusPill.tsx` (emerald/amber/red/primary variants) | `StatusPill` |
| `AvailabilityPill.tsx` (available / low / sold-out) | `AvailabilityPill` |
| `Stars.tsx` (5 amber stars + rating + count) | `home/ui.tsx` |
| `EmptyState.tsx` (dashed border, icon circle, CTA) | `empty-state.tsx` |
| `Skeleton.tsx` (pulse block; `FoodCardSkeleton`) | `food-card.tsx` |
| `VerifiedBadge.tsx` (green check) | used on cards/detail |

## Done when

- [ ] `theme.ts` is the only source of hex colors; no new hardcoded hex
- [ ] Fonts load without errors; `font-display` / `font-bengali` usable
- [ ] All 10 UI components render and are used starting M02
- [ ] `npm run lint` passes
