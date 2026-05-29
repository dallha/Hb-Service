"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -15 }}
      transition={{
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1], // Custom Bézier curve for smooth motion
      }}
    >
      {children}
    </motion.div>
  );
}
