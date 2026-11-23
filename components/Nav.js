"use client";

import { useState } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useSpring } from "framer-motion";
import s from "./Nav.module.css";
import Magnetic from "./Magnetic";

const LINKS = [
  ["The House", "#house"],
  ["Menu", "#menu"],
  ["The Table", "#table"],
  ["Visit", "#visit"],
];

export default function Nav() {
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.3 });

  useMotionValueEvent(scrollY, "change", (y) => setStuck(y > 60));

  const cls = [s.nav, stuck ? s.stuck : ""].join(" ");

  return (
    <>
      <header className={cls}>
        <div className={`wrap ${s.inner}`}>
          <a href="#top" className={`script ${s.brand}`} aria-label="Oro House, home">
            oro
          </a>

          <nav className={s.links} aria-label="Main">
            {LINKS.map(([label, href]) => (
              <a key={href} href={href}>
                <span>{label}</span>
              </a>
            ))}
          </nav>

          <div className={s.right}>
            <Magnetic>
              <a href="#book" className={`btn ${s.cta}`}>
                Book a table <i className="dot" />
              </a>
            </Magnetic>
            <button
              className={s.burger}
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
            >
              <span style={{ transform: open ? "translateY(3.5px) rotate(45deg)" : "none" }} />
              <span style={{ transform: open ? "translateY(-3.5px) rotate(-45deg)" : "none" }} />
            </button>
          </div>
        </div>

        <motion.div className={s.progress} style={{ scaleX: progress }} aria-hidden="true" />
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className={s.sheet}
            initial={{ clipPath: "circle(0% at 92% 5%)" }}
            animate={{ clipPath: "circle(145% at 92% 5%)" }}
            exit={{ clipPath: "circle(0% at 92% 5%)" }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            onClick={() => setOpen(false)}
          >
            <ul>
              {[...LINKS, ["Book a table", "#book"]].map(([label, href], i) => (
                <motion.li
                  key={href}
                  initial={{ opacity: 0, y: 26 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.07, duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
                >
                  <a href={href}>{label}</a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
