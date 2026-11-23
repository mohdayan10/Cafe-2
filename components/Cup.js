"use client";

import { motion } from "framer-motion";

/** Espresso in a glass, with steam that never settles. */
export default function Cup({ className, delay = 0 }) {
  const steam = (d) => ({
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: [0, 0.9, 0], y: -14 },
    transition: { delay: delay + d, duration: 3.4, repeat: Infinity, repeatDelay: 0.3, ease: "easeOut" },
  });

  return (
    <motion.svg
      className={className}
      viewBox="0 0 120 150"
      role="img"
      aria-label="A glass of espresso, steaming"
      initial={{ opacity: 0, y: 18, rotate: -6 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ delay, duration: 1, ease: [0.19, 1, 0.22, 1] }}
    >
      <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        <motion.path d="M34 34c-6 10-2 18 2 26" key="s1" {...steam(0)} />
        <motion.path d="M60 26c-7 12-1 20 3 29" key="s2" {...steam(0.5)} />
        <motion.path d="M86 34c-6 10-2 18 2 26" key="s3" {...steam(1)} />
      </g>
      {/* saucer */}
      <ellipse cx="60" cy="140" rx="46" ry="7" fill="rgba(42,23,16,.14)" />
      {/* glass */}
      <path d="M26 74h68l-8 56a10 10 0 0 1-10 9H44a10 10 0 0 1-10-9z" fill="rgba(255,253,248,.92)" stroke="currentColor" strokeWidth="2.6" />
      {/* crema + coffee */}
      <path d="M31 86h58l-6 44a8 8 0 0 1-8 7H45a8 8 0 0 1-8-7z" fill="#5A2B14" />
      <path d="M31 86h58l-1.4 10H32.4z" fill="#C08A2E" />
      {/* handle */}
      <path d="M94 86c12 0 18 7 18 15s-7 15-17 15" fill="none" stroke="currentColor" strokeWidth="2.6" />
    </motion.svg>
  );
}
