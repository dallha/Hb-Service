---
name: NexusFlow Institutional
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
  on-surface-variant: '#424754'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#727784'
  outline-variant: '#c2c6d5'
  surface-tint: '#085ac0'
  primary: '#004191'
  on-primary: '#ffffff'
  primary-container: '#0058be'
  on-primary-container: '#c4d5ff'
  inverse-primary: '#adc6ff'
  secondary: '#576065'
  on-secondary: '#ffffff'
  secondary-container: '#dbe4ea'
  on-secondary-container: '#5d666b'
  tertiary: '#005035'
  on-tertiary: '#ffffff'
  tertiary-container: '#026a48'
  on-tertiary-container: '#92e7bc'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#dbe4ea'
  secondary-fixed-dim: '#bfc8cd'
  on-secondary-fixed: '#141d21'
  on-secondary-fixed-variant: '#3f484d'
  tertiary-fixed: '#9ff4c8'
  tertiary-fixed-dim: '#83d7ad'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
  surface-main: '#f8f9ff'
  surface-card: '#ffffff'
  surface-sidebar: '#ffffff'
  outline-soft: '#c2c6d6'
  accent-success: '#00855b'
  accent-error: '#ba1a1a'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-md:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  sidebar-width: 280px
  gutter: 24px
  margin-desktop: 32px
  margin-mobile: 16px
  container-max: 1440px
---

## Brand & Style

NexusFlow Institutional embodies a **Corporate Modern** aesthetic tailored for educational and administrative excellence. The brand personality is professional, structured, and authoritative yet remains accessible and optimistic through the use of vibrant blue accents and soft, rounded containers. 

The design prioritizes clarity and high information density without sacrificing visual breathing room. It utilizes a sophisticated "Surface-on-Surface" approach, where light-blue tinted backgrounds differentiate functional zones from the main content canvas. The emotional response should be one of reliability, systematic order, and modern efficiency.

## Colors

The palette is built on a "Fidelity" blue foundation, emphasizing trust and stability. 

- **Primary (#0058be):** Used for key actions, active navigation states, and branding elements.
- **Secondary / Neutrals:** A range of cool-toned slates and greys provide professional grounding.
- **Surface Strategy:** The system uses a multi-tiered light mode. The base background is a very faint blue-grey (`#f8f9ff`), while primary interaction containers and cards use pure white (`#ffffff`) to pop against the background.
- **Functional Accents:** Emerald green is reserved for positive progress and success states, while a deep red handles errors and destructive actions like "Logout".

## Typography

The system exclusively uses **Hanken Grotesk**, a contemporary sans-serif that balances geometric clarity with humanist readability. 

- **Hierarchy:** Dramatic scale is used for welcome headers (Display LG) to create a focal point.
- **Utility:** Labels use uppercase styling with increased letter spacing to provide clear section signposts within the sidebar and data tables.
- **Optimization:** Headlines scale down by 25% on mobile devices to maintain readability without overwhelming the viewport. 
- **Weighting:** Semi-bold (600) and Bold (700) are used strategically for interactive elements and titles, while Regular (400) is reserved for descriptive body text.

## Layout & Spacing

The layout follows a **Fixed-Fluid Hybrid** model. A fixed-width sidebar (280px) provides persistent navigation, while the main content area occupies the remaining width up to a maximum container size of 1440px.

- **Grid:** A Bento-style grid is used for the dashboard, utilizing a 24px gutter. On large screens, primary cards span multiple columns to create visual interest.
- **Rhythm:** A 4px base unit governs all spacing. Standard component padding is 16px (4 units) or 24px (6 units).
- **Responsive Behavior:** On mobile, the sidebar transitions to a hidden drawer, and the 3-column bento grid reflows into a single vertical stack with reduced outer margins (16px).

## Elevation & Depth

NexusFlow uses a **Tonal Layering** approach combined with **Soft Ambient Shadows** to define hierarchy.

- **Base Layer:** The background (`surface-main`) is the lowest point of the UI.
- **Mid Layer:** Cards and the sidebar use a white background with a `shadow-sm` or `shadow-md` (low-blur, 5-10% opacity black) and a `1px` border in `outline-soft` to define their boundaries.
- **Interactive Depth:** Buttons and active cards use a slight `-translate-y` transform and increased shadow intensity on hover to simulate physical lifting.
- **Functional Tinting:** Background circles and decorative elements use `primary-container` (light blue) at low opacities to add depth without adding structural complexity.

## Shapes

The shape language is **distinctly rounded**, moving away from strict corporate corners to feel more modern and inviting.

- **Standard Radius:** 0.5rem (8px) for buttons and small containers.
- **Large Radius:** 1.5rem (24px) to 2rem (32px) for main dashboard cards and the "Welcome" section to create a soft, "app-like" feel.
- **Full Radius:** Reserved for profile avatars and icon badges to denote organic or circular status elements.
- **Interactive Elements:** Navigation links use an "Extra Large" (12px) radius for their hover states, creating a comfortable "pill-block" appearance.

## Components

### Buttons
- **Primary:** Solid blue fill (`primary`) with white text and a shadow.
- **Action/Secondary:** `primary-container` background with `on-primary-container` text for less urgent actions.
- **Destructive:** `error-container` background with `error` (red) text.

### Navigation
- **Sidebar Links:** High-contrast text for active states with a primary color background. Inactive states use `on-surface-variant` with a soft grey background on hover. Icons are mandatory for every link for rapid scanning.

### Cards (Bento)
- Cards must feature a 1px border. Padding should be generous (default 32px) to allow for large-scale typography. Decorative abstract shapes are encouraged in large-format cards.

### Data Tables
- Use subtle `border-b` dividers instead of full grids. Headers must be all-caps, bold, and use the `label-caps` typography style. Rows should feature a subtle hover background transition.

### Input Fields
- Search inputs use a `surface` background (slightly darker than the card) with a 1px `outline` and a lead icon. Focus states should trigger a `primary` color ring.