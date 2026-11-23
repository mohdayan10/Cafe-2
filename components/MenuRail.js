"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import SplitWords from "./SplitWords";
import s from "./MenuRail.module.css";

const CARDS = [
  {
    key: "burgers",
    tag: "01 — Burgers",
    title: "Burgers",
    note: "Strictly no veg. Griddled to order, sauce doubled on request.",
    glyph: "burger",
    items: [
      ["The Pataka Lamb Burger", "₹425", "Juicy and somewhat tangy. Good."],
      ["Oro's Smash Chicken Burger", "₹425", "Smashed. Double the sauce or come hungry.", "House"],
      ["The Berlin Chicken Burger", "₹425", "Fried chicken, mango salsa, ranch — all in one bite."],
      ["The Vegan Burger", "₹395", "A plant patty that stays soft and creamy.", "Vegan"],
      ["Amritsari Fish Burger", "₹425", "Our house burger, only this time the fish gets centre stage."],
      ["Baja Avocado Burger", "₹425", "The salsa turns it up. The avocado turns it back down."],
    ],
  },
  {
    key: "mains",
    tag: "02 — Mains, rice & protein",
    title: "Mains",
    note: "Rice and protein, plated properly. Served hot off the pass.",
    glyph: "bowl",
    items: [
      ["Italian Wedding Risotto", "₹525", "Some ingredients shine. These ones get married.", "Veg"],
      ["\u201cMarry Me\u201d Lemon Butter Chicken", "₹525", "Good enough for a second date. Maybe even a proposal."],
      ["Stuffed Butter Chicken Marsala", "₹525", "Herb butter inside, Marsala around it, herb rice beneath."],
      ["Jerk Chicken with Coconut Curry Sauce", "₹495", "The jerk brings the fire. The coconut makes peace with it."],
      ["Golden Chicken Curry with Cilantro Rice", "₹525", "Mexico brings the warmth. The coconut brings it home."],
      ["Exotic Vegetable Stew with Herb Rice", "₹525", "Fresh herbs in the stew, dried herbs in the rice.", "Veg"],
    ],
  },
  {
    key: "pasta",
    tag: "03 — Pasta",
    title: "Pasta",
    note: "Rolled and filled in-house. Sauces built slow, then finished fast.",
    glyph: "pasta",
    items: [
      ["Ravioli & Piola Pink Sauce", "₹525", "The one dish where breaking it open makes it better.", "Mushroom"],
      ["Fettuccine Lamb Bolognese", "₹525", "Slow-cooked lamb until it clings to every ribbon."],
      ["Gnocchi with Makhni Gravy", "₹525", "Two sauces. Three ways to eat it. You decide."],
      ["Brown Butter Penne", "₹425", "The ultimate comfort meal."],
    ],
  },
  {
    key: "pizzas",
    tag: "04 — Pizzas",
    title: "Pizzas",
    note: "Stretched thin, out of the oven and onto the board.",
    glyph: "pizza",
    items: [
      ["Pesto Primavera Veg", "₹525", "Fresh, herby, creamy. Goes faster than expected.", "Veg"],
      ["Bhuna Nights Chicken", "₹395", "A little smoky, a little buttery, a little sweet."],
      ["Spiced Lamb Kheema", "₹525", "Spiced, crisp and just lively enough."],
    ],
  },
  {
    key: "desserts",
    tag: "05 — Desserts",
    title: "Desserts",
    note: "Made in the morning, finished when you order. Worth the wait.",
    glyph: "cornetto",
    tone: "gold",
    items: [
      ["Saffron Br\u00fbl\u00e9e", "₹395", "Give it a good tap. We made the top for you to break."],
      ["Oro's Churros", "₹425", "Souvenirs you can eat are the best kind.", "House"],
      ["Fluffy Blueberry Pancakes", "₹395", "The pancake keeps it soft. The blueberries keep it interesting."],
    ],
  },
];

function Glyph({ name }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" };
  if (name === "cup") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M10 18h26l-3 20a6 6 0 0 1-6 5H19a6 6 0 0 1-6-5z" {...common} />
        <path d="M36 22c6 0 8 3 8 7s-3 7-7 7" {...common} />
        <path d="M18 10c-2 3-1 5 0 7M26 8c-2 3-1 5 0 7" {...common} />
      </svg>
    );
  }
  if (name === "pasta") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M6 30c0-9 8-16 18-16s18 7 18 16" {...common} />
        <path d="M6 30h36a18 18 0 0 1-36 0z" {...common} />
        <path d="M16 22c3-3 6-3 9 0s6 3 9 0" {...common} />
      </svg>
    );
  }
  if (name === "bowl") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M5 23h38c0 10-8 17-19 17S5 33 5 23z" {...common} />
        <path d="M2 23h44" {...common} />
        <path d="M19 9c-2 3-1 5 0 7M28 7c-2 3-1 5 0 7" {...common} />
      </svg>
    );
  }
  if (name === "burger") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M7 19c0-6 7-11 17-11s17 5 17 11z" {...common} />
        <path d="M7 24h34M9 29h30" {...common} />
        <path d="M7 33h34c0 5-5 7-11 7H18c-6 0-11-2-11-7z" {...common} />
      </svg>
    );
  }
  if (name === "pizza") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M24 5 43 41c-12 5-26 5-38 0z" {...common} />
        <path d="M13 32h22" {...common} />
        <circle cx="24" cy="20" r="2" {...common} />
        <circle cx="19" cy="30" r="2" {...common} />
        <circle cx="30" cy="31" r="2" {...common} />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M5 32c6-14 16-20 24-20s14 4 14 10-6 10-14 10c-10 0-18-2-24 0z" {...common} />
      <path d="M17 18c2 5 2 10 0 14M27 15c2 6 2 12 0 17" {...common} />
    </svg>
  );
}

export default function MenuRail() {
  const wrapRef = useRef(null);
  const railRef = useRef(null);
  const [distance, setDistance] = useState(0);
  const [pinned, setPinned] = useState(false);

  useLayoutEffect(() => {
    const measure = () => {
      const wide = window.matchMedia("(min-width: 901px)").matches;
      setPinned(wide);
      const rail = railRef.current;
      if (!rail || !wide) { setDistance(0); return; }
      setDistance(Math.max(0, rail.scrollWidth - window.innerWidth + 64));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });
  const raw = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const x = useSpring(raw, { stiffness: 120, damping: 30, mass: 0.4 });

  return (
    <section
      className={s.menu}
      id="menu"
      ref={wrapRef}
      style={pinned ? { height: `calc(100vh + ${distance * 1.7}px)` } : undefined}
    >
      <div className={pinned ? s.sticky : s.flow}>
        <div className={`wrap ${s.head}`}>
          <div>
            <p className="eyebrow">Served all day</p>
            <SplitWords className={s.title} text="The Menu" />
          </div>
          <p className={s.hint}>
            {pinned ? "Keep scrolling — the menu moves sideways" : "Swipe through the five counters"}
          </p>
        </div>

        <motion.div className={s.rail} ref={railRef} style={pinned ? { x } : undefined}>
          {CARDS.map((card, i) => (
            <article className={`${s.card} ${card.tone === "gold" ? s.gold : ""}`} key={card.key}>
              <header>
                <span className={s.tag}>{card.tag}</span>
                <div className={s.glyph}><Glyph name={card.glyph} /></div>
                <h3>{card.title}</h3>
                <p className={s.note}>{card.note}</p>
              </header>
              <ul>
                {card.items.map(([name, price, desc, flag]) => (
                  <li key={name}>
                    <div className={s.row}>
                      <h4>
                        {name}
                        {flag && <em>{flag}</em>}
                      </h4>
                      <span className={s.dots} aria-hidden="true" />
                      <span className={s.price}>{price}</span>
                    </div>
                    <p>{desc}</p>
                  </li>
                ))}
              </ul>
              <span className={s.index}>{String(i + 1).padStart(2, "0")}</span>
            </article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
