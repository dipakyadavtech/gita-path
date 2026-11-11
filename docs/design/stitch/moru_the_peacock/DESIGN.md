---
name: Moru the Peacock
colors:
  surface: '#fff9ee'
  surface-dim: '#e1d9c9'
  surface-bright: '#fff9ee'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fbf3e2'
  surface-container: '#f5eddc'
  surface-container-high: '#efe7d7'
  surface-container-highest: '#e9e2d1'
  on-surface: '#1e1b11'
  on-surface-variant: '#444653'
  inverse-surface: '#343025'
  inverse-on-surface: '#f8f0df'
  outline: '#757684'
  outline-variant: '#c4c5d5'
  surface-tint: '#3755c3'
  primary: '#00288e'
  on-primary: '#ffffff'
  primary-container: '#1e40af'
  on-primary-container: '#a8b8ff'
  inverse-primary: '#b8c4ff'
  secondary: '#1f686d'
  on-secondary: '#ffffff'
  secondary-container: '#a8ebf1'
  on-secondary-container: '#256c71'
  tertiary: '#4c2e00'
  on-tertiary: '#ffffff'
  tertiary-container: '#6b4200'
  on-tertiary-container: '#ffa929'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b8c4ff'
  on-primary-fixed: '#001453'
  on-primary-fixed-variant: '#173bab'
  secondary-fixed: '#abeef4'
  secondary-fixed-dim: '#8fd2d7'
  on-secondary-fixed: '#002022'
  on-secondary-fixed-variant: '#004f54'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#fff9ee'
  on-background: '#1e1b11'
  surface-variant: '#e9e2d1'
typography:
  display-hero:
    fontFamily: Sora
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
  display-hero-mobile:
    fontFamily: Sora
    fontSize: 34px
    fontWeight: '800'
    lineHeight: 42px
  headline-lg:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Sora
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
  headline-md:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-sm:
    fontFamily: Sora
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Nunito Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 30px
  body-md:
    fontFamily: Nunito Sans
    fontSize: 17px
    fontWeight: '600'
    lineHeight: 26px
  body-sm:
    fontFamily: Nunito Sans
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 22px
  label-lg:
    fontFamily: Sora
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 24px
  label-md:
    fontFamily: Sora
    fontSize: 15px
    fontWeight: '700'
    lineHeight: 20px
  label-sm:
    fontFamily: Sora
    fontSize: 13px
    fontWeight: '700'
    lineHeight: 18px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2.5rem
  margin-mobile: 1.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1.25rem
  space-lg: 2rem
  space-xl: 3rem
---

## Brand & Style

This design system delivers an enchanting, joyful sanctuary designed for children ages 3 to 12 as they explore sacred tales, verses, and cultural heritage. The brand personality is deeply warm, protective, and lively—embodied by Moru, an affectionate feathered guide. The user experience evokes wonder, safety, and encouragement, eschewing chaotic overstimulation in favor of grounded, cheerful warmth.

The aesthetic blends **Playful Tactility** with **Charming Illustrated Storytelling**. Physical UI elements feature plump geometries, soft layered cards, expressive cartoon-inspired contours, and welcoming tap affordances. The interface removes dark patterns, commercial clutter, and friction: there are zero ads, strictly no open chat interactions, and adult operations are enclosed behind an interactive Parent Lock PIN gate. Every interaction feels tangible, responsive, and secure.

## Colors

The palette draws inspiration from a regal peacock roaming a sunlit temple courtyard:

- **Primary (`#1E40AF` - Peacock Royal Blue)**: Serves as the primary anchor for core actions, story navigation headers, and hero buttons.
- **Secondary (`#0F5E63` - Peacock Teal)**: Grounded, rich ocean-teal used for chapter indicators, audio play heads, and grounding accents.
- **Tertiary (`#F59E0B` - Sunny Golden Amber) & Accent Golden Yellow (`#FFC94D`)**: Infuses sunshine, reward badges, completed shloka stars, and interactive focus states.
- **Leaf Green (`#2E7D32`)**: Denotes positive affirmation, moral lesson accomplishments, and safety gates.
- **Saffron Coral (`#E05315`)**: Highlights celebration points, festive challenges, and interactive character dialogue tags.
- **Sky Blue (`#DDEFFF`)**: Soft sky tint used for sub-containers, read-along highlight tracks, and speech bubbles.
- **Neutral Canvas (`#FFF7E6` - Warm Cream)**: Forms the gentle, paper-like background that prevents eye fatigue and avoids the clinical coldness of pure white. Text is set in an ultra-deep indigo-slate (`#1E1B4B`) rather than black to keep contrast gentle yet crisp.

## Typography

The typographic hierarchy prioritizes legibility, high visual friendliness, and comfortable reading mechanics for emerging and confident young readers:

- **Headlines & Badges (`Sora`)**: Geometric, wide, and joyful. The rounded counters and rhythmic width deliver instant enthusiasm and structural punch without feeling rigid or institutional.
- **Body & Story Verse Text (`Nunito Sans`)**: Naturally curved, warm humanist sans with open apertures and substantial x-height. Weight is standardized to 600 (Semi-Bold) for body copy to guarantee contrast against warm cream backgrounds on low-brightness displays.
- **Read-Along Text**: Features widened letter-spacing (+0.02em) and generous line-heights (1.5–1.6) to allow effortless finger-tracking and karaoke-style shloka pronunciation aids.

## Layout & Spacing

The layout philosophy utilizes a responsive **fluid grid** calibrated to small hands and tablet-first exploration:

- **Desktop & Large Tablets (Landscape)**: 8 to 12 fluid columns with `2.5rem` outer margins and `1.5rem` gutters. Content containers max out at `1120px` to maintain focused narrative sightlines.
- **Tablets (Portrait) & Handhelds**: 4 columns with `1.25rem` outer margins and `1rem` gutters.
- **Generous Component Padding**: Interactive items provide generous internal clearances (`space-md` to `space-lg`) to prevent mis-clicks and accidental activations.
- **Children's Ergonomic Reach Zone**: Primary progression and audio triggers reside within the lower two-thirds of the display viewport for thumb accessibility on handheld devices.

## Elevation & Depth

Visual hierarchy uses warm, pillowy depth instead of sterile drop shadows:

- **Cartoon Edge Borders**: Cards, chips, and modals combine a 2px to 3px solid border (tinted in a 15% darker shade of their parent surface or primary accent) to maintain distinct separation across varied viewing angles.
- **Warm Friendly Shadows**: Shadows use a double-layer technique with warm amber-indigo undertones (`rgba(30, 27, 75, 0.08)` blur 16px with an offset of 8px, paired with a solid 3px "lift ledge" at the bottom to give buttons a pressable, physical toy-like presence).
- **Surface Elevation Levels**:
  - **Level 0 (Canvas)**: Warm Cream (`#FFF7E6`).
  - **Level 1 (Story Modules & Cards)**: Pure White (`#FFFFFF`) with 3px solid border in `#FDE68A` (Pale Gold) and a soft downward drop.
  - **Level 2 (Popovers, Bottom Sheets & Dialogue Bubbles)**: Elevated white or Sky Blue (`#DDEFFF`) with 3px border in `#BFDBFE` and 12px deep warm shadow.
  - **Level 3 (Parent Gate Lock)**: Frosted overlay (`rgba(30, 64, 175, 0.4)` blur 12px) with centered security vault container.

## Shapes

The design system embraces an ultra-rounded shape dialect (`roundedness: 3`). There are zero razor-sharp angles across the entire UI.

- **Standard Cards**: `24px` to `32px` corner radii, creating a plush, organic frame resembling picture-book windows.
- **Action Buttons & Badges**: Fully pill-shaped (`9999px` border-radius), communicating soft, pinchable comfort.
- **Input Keypads & PIN Circles**: Smooth pebble profiles (`20px` to `24px` radius) providing clear hit feedback.
- **Icons & Avatar Portals**: Encased in squircle or circle bubbles with soft accent rings.

## Components

### Buttons & Interactive Controls
- **Hero & Primary Buttons**: Minimum height of `64px` (child-safe sizing). Plump pill geometry filled with `#1E40AF` or `#F59E0B`, featuring bold centered typography (`label-lg`), high-contrast white text, and a distinct 4px bottom border ledge simulating a 3D block. 
- **Active State**: Translates downward by 3px on touch with haptic audio click, flattening the bottom ledge to indicate realistic physical compression.
- **Audio & Read-Aloud Floaters**: Circular 68px floating buttons encased in peacock teal (`#0F5E63`) with bright play/pause pictograms.

### Story & Chapter Cards
- Generous containers featuring `28px` rounded corners, white surface fill, and a 3px border in golden-sun yellow (`#FFC94D`).
- Inner layouts prioritize visual illustration over text: 60% artwork space, 40% verse title and audio duration tag.
- Includes a bottom progress caterpillar bar with green dots (`#2E7D32`) tracking completion.

### Badges & Pill Chips
- Pill chips (`36px` to `44px` height) with vibrant saturated fills (Sky Blue `#DDEFFF`, Golden Yellow `#FFC94D`, Saffron Coral `#E05315`).
- Text in `label-sm` or `label-md` accompanied by friendly thematic icons (peacock feather, lotus, flute, sun).

### Input Fields & Parent Lock Gate
- Child protection screen requires passing a math prompt or parental PIN ("Grown-ups Only: Spell 4, 8, 2 or solve 7 × 3").
- PIN entries use oversized `72px × 72px` numbered pebble buttons with heavy tactile feedback.
- Standard text inputs are strictly absent in child-mode surfaces to eliminate typing frustration.

### Lists & Verses
- Stacked narrative blocks separated by `space-md` gaps.
- Verses are enclosed in Sky Blue speech and chant bubbles with karaoke word highlights shifting to `#F59E0B` in sync with Sanskrit recitations.

### Checkboxes & Selection Toggles
- Replaced by oversized toggle pebbles (min `48px` diameter) with animated tick marks and friendly bouncing stars upon selection.