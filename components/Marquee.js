"use client";

import { useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  wrap,
} from "framer-motion";
import s from "./Marquee.module.css";

const WORDS = [
  "Espresso",
  "Cornetti",
  "Maritozzo",
  "Gelato",
  "Focaccia",
  "Tiramisù",
  "Cold Brew",
  "Torta della Nonna",
];

/** A ribbon that runs on its own, then speeds up and flips with your scroll. */
export default function Marquee({ baseVelocity = -3 }) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smooth = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const factor = useTransform(smooth, [0, 1000], [0, 4], { clamp: false });
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);
  const dir = useRef(1);

  useAnimationFrame((t, delta) => {
    let move = dir.current * baseVelocity * (delta / 1000);
    if (factor.get() < 0) dir.current = -1;
    else if (factor.get() > 0) dir.current = 1;
    move += dir.current * move * factor.get();
    baseX.set(baseX.get() + move);
  });

  const row = WORDS.map((w, i) => (
    <b key={i}>
      {w}
      <i />
    </b>
  ));

  return (
    <div className={s.marq} aria-hidden="true">
      <motion.div className={s.track} style={{ x }}>
        {row}
        {row}
        {row}
        {row}
      </motion.div>
    </div>
  );
}
