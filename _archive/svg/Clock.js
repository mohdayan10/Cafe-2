"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Cup from "./Cup";
import Reveal from "./Reveal";
import SplitWords from "./SplitWords";
import { HOURS, span, statusAt } from "./hours";
import s from "./Clock.module.css";

/* ──────────────────────────────────────────────────────────────
   A twenty-four hour dial. Midnight at the top, noon at the
   bottom, so the whole trading day is one unbroken arc instead of
   two laps — the red band is simply when the doors are open, and
   the hand is where we are in it right now.
   ────────────────────────────────────────────────────────────── */

const C = 310;                       // centre
const R_ARC = 290;                   // opening-hours band
const R_TICK = 276;                  // tick outer edge
const R_LABEL = 234;
const R_HAND = 198;

const deg = (hour) => (hour / 24) * 360;
const pt = (a, r) => [
  +(C + r * Math.sin((a * Math.PI) / 180)).toFixed(2),
  +(C - r * Math.cos((a * Math.PI) / 180)).toFixed(2),
];

/* a tick every quarter hour, longer on the hour */
const TICKS = Array.from({ length: 96 }, (_, i) => {
  const a = deg(i / 4);
  const major = i % 4 === 0;
  const [x1, y1] = pt(a, major ? 256 : 267);
  const [x2, y2] = pt(a, R_TICK);
  return { i, major, x1, y1, x2, y2 };
});

const LABELS = Array.from({ length: 12 }, (_, i) => {
  const h = i * 2;
  const [x, y] = pt(deg(h), R_LABEL);
  return { h, x, y };
});

/* the open-hours band as a single arc path */
function arc(openMin, closeMin) {
  const a0 = deg(openMin / 60);
  const a1 = deg(closeMin / 60);
  const [x0, y0] = pt(a0, R_ARC);
  const [x1, y1] = pt(a1, R_ARC);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M${x0} ${y0} A${R_ARC} ${R_ARC} 0 ${large} 1 ${x1} ${y1}`;
}

export default function Clock() {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  /* time is client-only: rendering it on the server would not match */
  const [now, setNow] = useState(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 20000);
    return () => clearInterval(id);
  }, []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const ringSpin = useTransform(scrollYProgress, [0, 1], [-7, 7]);

  const day = now ? now.getDay() : 1;
  const { open, close } = span(day);
  const status = now ? statusAt(now) : null;
  const handAngle = now
    ? deg(now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600)
    : 0;
  const [nx, ny] = pt(handAngle, R_ARC);

  return (
    <section className={`band ${s.clock}`} id="hours" ref={ref}>
      <div className={`wrap ${s.inner}`}>
        <header className={s.head}>
          <Reveal><p className="eyebrow">Twenty-four hours, one dial</p></Reveal>
          <SplitWords className={s.title} text="The city wakes up here." />
          <Reveal delay={0.12}>
            <p className={s.lede}>
              The red band is when the doors are open. The hand is now.
            </p>
          </Reveal>
        </header>

        <div className={s.stage}>
          <svg viewBox="0 0 620 620" className={s.dial} role="img" aria-label={
            now
              ? `A 24 hour clock. Today, ${HOURS[day][0]}, Oro is open ${HOURS[day][1]}. ${status.note}.`
              : "A 24 hour clock showing today's opening hours"
          }>
            <defs>
              <linearGradient id="ck-band" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#D81F26" />
                <stop offset="0.55" stopColor="#8E1419" />
                <stop offset="1" stopColor="#C08A2E" />
              </linearGradient>
            </defs>

            {/* face */}
            <circle cx={C} cy={C} r={R_ARC} fill="none" stroke="rgba(42,23,16,.12)" strokeWidth="1" />
            <circle cx={C} cy={C} r="214" fill="rgba(42,23,16,.025)" />

            {/* ticks drift a little as you scroll past */}
            <motion.g style={{ rotate: reduced ? 0 : ringSpin, originX: `${C}px`, originY: `${C}px` }}>
              {TICKS.map((t) => (
                <line
                  key={t.i}
                  x1={t.x1}
                  y1={t.y1}
                  x2={t.x2}
                  y2={t.y2}
                  stroke="#2A1710"
                  strokeWidth={t.major ? 1.8 : 0.8}
                  strokeLinecap="round"
                  opacity={t.major ? 0.55 : 0.2}
                />
              ))}
            </motion.g>

            {/* the opening-hours band, drawn on as it comes into view */}
            <motion.path
              d={arc(open, close)}
              fill="none"
              stroke="url(#ck-band)"
              strokeWidth="9"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true, margin: "0px 0px -15% 0px" }}
              transition={{ duration: reduced ? 0 : 1.7, ease: [0.19, 1, 0.22, 1] }}
            />

            {LABELS.map((l) => (
              <text
                key={l.h}
                x={l.x}
                y={l.y}
                textAnchor="middle"
                dominantBaseline="central"
                className={`${s.num} ${now && l.h === Math.floor(now.getHours() / 2) * 2 ? s.numNow : ""}`}
              >
                {String(l.h).padStart(2, "0")}
              </text>
            ))}

            {/* the hand sweeps round to the current time on arrival */}
            {now && (
              <motion.g
                initial={{ rotate: 0 }}
                animate={{ rotate: handAngle }}
                transition={{ duration: reduced ? 0 : 2.2, ease: [0.19, 1, 0.22, 1] }}
                style={{ originX: `${C}px`, originY: `${C}px` }}
              >
                {/* a floating segment, so it reads as a pointer rather
                    than a stick emerging from behind the glass */}
                <line
                  x1={C}
                  y1={C - 120}
                  x2={C}
                  y2={C - R_HAND}
                  stroke="#2A1710"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
                <circle cx={C} cy={C - R_HAND} r="5" fill="#D81F26" />
              </motion.g>
            )}

            {/* a dot on the rim at this exact minute */}
            {now && (
              <motion.circle
                cx={nx}
                cy={ny}
                r="7"
                fill="#D81F26"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: reduced ? 0 : 1.5, duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
              />
            )}
          </svg>

          <div className={s.centre}>
            <Cup className={s.cup} delay={0.3} />
          </div>
        </div>

        <div className={s.meta}>
          <Reveal delay={0.1}>
            <div className={s.statusRow}>
              <span className={`${s.pill} ${status?.open ? s.on : s.off}`}>
                <i />
                {now ? (status.open ? "Open now" : "Closed") : "Hours"}
              </span>
              <span className={s.note}>
                {now ? `${HOURS[day][0]} · ${HOURS[day][1]} · ${status.note}` : " "}
              </span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
