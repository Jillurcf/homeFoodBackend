---
name: mobile-ui-design

description: Create beautiful, production-ready React Native (Expo) screens, components, and user experiences for the Home Food application. Use this skill whenever building or redesigning mobile screens, reusable components, navigation flows, dashboards, onboarding, authentication, seller tools, buyer experiences, or improving the application's UI/UX.

license: Complete terms in LICENSE.txt
---

This skill creates high-quality mobile interfaces for the **Home Food** application.

The project is built with:

- Expo SDK 53
- React Native
- TypeScript
- Expo Router
- Redux Toolkit
- RTK Query

Always follow the project conventions defined in `AGENT.md`.

The goal is to create interfaces that feel like a polished production mobile application rather than a generic template.

---

# Design Philosophy

Before implementing any UI, understand:

- Who is using this screen?
- What action should the user accomplish?
- What is the emotional goal of this screen?
- How does it fit into the overall Home Food experience?

Every screen should have a clear purpose and a clean visual hierarchy.

---

# Design Principles

Prioritize:

- Simplicity
- Consistency
- Accessibility
- Performance
- Reusability

Design should always support usability first.

---

# Visual Style

The Home Food application should feel:

- Warm
- Friendly
- Homemade
- Fresh
- Trustworthy
- Modern

Avoid looking like a generic food delivery clone.

The experience should emphasize:

- Home cooking
- Local sellers
- Fresh ingredients
- Community
- Authentic food

---

# Color Guidelines

Use the existing design system.

Primary color:

```
#F36C26
```

Use supporting colors consistently.

Prefer warm neutral backgrounds.

Use semantic colors for:

- Success
- Warning
- Error
- Information

Do not introduce random colors.

---

# Typography

Use only project fonts.

Current fonts:

- AvenirLTProBlack
- AvenirLTProBook

Maintain a clear typography hierarchy.

Examples:

- Hero title
- Screen title
- Section title
- Body text
- Caption
- Button label

Avoid excessive font weights.

---

# Layout

Follow consistent spacing.

Use:

- SafeAreaView
- ScrollView when necessary
- Proper keyboard handling
- Responsive layouts

Support:

- Small phones
- Large phones
- Tablets where appropriate

Maintain consistent spacing using the project's spacing scale.

---

# Components

Always prefer reusable components.

Examples:

- FoodCard
- SellerCard
- CategoryChip
- RatingStars
- Avatar
- QuantitySelector
- SearchBar
- AddressCard
- OrderCard
- EmptyState
- LoadingState
- ErrorState

Do not duplicate UI across screens.

---

# Navigation

Use Expo Router.

Follow existing routing conventions.

Respect authentication flows.

Separate Buyer and Seller experiences where appropriate.

---

# Forms

Use reusable form components.

Include:

- Labels
- Validation
- Helper text
- Error messages
- Loading indicators

Provide clear user feedback.

---

# Images

Food images are the most important visual element.

Prioritize:

- Large previews
- Rounded corners
- Proper aspect ratios
- Lazy loading
- Placeholders
- Smooth transitions

Never stretch images.

---

# Lists

Optimize long lists.

Use:

- FlatList
- FlashList (if available)

Support:

- Pull to refresh
- Infinite scrolling
- Empty state
- Loading state

---

# Animations

Animations should improve usability.

Prefer subtle animations such as:

- Screen transitions
- Button feedback
- Card press animations
- Skeleton loading
- Fade-ins
- Scale effects

Avoid distracting animations.

---

# State Handling

Every screen should gracefully handle:

- Loading
- Empty
- Error
- Offline
- Success

Never leave the user without feedback.

---

# API Integration

Use the existing RTK Query layer.

Do not use direct fetch requests unless explicitly instructed.

Separate:

- API logic
- Business logic
- Presentation

---

# Code Standards

Always:

- Use TypeScript
- Use functional components
- Create reusable hooks
- Create reusable UI components
- Keep components small
- Follow existing folder structure

Avoid:

- Inline business logic
- Duplicate components
- Hardcoded values
- Large monolithic screens

---

# Accessibility

Ensure every screen supports:

- Readable font sizes
- Good contrast
- Touchable targets
- Screen readers where applicable

---

# Performance

Optimize rendering.

Use:

- React.memo
- useCallback
- useMemo

Only when beneficial.

Avoid unnecessary re-renders.

---

# Seller Experience

Seller screens should focus on:

- Food management
- Order management
- Earnings
- Analytics
- Availability
- Notifications

Make frequent actions easy to access.

---

# Buyer Experience

Buyer screens should focus on:

- Discovering food
- Searching
- Browsing categories
- Ordering
- Tracking orders
- Reviews
- Favorites

The ordering flow should feel simple and intuitive.

---

# Home Food Identity

Every UI should reinforce the identity of the application.

The experience should feel:

- Homemade
- Friendly
- Trustworthy
- Fresh
- Community-driven

Users should immediately recognize that they are buying food prepared by local home chefs rather than ordering from a traditional restaurant.

---

# Implementation Rules

Always follow `AGENT.md`.

Additionally:

- Use Expo Router.
- Use TypeScript.
- Follow the existing project structure.
- Use reusable components.
- Use RTK Query for API communication.
- Keep business logic outside UI components.
- Support both Buyer and Seller roles.
- Handle loading, empty, and error states.
- Follow the project's design system.
- Maintain consistency across every screen.

Every screen should be production-ready, reusable, maintainable, and consistent with the Home Food application.