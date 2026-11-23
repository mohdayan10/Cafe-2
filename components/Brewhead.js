"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import s from "./Brewhead.module.css";

/* ── gauge geometry ───────────────────────────────────────────────
   Angles run from 12 o'clock, clockwise. The dial sweeps 0–16 bar
   over 280°, the way a real portafilter gauge is laid out. */
const GC = { x: 330, y: 96, r: 48 };
const SWEEP = 280;
const MAXBAR = 16;
const ang = (bar) => -SWEEP / 2 + (bar / MAXBAR) * SWEEP;
const pt = (a, r) => [
  +(GC.x + r * Math.sin((a * Math.PI) / 180)).toFixed(2),
  +(GC.y - r * Math.cos((a * Math.PI) / 180)).toFixed(2),
];

const TICKS = Array.from({ length: MAXBAR + 1 }, (_, i) => {
  const a = ang(i);
  const major = i % 4 === 0;
  const [x1, y1] = pt(a, major ? 28 : 32);
  const [x2, y2] = pt(a, 36);
  const [lx, ly] = pt(a, 20);
  return { i, major, x1, y1, x2, y2, lx, ly };
});

/* the 8–10 bar band every barista is chasing */
const BAND = (() => {
  const [x1, y1] = pt(ang(8), 32);
  const [x2, y2] = pt(ang(10), 32);
  return `M${x1} ${y1} A32 32 0 0 1 ${x2} ${y2}`;
})();

/* glass: rim y 310, foot y 451 */
const GLASS_IN = "M168 317 L240 317 L231 441 Q230 448 223 448 L185 448 Q178 448 177 441 Z";
const GLASS_OUT = "M164 310h80l-11 133a9 9 0 0 1-9 8h-40a9 9 0 0 1-9-8z";

const STEAM = [
  "M186 300c-5-9-2-15 1-22",
  "M204 296c-6-11-1-17 2-25",
  "M222 300c-5-9-2-15 1-22",
];

export default function Brewhead({ className }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 88%", "end 45%"],
  });
  const settled = useMotionValue(0.68);
  /* Only switch to the settled state after mount: reading it during the
     first client render would disagree with the server-rendered markup. */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const p = mounted && reduced ? settled : scrollYProgress;

  /* pressure: dead-head, pre-infusion, 9 bar plateau, taper */
  const barRaw = useTransform(
    p,
    [0, 0.12, 0.22, 0.32, 0.74, 0.88, 1],
    [0, 0, 3.1, 9.2, 8.7, 1.8, 0.3],
  );
  const bar = useSpring(barRaw, { stiffness: 90, damping: 14, mass: 0.6 });
  const needle = useTransform(bar, (b) => ang(b));
  const barText = useTransform(bar, (b) => b.toFixed(1));

  /* flow */
  const flow = useTransform(p, [0.22, 0.3, 0.8, 0.87], [0, 1, 1, 0]);
  const tailScale = useSpring(flow, { stiffness: 150, damping: 24 });

  /* the glass fills: the liquid group slides up behind the clip */
  const lift = useTransform(p, [0.26, 0.84], [128, 0]);
  const liftS = useSpring(lift, { stiffness: 110, damping: 26, mass: 0.5 });
  const steamOp = useTransform(p, [0.5, 0.74], [0, 0.5]);

  /* readouts */
  const secsText = useTransform(
    useTransform(p, [0.12, 0.88], [0, 27]),
    (v) => `${Math.max(0, v).toFixed(1)}s`,
  );
  const gramsText = useTransform(
    useTransform(p, [0.24, 0.84], [0, 36]),
    (v) => `${Math.max(0, v).toFixed(1)}g`,
  );

  return (
    <div className={`${s.rig} ${className || ""}`} ref={ref}>
      <svg
        viewBox="0 0 440 500"
        role="img"
        aria-label="An espresso group head pulling a nine bar shot into a glass"
        className={s.svg}
      >
        <defs>
          <linearGradient id="bh-brass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F2DCA6" />
            <stop offset="0.38" stopColor="#C08A2E" />
            <stop offset="0.58" stopColor="#EED399" />
            <stop offset="1" stopColor="#8E601A" />
          </linearGradient>
          <linearGradient id="bh-brass-v" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#EED399" />
            <stop offset="0.5" stopColor="#C08A2E" />
            <stop offset="1" stopColor="#8E601A" />
          </linearGradient>
          <linearGradient id="bh-body" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#5E0C10" />
            <stop offset="0.3" stopColor="#A81A20" />
            <stop offset="0.68" stopColor="#8E1419" />
            <stop offset="1" stopColor="#4E090D" />
          </linearGradient>
          <linearGradient id="bh-glass" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="rgba(42,23,16,.18)" />
            <stop offset="0.16" stopColor="rgba(255,253,248,.04)" />
            <stop offset="0.74" stopColor="rgba(255,253,248,.04)" />
            <stop offset="1" stopColor="rgba(42,23,16,.18)" />
          </linearGradient>
          <linearGradient id="bh-coffee" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6B3418" />
            <stop offset="1" stopColor="#36180A" />
          </linearGradient>
          <linearGradient id="bh-crema" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#A86A22" />
            <stop offset="0.38" stopColor="#E0B465" />
            <stop offset="1" stopColor="#9C5F1E" />
          </linearGradient>
          <linearGradient id="bh-stream" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#4A2310" />
            <stop offset="0.35" stopColor="#8A4820" />
            <stop offset="1" stopColor="#3E1C0C" />
          </linearGradient>
          <clipPath id="bh-clip">
            <path d={GLASS_IN} />
          </clipPath>
        </defs>

        {/* ── machine body, group head protruding to the left ── */}
        <g>
          <rect x="272" y="10" width="116" height="442" rx="10" fill="url(#bh-body)" />
          <rect x="272" y="10" width="116" height="442" rx="10" fill="none" stroke="#3E070A" strokeWidth="1.2" />
          <rect x="272" y="10" width="116" height="20" rx="8" fill="url(#bh-brass-v)" />
          <rect x="283" y="38" width="94" height="5" rx="2.5" fill="rgba(255,253,248,.14)" />
          <rect x="272" y="150" width="116" height="4" fill="rgba(42,23,16,.3)" />

          {/* steam wand on the far side */}
          <circle cx="392" cy="196" r="9" fill="#2A1710" />
          <circle cx="392" cy="196" r="9" fill="none" stroke="url(#bh-brass)" strokeWidth="2" />
          <path d="M388 206l16 56" stroke="url(#bh-brass-v)" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M402 258l4 12" stroke="#2A1710" strokeWidth="5" strokeLinecap="round" fill="none" />

          {/* arm + group head */}
          <rect x="214" y="170" width="66" height="24" fill="url(#bh-brass)" />
          <rect x="166" y="188" width="84" height="40" rx="8" fill="url(#bh-brass)" />
          <rect x="166" y="188" width="84" height="40" rx="8" fill="none" stroke="rgba(42,23,16,.3)" strokeWidth="1" />
          <path d="M170 208h76" stroke="rgba(42,23,16,.22)" strokeWidth="1.4" />
          <circle cx="208" cy="198" r="4" fill="rgba(42,23,16,.25)" />
          <path d="M174 228h68l-5 24h-58z" fill="#2A1710" />
          <path d="M174 228h68l-1.3 5H175.3z" fill="rgba(238,211,153,.55)" />

          {/* portafilter handle */}
          <rect x="136" y="230" width="42" height="14" rx="4" fill="url(#bh-brass-v)" />
          <path d="M54 228h86v18H54a9 9 0 0 1 0-18z" fill="#2A1710" />
          <rect x="60" y="233" width="26" height="3" rx="1.5" fill="rgba(238,211,153,.3)" />

          {/* spouts */}
          <path d="M188 252h12l-2.5 10h-7z" fill="url(#bh-brass-v)" />
          <path d="M212 252h12l-2.5 10h-7z" fill="url(#bh-brass-v)" />

          {/* badge */}
          <rect x="298" y="330" width="64" height="26" rx="4" fill="url(#bh-brass)" />
          <text x="330" y="344" textAnchor="middle" dominantBaseline="central" fontSize="12"
                letterSpacing="3.4" fill="#3B2208" fontFamily="var(--font-display), serif">ORO</text>
        </g>

        {/* ── the shot: two tails converging into one ── */}
        <motion.g style={{ scaleY: tailScale, opacity: flow, originX: "206px", originY: "260px" }}>
          <path d="M189 260h8q0 22 7 34l-6 3q-9-16-9-37z" fill="url(#bh-stream)" />
          <path d="M215 260h8q0 21-9 37l-6-3q7-12 7-34z" fill="url(#bh-stream)" />
          <path d="M200 294h10l-1 20h-8z" fill="url(#bh-stream)" />
          <path d="M202 297h2.6l-0.8 17h-2z" fill="#C98B4B" opacity="0.4" />
        </motion.g>

        {/* ── glass ── */}
        <g>
          <ellipse cx="204" cy="456" rx="44" ry="7" fill="rgba(42,23,16,.13)" />
          <g clipPath="url(#bh-clip)">
            <motion.g style={{ y: liftS }}>
              <rect x="160" y="329" width="92" height="132" fill="url(#bh-coffee)" />
              <rect x="160" y="317" width="92" height="12" fill="url(#bh-crema)" />
              <ellipse cx="192" cy="321" rx="15" ry="3" fill="#F6E3B8" opacity="0.5" />
              <ellipse cx="222" cy="324" rx="7" ry="2" fill="#F6E3B8" opacity="0.32" />
            </motion.g>
          </g>
          <path d={GLASS_IN} fill="url(#bh-glass)" />
          <path d={GLASS_OUT} fill="none" stroke="#2A1710" strokeWidth="2.6" strokeLinejoin="round" opacity="0.85" />
          <path d="M164 310h80" stroke="#2A1710" strokeWidth="3.4" strokeLinecap="round" />
          <path d="M178 326l6 108" stroke="#FFFDF8" strokeWidth="3" strokeLinecap="round" opacity="0.55" />
        </g>

        {/* ── steam off the crema ── */}
        <motion.g
          style={{ opacity: steamOp }}
          fill="none"
          stroke="#8E1419"
          strokeWidth="2"
          strokeLinecap="round"
        >
          {STEAM.map((d, i) => (
            <motion.path
              key={d}
              d={d}
              initial={false}
              animate={mounted && reduced ? { opacity: 0.55, y: 0 } : { y: [0, -14], opacity: [0, 1, 0] }}
              transition={{ duration: 3.2, delay: i * 0.5, repeat: Infinity, ease: "easeOut" }}
            />
          ))}
        </motion.g>

        {/* ── drip tray ── */}
        <g>
          <rect x="118" y="452" width="272" height="24" rx="4" fill="url(#bh-body)" />
          <rect x="126" y="456" width="256" height="5" rx="2.5" fill="url(#bh-brass)" opacity="0.75" />
          {Array.from({ length: 21 }, (_, i) => (
            <line
              key={i}
              x1={132 + i * 12}
              y1="463"
              x2={132 + i * 12}
              y2="472"
              stroke="rgba(42,23,16,.5)"
              strokeWidth="1.4"
            />
          ))}
          <rect x="110" y="476" width="288" height="10" rx="5" fill="#2A1710" opacity="0.92" />
        </g>

        {/* ── pressure gauge, mounted on the body ── */}
        <g>
          <circle cx={GC.x} cy={GC.y} r={GC.r} fill="url(#bh-brass)" />
          <circle cx={GC.x} cy={GC.y} r={GC.r - 5} fill="#FFFDF8" />
          <circle cx={GC.x} cy={GC.y} r={GC.r - 5} fill="none" stroke="rgba(42,23,16,.28)" strokeWidth="1" />
          <path d={BAND} fill="none" stroke="#D81F26" strokeWidth="3.6" strokeLinecap="round" opacity="0.85" />
          {TICKS.map((t) => (
            <g key={t.i}>
              <line
                x1={t.x1}
                y1={t.y1}
                x2={t.x2}
                y2={t.y2}
                stroke="#2A1710"
                strokeWidth={t.major ? 1.7 : 0.9}
                strokeLinecap="round"
                opacity={t.major ? 0.9 : 0.42}
              />
              {t.major && (
                <text
                  x={t.lx}
                  y={t.ly}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="8"
                  fill="#6B5243"
                  fontFamily="var(--font-body), sans-serif"
                >
                  {t.i}
                </text>
              )}
            </g>
          ))}
          <text
            x={GC.x}
            y={GC.y + 24}
            textAnchor="middle"
            fontSize="6.5"
            letterSpacing="2.2"
            fill="#8E1419"
            fontFamily="var(--font-body), sans-serif"
          >
            BAR
          </text>

          <motion.g style={{ rotate: needle, originX: `${GC.x}px`, originY: `${GC.y}px` }}>
            <path d={`M${GC.x} ${GC.y - 36} L${GC.x + 1.7} ${GC.y + 3} L${GC.x - 1.7} ${GC.y + 3} Z`} fill="#D81F26" />
            <rect x={GC.x - 1.5} y={GC.y + 1} width="3" height="11" rx="1.5" fill="#8E1419" />
          </motion.g>
          <circle cx={GC.x} cy={GC.y} r="4.2" fill="#2A1710" />
          <circle cx={GC.x} cy={GC.y} r="1.7" fill="#E8C474" />
          <path
            d={`M${GC.x - 32} ${GC.y - 20} A40 40 0 0 1 ${GC.x + 20} ${GC.y - 36} A42 42 0 0 0 ${GC.x - 32} ${GC.y - 20} Z`}
            fill="#FFFDF8"
            opacity="0.45"
          />
        </g>
      </svg>

      <div className={s.readout} aria-hidden="true">
        <div>
          <motion.b>{secsText}</motion.b>
          <span>Time</span>
        </div>
        <div>
          <motion.b>{barText}</motion.b>
          <span>Pressure</span>
        </div>
        <div>
          <motion.b>{gramsText}</motion.b>
          <span>In the glass</span>
        </div>
      </div>
    </div>
  );
}
