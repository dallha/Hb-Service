'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/hooks/use-theme';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  twinkleSpeed: number;
}

/**
 * AmbientStars — Constellation interactive en mode sombre
 * Inspiré du "Mode Nuit Étoilée" du Al-Mouyassar Islamic Quiz
 * 
 * Affiche des étoiles scintillantes uniquement en mode sombre,
 * avec des rythmes de scintillement différenciés.
 */
export default function AmbientStars({ starCount = 48 }: { starCount?: number }) {
  const { isDark, mounted } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animationRef = useRef<number>(0);
  const [initialized, setInitialized] = useState(false);

  // Générer les étoiles une seule fois
  useEffect(() => {
    if (!mounted) return;

    const stars: Star[] = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 0.5 + Math.random() * 2.5,
        opacity: 0.2 + Math.random() * 0.8,
        duration: 2 + Math.random() * 4,
        delay: Math.random() * 5,
        twinkleSpeed: 0.5 + Math.random() * 2,
      });
    }
    starsRef.current = stars;
    setInitialized(true);
  }, [mounted, starCount]);

  // Animation loop
  useEffect(() => {
    if (!mounted || !isDark || !initialized) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let startTime = performance.now();

    const animate = (time: number) => {
      if (!ctx || !canvas) return;
      const elapsed = (time - startTime) / 1000;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      starsRef.current.forEach((star) => {
        const twinkle = Math.sin(elapsed * star.twinkleSpeed + star.delay) * 0.5 + 0.5;
        const alpha = star.opacity * (0.3 + twinkle * 0.7);

        ctx.beginPath();
        ctx.arc(
          (star.x / 100) * canvas.width,
          (star.y / 100) * canvas.height,
          star.size,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = `rgba(212, 175, 55, ${alpha})`;
        ctx.fill();

        // Lueur subtile autour des grandes étoiles
        if (star.size > 1.5) {
          ctx.beginPath();
          ctx.arc(
            (star.x / 100) * canvas.width,
            (star.y / 100) * canvas.height,
            star.size * 3,
            0,
            Math.PI * 2
          );
          ctx.fillStyle = `rgba(212, 175, 55, ${alpha * 0.1})`;
          ctx.fill();
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [isDark, mounted, initialized]);

  if (!mounted || !isDark) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
