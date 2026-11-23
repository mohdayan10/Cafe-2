"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import s from "./FlipBoard.module.css";

/* A split-flap board, the kind that hangs over a counter and clatters
   through the day's list. Every flap steps forward through the charset
   one character at a time, exactly like the mechanical thing. */

const CHARSET = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,'&-:";
const N = CHARSET.length;
const COLS = 19;
const STEP = 30;   // ms per flap
const HOLD = 5200; // ms a frame stays up

const FRAMES = [
  ["PISTACHIO CORNETTO", "TWELVE MADE TODAY", "GONE BY NINE-THIRTY"],
  ["LEMON RICOTTA CAKE", "WHOLE, BY THE SLICE", "OR BOXED TO TAKE"],
  ["POUR-OVER ETHIOPIA", "ONE ORIGIN, CHANGED", "EVERY MONDAY AT SIX"],
  ["SOUP OF THE MORNING", "WHATEVER THE MARKET", "HAD AT SIX O'CLOCK"],
];

const pad = (line) => line.toUpperCase().padEnd(COLS, " ").slice(0, COLS).split("");

function Flap({ target, delay, live }) {
  const [char, setChar] = useState(" ");
  const [tick, setTick] = useState(0);
  const at = useRef(" ");

  useEffect(() => {
    const goal = CHARSET.indexOf(target);
    if (goal < 0) return;
    if (!live) {
      at.current = target;
      setChar(target);
      return;
    }
    let cur = CHARSET.indexOf(at.current);
    if (cur < 0) cur = 0;
    const steps = (goal - cur + N) % N;
    if (steps === 0) return;

    const timers = [];
    for (let k = 1; k <= steps; k++) {
      timers.push(
        setTimeout(() => {
          const c = CHARSET[(cur + k) % N];
          at.current = c;
          setChar(c);
          setTick((t) => t + 1);
        }, delay + k * STEP),
      );
    }
    return () => timers.forEach(clearTimeout);
  }, [target, delay, live]);

  return (
    <span className={s.flap}>
      <span className={s.ch} key={tick}>
        {char === " " ? " " : char}
      </span>
      <span className={s.hinge} aria-hidden="true" />
    </span>
  );
}

export default function FlipBoard({ className }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { amount: 0.3 });
  const [frame, setFrame] = useState(0);
  const live = inView && !reduced;

  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => setFrame((f) => (f + 1) % FRAMES.length), HOLD);
    return () => clearInterval(id);
  }, [live]);

  const lines = FRAMES[frame];

  return (
    <div className={`${s.board} ${className || ""}`} ref={ref}>
      <div className={s.rail} aria-hidden="true">
        <span className={s.bulb} />
        <span className={s.label}>On the board</span>
        <span className={s.bulb} />
      </div>

      <div className={s.face} role="img" aria-label={`The board reads: ${lines.join(". ")}`}>
        {lines.map((line, r) => (
          <div className={s.line} key={r}>
            {pad(line).map((c, i) => (
              <Flap key={i} target={c} delay={i * 18 + r * 70} live={live} />
            ))}
          </div>
        ))}
      </div>

      <div className={s.feet} aria-hidden="true">
        {FRAMES.map((_, i) => (
          <span key={i} className={i === frame ? s.onDot : s.dot} />
        ))}
      </div>
    </div>
  );
}
