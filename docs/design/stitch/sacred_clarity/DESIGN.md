---
name: Sacred Clarity
colors:
  surface: '#f8f9fd'
  surface-dim: '#d9dade'
  surface-bright: '#f8f9fd'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3f7'
  surface-container: '#edeef2'
  surface-container-high: '#e7e8ec'
  surface-container-highest: '#e1e2e6'
  on-surface: '#191c1f'
  on-surface-variant: '#59413a'
  inverse-surface: '#2e3134'
  inverse-on-surface: '#eff1f5'
  outline: '#8d7168'
  outline-variant: '#e1bfb5'
  surface-tint: '#ac3400'
  primary: '#9b2f00'
  on-primary: '#ffffff'
  primary-container: '#c2410c'
  on-primary-container: '#ffece7'
  inverse-primary: '#ffb59d'
  secondary: '#5b5794'
  on-secondary: '#ffffff'
  secondary-container: '#bebafe'
  on-secondary-container: '#4b4883'
  tertiary: '#0f5e63'
  on-tertiary: '#ffffff'
  tertiary-container: '#32777c'
  on-tertiary-container: '#c2faff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbd0'
  primary-fixed-dim: '#ffb59d'
  on-primary-fixed: '#390c00'
  on-primary-fixed-variant: '#832600'
  secondary-fixed: '#e3dfff'
  secondary-fixed-dim: '#c4c0ff'
  on-secondary-fixed: '#17114d'
  on-secondary-fixed-variant: '#43407b'
  tertiary-fixed: '#abeef4'
  tertiary-fixed-dim: '#8fd2d7'
  on-tertiary-fixed: '#002022'
  on-tertiary-fixed-variant: '#004f54'
  background: '#f8f9fd'
  on-background: '#191c1f'
  surface-variant: '#e1e2e6'
typography:
  headline-display:
    fontFamily: Sora
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-display-mobile:
    fontFamily: Sora
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Sora
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Sora
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Sora
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  scripture-verse:
    fontFamily: Noto Serif
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 34px
    letterSpacing: 0.01em
  scripture-verse-mobile:
    fontFamily: Noto Serif
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: 0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-caps:
    fontFamily: Sora
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.08em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-tablet: 1.5rem
  gutter-desktop: 2rem
  margin: 1.25rem
  margin-tablet: 2rem
  margin-desktop: 3rem
  space-2xs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system delivers a contemplative, distraction-free environment engineered to integrate ancient wisdom into a high-tempo modern lifestyle. The aesthetic balances architectural restraint with spiritual serenity: it avoids temple-kitsch, ornate filigree, and faux-parchment textures in favor of generous whitespace, geometric discipline, and deliberate typographic rhythm.

The design movement is **Modern Editorial with Tactile Micro-Interactions**. Surfaces feel weighted and purposeful rather than ethereal, using deep tonal contrast and subtle structural borders to delineate sacred text study, meditation prompts, and habit-tracking progress. The interface evokes quiet focus, dignity, and intellectual clarity.

## Colors

The palette draws from Vedic iconography while adhering to modern WCAG AA contrast standards across all viewport states.

- **Primary (`#C2410C` — Saffron Flame):** Reserved strictly for primary focal points: active daily learning CTAs, primary navigation triggers, and streak momentum markers. It carries visual warmth without feeling aggressive.
- **Secondary (`#24205A` — Deep Sacred Indigo):** Represents quietude and depth. Utilized for hero scripture cards, night-mode audio interfaces, chapter header blocks, and high-emphasis instructional framing.
- **Tertiary (`#0F5E63` — Peacock Teal):** Used for reflective checkpoints, quiz validations, progress milestones, and secondary actions.
- **Accent Gold (`#D97706`):** Dedicated to streak indicators, daily sun badges, and reflection metrics.
- **Neutral Canvas & Surfaces (`#F5F6FA` & `#FFFFFF`):** Base canvas employs an off-white warmth (`#F5F6FA`) to mitigate eye fatigue during long reading periods. Card surfaces remain crisp white (`#FFFFFF`) with a structural hairline border (`#E4E4EC`).
- **Typography Tones:** High-contrast `#15132B` handles all primary text hierarchies; `#55546A` anchors secondary insights, verse citations, and metadata.

## Typography

The typographic hierarchy is divided into three distinct functional tiers:

1. **Structural Headings (`Sora`):** Geometric, contemporary, and confident. Used for page titles, modal announcements, and habit progression metrics.
2. **Expository Body & UI Labels (`Inter`):** Selected for high legibility, clean vertical stems, and exceptional rendering at micro-scales on mobile viewports.
3. **Sacred Verses & Commentary (`Noto Serif`):** Employs an editorial cadence for Sanskrit transliterations, direct shlokas, and contemplative translations. It introduces intellectual warmth and dignity without distracting ornamentation.

Verse numbers and Sanskrit categorization badges leverage `label-caps` in `Sora` for sharp contrast against the serif passages.

## Layout & Spacing

The layout philosophy follows a rhythm of meditative containment. Content is bounded within a centered column (max-width `480px` on mobile/standalone mobile frames, max-width `768px` for reading tablets) to prevent eye strain during structured 10-minute reading sessions.

- **Mobile (< 640px):** Single-column layout anchored with an outer margin of `1.25rem` (`margin`) and `1rem` vertical component stacking. Touch surfaces default to full horizontal width inside the safe margin zone.
- **Tablet (640px - 1024px):** Dual-card asymmetric rhythm (e.g., Daily Progress / Reading Window side-by-side) with `1.5rem` gutters and `2rem` outer padding.
- **Desktop (> 1024px):** Main study canvas restricted to `720px` centered width with utility context (journaling drawer, audio panel) positioned in fixed side rails.

## Elevation & Depth

Visual hierarchy is communicated through structural layering rather than dramatic, heavy dropshadows:

- **Level 0 (Base Canvas):** Background tone `#F5F6FA`. Pure flat base.
- **Level 1 (Default Study Cards):** `#FFFFFF` surface accompanied by a hairline outline (`1px solid #E4E4EC`) and an ambient, low-opacity shadow: `0 2px 8px -2px rgba(21, 19, 43, 0.04), 0 1px 4px -1px rgba(21, 19, 43, 0.02)`.
- **Level 2 (Active/Interactive Panels):** Raised state on interaction or active selection: `0 8px 24px -4px rgba(21, 19, 43, 0.08), 0 4px 12px -2px rgba(21, 19, 43, 0.03)`.
- **Level 3 (Floating Sacred Audio & Modals):** Applied to active audio playback controllers and sticky bottom sheets. Layering incorporates `#24205A` background with crisp `0 16px 36px -6px rgba(36, 32, 90, 0.25)`.
- **Level 4 (Floating Navigation Bar):** The fixed bottom bar rests at `rgba(255, 255, 255, 0.92)` with `backdrop-filter: blur(16px)` and an upper hairline divider (`1px solid #E4E4EC`).

## Shapes

The design system maintains a tactile geometry calibrated for warmth and precision:

- **Standard Cards & Modals:** `rounded-lg` (`1rem` / 16px) to `rounded-xl` (`1.5rem` / 24px) for prominent featured study blocks, softening the technical density of the scripture.
- **Interactive Buttons:** `rounded-md` (`0.75rem` / 12px) for structured utility buttons, keeping them grounded and deliberate.
- **Micro-Indicators & Streak Badges:** Fully circular (`rounded-full` / 9999px) pills for topic tags, mood filters, audio time stamps, and verification indicators.

## Components

### Buttons & Touch Targets
- **Primary Action (Saffron CTA):** Minimum height `50px` (desktop) to `54px` (mobile). Solid fill `#C2410C`, text `#FFFFFF`, font `Sora` semi-bold (`label-lg`), border radius `12px`. Hover state darkens to `#9A3412`; active press uses a `scale(0.98)` tactile transform.
- **Secondary Action (Quiet Indigo Outline):** Solid white surface with `1.5px` border `#24205A`, text `#24205A`.
- **Tertiary Ghost Action:** Borderless, zero-surface treatment using `#0F5E63` or `#55546A` with `space-sm` internal padding for tertiary skips and dismissals.

### Cards (The "Sloka" Study Frame)
- **Base Study Card:** Solid `#FFFFFF`, `1px` border `#E4E4EC`, `1.25rem` inner padding, `rounded-xl` corners. Top metadata row features the chapter/verse badge in `label-caps` muted `#55546A`.
- **Sacred Card (Deep Indigo Hero):** Deep background `#24205A`, white typography, accent highlights in `#D97706`. Used for the "Verse of the Day" and active audio player sheets.

### Chips & Badges
- **Pill Chips:** Height `32px` to `36px`, fully rounded (`rounded-full`), padding `0 14px`.
- **Active State:** `#C2410C` background with `#FFFFFF` text.
- **Inactive State:** `#FFFFFF` background with `1px solid #E4E4EC`, text `#55546A`. Hover/focus shifts border to `#24205A`.

### Input Fields & Reflection Prompts
- **Text Inputs:** Height `52px`, background `#FFFFFF`, border `1px solid #E4E4EC`, corner radius `12px`, padding `0 16px`. Active focus state triggers an outline ring of `2px solid #24205A` with zero chromatic bleed.

### Selection Controls (Checkboxes & Radios)
- **Verse Completed Indicator:** Custom circular checkbox `24px x 24px`. Unchecked state uses `#E4E4EC` border on white; checked state displays `#0F5E63` fill with a crisp white checkmark icon.

### Bottom Navigation Bar
- **Architecture:** Fixed bottom dock, height `64px` plus safe-area-inset padding. Frosted surface (`rgba(255, 255, 255, 0.94)` with `12px` blur).
- **Navigation Tabs:** Exactly five destinations (`Today`, `Path`, `Ask`, `Stories`, `Circle`).
- **Tab Indicators:** Active tab displays a solid `#C2410C` icon alongside a persistent `4px` indicator dot beneath the label. Inactive tabs render in `#55546A`.

### Audio Verse Player (Floating Micro-Bar)
- Compact persistent bar (`height: 58px`, `rounded-xl`) docking `12px` above the bottom navigation bar. Deep Indigo background (`#24205A`), crisp play/pause control in `#C2410C`, and real-time Sanskrit waveform rendering in `#0F5E63`.