"use client";

import { motion } from "framer-motion";

const EASE = [0.19, 1, 0.22, 1];

/** The house, drawn: plaster columns below, gingham skin above, sign swinging. */
export default function Facade({ className }) {
  const draw = (delay) => ({
    initial: { pathLength: 0, opacity: 0 },
    whileInView: { pathLength: 1, opacity: 1 },
    viewport: { once: true, amount: 0.3 },
    transition: { pathLength: { duration: 1.6, delay, ease: EASE }, opacity: { duration: 0.3, delay } },
  });

  return (
    <svg className={className} viewBox="0 0 520 620" role="img" aria-label="Illustration of the Oro House: a gingham-clad upper floor over a colonnade, with a red hanging sign.">
      <defs>
        <pattern id="gingham" width="36" height="36" patternUnits="userSpaceOnUse">
          <rect width="36" height="36" fill="#FFFDF8" />
          <rect width="18" height="36" fill="rgba(216,31,38,.45)" />
          <rect width="36" height="18" fill="rgba(216,31,38,.45)" />
          <rect width="18" height="18" fill="rgba(216,31,38,.92)" />
        </pattern>
        <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8C474" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#E8C474" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* gingham upper floor */}
      <motion.rect
        x="70" y="60" width="380" height="250"
        fill="url(#gingham)"
        initial={{ scaleY: 0, originY: 1 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.2, ease: EASE }}
        style={{ transformOrigin: "260px 310px" }}
      />

      {/* cornice */}
      <motion.rect
        x="54" y="44" width="412" height="20" fill="#FFFDF8" stroke="#2A1710" strokeWidth="1.2"
        initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.9, delay: 0.5, ease: EASE }}
      />

      {/* windows */}
      {[[150, 120], [300, 120]].map(([x, y], i) => (
        <motion.g key={i}
          initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.75 + i * 0.12, ease: EASE }}
          style={{ transformOrigin: `${x + 35}px ${y + 55}px` }}
        >
          <rect x={x - 12} y={y - 12} width="94" height="134" fill="#FFFDF8" />
          <rect x={x} y={y} width="70" height="110" fill="#2A1710" />
          <rect x={x + 32} y={y} width="6" height="110" fill="#FFFDF8" />
        </motion.g>
      ))}

      {/* ground floor: plaster band + colonnade */}
      <motion.rect
        x="54" y="310" width="412" height="230" fill="#FFFDF8"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.8, delay: 0.2 }}
      />
      <rect x="54" y="310" width="412" height="16" fill="url(#glow)" />

      {[90, 196, 302, 408].map((x, i) => (
        <motion.g key={x}
          initial={{ y: 40, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, delay: 0.5 + i * 0.09, ease: EASE }}
        >
          <rect x={x - 4} y="336" width="34" height="12" fill="#FFFDF8" stroke="#2A1710" strokeWidth="1.1" />
          <rect x={x} y="348" width="26" height="170" fill="#FFFDF8" stroke="#2A1710" strokeWidth="1.1" />
          {[6, 13, 20].map((o) => (
            <line key={o} x1={x + o} y1="352" x2={x + o} y2="514" stroke="#2A1710" strokeWidth="0.7" opacity="0.45" />
          ))}
          <rect x={x - 4} y="518" width="34" height="12" fill="#FFFDF8" stroke="#2A1710" strokeWidth="1.1" />
        </motion.g>
      ))}

      {/* warm light spilling from inside */}
      <motion.rect
        x="112" y="360" width="296" height="158" fill="#E8C474" opacity="0.26"
        initial={{ opacity: 0 }} whileInView={{ opacity: 0.26 }}
        viewport={{ once: true, amount: 0.3 }} transition={{ duration: 1.4, delay: 1 }}
      />

      {/* pavement */}
      <motion.line
        x1="20" y1="540" x2="500" y2="540" stroke="#2A1710" strokeWidth="1.4"
        {...draw(0.3)}
      />

      {/* hanging sign */}
      <motion.g
        style={{ transformOrigin: "470px 330px" }}
        initial={{ rotate: -14, opacity: 0 }}
        whileInView={{ rotate: [-14, 5, -2, 0], opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 2.2, delay: 1.1, ease: EASE }}
      >
        <line x1="470" y1="330" x2="470" y2="540" stroke="#D81F26" strokeWidth="7" strokeLinecap="round" />
        <line x1="470" y1="340" x2="398" y2="340" stroke="#D81F26" strokeWidth="5" strokeLinecap="round" />
        <ellipse cx="416" cy="392" rx="62" ry="40" fill="#D81F26" />
        <line x1="416" y1="352" x2="416" y2="340" stroke="#D81F26" strokeWidth="4" />
        <text x="416" y="404" textAnchor="middle" fill="#E8C474"
          style={{ font: "italic 38px var(--font-script), cursive" }}>oro</text>
      </motion.g>
    </svg>
  );
}
