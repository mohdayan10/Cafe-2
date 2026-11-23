"use client";

import { motion } from "framer-motion";

const EASE = [0.19, 1, 0.22, 1];

export default function Reveal({ children, delay = 0, y = 34, as = "div", className, style }) {
  const M = motion[as] || motion.div;
  return (
    <M
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.95, delay, ease: EASE }}
    >
      {children}
    </M>
  );
}
