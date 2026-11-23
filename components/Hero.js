"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import GinghamCanvas from "./GinghamCanvas";
import Cup from "./Cup";
import Magnetic from "./Magnetic";
import s from "./Hero.module.css";

const LETTERS = ["o", "r", "o"];
const EASE = [0.19, 1, 0.22, 1];

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const clothY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const wordY = useTransform(scrollYProgress, [0, 1], ["0%", "-38%"]);
  const fade = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  return (
    <section className={s.hero} ref={ref} id="hero">
      <motion.div className={s.cloth} style={{ y: clothY }}>
        <GinghamCanvas className={s.canvas} />
        <div className={s.vignette} />
      </motion.div>

      <motion.div className={s.inner} style={{ y: wordY, opacity: fade }}>
        <div className="wrap">
          <p className={s.kicker}>
            {"Est. on the corner · Open daily".split("").map((ch, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 + i * 0.012, duration: 0.5 }}
              >
                {ch === " " ? " " : ch}
              </motion.span>
            ))}
          </p>

          <h1 className={`script ${s.word}`} aria-label="oro">
            {LETTERS.map((l, i) => (
              <motion.span
                key={i}
                initial={{ y: "48%", opacity: 0, rotate: 7 }}
                animate={{ y: "0%", opacity: 1, rotate: 0 }}
                transition={{ delay: 2.25 + i * 0.11, duration: 1.1, ease: EASE }}
              >
                {l}
              </motion.span>
            ))}
            <Cup className={s.cup} delay={3.1} />
          </h1>

          <div className={s.row}>
            <motion.p
              className={s.tag}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.8, duration: 0.9, ease: EASE }}
            >
              Coffee, pastry and gold light, served inside a picnic cloth.
            </motion.p>

            <motion.div
              className={s.cta}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.95, duration: 0.9, ease: EASE }}
            >
              <Magnetic><a href="#menu" className="btn">See the menu <i className="dot" /></a></Magnetic>
              <Magnetic><a href="#book" className="btn btn--solid">Reserve <i className="dot" /></a></Magnetic>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className={s.cue}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.4, duration: 0.8 }}
        aria-hidden="true"
      >
        <span />
      </motion.div>
    </section>
  );
}
