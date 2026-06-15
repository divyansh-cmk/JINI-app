---
name: Obsidian Nebula
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#cfc2d6'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#988d9f'
  outline-variant: '#4d4354'
  surface-tint: '#ddb7ff'
  primary: '#ddb7ff'
  on-primary: '#490080'
  primary-container: '#b76dff'
  on-primary-container: '#400071'
  inverse-primary: '#842bd2'
  secondary: '#adc6ff'
  on-secondary: '#002e6a'
  secondary-container: '#0566d9'
  on-secondary-container: '#e6ecff'
  tertiary: '#c1c7cf'
  on-tertiary: '#2b3137'
  tertiary-container: '#8b9199'
  on-tertiary-container: '#242a30'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#f0dbff'
  primary-fixed-dim: '#ddb7ff'
  on-primary-fixed: '#2c0051'
  on-primary-fixed-variant: '#6900b3'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#dde3eb'
  tertiary-fixed-dim: '#c1c7cf'
  on-tertiary-fixed: '#161c22'
  on-tertiary-fixed-variant: '#41474e'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-lg:
    fontFamily: Sora
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-xl:
    fontFamily: Sora
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Sora
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.3'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Sora
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: -0.01em
  body-md:
    fontFamily: Sora
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.1em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 4px
  container-margin: 24px
  gutter: 16px
  section-gap-lg: 80px
  section-gap-md: 48px
  safe-area: 20px
---

## Brand & Style

The design system is a "Cyberpunk meets Minimalist Luxury" framework designed for a Gen Z audience. It balances high-energy expressive elements with premium, polished execution. The brand personality is hyper-intelligent, magical, and boundary-pushing, centered around the ethereal "JINI" mascot. 

The aesthetic is characterized by:
- **Futuristic Vibrancy:** High-saturation neons against infinite depths.
- **Dimensionality:** A heavy reliance on depth created through light, rather than just shadows.
- **Expressive Fluidity:** Organic, "liquid" shapes that contrast with a structured, technical grid.
- **Digital Craft:** Precision-engineered details such as hairline borders and micro-interactions that feel responsive and "alive."

## Colors

The palette is optimized for OLED displays and high-dynamic-range interfaces.

- **Primary (Electric Purple):** Used for core brand moments, active states, and magical "genie" effects.
- **Secondary (Cyber Blue):** Used for technical actions, data visualization, and links.
- **Holographic Silver:** A metallic gradient used for premium accents and high-level hierarchy elements.
- **Obsidian Neutrals:** Deep, dark blues and blacks that provide the "void" for neons to pop.
- **Neon Glows:** Low-opacity versions of the primary and secondary colors used for inner and outer glow effects.

## Typography

The typography system utilizes **Sora** for its technical yet approachable geometric structure. For headings, we use aggressive weights (Bold to ExtraBold) and tight letter spacing to create a dense, "heavy" impact.

**JetBrains Mono** is introduced as a secondary label font to emphasize the "AI/Bot" nature of the product, used for metadata, status tags, and technical readouts. 

Key Rules:
- All display text must use negative letter-spacing.
- Paragraph text maintains generous line heights for readability against dark backgrounds.
- Avoid light weights; the minimum weight for body text is 400.

## Layout & Spacing

This design system uses a **Fluid Grid** model built on a 4px baseline.

- **Desktop:** 12-column grid with 24px margins. Content is often centered in a max-width container (1440px) to maintain the "Minimalist Luxury" feel.
- **Mobile:** 4-column grid with 20px margins.
- **Spacing Logic:** Vertical spacing is intentionally large between sections to create a sense of scale and breathing room ("White space" is technically "Obsidian space" here).
- **Safe Zones:** UI elements that float (like the chat input) should maintain a 24px safe zone from the screen edges.

## Elevation & Depth

Depth is communicated through **Light and Transparency** rather than traditional drop shadows.

1.  **Backdrop Blurs:** All elevated surfaces use glassmorphism. Surfaces should have a `blur(12px)` and a background opacity of `10%` to `30%`.
2.  **Inner Glows:** Every container has a 1px solid border at 15% opacity, with an additional 1px inner glow (box-shadow: inset) to simulate light catching the edge of glass.
3.  **Glow Bloom:** High-priority elements (like the primary button) emit a soft, diffused "bloom" using a multi-layered outer glow that matches the element’s color.
4.  **Z-Axis Hierarchy:**
    - Level 0: Deep Obsidian background.
    - Level 1: Glass containers for cards/content.
    - Level 2: Interactive elements (Buttons, Inputs).
    - Level 3: Overlays and Mascots (The JINI mascot always sits on the highest Z-index).

## Shapes

The shape language is defined by ultra-large radii, giving the UI a friendly, organic, and premium feel.

- **Base Radius:** 24px (used for small cards and buttons).
- **Large Radius:** 40px (used for main content containers and modular sections).
- **Liquid Shapes:** Elements like the mascot’s trail or button hover states should use non-uniform "blob" shapes to mimic fluid movement.
- **Buttons:** Always fully rounded (Pill-shaped) to reinforce the liquid aesthetic.

## Components

### Buttons (Liquid Style)
Buttons are the centerpiece of the interaction model. The "Liquid" effect is achieved by using a high-contrast gradient background and a subtle `scale(1.05)` on hover. The background should feel like a flowing fluid, possibly using a mesh gradient of Purple and Blue.

### Glass Cards
Cards are semi-transparent with a 1px "Holographic" border. They do not have shadows; instead, they have a subtle outer glow that matches the primary brand color at 5% opacity.

### Input Fields
Inputs are deep obsidian with a neon-purple bottom border. On focus, the entire border glows, and the inner background lightens slightly. The cursor should be a custom neon-blue block.

### Status Chips
Chips use **JetBrains Mono** and are strictly outlined with high-saturation neons. They are used for categorizing AI responses or showing system status.

### The JINI Interface
The chat interface should feel like a conversation with light. User messages are simple glass bubbles, while JINI's messages have a subtle purple-to-blue gradient stroke and appear to "materialize" with a blur-in animation.