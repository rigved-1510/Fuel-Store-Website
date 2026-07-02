---
name: Athletic Minimalist
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#bb0011'
  on-secondary: '#ffffff'
  secondary-container: '#e8121d'
  on-secondary-container: '#fffbff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#191c1e'
  on-tertiary-container: '#818486'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#ffdad6'
  secondary-fixed-dim: '#ffb4ab'
  on-secondary-fixed: '#410002'
  on-secondary-fixed-variant: '#93000b'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-sm:
    fontFamily: Montserrat
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style
The design system is engineered for a high-end football retail experience, blending the raw energy of sport with the sophisticated clarity of modern e-commerce. The brand personality is professional, performance-oriented, and authoritative. 

The aesthetic follows a **Minimalist-Athletic** hybrid: 
- **Minimalism:** Use of expansive whitespace to allow jersey textures and colors to remain the focal point.
- **Athletic Precision:** High-contrast typography and geometric alignments that evoke the precision of a pitch or a tactical playbook.
- **Professionalism:** A structured, grid-based approach ensures trust and reliability during the purchasing process.

## Colors
The palette is rooted in a "Clean Stadium" concept, using high-contrast neutrals to frame vibrant product photography and critical actions.

- **Primary (Deep Charcoal/Navy):** `#0f172a`. Used for typography, navigation, and structural elements. It provides a grounded, premium feel.
- **Secondary (Athletic Red):** `#e00518`. A high-energy, vibrant accent reserved strictly for Primary CTAs, notifications, and live-match indicators. This updated red offers a more direct, pure competitive tone.
- **Tertiary (Ice Gray):** `#f8fafc`. A subtle off-white used for background layering and card containers to distinguish them from the pure white page background.
- **Neutral:** `#64748b`. A range of grays for secondary text, borders, and disabled states.

## Typography
The typography strategy utilizes a dual-font approach to balance impact with legibility.

- **Headlines:** Montserrat is used in heavy weights (Bold/ExtraBold) for all headings. The geometric nature of the font suggests movement and strength. Letter spacing is slightly tightened on large displays to increase visual tension.
- **Body & Interface:** Inter provides a neutral, highly readable foundation for product descriptions, technical specs, and checkout flows.
- **Labels:** Small labels use uppercase Inter with increased letter spacing to mimic the look of jersey name-and-number printing.

## Layout & Spacing
The layout follows a strict **8px square grid** to maintain a rhythmic, athletic feel. 

- **Mobile:** A 4-column fluid grid with 16px side margins. Content cards usually span the full width or 2 columns for product listings.
- **Desktop:** A 12-column fixed-max-width grid (1440px). 
- **Vertical Rhythm:** Use generous `lg` (48px) and `xl` (80px) spacing between sections to ensure the design feels breathable and premium, rather than cluttered.

## Elevation & Depth
This design system uses a "Flat-Plus" approach. Depth is communicated through tonal shifts and very subtle, expansive shadows rather than heavy gradients.

- **Level 0 (Base):** Pure white background.
- **Level 1 (Cards):** Ice Gray (`#f8fafc`) background with a 1px border.
- **Level 2 (Interactive):** When hovered or active, cards lift using a soft, neutral shadow: `0px 12px 24px rgba(15, 23, 42, 0.08)`.
- **Overlays:** Modals and drawers use a 40% opacity Deep Charcoal backdrop blur to maintain focus on the task.

## Shapes
The shape language is "Rounded-Geometric." Elements are soft enough to feel modern and accessible but sharp enough to feel precise.

- **Standard Radius:** 8px for buttons, input fields, and small UI components.
- **Large Radius:** 16px for product cards and featured containers.
- **Full Radius:** Used only for status badges (e.g., "In Stock") and circular icon buttons.

## Components
- **Buttons:** Primary CTAs are solid Athletic Red (`#e00518`) with white text, bold weight, and 8px corners. Secondary buttons use a transparent background with a 2px Deep Charcoal stroke.
- **Product Cards:** Minimalist containers with no external borders. The image should be on an Ice Gray background. Product name in Bold Montserrat, price in a neutral gray Inter.
- **Chips:** Used for size selection (S, M, L, XL). Unselected: Light gray border. Selected: Solid Deep Charcoal with white text.
- **Inputs:** Clean, 1px bordered fields. On focus, the border thickens and changes to Deep Charcoal, never the secondary color, to keep the UI professional.
- **Status Badges:** Small, uppercase labels for "New Arrival" or "Limited Edition," using high-contrast backgrounds (e.g., Black/White) to stand out without competing with CTAs.