"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import SplitWords from "./SplitWords";
import Reveal from "./Reveal";
import s from "./LongTable.module.css";

const COLS = 16;
const ROWS = 6;
const TILES = Array.from({ length: COLS * ROWS }, (_, i) => i);
const EASE = [0.19, 1, 0.22, 1];

/** The nine-metre checkerboard, laid square by square as you arrive. */
export default function LongTable() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  const skew = useTransform(scrollYProgress, [0, 0.5, 1], [-2.5, 0, 2.5]);

  return (
    <section className={s.table} id="table" ref={ref}>
      <motion.div className={s.board} style={{ x, skewY: skew }} aria-hidden="true">
        {TILES.map((i) => {
          const r = Math.floor(i / COLS);
          const c = i % COLS;
          const dark = (r + c) % 2 === 0;
          return (
            <motion.span
              key={i}
              className={dark ? s.dark : s.lite}
              initial={{ opacity: 0, rotateX: 70, y: 26 }}
              whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -8% 0px" }}
              transition={{ duration: 0.75, delay: (c * 0.028) + (r * 0.05), ease: EASE }}
            />
          );
        })}
      </motion.div>

      <div className={`wrap ${s.copy}`}>
        <Reveal><p className="eyebrow">Nine metres, one table</p></Reveal>
        <SplitWords className={s.head} text="Sit with strangers." />
        <Reveal delay={0.1}>
          <p className={s.lede}>
            The long checkerboard runs the length of the room — oak, cream tile and burgundy squares,
            polished every night. No reservations on it before noon. Take a square and stay.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
