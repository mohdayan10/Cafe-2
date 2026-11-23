"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import s from "./Preloader.module.css";

const COLS = 10;
const ROWS = 10;
const TILES = Array.from({ length: COLS * ROWS }, (_, i) => i);

export default function Preloader() {
  const [done, setDone] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const r = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(r);
    document.body.classList.add("is-locked");
    const t = setTimeout(() => setDone(true), r ? 100 : 2150);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => document.body.classList.remove("is-locked"), 700);
    return () => clearTimeout(t);
  }, [done]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className={s.loader}
          aria-hidden="true"
          exit={{ y: "-101%" }}
          transition={{ duration: reduced ? 0 : 1, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className={s.tiles}>
            {TILES.map((i) => {
              const r = Math.floor(i / COLS);
              const c = i % COLS;
              return (
                <motion.i
                  key={i}
                  style={{ opacity: (r + c) % 2 === 0 ? 1 : 0.28 }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    duration: reduced ? 0 : 0.5,
                    delay: reduced ? 0 : (r + c) * 0.026,
                    ease: [0.19, 1, 0.22, 1],
                  }}
                />
              );
            })}
          </div>

          <motion.div
            className={`${s.mark} script`}
            initial={{ opacity: 0, y: 26, rotate: -6 }}
            animate={{ opacity: 1, y: 0, rotate: -3 }}
            transition={{ duration: reduced ? 0 : 0.9, delay: reduced ? 0 : 0.6, ease: [0.19, 1, 0.22, 1] }}
          >
            oro
          </motion.div>

          <motion.span
            className={s.sub}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduced ? 0 : 1.15, duration: 0.6 }}
          >
            Espresso · Kitchen · Pasticceria
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
