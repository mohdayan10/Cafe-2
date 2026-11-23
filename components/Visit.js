"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Reveal from "./Reveal";
import SplitWords from "./SplitWords";
import Magnetic from "./Magnetic";
import { HOURS, slotsFor, toISO, parseISO } from "./hours";
import { SITE, ADDRESS, MAPS_URL, TEL_HREF } from "./site";
import s from "./Visit.module.css";

/* Set NEXT_PUBLIC_BOOKING_ENDPOINT to a URL that accepts a JSON POST
   (a form service, a webhook, your own route handler). Without it the
   form hands the request to the guest's mail client instead — what it
   must never do is look sent while going nowhere. */
const ENDPOINT = process.env.NEXT_PUBLIC_BOOKING_ENDPOINT || "";

/* House rules the page already advertises, now actually enforced. */
const FIRST_FLOOR_FROM = "19:00";   // "the first floor is by reservation after 7pm"
const BIG_PARTY = 7;                // larger groups we'd rather arrange by phone
const BOOK_AHEAD_DAYS = 90;
const FLOORS = ["The long table", "Ground floor booth", "First floor"];

const digits = (s) => s.replace(/\D/g, "");

const mailtoFor = (f) => {
  const body = [
    `Name:   ${f.name}`,
    `Phone:  ${f.phone}`,
    `Date:   ${f.date}`,
    `Time:   ${f.time}`,
    `Guests: ${f.guests}`,
    `Where:  ${f.floor}`,
    f.note.trim() ? `Notes:  ${f.note.trim()}` : null,
  ].filter(Boolean).join("\n");
  return `mailto:${SITE.email}?subject=${encodeURIComponent(
    `Table request — ${f.name}, ${f.guests} on ${f.date}`,
  )}&body=${encodeURIComponent(body)}`;
};

function Copy({ value, label }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setDone(true);
      setTimeout(() => setDone(false), 1600);
    } catch {
      setDone(false);
    }
  };
  return (
    <button className={s.copy} onClick={copy} type="button">
      {done ? "Copied" : label}
    </button>
  );
}

export default function Visit() {
  const [today, setToday] = useState(-1);
  const [sent, setSent] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(null);
  const [form, setForm] = useState({
    name: "", phone: "", date: "", time: "13:00", guests: "2", floor: "The long table", note: "",
  });

  useEffect(() => {
    const d = new Date();
    setNow(d);
    setToday(d.getDay());
    setForm((f) => ({ ...f, date: toISO(d) }));
  }, []);

  /* Times come from the real opening hours for the chosen day, never a
     hardcoded list — so they can't offer a table before we open, after
     last seating, or at a time that has already passed today. */
  const slots = useMemo(
    () => (now && form.date ? slotsFor(form.date, now) : []),
    [form.date, now],
  );
  const firstFloorOk = form.time >= FIRST_FLOOR_FROM;
  const bigParty = form.guests === "7+" || Number(form.guests) >= BIG_PARTY;

  /* Keep the selection coherent when the date (and so the slots) change. */
  useEffect(() => {
    if (slots.length && !slots.includes(form.time)) {
      setForm((f) => ({ ...f, time: slots[0] }));
    }
  }, [slots, form.time]);

  useEffect(() => {
    if (!firstFloorOk && form.floor === "First floor") {
      setForm((f) => ({ ...f, floor: FLOORS[0] }));
    }
  }, [firstFloorOk, form.floor]);

  const minDate = now ? toISO(now) : undefined;
  const maxDate = now
    ? toISO(new Date(now.getFullYear(), now.getMonth(), now.getDate() + BOOK_AHEAD_DAYS))
    : undefined;

  const dayName = form.date && parseISO(form.date)
    ? HOURS[parseISO(form.date).getDay()][0]
    : "";

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Add a name so we know whose table it is.");
      return;
    }
    if (digits(form.phone).length < 7) {
      setError("That phone number looks incomplete — we need it to confirm.");
      return;
    }
    if (!slots.length) {
      setError(`We're fully past last seating for ${dayName || "that day"}. Try another date.`);
      return;
    }
    if (!slots.includes(form.time)) {
      setError("Pick a time we're actually open for.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      if (ENDPOINT) {
        const r = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!r.ok) throw new Error(String(r.status));
        setSent({ ...form, via: "sent" });
      } else {
        window.location.href = mailtoFor(form);
        setSent({ ...form, via: "mail" });
      }
    } catch {
      setError(`That didn't send. Call us on ${SITE.phone} and we'll sort the table out.`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={`band ${s.visit}`} id="visit">
      <div className="wrap">
        <Reveal><p className="eyebrow">Find us</p></Reveal>
        <SplitWords className={s.head} text="Visit the house" />

        <div className={s.grid}>
          <Reveal className={s.card} delay={0.05}>
            <h3>Hours</h3>
            <dl className={s.hours}>
              {HOURS.map(([day, time], i) => (
                <div key={day} className={i === today ? s.now : undefined}>
                  <dt>{day}{i === today ? " · today" : ""}</dt>
                  <dd>{time}</dd>
                </div>
              ))}
            </dl>
            <div className="rule" />
            <div className={s.line}>
              <strong>{ADDRESS}</strong>
              <a className={s.copy} href={MAPS_URL} target="_blank" rel="noreferrer noopener">Directions</a>
            </div>
            <div className={s.line}>
              <a href={TEL_HREF}>{SITE.phone}</a>
              <Copy value={SITE.phone} label="Copy number" />
            </div>
            <p className={s.note}>
              Walk-ins always welcome at the long table. The first floor is by reservation after 7pm.
            </p>
          </Reveal>

          <Reveal className={s.card} delay={0.12}>
            <h3 id="book">Book a table</h3>

            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="done"
                  className={s.done}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
                >
                  <motion.svg viewBox="0 0 48 48" className={s.tick} aria-hidden="true">
                    <motion.path
                      d="M10 25l10 10 18-22"
                      fill="none" stroke="currentColor" strokeWidth="3"
                      strokeLinecap="round" strokeLinejoin="round"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                    />
                  </motion.svg>
                  <p className={s.doneHead}>Thank you, {sent.name.split(" ")[0]}.</p>
                  <p className={s.note}>
                    {sent.guests} at {sent.time} on {sent.date}, {sent.floor.toLowerCase()}.{" "}
                    {sent.via === "mail"
                      ? "We've opened an email with your request — send it and we'll confirm within the hour."
                      : "We call back within the hour to confirm."}{" "}
                    In a hurry? Call <a href={TEL_HREF}>{SITE.phone}</a>.
                  </p>
                  <button className="btn" type="button" onClick={() => setSent(null)}>
                    Change it <i className="dot" />
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={submit}
                  className={s.form}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  noValidate
                >
                  <div className={s.two}>
                    <label className={s.field}>
                      <span>Name</span>
                      <input value={form.name} onChange={set("name")} autoComplete="name" required />
                    </label>
                    <label className={s.field}>
                      <span>Phone</span>
                      <input value={form.phone} onChange={set("phone")} inputMode="tel" autoComplete="tel" required />
                    </label>
                  </div>
                  <div className={s.two}>
                    <label className={s.field}>
                      <span>Date</span>
                      <input
                        type="date"
                        value={form.date}
                        onChange={set("date")}
                        min={minDate}
                        max={maxDate}
                      />
                    </label>
                    <label className={s.field}>
                      <span>Time{dayName ? ` · ${HOURS[parseISO(form.date).getDay()][1]}` : ""}</span>
                      <select value={form.time} onChange={set("time")} disabled={!slots.length}>
                        {slots.length ? (
                          slots.map((t) => <option key={t}>{t}</option>)
                        ) : (
                          <option>{now ? "No tables left today" : form.time}</option>
                        )}
                      </select>
                    </label>
                  </div>
                  <div className={s.two}>
                    <label className={s.field}>
                      <span>Guests</span>
                      <select value={form.guests} onChange={set("guests")}>
                        {["1", "2", "3", "4", "5", "6", "7+"].map((g) => <option key={g}>{g}</option>)}
                      </select>
                    </label>
                    <label className={s.field}>
                      <span>Where</span>
                      <select value={form.floor} onChange={set("floor")}>
                        {FLOORS.map((f) => (
                          <option key={f} disabled={f === "First floor" && !firstFloorOk}>
                            {f}
                            {f === "First floor" && !firstFloorOk ? " — after 7pm" : ""}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <label className={s.field}>
                    <span>Anything we should know</span>
                    <textarea rows={2} value={form.note} onChange={set("note")} />
                  </label>

                  <p className={s.hint} aria-live="polite">
                    {!slots.length && now
                      ? `Last seating has passed for ${dayName}. Pick another date, or call us.`
                      : bigParty
                        ? `Parties of ${BIG_PARTY} or more are easier by phone — give us a ring on ${SITE.phone}.`
                        : form.floor === "First floor"
                          ? "First floor, after 7pm — held for you until fifteen past."
                          : ""}
                  </p>

                  <p className={s.error} role="alert" aria-live="assertive">{error}</p>

                  <Magnetic>
                    <button className="btn btn--solid" type="submit" disabled={busy}>
                      {busy ? "Sending" : "Request the table"} <i className="dot" />
                    </button>
                  </Magnetic>
                </motion.form>
              )}
            </AnimatePresence>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
