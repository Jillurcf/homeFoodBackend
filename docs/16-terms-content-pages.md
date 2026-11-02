# M16 — Terms Content & Public Pages

**Goal:** Publish Bangla buyer and seller Terms & Conditions on both web and mobile, readable before signup.

## Locked decisions

| Decision | Choice |
|---|---|
| Language | Bangla only |
| Version | `1.0` |
| Effective date | `৩০ অক্টোবর ২০২৬` |
| Contact details | Existing contact page values (`gharerkhabar.net@gmail.com`, `+880 1700-000000`, Dhanmondi address) |
| Website | `https://gharerkhabar.net` |
| Source of truth | Local content modules in each app; no CMS/API |

## Content model

Create `src/content/terms.ts` in both apps:

```ts
TERMS_VERSION = "1.0"
TERMS_DOCUMENTS.buyer
TERMS_DOCUMENTS.seller
```

Each document has `title`, `effectiveDate`, `website`, `intro`, and `sections`. Sections use blocks: `paragraph`, `bullets`, `subheading`, `note`. This covers the nested delivery, commission, and example sections in the seller copy.

Transcribe the provided Bangla copy verbatim: 12 buyer sections, 14 seller sections.

## Files

**Web**
- `src/content/terms.ts`
- `src/components/common/terms-page.tsx`
- `src/app/(common)/terms/buyer/page.tsx`
- `src/app/(common)/terms/seller/page.tsx`
- `src/components/common/Footer.tsx` — add buyer/seller terms links

**Mobile**
- `src/content/terms.ts`
- `src/components/marketing/TermsScreen.tsx`
- `app/(stack)/marketing/terms/[role].tsx`
- `src/components/marketing/MarketingShell.tsx` — support Bangla title font
- `app/(tabs)/profile.tsx` — add buyer/seller terms links

## UI

- Render all Bangla text with `font-bengali` (Noto Sans Bengali is already loaded in both apps).
- Web: readable `max-w-3xl` document layout with section headings and bullets.
- Mobile: scrollable screen with back navigation, matching existing marketing pages.
- Both pages are public and reachable without login.

## Done when

- [ ] Buyer and seller T&C pages render every provided section on web and mobile
- [ ] Pages are reachable from footer/profile links and before signup
- [ ] Bangla text renders with the Bengali font
- [ ] `npm run lint` passes in both frontend projects
