"use client";

import Reveal from "./Reveal";
import SplitWords from "./SplitWords";
import Counter from "./Counter";
import Brewhead from "./Brewhead";
import s from "./House.module.css";

const STATS = [
  [9, "Metre long table"],
  [18, "Pastries baked daily"],
  [92, "Seats, two floors"],
];

export default function House() {
  return (
    <section className={`band ${s.house}`} id="house">
      <div className={`wrap ${s.grid}`}>
        <Reveal className={s.art}>
          <Brewhead />
        </Reveal>

        <div className={s.text}>
          <Reveal><p className="eyebrow">Nine bars, ninety-two degrees</p></Reveal>
          <SplitWords className={s.head} text="The gold is in the crema." />
          <Reveal delay={0.1}><div className="rule" /></Reveal>
          <Reveal delay={0.15}>
            <p className="lede">
              Oro means gold. The house was built around that one idea: cove light that never goes
              blue, brass on the door handles, and a red gingham skin pulled tight over plaster
              cornices. Downstairs is the espresso bar and the long table. Upstairs, past the crimson
              staircase, is quieter — for long lunches and slower afternoons.
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <div className={s.stats}>
              {STATS.map(([n, label]) => (
                <div key={label} className={s.stat}>
                  <Counter to={n} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
