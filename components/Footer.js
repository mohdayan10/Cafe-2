"use client";

import { motion } from "framer-motion";
import { SITE, ADDRESS, TEL_HREF } from "./site";
import s from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={s.foot}>
      <div className="wrap">
        <motion.div
          className={`script ${s.word}`}
          initial={{ y: "22%", opacity: 0 }}
          whileInView={{ y: "0%", opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
          aria-hidden="true"
        >
          oro
        </motion.div>
        <div className={s.cols}>
          <span>{ADDRESS}</span>
          <span>Open daily from 8:00</span>
          <a href={TEL_HREF}>{SITE.phone}</a>
          <span className={s.social}>
            <a href={SITE.instagram} target="_blank" rel="noreferrer noopener">Instagram</a>
            <a href={SITE.facebook} target="_blank" rel="noreferrer noopener">Facebook</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
