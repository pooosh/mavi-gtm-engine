---
name: MAVI Trial OS
description: Editorial finance desk, black-and-white pages with a single electric cobalt signal.
colors:
  mavi-indigo: "#4f46e5"
  ink: "#0c0a08"
  obsidian: "#1a1919"
  paper: "#ffffff"
  bone: "#f4f2f0"
  ash: "#6d6c6b"
  hairline: "#e5e7eb"
  smoke: "#d3d3d3"
typography:
  display:
    fontFamily: "'lausanne', ui-sans-serif, system-ui, sans-serif"
    fontSize: "64px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "normal"
  heading-lg:
    fontFamily: "'lausanne', ui-sans-serif, system-ui, sans-serif"
    fontSize: "40px"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "normal"
  heading:
    fontFamily: "'lausanne', ui-sans-serif, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 400
    lineHeight: 1.14
    letterSpacing: "normal"
  heading-sm:
    fontFamily: "'lausanne', ui-sans-serif, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 400
    lineHeight: 1.17
    letterSpacing: "normal"
  subheading:
    fontFamily: "'lausanne', ui-sans-serif, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "'lausanne', ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  caption:
    fontFamily: "'lausanne', ui-sans-serif, system-ui, sans-serif"
    fontSize: "10px"
    fontWeight: 400
    lineHeight: 2.2
    letterSpacing: "0.18px"
rounded:
  tags: "6px"
  buttons: "6px"
  inputs: "10px"
  wash: "12px"
  cards: "16px"
spacing:
  4: "4px"
  8: "8px"
  12: "12px"
  16: "16px"
  20: "20px"
  24: "24px"
  32: "32px"
  40: "40px"
  48: "48px"
  64: "64px"
  128: "128px"
  156: "156px"
components:
  button-primary:
    backgroundColor: "{colors.mavi-indigo}"
    textColor: "{colors.paper}"
    rounded: "{rounded.buttons}"
    padding: "0px 20px"
  button-outlined:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.buttons}"
    padding: "0px 12px"
  content-card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.cards}"
    padding: "20px 24px"
---

# Design System: MAVI Trial OS

## Overview

**Creative North Star: "Editorial Finance Desk"**

MAVI operates as a black-and-white editorial system punctuated by a single electric cobalt accent — the visual equivalent of an executive finance audit with an indigo marker. The interface stays nearly monochrome: warm off-white canvas (`#f4f2f0`), white cards (`#ffffff`), hairline gray borders (`#e5e7eb`), and deep near-black text (`#0c0a08`). That one vivid indigo (`#4f46e5`) appears only where momentum moves — primary CTAs, unblocking actions, live resolution triggers, and active trial milestones — making every action feel decisive.

Typography is a single-weight, neo-grotesque custom face (`lausanne`) at 400, used at large display sizes with tight leading (lineHeight ~1.0 at 64px) and positive tracking on small uppercase labels. Components are flat, hairline-bordered, and shadow-free: cards rest on 1px borders, not shadows, with 12–16px radii; buttons are 6px-radius rectangles. Density is comfortable, rhythm is 8/12/16/24px, and motion is utility-focused.

**Key Characteristics:**
- Single-weight typography: hierarchy driven strictly by scale and tracking, never bold/semibold weights.
- Single chromatic signal: MAVI Indigo (`#4f46e5`) reserved exclusively for primary action fills and active status highlights.
- Flat hairline elevation: 1px `#e5e7eb` outlines replace box-shadows.

## Colors

The palette is a monochrome publication surface with a single chromatic accent that acts as an operational marker.

### Primary
- **MAVI Indigo** (`#4f46e5` / `oklch(0.53 0.24 264)`): Primary action fills, live milestone triggers, active-state highlights. The only chromatic accent in the system.

### Neutral
- **Ink** (`#0c0a08`): Primary text, heading fill, dark surface backgrounds.
- **Obsidian** (`#1a1919`): Dark panels, navigation bar, inverted sections.
- **Paper** (`#ffffff`): Card surfaces, modal panels, light fills.
- **Bone** (`#f4f2f0`): Page canvas, subtle card washes, hover background states.
- **Ash** (`#6d6c6b`): Secondary text, hushed captions, muted labels.
- **Hairline** (`#e5e7eb`): Card borders, divider lines, structural outlines.
- **Smoke** (`#d3d3d3`): Subtle borders, muted backgrounds, skeleton states.

### Named Rules
**The Single Accent Rule.** `#4f46e5` is reserved strictly for interactive actions and live status triggers. It is never used as a background wash, decorative gradient, or passive highlight.

## Typography

**Display Font:** `lausanne` (with fallback `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`)
**Body Font:** `lausanne` (same single font family across all UI roles)

**Character:** Editorial, precise, and understated. A single weight (400) creates clean, high-density financial readability.

### Hierarchy
- **Display** (400, 64px, line-height 1.0): Hero headlines and major editorial statements.
- **Headline-LG** (400, 40px, line-height 1.05): Primary section headers.
- **Headline** (400, 28px, line-height 1.14): Modal titles and card headers.
- **Headline-SM** (400, 24px, line-height 1.17): Sub-section titles.
- **Subheading** (400, 20px, line-height 1.3): Group headers.
- **Body** (400, 16px, line-height 1.5): Standard narrative and task descriptions.
- **Caption** (400, 10px, line-height 2.2, tracking 0.18px): Uppercase micro-labels, metadata tags, and metric captions.

### Named Rules
**The Single-Weight Rule.** Use weight 400 exclusively. Hierarchy is established through size differential, line-height compression on display sizes, and letter-spacing expansion on captions.
**The No-Monospace-Costume Rule.** Monospace (`font-mono`) is forbidden for labels, status pills, or prose. Use `tabular-nums` for numeric alignment.

## Layout

Full-bleed light canvas (`#f4f2f0`) with max-width 1200px centered content columns. Content arrangement is left-aligned within max-width containers. Density is high, with element gaps at 8px, card padding at 20-24px, and section rhythm alternating between 64px and 128px.

## Elevation & Depth

Elevation is expressed entirely through hairline 1px borders (`#e5e7eb`) and surface tonal shifts (Bone `#f4f2f0` → Paper `#ffffff` → Inverted `#1a1919`) rather than box-shadows.

### Named Rules
**The Hairline Border Rule.** Cards, containers, and popovers rest on 1px borders, never drop shadows.
**The No-Side-Tab Rule.** Thick 3px or 4px left/right colored border stripes on cards are prohibited. Status is indicated via text badges, icons, and subtle perimeter ring shifts.

## Shapes

Forms are clean, flat rectangles with consistent border radii tied strictly to component scale.

- **Tags / Buttons:** 6px radius (`--radius-md`)
- **Inputs:** 10px radius (`--radius-inputs`)
- **Wash Cards:** 12px radius (`--radius-xl`)
- **Content Cards:** 16px radius (`--radius-2xl`)

## Components

### Buttons
- **Shape:** 6px radius (`--radius-buttons`)
- **Primary:** `#4f46e5` fill, `#ffffff` text, no border, ~44px height (0px vertical / 20px horizontal padding).
- **Outlined:** Transparent fill, 1px `#0c0a08` border, `#0c0a08` text, 0px vertical / 12px horizontal padding.
- **Ghost:** Transparent fill, no border, `#0c0a08` text. Hover shifts to `#f4f2f0` background.

### Cards / Containers
- **Content Card:** 16px radius, `#ffffff` fill, 1px `#e5e7eb` border, no shadow, 20-24px padding.
- **Wash Card:** 12px radius, `#f4f2f0` fill, no border, 16-20px padding.

### Inputs / Fields
- **Email / Search Input:** 10px radius, `#ffffff` background, 1px `rgba(33,33,33,0.1)` border, `#0c0a08` text.

## Do's and Don'ts

### Do:
- **Do** use `lausanne` (or sans-serif fallback) at weight 400 exclusively.
- **Do** reserve `#4f46e5` indigo strictly for active CTAs and live resolution status.
- **Do** rely on 1px `#e5e7eb` hairline borders for element separation.
- **Do** use `tabular-nums` for numerical data alignment.

### Don't:
- **Don't** use `border-l-4` or thick 3px/4px colored side-tab borders on cards or alerts.
- **Don't** use `font-mono` as a costume on non-code UI labels, day counts, or status badges.
- **Don't** apply drop shadows to content cards, panels, or popovers.
- **Don't** use multicolor gradients or glassmorphism blurs.