'use client';

import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  type: 'star' | 'dot' | 'sparkle';
  color: string;
  delay: number;
  duration: number;
}

interface ParticleEffectProps {
  /** Déclenche l'explosion de particules */
  trigger: number;
  /** Position X (optionnelle, défaut: centre) */
  x?: number;
  /** Position Y (optionnelle, défaut: centre) */
  y?: number;
  /** Nombre de particules (défaut: 12) */
  count?: number;
  /** Couleurs des particules */
  colors?: string[];
}

/**
 * ParticleEffect — Micro-explosion de particules premium
 * Inspiré du "Starry Burst" du Al-Mouyassar Islamic Quiz
 * 
 * Utilisation:
 *   const [burst, setBurst] = useState(0);
 *   <ParticleEffect trigger={burst} />
 *   // Déclencher: setBurst(prev => prev + 1)
 */
export default function ParticleEffect({
  trigger,
  x,
  y,
  count = 12,
  colors = ['#D4AF37', '#E8D5A0', '#FFFFFF', '#F5F0E8', '#FFD700'],
}: ParticleEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const counterRef = useRef(0);

  const generateParticles = useCallback(
    (cx: number, cy: number): Particle[] => {
      const newParticles: Particle[] = [];
      const types: Particle['type'][] = ['star', 'dot', 'sparkle'];

      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
        const distance = 40 + Math.random() * 80;
        const size = 3 + Math.random() * 6;

        newParticles.push({
          id: counterRef.current++,
          x: cx + Math.cos(angle) * distance,
          y: cy + Math.sin(angle) * distance,
          size,
          rotation: Math.random() * 360,
          type: types[Math.floor(Math.random() * types.length)],
          color: colors[Math.floor(Math.random() * colors.length)],
          delay: Math.random() * 0.05,
          duration: 0.4 + Math.random() * 0.4,
        });
      }
      return newParticles;
    },
    [count, colors]
  );

  useEffect(() => {
    if (trigger === 0) return;

    let cx = x;
    let cy = y;

    if (cx === undefined || cy === undefined) {
      // Centre de l'écran par défaut
      cx = window.innerWidth / 2;
      cy = window.innerHeight / 2;
    }

    particlesRef.current = generateParticles(cx, cy);

    // Nettoyage après animation
    const timer = setTimeout(() => {
      particlesRef.current = [];
    }, 1000);

    return () => clearTimeout(timer);
  }, [trigger, x, y, generateParticles]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-[100]"
      aria-hidden="true"
    >
      <AnimatePresence>
        {particlesRef.current.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{
              opacity: 1,
              scale: 0,
              x: x ?? window.innerWidth / 2,
              y: y ?? window.innerHeight / 2,
              rotate: 0,
            }}
            animate={{
              opacity: 0,
              scale: [0, 1.2, 0],
              x: particle.x,
              y: particle.y,
              rotate: particle.rotation,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute"
            style={{
              width: particle.size,
              height: particle.size,
              color: particle.color,
            }}
          >
            {particle.type === 'star' ? (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ) : particle.type === 'sparkle' ? (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M12 0l1.5 6.5L20 8l-5.5 4.5L16 20l-4-4-4 4 1.5-7.5L4 8l6.5-1.5z" />
              </svg>
            ) : (
              <div
                className="w-full h-full rounded-full"
                style={{ backgroundColor: particle.color }}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
