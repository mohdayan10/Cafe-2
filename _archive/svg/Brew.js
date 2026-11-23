"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import s from "./Brew.module.css";

/* ──────────────────────────────────────────────────────────────
   One pinned sequence, five scenes.

   If photographs exist at /brew/01..05.jpg the section plays them
   as a scroll-scrubbed cross-fade. If they don't, it falls back to
   a particle field in which the same ~1600 points become the bean,
   the grounds, the bloom, the pour and the rosetta in turn —
   nothing cuts, every scene is a morph of the one before it.
   ────────────────────────────────────────────────────────────── */

const SCENES = [
  { n: "01", title: "Wake the beans.", note: "Single origin, roasted on Tuesday, rested three days.", img: "/brew/01.jpg" },
  { n: "02", title: "Grind to order.", note: "Nothing is ground before you ask for it.", img: "/brew/02.jpg" },
  // 03–05 are written and ready to switch on the moment their photographs
  // land in /public/brew — see that folder's README. Listing a scene whose
  // image is missing would render a broken frame, so they stay out until then.
  // { n: "03", title: "Let it bloom.", note: "Thirty seconds of patience while the gas leaves.", img: "/brew/03.jpg" },
  // { n: "04", title: "Pull it short.", note: "Twenty-seven seconds, and not a second longer.", img: "/brew/04.jpg" },
  // { n: "05", title: "Make the time taste better.", note: "Poured free-hand at the counter. Sit anywhere.", img: "/brew/05.jpg" },
];

const LAST = SCENES.length - 1;
const STEP = 1 / LAST;
const COUNT = 1600;
const BUCKETS = 14;
const PHI = 2.39996323;

const hash = (i) => {
  const x = Math.sin(i * 127.1 + 0.37) * 43758.5453;
  return x - Math.floor(x);
};
const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (t) => t * t * (3 - 2 * t);

const PALETTE = [
  [[74, 43, 24], [120, 72, 36]],
  [[90, 47, 22], [150, 95, 44]],
  [[122, 69, 32], [214, 160, 86]],
  [[80, 40, 18], [190, 120, 54]],
  [[236, 220, 192], [142, 86, 40]],
];

/* ── targets, in stage units ────────────────────────────────── */

function beanTarget(i, n, out) {
  const r = Math.sqrt((i + 0.5) / n);
  const a = i * PHI;
  let x = 0.25 * r * Math.cos(a);
  const y = 0.33 * r * Math.sin(a);
  const edge = 1 - Math.abs(y) / 0.33;
  x += Math.sign(x || 1) * 0.03 * edge * edge;
  out[0] = x * 0.97 - y * 0.12;
  out[1] = y * 0.97 + x * 0.12;
}

function grindTarget(i, n, out) {
  const u = (i + 0.5) / n;
  const w = 0.2 * Math.pow(1 - u, 1.7) + 0.014;
  out[0] = w * (hash(i) * 2 - 1);
  out[1] = -0.44 + u * 0.82;
}

function bloomTarget(i, n, out) {
  const r = Math.sqrt((i + 0.5) / n);
  const a = i * PHI;
  const rr = 0.3 * r;
  out[0] = rr * Math.cos(a);
  out[1] = rr * Math.sin(a) * 0.4 - 0.1 * (1 - r * r) + 0.02;
}

function streamTarget(i, n, out) {
  const u = (i + 0.5) / n;
  const a = u * Math.PI * 6.5;
  out[0] = 0.15 * Math.sin(a) * (0.3 + 0.7 * u);
  out[1] = -0.46 + u * 0.92;
}

function rosettaTarget(i, n, out) {
  const stemN = Math.floor(n * 0.1);
  if (i < stemN) {
    out[0] = (hash(i) - 0.5) * 0.012;
    out[1] = -0.3 + (i / stemN) * 0.62;
    return;
  }
  const j = i - stemN;
  const m = n - stemN;
  const LEAVES = 13;
  const k = Math.floor((j / m) * LEAVES);
  const v = ((j / m) * LEAVES) % 1;
  const span = 0.235 * (1 - k / (LEAVES + 3));
  const a = (v - 0.5) * Math.PI * 0.92;
  out[0] = Math.sin(a) * span;
  out[1] = -0.27 + k * 0.045 + (1 - Math.cos(a)) * 0.07;
}

const TARGETS = [beanTarget, grindTarget, bloomTarget, streamTarget, rosettaTarget];
const SIZES = [2.9, 1.25, 1.7, 1.5, 2.0];

/* one photo layer, scrubbed by scroll */
function Photo({ scene, index, progress }) {
  const at = index * STEP;
  const opacity = useTransform(progress, [at - STEP, at, at + STEP], [0, 1, 0]);
  const scale = useTransform(progress, [at - STEP, at, at + STEP], [1.1, 1, 0.94]);
  return (
    <motion.img
      src={scene.img}
      alt=""
      className={s.photo}
      style={{ opacity, scale }}
      draggable={false}
    />
  );
}

export default function Brew() {
  const wrapRef = useRef(null);
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const reduced = useReducedMotion();
  const sceneRef = useRef(0);
  const [scene, setScene] = useState(0);
  const [photos, setPhotos] = useState(null); // null = still checking

  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start start", "end end"] });

  /* are the photographs in place? */
  useEffect(() => {
    const probe = new Image();
    probe.onload = () => setPhotos(true);
    probe.onerror = () => setPhotos(false);
    probe.src = SCENES[0].img;
  }, []);

  /* keep the live scroll position on a ref so the canvas can read it
     without re-rendering React every frame */
  useEffect(() => {
    const unsub = scrollYProgress.on("change", (v) => {
      sceneRef.current = clamp01(v) * LAST;
      const idx = Math.min(LAST, Math.round(sceneRef.current));
      setScene((cur) => (cur === idx ? cur : idx));
    });
    return () => unsub();
  }, [scrollYProgress]);

  useEffect(() => {
    if (photos !== false) return; // photographs win; don't burn frames
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = stage.getBoundingClientRect();
      w = Math.max(1, r.width);
      h = Math.max(1, r.height);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#FBF3E4";
      ctx.fillRect(0, 0, w, h);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(stage);

    const px = new Float32Array(COUNT);
    const py = new Float32Array(COUNT);
    const vx = new Float32Array(COUNT);
    const vy = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      px[i] = (hash(i) - 0.5) * 0.7;
      py[i] = (hash(i + 7777) - 0.5) * 0.7;
    }

    /* group particles by shade so each frame sets fillStyle 14 times
       instead of 1600 — this is the difference between 40fps and 60 */
    const groups = Array.from({ length: BUCKETS }, () => []);
    for (let i = 0; i < COUNT; i++) {
      groups[Math.min(BUCKETS - 1, Math.floor(hash(i + 99) * BUCKETS))].push(i);
    }
    const bucket = groups.map((g) => Int32Array.from(g));

    const a = [0, 0];
    const b = [0, 0];

    const frame = () => {
      const sf = sceneRef.current;
      const i0 = Math.min(LAST, Math.floor(sf));
      const i1 = Math.min(LAST, i0 + 1);
      const t = smooth(clamp01((sf - i0 - 0.22) / 0.56));

      /* keep the subject clear of the headline on wide screens */
      const wide = w > 900;
      const S = wide ? Math.min(w * 0.44, h * 0.82) : Math.min(w * 0.9, h * 0.52);
      const cx = wide ? w * 0.6 : w * 0.5;
      const cy = wide ? h * 0.5 : h * 0.58;

      /* repaint only the box the particles can occupy — clearing the
         whole canvas every frame was most of the frame budget */
      const pad = S * 0.62;
      ctx.fillStyle = "rgba(251, 243, 228, 0.3)";
      ctx.fillRect(cx - pad, cy - pad, pad * 2, pad * 2);

      const pa = PALETTE[i0];
      const pb = PALETTE[i1];
      const size = lerp(SIZES[i0], SIZES[i1], t) * (S / 620);
      const fa = TARGETS[i0];
      const fb = TARGETS[i1];

      for (let g = 0; g < BUCKETS; g++) {
        const hi = (g + 0.5) / BUCKETS;
        const r = Math.round(lerp(lerp(pa[0][0], pa[1][0], hi), lerp(pb[0][0], pb[1][0], hi), t));
        const gr = Math.round(lerp(lerp(pa[0][1], pa[1][1], hi), lerp(pb[0][1], pb[1][1], hi), t));
        const bl = Math.round(lerp(lerp(pa[0][2], pa[1][2], hi), lerp(pb[0][2], pb[1][2], hi), t));
        ctx.fillStyle = `rgb(${r},${gr},${bl})`;
        ctx.beginPath();

        const list = bucket[g];
        for (let q = 0; q < list.length; q++) {
          const i = list[q];
          fa(i, COUNT, a);
          fb(i, COUNT, b);
          const tx = lerp(a[0], b[0], t);
          const ty = lerp(a[1], b[1], t);
          const k = 0.052 + hash(i + 31) * 0.045;
          vx[i] = (vx[i] + (tx - px[i]) * k) * 0.855;
          vy[i] = (vy[i] + (ty - py[i]) * k) * 0.855;
          px[i] += vx[i];
          py[i] += vy[i];
          /* squares, not arcs: at two or three pixels they read the same
             and cost a fraction to tessellate */
          const sz = size * (0.62 + hi * 0.76);
          ctx.rect(cx + px[i] * S - sz, cy + py[i] * S - sz, sz * 2, sz * 2);
        }
        ctx.fill();
      }
    };

    let raf;
    const loop = () => {
      frame();
      raf = requestAnimationFrame(loop);
    };

    if (reduced) {
      sceneRef.current = LAST;
      for (let n = 0; n < 220; n++) frame();
    } else {
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [reduced, photos]);

  const railScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      className={s.brew}
      id="brew"
      ref={wrapRef}
      style={{ height: `${SCENES.length * 104}vh` }}
    >
      <div className={s.sticky} ref={stageRef}>
        {photos ? (
          <div className={s.photos} aria-hidden="true">
            {SCENES.map((sc, i) => (
              <Photo key={sc.n} scene={sc} index={i} progress={scrollYProgress} />
            ))}
          </div>
        ) : (
          <canvas ref={canvasRef} className={s.canvas} aria-hidden="true" />
        )}

        <div className={`wrap ${s.overlay}`}>
          <div className={s.left}>
            {SCENES.map((sc, i) => (
              <h2
                key={sc.n}
                className={`${s.title} ${i === scene ? s.on : ""}`}
                aria-hidden={i === scene ? undefined : true}
              >
                {sc.title}
              </h2>
            ))}
          </div>

          <div className={s.right}>
            <span className={s.num}>{SCENES[scene].n}</span>
            <span className={s.of}>/ {String(SCENES.length).padStart(2, "0")}</span>
            {SCENES.map((sc, i) => (
              <p
                key={sc.n}
                className={`${s.note} ${i === scene ? s.on : ""}`}
                aria-hidden={i === scene ? undefined : true}
              >
                {sc.note}
              </p>
            ))}
          </div>
        </div>

        <div className={s.rail} aria-hidden="true">
          <motion.span style={{ scaleY: railScale }} />
        </div>
      </div>
    </section>
  );
}
