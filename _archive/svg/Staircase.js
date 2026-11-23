"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const STEPS = 20;
const EASE = [0.19, 1, 0.22, 1];

/** The crimson staircase, built one tread at a time as you scroll past it. */
export default function Staircase({ className }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rotate = useTransform(scrollYProgress, [0, 1], [8, -8]);
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <motion.svg
      ref={ref}
      className={className}
      viewBox="0 0 340 520"
      role="img"
      aria-label="Illustration of the crimson staircase curving to the first floor."
      style={{ rotate, y }}
    >
      {/* treads */}
      {Array.from({ length: STEPS }).map((_, i) => {
        const t = i / (STEPS - 1);
        const yTop = 470 - t * 420;
        const curve = Math.sin(t * Math.PI * 0.92) * 96;
        const x = 40 + curve;
        const w = 150 - t * 46;
        const h = 15 - t * 4;
        const shade = Math.round(142 + t * 74);
        return (
          <motion.polygon
            key={i}
            points={`${x},${yTop} ${x + w},${yTop - 10} ${x + w},${yTop - 10 + h} ${x},${yTop + h}`}
            fill={`rgb(${shade}, ${Math.round(20 + t * 11)}, ${Math.round(25 + t * 13)})`}
            initial={{ opacity: 0, x: -36, rotate: -6 }}
            whileInView={{ opacity: 1, x: 0, rotate: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.8, delay: i * 0.055, ease: EASE }}
          />
        );
      })}

      {/* banister */}
      <motion.path
        d="M44 462 C 120 430, 196 330, 196 212 C 196 128, 162 84, 126 56"
        fill="none"
        stroke="#8E1419"
        strokeWidth="7"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 2, delay: 0.4, ease: EASE }}
      />

      {/* pendant lamp */}
      <motion.g
        initial={{ opacity: 0, y: -26 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 1.1, delay: 1.2, ease: EASE }}
      >
        <line x1="268" y1="0" x2="268" y2="118" stroke="#2A1710" strokeWidth="1.6" />
        <circle cx="268" cy="140" r="26" fill="#FFFDF8" />
        <circle cx="268" cy="140" r="40" fill="#E8C474" opacity="0.22" />
      </motion.g>
    </motion.svg>
  );
}
