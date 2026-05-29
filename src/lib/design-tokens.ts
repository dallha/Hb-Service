/**
 * HB_Service Design System Tokens
 * Luxury E-commerce — Parfums & Soins Naturels Premium
 * 
 * This file centralizes all design tokens for consistency
 * and accelerated development with Tailwind CSS.
 */

// ─── Color Palette ─────────────────────────────────────────────
export const colors = {
  // Core brand colors
  bgPrimary: '#F8F7F5',      // Blanc cassé — replaces clinical pure white
  textPrimary: '#1A1A1A',    // Noir profond — maximum readability
  accentGold: '#D4AF37',     // Doré discret — luxury details
  surfaceLuxe: '#E8E0D5',    // Beige luxe — secondary backgrounds
  borderMuted: '#8C8C8C',    // Gris pierre — secondary hierarchy

  // Extended palette
  bgDark: '#1A1A1A',         // Dark mode primary
  surfaceDark: '#2A2A2A',    // Dark mode secondary
  goldLight: '#E8D5A0',      // Lighter gold for hover states
  goldDark: '#B8962E',       // Darker gold for pressed states
  cream: '#F5F0E8',          // Cream for subtle backgrounds
  stone: '#9B9B9B',          // Stone grey for muted text
  success: '#4A7C59',        // Natural green for stock/success
  error: '#C44536',          // Warm red for errors
  warning: '#D4A037',        // Amber for warnings
} as const;

// ─── Typography ────────────────────────────────────────────────
export const typography = {
  // Serif: Playfair Display — for storytelling & headlines
  serif: {
    family: "'Playfair Display', Georgia, serif",
    weights: {
      regular: 400,
      medium: 500,
      semiBold: 600,
      bold: 700,
    },
  },
  // Sans-Serif: Inter — for transactional UI
  sans: {
    family: "'Inter', system-ui, sans-serif",
    weights: {
      light: 300,
      regular: 400,
      medium: 500,
      semiBold: 600,
      bold: 700,
    },
  },
  // Scale (rem)
  scale: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
    '7xl': '4.5rem',   // 72px
  },
} as const;

// ─── Spacing ───────────────────────────────────────────────────
// Generous spacing to let products breathe — "couture" feel
export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
  '4xl': '6rem',   // 96px
  '5xl': '8rem',   // 128px
} as const;

// ─── Border Radius ─────────────────────────────────────────────
// Very low radius for "couture" feel
export const radius = {
  none: '0px',
  sm: '2px',
  md: '4px',
  lg: '6px',
} as const;

// ─── Motion ────────────────────────────────────────────────────
// Bezier curves for fluid animations — 0.4s duration
export const motion = {
  duration: {
    fast: '0.2s',
    normal: '0.4s',
    slow: '0.6s',
  },
  easing: {
    // Primary bezier for page transitions
    luxury: [0.22, 1, 0.36, 1] as [number, number, number, number],
    // Secondary bezier for micro-interactions
    smooth: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    // Spring-like for modals
    spring: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
  },
  // Framer Motion variants
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
  slideInRight: {
    initial: { opacity: 0, x: 40 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
} as const;

// ─── Breakpoints ───────────────────────────────────────────────
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// ─── Brand Copy ────────────────────────────────────────────────
export const brand = {
  name: 'HB_Service',
  tagline: 'Parfums & Soins Naturels Premium',
  mission: 'Rendre accessible une expérience premium du parfum et du soin naturel.',
  vision: 'Faire de HB_Service une référence incontournable du parfum et du bien-être, à l\'échelle africaine et internationale.',
  values: ['Qualité', 'Authenticité', 'Élégance', 'Confiance'],
  archetype: {
    primary: 'Le Créateur',    // Art, aesthetics, innovation
    secondary: 'Le Sage',      // Transparency, craftsmanship, knowledge
  },
  hero: {
    title: 'L\'Art du Parfum, l\'Essence du Naturel',
    subtitle: 'Découvrez des créations olfactives d\'exception, nées du savoir-faire africain et de la pureté des ingrédients naturels.',
    ctaPrimary: 'Acheter maintenant',
    ctaSecondary: 'Découvrir la collection',
  },
  reassurance: [
    { icon: 'truck', label: 'Livraison Rapide', desc: 'Sous 48h à Dakar' },
    { icon: 'shield', label: 'Paiement à la Livraison', desc: 'Zéro risque' },
    { icon: 'message-circle', label: 'Support WhatsApp', desc: 'Conseil personnalisé' },
  ],
} as const;
