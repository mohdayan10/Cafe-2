# Brew sequence photographs

## What's here now

    01.jpg  Wake the beans  — 2400x1600, giant bean splitting, beans falling into a glass
    02.jpg  Grind to order  — 2400x1600, ground coffee falling into a portafilter

Both are real photoreal renders on a warm cream ground, generated 2026-11-23.
`03.jpg`–`05.jpg` are **not** here yet — see the blocker below.

## How these were made (this pipeline works, use it again)

Canva's `generate-image` only hands back a 200x133 thumbnail through the API, and its
signed media URL is bound to those exact dimensions — rewriting `width:`/`height:` on it
returns 403. The way to get the full-resolution file out is to go via a design export:

1. `generate-image` with the prompt → returns a media id (e.g. `MAHbu80TW0Q`).
   `get-generate-image-job` to collect it. Source is ~2496x1664.
2. `create-design` with `references: [<media id>]`, `format: "Poster (Landscape)"` and a
   brief that insists on a full-bleed photo and **no text, no logos, no graphics** →
   returns a design id (`D...`). The brief matters: without it Canva lays type over the photo.
3. `export-design` with `{ type: "jpg", quality: 92, width: 2400 }` → returns a real
   S3 download URL.
4. `curl` that URL straight into this folder.

## Blocker

Steps 1 and 2 both consume Canva AI credits. The account hit
`quota_exceeded` after three image generations, so scenes 03–05 could not be
produced. Scene 03 was generated (media id `MAHbu3fHAGI`, a pour-over bloom) but its
`create-design` wrap failed on quota, so only the unusable 200x133 thumbnail exists.

To finish: top up Canva credits, then run the pipeline above for 03 (media id already
exists — start at step 2) and 04/05 (start at step 1 with the prompts below).

## Remaining prompts, ready to paste

**03 — Let it bloom**
> Photorealistic editorial product photograph for a coffee shop website: a ceramic V60
> pour-over cone sitting on a clear glass carafe, hot water being poured in a thin arc from a
> gooseneck kettle, the bed of coffee grounds swelling and blooming with foam and bubbles, a
> thin stream of brewed coffee dripping into the carafe below, delicate steam rising. Warm
> cream background (#FBF3E4), soft diffused studio lighting from the upper left, gentle shadow
> on a cream surface, shallow depth of field. Minimal, elegant, warm brown and cream palette.
> No text, no watermark, no people, no hands.

**04 — Pull it short**
> Photorealistic editorial product photograph for a coffee shop website: a rich dark espresso
> stream with golden crema pouring from a bottomless portafilter in a thin glossy ribbon down
> into a small clear glass cup, the crema swirling on the surface. Warm cream background
> (#FBF3E4), soft diffused studio lighting from the upper left, gentle shadow on a cream
> surface, shallow depth of field, high detail on the glossy liquid and the golden crema.
> Minimal, elegant, warm brown and cream palette. No text, no watermark, no people, no hands.

**05 — Make the time taste better**
> Photorealistic editorial product photograph for a coffee shop website: an overhead
> three-quarter view of a cappuccino in a cream ceramic cup with a perfect latte art rosetta in
> the foam, steamed milk being poured in a thin stream from a stainless steel pitcher, the
> leaves of the rosetta crisp against the espresso crema. Warm cream background (#FBF3E4), soft
> diffused studio lighting from the upper left, gentle shadow on a cream surface, shallow depth
> of field, high detail on the silky milk foam texture. Minimal, elegant, warm brown and cream
> palette. No text, no watermark, no people, no hands.

## Notes for whoever wires these up

- These are **3:2 landscape**. A 4:5 portrait frame with `object-fit: cover` crops them
  hard; both subjects are centred so they survive it, but a 3:2 frame suits them better.
- Don't list a scene whose image is missing — it renders a broken frame. Probe every
  image, not just `01.jpg`, or keep the scene list to the files that actually exist.
- Keep the headline column clear of the photo. At 1440px wide a photo at `left: 60%` /
  `width: min(44vw, 78vh)` starts around x=547px, and a two-word headline at
  `clamp(...,5vw,...)` runs past that and sits on top of the image.
