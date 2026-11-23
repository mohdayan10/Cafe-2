"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const EASE = [0.19, 1, 0.22, 1];

/** Headline that lifts in word by word from behind its own baseline. */
export default function SplitWords({ text, className, delay = 0, as: Tag = "h2" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  const words = text.split(" ");

  return (
    <Tag className={className} ref={ref}>
      <span
        style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clipPath: "inset(50%)" }}
      >
        {text}
      </span>
      <span aria-hidden="true" style={{ display: "flex", flexWrap: "wrap", columnGap: "0.26em" }}>
        {words.map((w, i) => (
          <span key={i} style={{ display: "block", overflow: "hidden", paddingBottom: "0.1em" }}>
            <motion.span
              style={{ display: "block" }}
              initial={{ y: "110%" }}
              animate={inView ? { y: "0%" } : { y: "110%" }}
              transition={{ duration: 1, delay: delay + i * 0.06, ease: EASE }}
            >
              {w}
            </motion.span>
          </span>
        ))}
      </span>
    </Tag>
  );
}
