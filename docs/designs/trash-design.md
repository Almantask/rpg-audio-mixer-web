# Vault of Echoes (Trash) Design Spec

## Overview
The "Vault of Echoes" (Trash) is a dedicated screen that holds all soft-deleted items across the RPG Audio Mixer platform before they are permanently purged. It provides peace of mind against accidental deletion and a clear management interface for recent changes.

## Screen URL/Path
`Settings` -> `Restore Recent Deletes`

## Key Visual Elements

### 1. Header & Typography
- **Headline**: "The Vault of Echoes" (Newsreader font, 5xl, italic, extrabold).
- **Subtitle**: "Lost fragments of your journey. Recover them before the ethereal mists claim them forever." (Manrope font, slightly faded variant color).
- **Navigation Bar**: Standard app top bar showing "Arcanum Audio", back arrow, and Settings gear icon.

### 2. Global Actions
- **"Empty Vault" Button**:
  - Positioned top right, directly below the header.
  - Features the `delete_forever` Material icon.
  - Bordered, low-emphasis background but becomes prominent on interaction.

### 3. List Item Cards
Each deleted item (Campaign, Session, Scene, Soundscape, or FX track) appears as a distinct card with:

**A. Iconography / Image**:
- **Sessions/Soundscapes**: Uses a solid-color icon container (e.g., `auto_stories` for campaigns/sessions).
- **Scenes**: Uses a faded, grayscale thumbnail image with a primary colored `details` icon overlaid in the center. Hovering over the card removes the grayscale for a transition effect.
- **FX Tracks**: Uses the `description` icon in a colored container.

**B. Metadata Details**:
- **Title**: Large, bold label (e.g., "Winter's Breath").
- **Type Chip**: Small, capitalized tag indicating the item type (e.g., `SOUNDSCAPE`, `SCENE`, `FX`).
- **Deletion Timestamp**: Simple text displaying the time since deletion (e.g., "Deleted 2 days ago").

**C. Item Actions**:
On the right side of each card, two prominent, circular icon buttons are placed:
- **Restore (Primary/Gold)**: `history` icon. On selection, moves the item back to the active library.
- **Delete (Error/Red)**: `delete` icon. On selection, permanently obliterates the item.

### 4. Empty State
- Centred visualization when no items are in the trash.
- **Icon**: `delete_forever` (large, gold).
- **Headline**: "The Vault is Quiet"
- **Instructional Text**: "No echoes of the past linger here. Your journey continues with a clean slate."
- **Return Button**: "Return to Scenes" navigates back to the main app.

## Interactions
- **Card Hover Effects**: Cards lightly brighten on hover with subtle glow traces on the borders (Ember glow effect).
- **Image Reveal**: Scene thumbnails revert to high-color saturation when their card is hovered.
- **Haptic Press**: Action buttons have a unified `active:scale-90` transform for solid tactile feel.

## Colors & Theming
- Integrates the standard app dark-mode theme colors.
- Background: `#131313`.
- Primary Accents (Gold/Amber): `#f2ca50`.
- Destructive Actions: Standard error reds mapped via Tailwind config (`#ffb4ab`).
