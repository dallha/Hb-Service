'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/use-theme';

/**
 * ThemeToggle — Sélecteur Lune/Soleil animé premium
 * Inspiré du sélecteur du Al-Mouyassar Islamic Quiz
 * 
 * Bascule entre le mode Jour (Soleil) et Nuit (Lune)
 * avec une animation fluide et des micro-interactions.
 */
export default function ThemeToggle() {
  const { isDark, toggle, mounted } = useTheme();

  if (!mounted) {
    return <div className="w-9 h-9 sm:w-10 sm:h-10" />;
  }

  return (
    <button
      onClick={toggle}
      className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-none hover:bg-accent/10 transition-colors group"
      aria-label={isDark ? 'Activer le mode clair' : 'Activer le mode sombre'}
    >
      {/* Lune (mode sombre) */}
      <motion.div
        initial={false}
        animate={{
          scale: isDark ? 1 : 0,
          rotate: isDark ? 0 : 90,
          opacity: isDark ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="absolute"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-accent"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      </motion.div>

      {/* Soleil (mode clair) */}
      <motion.div
        initial={false}
        animate={{
          scale: isDark ? 0 : 1,
          rotate: isDark ? -90 : 0,
          opacity: isDark ? 0 : 1,
        }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="absolute"
      >
        <motion.svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-accent"
          animate={!isDark ? { rotate: [0, 360] } : { rotate: 0 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </motion.svg>
      </motion.div>

      {/* Tooltip */}
      <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[10px] font-sans tracking-wider text-muted-foreground whitespace-nowrap bg-background/90 backdrop-blur-sm px-2 py-1 border border-border">
        {isDark ? 'Mode Jour' : 'Mode Nuit'}
      </span>
    </button>
  );
}
