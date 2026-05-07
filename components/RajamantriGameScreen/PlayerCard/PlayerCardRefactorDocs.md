# PlayerCard Refactor Docs

## Purpose

This refactor breaks the old large `cardComponent.tsx` into smaller files without changing the public import or behavior.

The old import still works:

```ts
import PlayerCard from "@/components/RajamantriGameScreen/cardComponent";
```

The old `cardComponent.tsx` now only re-exports the real component from the new `PlayerCard` folder.

---

## Folder Structure

```txt
components/RajamantriGameScreen/
  cardComponent.tsx

components/RajamantriGameScreen/PlayerCard/
  PlayerCard.tsx
  PlayerCardFrontFace.tsx
  PlayerCardBackFace.tsx
  ResultBadge.tsx
  cardAssets.ts
  playerCardUtils.ts
  types.ts
```

---

## File Roles

### 1. `cardComponent.tsx`

**Role:** Compatibility bridge.

This file keeps your old import path working.

```ts
export { default } from "./PlayerCard/PlayerCard";
```

Why it exists:

- No need to update existing imports.
- Your current `GamePlaySection`, `GridCard`, and `MysteryCard` can keep using the old path.
- Future code is cleaner because the real logic lives inside the `PlayerCard` folder.

---

### 2. `PlayerCard/PlayerCard.tsx`

**Role:** Main controller / wrapper component.

This is the main `PlayerCard` component. It handles:

- Touchable card press.
- Disabled logic.
- Calling `onBounceEffect(index)`.
- Calling `onClick(index)`.
- Redux selectors for player images.
- Flip animation.
- Card border/depth styling.
- Rendering front and back card faces.

Important timing:

```ts
CP_FLOW_TIMINGS.CARD_FLIP_DURATION_MS
```

The card flip duration now comes from your central timing config instead of being hardcoded.

---

### 3. `PlayerCard/PlayerCardFrontFace.tsx`

**Role:** Front side of the card.

This renders the card before it is flipped.

It handles:

- Player avatar/image background.
- Player name label.
- Highlight state.
- Pulsing highlight overlay.
- Card-back image when highlighted.

Used when:

```txt
flipped === false
```

---

### 4. `PlayerCard/PlayerCardBackFace.tsx`

**Role:** Back/revealed side of the card.

This renders the role after the card is flipped.

It handles:

- Role image: King, Advisor, Thief, Police, Joker.
- Player name badge at the top.
- Role label at the bottom.
- Green/red result overlay when clicked.

Used when:

```txt
flipped === true
```

---

### 5. `PlayerCard/ResultBadge.tsx`

**Role:** Shows the selected badge.

This component displays:

```txt
Selected
```

Only when:

```txt
clicked === true
flipped === false
```

Why separated:

- Keeps `PlayerCard.tsx` smaller.
- Makes selected-state UI easier to modify later.

---

### 6. `PlayerCard/cardAssets.ts`

**Role:** Stores card image imports.

This file contains:

- King image
- Advisor image
- Thief image
- Police image
- Joker image
- Card back image

Why separated:

- Keeps image `require()` calls out of the main component.
- Makes it easy to replace card assets later.

---

### 7. `PlayerCard/playerCardUtils.ts`

**Role:** Small helper functions.

Currently contains:

```ts
getImageSource()
```

This converts image data into the correct React Native image source format.

It supports:

- Local images
- Remote URI images

---

### 8. `PlayerCard/types.ts`

**Role:** Shared TypeScript types.

Contains:

- `PlayerCardProps`
- `PlayerImageData`

Why separated:

- Cleaner imports.
- Props can be reused by child components if needed later.
- Main component becomes easier to read.

---

## Animation Responsibility

### Card Dealing Animation

Not inside this folder.

Controlled by:

```txt
screens/OfflineGame/components/GamePlaySection/utils/cardDealMotion.ts
```

This handles:

- `classicSpin`
- `tornadoDeal`
- `waveDeal`
- `orbitDeal`
- `popBurstDeal`

---

### Card Flip Animation

Inside:

```txt
components/RajamantriGameScreen/PlayerCard/PlayerCard.tsx
```

Controlled by:

```ts
CP_FLOW_TIMINGS.CARD_FLIP_DURATION_MS
```

---

### Mystery Card Shuffle Animation

Not inside this folder.

Controlled by:

```txt
screens/OfflineGame/components/GamePlaySection/hooks/useMysteryShuffle.ts
screens/OfflineGame/components/GamePlaySection/utils/mysteryMotion.ts
```

---

## Data Flow

```txt
GamePlaySection / GridCard / MysteryCard
        ↓
cardComponent.tsx
        ↓
PlayerCard/PlayerCard.tsx
        ↓
PlayerCardFrontFace.tsx / PlayerCardBackFace.tsx / ResultBadge.tsx
```

---

## Why This Refactor Is Safe

This refactor is safe because:

- The default export remains the same.
- Existing imports do not need to change.
- `PlayerCardProps` remain the same.
- Redux selectors are still used in the main card component.
- Visual UI is split, not redesigned.
- Flip timing now uses the central `CP_FLOW_TIMINGS` config.

---

## Future Editing Guide

### To change card role images

Edit:

```txt
PlayerCard/cardAssets.ts
```

### To change front card design

Edit:

```txt
PlayerCard/PlayerCardFrontFace.tsx
```

### To change revealed role design

Edit:

```txt
PlayerCard/PlayerCardBackFace.tsx
```

### To change selected badge design

Edit:

```txt
PlayerCard/ResultBadge.tsx
```

### To change flip animation duration

Edit:

```txt
constants/cpFlowTimings.ts
```

Update:

```ts
CARD_FLIP_DURATION_MS
```

### To change card dealing animation

Edit:

```txt
GamePlaySection/utils/cardDealMotion.ts
```
