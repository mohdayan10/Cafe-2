"use client";

import { useEffect, useRef } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import SplitWords from "./SplitWords";
import Reveal from "./Reveal";
import s from "./LatteArt.module.css";

/* ──────────────────────────────────────────────────────────────
   Milk poured into espresso, solved properly.

   A 2D incompressible fluid on a 128² grid — Jos Stam's stable
   solver: semi-Lagrangian advection, then a Gauss-Seidel pressure
   projection to keep the velocity field divergence-free. Viscosity
   and dye diffusion are left at zero; the numerical diffusion in
   the advection step is what makes milk feather the way it does.

   Drag on the cup to pour. Left alone, it pours a rosetta.
   ────────────────────────────────────────────────────────────── */

const N = 128;
const W = N + 2;
const SIZE = W * W;
const ITER = 18;
const DT = 0.12;
const DISSIPATE = 0.9995;
const DAMP = 0.968;

const ix = (i, j) => i + W * j;

/* espresso → crema → milk */
const RAMP = [
  [0.0, [32, 15, 6]],
  [0.22, [78, 38, 14]],
  [0.42, [158, 104, 36]],
  [0.62, [222, 190, 128]],
  [0.85, [248, 238, 220]],
  [1.0, [253, 249, 240]],
];

function buildLUT() {
  const lut = new Uint8ClampedArray(256 * 3);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    let a = RAMP[0];
    let b = RAMP[RAMP.length - 1];
    for (let k = 0; k < RAMP.length - 1; k++) {
      if (t >= RAMP[k][0] && t <= RAMP[k + 1][0]) {
        a = RAMP[k];
        b = RAMP[k + 1];
        break;
      }
    }
    const f = b[0] === a[0] ? 0 : (t - a[0]) / (b[0] - a[0]);
    lut[i * 3] = a[1][0] + (b[1][0] - a[1][0]) * f;
    lut[i * 3 + 1] = a[1][1] + (b[1][1] - a[1][1]) * f;
    lut[i * 3 + 2] = a[1][2] + (b[1][2] - a[1][2]) * f;
  }
  return lut;
}
const LUT = buildLUT();

/* b: 0 scalar, 1 horizontal velocity, 2 vertical velocity */
function setBnd(b, x) {
  for (let i = 1; i <= N; i++) {
    x[ix(0, i)] = b === 1 ? -x[ix(1, i)] : x[ix(1, i)];
    x[ix(N + 1, i)] = b === 1 ? -x[ix(N, i)] : x[ix(N, i)];
    x[ix(i, 0)] = b === 2 ? -x[ix(i, 1)] : x[ix(i, 1)];
    x[ix(i, N + 1)] = b === 2 ? -x[ix(i, N)] : x[ix(i, N)];
  }
  x[ix(0, 0)] = 0.5 * (x[ix(1, 0)] + x[ix(0, 1)]);
  x[ix(0, N + 1)] = 0.5 * (x[ix(1, N + 1)] + x[ix(0, N)]);
  x[ix(N + 1, 0)] = 0.5 * (x[ix(N, 0)] + x[ix(N + 1, 1)]);
  x[ix(N + 1, N + 1)] = 0.5 * (x[ix(N, N + 1)] + x[ix(N + 1, N)]);
}

function project(u, v, p, div) {
  const h = 1.0 / N;
  for (let j = 1; j <= N; j++) {
    for (let i = 1; i <= N; i++) {
      div[ix(i, j)] =
        -0.5 * h * (u[ix(i + 1, j)] - u[ix(i - 1, j)] + v[ix(i, j + 1)] - v[ix(i, j - 1)]);
      p[ix(i, j)] = 0;
    }
  }
  setBnd(0, div);
  setBnd(0, p);

  for (let k = 0; k < ITER; k++) {
    for (let j = 1; j <= N; j++) {
      for (let i = 1; i <= N; i++) {
        p[ix(i, j)] =
          (div[ix(i, j)] +
            p[ix(i - 1, j)] +
            p[ix(i + 1, j)] +
            p[ix(i, j - 1)] +
            p[ix(i, j + 1)]) /
          4;
      }
    }
    setBnd(0, p);
  }

  for (let j = 1; j <= N; j++) {
    for (let i = 1; i <= N; i++) {
      u[ix(i, j)] -= (0.5 * (p[ix(i + 1, j)] - p[ix(i - 1, j)])) / h;
      v[ix(i, j)] -= (0.5 * (p[ix(i, j + 1)] - p[ix(i, j - 1)])) / h;
    }
  }
  setBnd(1, u);
  setBnd(2, v);
}

function advect(b, d, d0, u, v, dt) {
  const dt0 = dt * N;
  for (let j = 1; j <= N; j++) {
    for (let i = 1; i <= N; i++) {
      let x = i - dt0 * u[ix(i, j)];
      let y = j - dt0 * v[ix(i, j)];
      if (x < 0.5) x = 0.5;
      if (x > N + 0.5) x = N + 0.5;
      if (y < 0.5) y = 0.5;
      if (y > N + 0.5) y = N + 0.5;
      const i0 = x | 0;
      const i1 = i0 + 1;
      const j0 = y | 0;
      const j1 = j0 + 1;
      const s1 = x - i0;
      const s0 = 1 - s1;
      const t1 = y - j0;
      const t0 = 1 - t1;
      d[ix(i, j)] =
        s0 * (t0 * d0[ix(i0, j0)] + t1 * d0[ix(i0, j1)]) +
        s1 * (t0 * d0[ix(i1, j0)] + t1 * d0[ix(i1, j1)]);
    }
  }
  setBnd(b, d);
}

export default function LatteArt() {
  const hostRef = useRef(null);
  const canvasRef = useRef(null);
  const inView = useInView(hostRef, { amount: 0.25 });
  const reduced = useReducedMotion();
  const liveRef = useRef(false);
  liveRef.current = inView;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const u = new Float32Array(SIZE);
    const v = new Float32Array(SIZE);
    const u0 = new Float32Array(SIZE);
    const v0 = new Float32Array(SIZE);
    const dens = new Float32Array(SIZE);
    const dens0 = new Float32Array(SIZE);
    const p = new Float32Array(SIZE);
    const div = new Float32Array(SIZE);

    // a touch of crema in the cup to begin with
    for (let j = 1; j <= N; j++) {
      for (let i = 1; i <= N; i++) {
        const dx = (i - N / 2) / (N / 2);
        const dy = (j - N / 2) / (N / 2);
        const r = Math.sqrt(dx * dx + dy * dy);
        dens[ix(i, j)] = 0.1 + 0.05 * Math.sin(i * 0.21) * Math.cos(j * 0.17) + 0.07 * r * r;
      }
    }

    const img = ctx.createImageData(N, N);
    const data = img.data;
    for (let k = 3; k < data.length; k += 4) data[k] = 255;

    /* Splat milk into the grid. `push` shoves the surrounding liquid
       radially outward — a fresh pulse of milk displacing whatever is
       already floating there, which is what nests the crescents. */
    const splat = (gx, gy, dx, dy, amount, radius, push = 0) => {
      const r2 = radius * radius;
      const i0 = Math.max(1, Math.floor(gx - radius));
      const i1 = Math.min(N, Math.ceil(gx + radius));
      const j0 = Math.max(1, Math.floor(gy - radius));
      const j1 = Math.min(N, Math.ceil(gy + radius));
      for (let j = j0; j <= j1; j++) {
        for (let i = i0; i <= i1; i++) {
          const ox = i - gx;
          const oy = j - gy;
          const d2 = ox * ox + oy * oy;
          if (d2 > r2) continue;
          const f = Math.exp(-d2 / (r2 * 0.62));
          const k = ix(i, j);
          dens[k] += amount * f;
          u[k] += dx * f;
          v[k] += dy * f;
          if (push) {
            const d = Math.sqrt(d2) || 1;
            u[k] += (ox / d) * push * f;
            v[k] += (oy / d) * push * f;
          }
        }
      }
    };

    /* ── the scripted pour ──────────────────────────────────────
       A rosetta is not one continuous stream. The pitcher drops a
       pulse of milk, rocks to the other side, drops another — each
       one pushing the last crescent back. That stacking is what
       makes the leaves. Then you raise the pitcher and pull a thin
       stem straight through the middle to draw the tips in. */
    const PULSES = 15;
    const GAP = 9;        // frames between pulses
    const SETTLE = 26;    // beat before the stem
    const STEM = 46;
    const POUR_FRAMES = PULSES * GAP + SETTLE + STEM;
    let pour = 0;
    let pouring = true;

    const autoPour = () => {
      if (!pouring) return;
      const f = pour;

      if (f < PULSES * GAP) {
        if (f % GAP === 0) {
          const k = f / GAP;
          const side = k % 2 === 0 ? 1 : -1;
          const decay = 1 - k * 0.028;          // leaves narrow as it fills
          const gx = (0.5 + 0.165 * side * decay) * N;
          const gy = (0.33 + k * 0.026) * N;
          splat(gx, gy, side * 0.35, 0.45, 1.9, 9.5, 2.4);
        }
      } else if (f < PULSES * GAP + SETTLE) {
        // let the crescents relax into each other
      } else if (f < POUR_FRAMES) {
        const k = (f - PULSES * GAP - SETTLE) / STEM;
        const gy = (0.88 - 0.72 * k) * N;
        splat(0.5 * N, gy, 0, -6.5, 1.15, 4.4, 0.5);
      } else {
        pouring = false;
      }
      pour++;
    };

    /* ── pointer pouring ── */
    let px = null;
    let py = null;
    const toGrid = (e) => {
      const r = canvas.getBoundingClientRect();
      return [((e.clientX - r.left) / r.width) * N, ((e.clientY - r.top) / r.height) * N];
    };
    const onMove = (e) => {
      const [gx, gy] = toGrid(e);
      const dx2 = (gx - 0.5 * N) ** 2 + (gy - 0.5 * N) ** 2;
      if (dx2 > (0.5 * N) ** 2) {
        px = py = null;
        return;
      }
      if (px !== null) {
        pouring = false;
        splat(gx, gy, (gx - px) * 1.6, (gy - py) * 1.6, 0.3, 6);
      }
      px = gx;
      py = gy;
    };
    const onLeave = () => {
      px = py = null;
    };
    canvas.addEventListener("pointermove", onMove, { passive: true });
    canvas.addEventListener("pointerleave", onLeave, { passive: true });
    canvas.addEventListener("pointerdown", onMove, { passive: true });

    const step = () => {
      autoPour();

      // velocity: advect through itself, then make it divergence-free
      u0.set(u);
      v0.set(v);
      advect(1, u, u0, u0, v0, DT);
      advect(2, v, v0, u0, v0, DT);
      project(u, v, p, div);

      // dye rides the velocity field
      dens0.set(dens);
      advect(0, dens, dens0, u, v, DT);

      for (let k = 0; k < SIZE; k++) {
        dens[k] *= DISSIPATE;
        u[k] *= DAMP;
        v[k] *= DAMP;
      }
    };

    const draw = () => {
      let o = 0;
      for (let j = 1; j <= N; j++) {
        for (let i = 1; i <= N; i++) {
          let d = dens[ix(i, j)];
          if (d > 1) d = 1;
          const c = (d * 255) | 0;
          data[o] = LUT[c * 3];
          data[o + 1] = LUT[c * 3 + 1];
          data[o + 2] = LUT[c * 3 + 2];
          o += 4;
        }
      }
      ctx.putImageData(img, 0, 0);
    };

    let raf;
    const loop = () => {
      if (liveRef.current) {
        step();
        draw();
      }
      raf = requestAnimationFrame(loop);
    };

    if (reduced) {
      // no animation: solve the pour once, show the finished cup
      for (let f = 0; f < POUR_FRAMES + 60; f++) step();
      draw();
    } else {
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointerdown", onMove);
    };
  }, [reduced]);

  return (
    <section className={s.pour} id="pour" ref={hostRef}>
      <div className={`wrap ${s.inner}`}>
        <Reveal><p className={`eyebrow ${s.eyebrow}`}>Free pour, no stencils</p></Reveal>
        <SplitWords className={s.head} text="Drag the milk." />

        <div className={s.cup}>
          <div className={s.saucer} aria-hidden="true" />
          <canvas
            ref={canvasRef}
            width={N}
            height={N}
            className={s.canvas}
            aria-label="A cup of espresso; drag to pour milk into it"
            role="img"
          />
          <div className={s.rim} aria-hidden="true" />
        </div>

        <Reveal delay={0.1}>
          <p className={s.hint}>
            Incompressible fluid, solved every frame — the milk goes where the espresso lets it
          </p>
        </Reveal>
      </div>
    </section>
  );
}
