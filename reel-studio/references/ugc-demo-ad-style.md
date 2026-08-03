# Reference analysis: "Openart video - Tina.mp4" — UGC product-demo reel style

Source: Frame.io share (asset 7c051a9a), saved locally as `reference/tina_reference.mp4`.
1080×1920, 60fps, 22.4s. A creator-style ad for OpenArt: talking-head narration over a
product showcase (AI short film), a screen-recording proof section, and a brand outro.
Frame-by-frame findings for emulation. Transcript: `reference/tina_transcript.txt`.

## Overall grade / mood

Clean and native — **no unifying grain, no warm grade, no vignette**. Each source keeps
its own look: naturally-lit indoor speaker cam, cinematic AI film clips, raw dark-mode UI
recordings. Canvas behind everything is pure black (or a heavily darkened blur-fill of
the media itself). The polish comes from layout discipline, not color treatment.

## The four layouts

**A. 50/50 split (speaker + media), caption on the seam**
- Hard horizontal split at exactly y=960: media on top, speaker cam on the bottom.
- Both panes are centered crops, full-bleed to their half. No divider line, no gap.
- Caption is centered ON the seam (text center ≈ y960), overlapping both panes.
- Used for the hook (tweet collage on top) and for film reaction beats (film crop top).

**B. 16:9 media band + speaker PIP card**
- The media (the 16:9 film, or the logo animation) plays as a full-width 16:9 band,
  y ≈ 467–1074 — band center sits at ~40% height, slightly above frame center.
- The rest of the frame is filled with a **heavily darkened, blurred blow-up of the same
  clip** (blur-fill letterboxing, near-black — reads as texture, not image).
- Speaker cam floats as a **rounded PIP card**: ~620×408 (≈3:2), centered horizontally
  (x ≈ 228–848), top edge overlapping the band's bottom edge by ~20px (y ≈ 1057–1465).
  Radius ~24px. No border, no visible shadow.
- Caption centered ~35px below the PIP.
- The film carries a small "∞ OpenArt" watermark at the band's bottom-right.

**C. Full-frame screen recording + speaker PIP**
- The product UI (dark-mode chat + storyboard + timeline editor) fills the whole 9:16
  frame — the desktop app cropped/stacked so chat is the top half, timeline the bottom.
- Same speaker PIP as B (~620px wide, centered, mid-frame y ≈ 920–1415; corners nearly
  square here in the source — keep 24px for consistency), caption just below.
- The recording shows real cursor movement, scrolling, and generation UI; quick cuts
  jump between chat moments, storyboard cards, and the timeline.

**D. Full-frame speaker (CTA close)**
- Final beat: a different, closer camera (near-selfie framing, warm window light),
  full-frame, no overlays. Caption sits mid-frame just above the mic (~64% height).

## Caption system

- 1–2 word chunks ("AI video", "lonely", "and flowers", "link"), sentence case,
  word-synced to speech — a chunk every ~0.3–0.7s.
- Helvetica-style bold (Helvetica Neue Bold / SF Pro Display Bold feel), pure white,
  ~56–60px at 1080w, tight tracking, subtle soft shadow. No chips, no color accents,
  no uppercase, no punctuation beyond apostrophes.
- Word-by-word emphasis by opacity: the upcoming word of a 2-word chunk can sit
  pre-dimmed (~50% white) and brighten to full white as it's spoken
  (seen at "another level": "another" bright, "level" dimmed).
- Position is contextual per layout: seam-centered (A), below the PIP (B/C),
  above-the-mic (D). Never bottom-of-frame thirds.

## Social-proof tweet collage (hook, 0–3s)

- Dark-mode X/Twitter posts on black, overlapping at staggered scales/depths: one
  fully-readable card front and center, others peeking from edges and behind.
- Posts show real embedded video thumbnails; engagement rows visible (replies, likes,
  views) — the numbers ARE the proof. Slow drift/parallax, quick cuts between stacks.
- Fills the top pane of Layout A while the speaker talks below.

## Structure template (22s ad; scales to any length)

1. **Hook** (0–3s) — Layout A, tweet collage: "AI video has reached another level."
2. **Showcase** (3–10s) — alternate B (film band + PIP) and A (film crop + reaction):
   introduce the character/story of the demo film; let the film breathe, speaker reacts.
3. **Workflow proof** (10–17s) — Layout C: the actual UI making the film; the claim
   ("vibed in 10 minutes by describing it") lands while the recording shows it.
4. **Result montage** (17–19s) — B: best film beats ("with sounds and everything").
5. **Brand outro** (19–21s) — B with the logo animation as the band; name the product.
6. **CTA** (21–22s) — D: closer camera, direct address, "link is in the description."

## Rhythm

- Caption chunk changes ~every 0.5s; layout changes every ~1.5–3s; all hard cuts.
- Film sub-clips run 1–2s each. The speaker cam runs continuously underneath — the
  PIP/split panes are windows onto one uninterrupted take, which keeps it feeling live.

## What this maps to in the Remotion template

- Layout A ≈ existing `SplitOverlay` (already centered-crop discipline) + seam captions
  (new caption position mode).
- Layout B = new component: 16:9 band + blur-fill background + rounded PIP card
  (PIP = `public/source/speaker.mp4` cropped 3:2, `borderRadius 24`).
- Layout C = screen-recording asset full-frame + same PIP card.
- Captions: existing word-sync pipeline, new look — white Helvetica bold ~58px, 1–2 word
  chunks, opacity pre-dim for upcoming word, contextual y-position per layout.
- No grain/vignette pass for this style — skip `GrainOverlay`.
