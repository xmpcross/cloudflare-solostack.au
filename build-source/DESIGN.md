---
name: SoloStack
description: A field guide to the one-person business, where every tool, stack and piece of gear is a priced, catalogued specimen plate.
colors:
  sea: "oklch(40% 0.075 197deg)"
  sea-deep: "oklch(33% 0.062 197deg)"
  ink: "oklch(20% 0.04 215deg)"
  ink-soft: "oklch(28% 0.05 215deg)"
  salt: "oklch(97.5% 0.008 195deg)"
  salt-2: "oklch(94% 0.017 195deg)"
  rule: "oklch(84% 0.02 195deg)"
  muted: "oklch(40% 0.03 215deg)"
  coral: "oklch(72% 0.165 40deg)"
  coral-bright: "oklch(77% 0.16 42deg)"
  coral-shade: "oklch(63% 0.15 38deg)"
  coral-text: "oklch(49% 0.16 35deg)"
  leaf: "oklch(52% 0.09 170deg)"
typography:
  display:
    fontFamily: "'Geist Sans', 'Segoe UI', system-ui, sans-serif"
    fontSize: "clamp(2.8rem, 5.6vw, 5.2rem)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.035em"
    fontFeature: "lining-nums tabular-nums"
  headline:
    fontFamily: "'Geist Sans', 'Segoe UI', system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 4.6vw, 3.9rem)"
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: "-0.03em"
  subhead:
    fontFamily: "'Geist Sans', 'Segoe UI', system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 3.2vw, 2.6rem)"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.025em"
  title-lg:
    fontFamily: "'Geist Sans', 'Segoe UI', system-ui, sans-serif"
    fontSize: "clamp(1.375rem, 2.2vw, 1.625rem)"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.015em"
  title:
    fontFamily: "'Geist Sans', 'Segoe UI', system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  lede:
    fontFamily: "Figtree, 'Segoe UI', sans-serif"
    fontSize: "clamp(1.125rem, 1.4vw, 1.25rem)"
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "Figtree, 'Segoe UI', sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  small:
    fontFamily: "Figtree, 'Segoe UI', sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Figtree, 'Segoe UI', sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.1em"
rounded:
  plate: "6px"
  photo: "2px"
  pill: "999px"
spacing:
  section-sm: "56px"
  section-md: "96px"
  section-lg: "112px"
  gutter: "32px"
components:
  button-primary:
    backgroundColor: "{colors.coral}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "13.6px 25.6px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.coral-bright}"
  button-primary-on-coral:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.salt}"
  button-line:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
  plate:
    backgroundColor: "{colors.salt}"
    textColor: "{colors.ink}"
    rounded: "{rounded.plate}"
    padding: "36px"
  field-sea:
    backgroundColor: "{colors.sea}"
    textColor: "{colors.salt}"
  field-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.salt}"
  field-coral:
    backgroundColor: "{colors.coral}"
    textColor: "{colors.ink}"
  field-salt-2:
    backgroundColor: "{colors.salt-2}"
    textColor: "{colors.ink}"
---

# Design System: SoloStack

> Scope: this system is built on the homepage (`.fg` scope in `src/app/(frontend)/globals.css`, markup in `HomePageClient.tsx`) and applied site-wide through the shared tokens: Geist Sans and Figtree, the remapped Tailwind ramps (indigo is sea-green, emerald is coral, slate is marine), the semantic colour tokens, the `.road` directory-page tokens, the header and the footer. Inner pages (directories, guides index, about, FAQs, contact, legal, search) use the same fields, plates, pill buttons and ruled rows through the `.road` scope and the shared `RoadChrome` hero, disclosure band and page header; article pages keep the earlier layout.

## Overview

**Creative North Star: "The Field Guide"**

SoloStack reads as a printed field guide to the one-person business. Every tool, stack and gear item is a catalogued specimen: a framed salt-white plate with a figure number, a name, a tagline, an A$ price and a verdict. Sections are saturated fields that swap as the visitor scrolls (sea, salt, ink, salt-2, coral), one idea per field.

Bass Strait sea-green carries the cover, deep marine ink carries the software catalogue, and a single coral does all the acting: buttons, prices, and the drenched business section. Geist Sans over Figtree, with tracked uppercase captions, makes the page recognisable with its content removed. Drawn eucalyptus sprigs and one drawn mark per gear kind are the recurring devices.

The page is dense with real data (prices, verdicts, ratings) and calm in its chrome: no gradients, no decorative icon tiles, no card grids of identical shape.

**Key Characteristics:**
- Full-bleed field colour per section; content centred at 1366px.
- Salt plates with a fine double frame as the only container language for specimens.
- Geometric sans display (Geist Sans), friendly sans text (Figtree), uppercase tracked captions for catalogue data.
- One action colour (coral); its text-safe variant for coral type on light fields.
- Dotted leaders and hairline-ruled rows, as in a printed catalogue.

## Colors

Cold marine neutrals (hue 195 to 215) with one warm coral (hue 35 to 42) and a small leaf green. All values are OKLCH and the frontmatter is normative.

### Primary
- **Bass Strait Sea** (`sea`): the cover field and any sea section; salt text on it.
- **Deep Sea** (`sea-deep`): a darker sea for depth within sea-coloured areas.

### Secondary
- **Action Coral** (`coral`): the one action colour. Button fill, text selection, the coral business field. Ink text on it.
- **Coral Bright** (`coral-bright`): button hover.
- **Coral Shade** (`coral-shade`): the sprig drawn on the coral field, tone on tone.
- **Coral Text** (`coral-text`): coral for type on salt and salt-2 (prices, the stack total). Plain `coral` is not used for text on light fields.

### Tertiary
- **Eucalyptus Leaf** (`leaf`): leaf green for the drawn sprig.

### Neutral
- **Marine Ink** (`ink`): the ink field, body text on light fields, plate frame line, focus ring.
- **Ink Soft** (`ink-soft`): hover state of ink-filled buttons on coral.
- **Salt** (`salt`): the page ground, plate sheets, text on sea and ink fields.
- **Salt Two** (`salt-2`): the alternate light field (gear), image placeholders.
- **Rule** (`rule`): hairlines between catalogue rows and under plate headings.
- **Muted Marine** (`muted`): secondary text on light fields. On sea and ink fields secondary text is salt at 86% mix; on coral it is ink at 88%.

### Named Rules
**The One Action Rule.** Coral is the only action colour. On the coral field the primary button flips to ink with salt text; it never becomes a second hue.
**The Field Swap Rule.** Each section owns one field colour and its paired text colour. Do not tint a field with gradients or overlay a second field inside it, except plates.
**The Coral Text Rule.** Coral as type on a light field uses `coral-text`, never `coral`.

## Typography

**Display Font:** Geist Sans (with Segoe UI, system-ui, sans-serif), used at 700 for display, headline and subhead and 600 for titles, loaded as `--font-geist-sans`.
**Body Font:** Figtree (with Segoe UI, sans-serif), variable 300 to 900, loaded as `--font-body`.

**Character:** A geometric, round-bowled display sans for names, prices and headlines, set against a friendly geometric text sans for reading and uppercase tracked captions for catalogue data.

### Hierarchy
- **Display** (400, `clamp(2.8rem, 5.6vw, 5.2rem)`, 0.96): the cover H1.
- **Headline** (400, `clamp(2.2rem, 4.4vw, 3.75rem)`, about 1.02): section H2s; the business section runs larger (`clamp(2.4rem, 5vw, 4.5rem)`).
- **Title** (400, 1.25 to 2rem, about 1.1 to 1.2): specimen names, prices, rows, lead post (`clamp(1.75rem, 3.2vw, 2.75rem)`).
- **Body** (400, 1.0625rem base, 1.6; lead copy 1.125 to 1.25rem; small 0.875rem): running text, taglines, verdicts. Intro paragraphs cap near 32rem to 36rem.
- **Label** (700, 0.75rem, 0.1em tracking, uppercase, 1.4): "Fig. N" numbers, plate captions, definition-list terms, row notes.

### Named Rules
**The Weight Cap Rule.** Display roles are 700, titles 600, text 400 and captions 700; nothing goes above 700, and `font-synthesis-weight: none` is set so no faux weights appear.
**The Lining Figures Rule.** Prices and figure numbers use lining, tabular numerals (`.num`, `.fg-display`).
**The Caption Is Data Rule.** Uppercase tracked captions carry catalogue data (figure number, manufacturer, terms, notes). They are not decoration and not a lead-in above headings.

## Layout

Content sits in a 1366px centred wrap with 16px gutters (32px from 640px). Sections are full-bleed fields with vertical padding of 56px (compact), 96px (standard) to 112px (the coral section) at small/large breakpoints. The cover is a 12-column grid: 6 columns of headline, search and action, 6 columns of the stack plate. The latest-guides area is 7 + 5 (lead plate, ruled list). Software is 4 + 8 with a sticky intro; gear is a two-column catalogue; the business section is 6 + 6. Rows are hairline-ruled lists, not cards. Below the large breakpoint everything stacks to one column and category filter chips scroll horizontally.

## Elevation & Depth

Depth is tonal (field swaps) plus one lifted object, the plate. A plate has a double frame made of insets (7px salt, then a 1px ink line) and a soft, blurred, downward shadow (`0 28px 40px -24px oklch(18% 0.08 40deg / 0.55)`). Nothing else carries a shadow; focus uses an outline plus a halo.

### Named Rules
**The Plate Lift Rule.** Only plates are lifted. Rows, chips, buttons and fields stay flat.

## Shapes

Plates are gently squared (6px) with 2px photo corners inside the frame. Buttons, the search bar and category chips are full pills (999px). Brand marks and gear glyphs sit in small 8px-rounded salt tiles with a hairline ring. Empty states use a 2px dashed ink border with 6px corners. Lines are fine (1px rules, 2px strokes); the double frame is the signature silhouette. Drawn eucalyptus sprigs (round caps and joins) cross the frame of the cover plate and sit on the coral field.

## Components

### Buttons
- **Shape:** full pill, minimum height 44px, padding about 14px by 26px, weight 700.
- **Primary:** coral fill with ink text. On the coral field: ink fill with salt text.
- **Hover:** lifts 2px and brightens to `coral-bright` (ink-soft on coral). Lift is removed under reduced motion.
- **Line:** transparent with a 2px inset currentColor ring; hover adds a 10% currentColor wash.
- **Link:** bold, 2px underline offset 5px; underline turns coral-text on light fields and coral on sea/ink.

### Plates
Salt sheet, 6px corners, double frame, lift shadow. Specimen plate: display title, stack total in `coral-text`, a hairline, then a two-column grid of figures (brand mark, "Fig. N", display name, tagline, price). Photo plate: 12px padding, 2px photo corners.

### Search
A salt pill on the sea field with a leading icon, a clear control and an embedded coral submit button; coral focus-within outline.

### Catalogue rows
Hairline-ruled rows with figure number, mark, display name, tagline and a right-aligned price block. Hover underlines the name and moves the arrow 6px right; the layout does not shift. Gear rows use a dotted leader between name and price.

### Guides list
Field notes shows a lead guide on a framed photo plate and a ruled list beside it, newest first, capped at six guides. Row titles use the title role limited to two lines with a 10px bottom margin. Filtering is by the hero search only; topic browsing lives on the guides page.

### Software verdict line
Each software row adds a small "Good:" and "Watch:" line in coral labels, using the tool's first recorded pro and con. No new claims are written for it.

### Motion
Cover only: figures "develop" (0.9s, rise 18px, de-blur, staggered 120ms) and the sprig draws its stem (1.6s). Easing is `cubic-bezier(0.22, 1, 0.36, 1)`. Both are disabled under `prefers-reduced-motion`.

## Do's and Don'ts

### Do:
- **Do** give each section one field colour from sea, salt, salt-2, ink or coral, with its paired text colour.
- **Do** frame specimens as plates and give each a figure number, name, tagline, A$ price and verdict where data exists.
- **Do** keep every weight at 700 or below, with tabular numerals for prices.
- **Do** use `coral-text` for coral type on light fields and keep 44px minimum touch height.
- **Do** keep focus visible: 3px outline with a 6px ink halo on dark fields, ink outline on light fields and plates.

### Don't:
- **Don't** add a second action colour or a gradient field.
- **Don't** lift anything but plates with a shadow.
- **Don't** return to identical card grids with a pill-row header; use plates and ruled catalogue rows.
- **Don't** bring back the old Manrope, Mulish, Young Serif or indigo values; the shared tokens now carry the sea-green and coral palette.
- **Don't** claim anything the data does not back (see PRODUCT.md).
