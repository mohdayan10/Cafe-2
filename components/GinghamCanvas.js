"use client";

import { useEffect, useRef } from "react";

/**
 * The house pattern, drawn rather than photographed: a woven gingham
 * cloth whose threads breathe, ripple away from the pointer, and
 * catch gold light at the crossings.
 */
export default function GinghamCanvas({ className }) {
  const ref = useRef(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let w = 0, h = 0, cols = 0, rows = 0, cell = 0, raf = 0, t = 0;
    const pointer = { x: -9999, y: -9999, vx: 0, vy: 0 };

    const resize = () => {
      const r = cv.getBoundingClientRect();
      w = Math.max(1, Math.round(r.width));
      h = Math.max(1, Math.round(r.height));
      cv.width = w * dpr;
      cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cell = Math.max(34, Math.round(Math.min(w, h) / 13));
      cols = Math.ceil(w / cell) + 1;
      rows = Math.ceil(h / cell) + 1;
    };

    const onMove = (e) => {
      const r = cv.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
    };
    const onLeave = () => { pointer.x = -9999; pointer.y = -9999; };

    const draw = () => {
      t += reduced ? 0 : 0.0065;
      ctx.clearRect(0, 0, w, h);

      // linen ground
      ctx.fillStyle = "#FFFDF8";
      ctx.fillRect(0, 0, w, h);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * cell;
          const y = r * cell;

          // woven value: 0 = white gap, 1 = full red thread crossing
          const stripe = ((c % 2) + (r % 2)) / 2; // 0, .5, 1
          const wave = Math.sin(t * 1.6 + (c + r) * 0.38) * 0.5 + 0.5;

          const dx = x + cell / 2 - pointer.x;
          const dy = y + cell / 2 - pointer.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const lift = Math.max(0, 1 - dist / (cell * 5.2));

          // three tones, like a real woven check: gap, single thread, crossing
          const base = stripe === 0 ? 0.03 : stripe === 0.5 ? 0.52 : 1;
          const alpha = Math.min(1, base + wave * 0.06 + lift * 0.14);
          const inset = lift * cell * 0.16 + (1 - wave) * 0.5;
          const size = cell - inset * 2;

          ctx.fillStyle = `rgba(${Math.round(222 - stripe * 46)}, ${Math.round(42 - stripe * 20)}, ${Math.round(48 - stripe * 22)}, ${alpha})`;
          ctx.fillRect(x + inset, y + inset, size, size);

          // gold glint where the threads cross, strongest near the pointer
          if (stripe === 1 && lift > 0.25) {
            ctx.fillStyle = `rgba(232, 196, 116, ${lift * 0.55})`;
            ctx.fillRect(x + cell * 0.36, y + cell * 0.36, cell * 0.28, cell * 0.28);
          }
        }
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);

    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(draw);
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
