# Dynamic titles + code-built explanatory graphics

The locked style, reverse-engineered frame-by-frame from her "How does AI work?
episode 01" reel (instagram.com/p/DbD8-40Owbv) and episode 02 (Frame.io "Anthropic #2"),
implemented in `assets/podcast-components/podcast/titles.tsx` + `graphics.tsx`/`graphics2.tsx`.

## SAFE ZONES + COLLISION CHECKLIST (verify on EVERY overlay)

Reels UI covers ~110px top, ~320px bottom, 60px left, 120px right of 1080×1920.
**All text overlays live inside x 60–960, y 250–1600** (`SAFE` in layout.ts).
Before rendering, verify with stills that NO two of these intersect, and that none
touches a face: main title lockup, name tags + their arrows, caption band (vertically
centered at ~915–1005), corner cards, graphic-card content. Specifically check:
- name-tag arrows end ≥15px SHY of the speaker's hair/face edge — and the shot that
  hosts an arrow must be STATIC (no Ken Burns), or the head drifts into the arrow;
- captions are vertically+horizontally centered; on graphic-card beats they get a
  dark rounded backdrop (cream text on cream card is invisible);
- the scrim behind a title must fade out ABOVE the speaker's face (short `fade` when
  faces sit high) — a face inside the scrim reads underlit and drab;
- keep the table/foreground furniture under ~25% of frame height in every crop.

## Warm grade (anti-drab, matches ep02)

Footage: `filter: saturate(1.18) contrast(1.07) brightness(1.03)` + a soft-light warm
gradient overlay (rgba(255,176,96,.14) → rgba(255,120,60,.05)). Vignette barely-there
(0.16). Cream graphic backgrounds are warm GRADIENTS, never flat cream.

## The OPENING title (final design after several rejected drafts)

The cold open is a **hard split**: full-bleed warm-cream panel (top ~52%) with the
lockup in INK serif, over a tight STATIC two-shot pane below. She rejected: white-on-
scrim over the footage ("massive amount of ceiling above us looks weird"), any Ken
Burns on that shot (a static arrow must stay locked to the head it points at), and
title fade-outs (titles HOLD and cut with the shot). The chosen lockup is the "duel"
arrangement — both terms equal size with a small orange "vs" between rules — из four
arrangement — one of four variants living in titles.tsx (`duel|weights|explained|footer`),
switchable via `--props='{"titleVariant":"..."}'` for instant comparison stills. The "ai" inside
"explained" is always accent orange. NO grain over the cream panel (animated grain on
flat cream reads as the title "shaking").

## Mid-video title cards (the "shadow dropdown behind" look)

1. **Depth comes from a scrim, not a text shadow**: a soft black linear gradient blooms on
   the FOOTAGE behind the title (top stop ~0.72 black fading to 0 by ~48% frame height),
   fading in/out with the title. Text carries only a faint drop shadow for edge separation.
2. **Font**: high-contrast calligraphic italic display serif. Reference look ≈ Ogg/Canela
   italic; **Cormorant Italic (variable, Google Fonts) is the proven free match** — load as
   `FontFace` with `style: "italic", weight: "300 700"`, inside the component (never module
   top level).
3. **Lockup hierarchy**: small line / HUGE line / small line (e.g. "open source vs" 92px /
   "open weights?" 196px / "explained" 68px), centered in the top ~30% of frame, lineHeight
   ~0.98, warm white #FAF6ED.
4. **Entrance**: words staggered ~0.3/0.85/1.5s; each starts ~26px gaussian-blurred,
   opacity 0, scale 1.07, settles sharp over ~0.6s (ease-out cubic). **Exit**: whole lockup
   blurs+fades ~0.5s. The scrim may persist into a following overlay.
5. **Meaningful dynamics**: animate the word to enact its meaning — reference spreads
   "Sample" into "Sa mp le" while explaining tokens; we spread the letter-spacing of
   "a spectrum" (0→0.3em, compensate margin-left to stay centered) as the word is spoken.
6. **Secondary card**: a single italic word parked upper-LEFT (e.g. "licenses") holding
   through a beat, with a small Helvetica annotation fading in top-right when the concept
   is spoken. Same scrim + blur-in.
7. Timing comes from the word timestamps: trigger each element on its spoken word.
8. **Speaker ID tags** (`NameTag` in titles.tsx): name in the title serif italic (~46px)
   over credential lines in Helvetica (~28px), cream, with a curved SVG arrow (quadratic
   bezier + arrowhead) pointing at the speaker. Park the tag in negative wall space (the
   gap between two heads, or beside a solo speaker), keep the shot loose enough to have
   that space, and blur it in/out like every other title. these should appear on each
   speaker's first appearance.

## Captions (brand-driven — sourced from brand.ts, evolved across episodes)

**CURRENT SYSTEM (adopted from the series-intro reel, "her swatch"): butter-yellow
chips.** Rounded chip rgba(250,246,216,0.96) (white chip over cream cards), ink text
#23201B in the project's brand sans-serif (loaded via `caption-sans.otf` as "CaptionSans" — swap the file per brand), key terms BOLD in
brand accent (from brand.ts), soft chip shadow, ~45px, radius 12, padding 8x20. The series
intro (series-intro/reel) is the style source of truth — CHECK IT FIRST when styling
a new episode; conventions converge there before they land in these docs.

## Captions (historical spec — superseded by the butter system above)

Helvetica cream: `'Helvetica Neue', Helvetica, Arial`, weight 500, ~47px, color #F2E9D6,
natural case, ≤4-word phrases, active word full opacity / rest 0.8.
- **Vertically + horizontally centered**, max-width 80%; per-framing shifts: the spec
  punch-ins +130px (fully on the navy shirt, off the collar); title-split open rides
  the panel/pane divider line.
- **Dark rounded backdrop on EVERY caption** (rgba(28,24,18,0.62), radius 16) — she
  asked for it "throughout", not just over cards.
- **Key terms are COLORED TEXT, NOT chips** — she rejected bubble chips on recurring
  terms. Blue #5B8BF0 for core concepts, orange #E8663C for actions/qualities,
  weight 600, phrase-aware. Chips remain fine inside GRAPHICS (NVIDIA/AI2 pills),
  just not in captions.
- **Proper punctuation and capitalization** — keep periods, capitalize sentence starts.
  She EXPLICITLY dislikes the loose punctuation in her own reference videos ("the video
  examples I sent you don't use good punctuation, but I didn't actually like that") —
  reference-matching has limits; her stated preferences beat the reference.
- Punctuation details matter to her: quote words she air-quotes ('"only"'), italicize
  emphasized words (builder ITALIC_STARTS), delay a caption's display start when
  whisper leads her voice (builder START_DELAYS).
- Caption style system: variants in CaptionsCream (dark/cream/creamblue/whitegrey/
  frost), switchable via --props captionStyle — render option stills for her to pick.

## Explanatory graphics for technical beats (code-built, zoom-timed)

**Graphics are FLOATING CARDS, not hard splits** (ep02's screen-recording-card look):
rounded ~26px, warm-gradient cream, big soft drop shadow, spring scale-in, floating
over the full-frame speaker — the speaker's face stays visible below the card and
keeps talking. Content in the reference's language:

- Palette: panel #F1ECE3, ink #2E2A24, orange #DE5F3B, blue #6E93CE, green #3E7C56,
  muted #8A8478. Headlines in the italic title serif (ink); rows/labels in Helvetica.
- A small dark pill chip in a panel CORNER (top-right) carries the series/topic tag on
  every panel. It must live in CAMERA space (inside the zoom/pan wrapper), not pinned to
  the viewport — a pinned chip collides with headlines mid-pan.
- **The camera is the explanation**: wrap panel content in a keyframed zoom/pan camera
  (`{t, z, x, y}` keyframes in source-seconds → eased piecewise). Zoom to the row/item as
  its word is spoken, back out for the payoff/badge. Elements pop in with a spring ON their
  word (checkmark ticks, chips, badges).
- Proven panel shapes: checklist with ✓/✗ marks (mark LEFT of label, in a colored circle);
  logo row + big italic payoff word; file-card → arrow → architecture stack; two path
  cards with an orange highlight ring when one is chosen; benefits checklist; dark terminal
  card that TYPES its line in sync with speech (blinking block cursor).
- **Real logos, not text pills, for organizations** (the rule): white rounded
  cards containing the actual logo image. Source via Playwright element-screenshots of
  the org's own site header (Wikimedia thumb URLs often 404); key out non-white header
  backgrounds with ffmpeg colorkey. NO series chip on cards — she removed it.
- **Diagrams must be technically correct** — she checks. (The transformer stack:
  ×N wraps the attention+mlp block PAIR, embeddings before, lm head after.)
- Never invent specifics the script doesn't say (commands, version numbers) — type the
  spoken phrase itself if the concrete command is unknown.

## Ep02 recipes not yet componentized (build when an episode calls for them)

Polaroid history cards (white frames, ±5–10° rotation, tossed onto warm cream, italic
handwritten labels); pinned dictionary-definition card with inline chip highlights;
hand-drawn cream data chart that draws on; archival B&W Ken Burns sweeps; scattered
italic-serif phrase overlays (words placed across the frame, staggered blur-in);
phone-frame screen-recording cards, two side-by-side for before/after.

## Grain unifier for bright footage

The template's moody grain/vignette is too dark for daylight interviews + cream cards:
vignette rgba(10,10,14,0.16) at the far edges and grain opacity ~0.055; warmth comes
from the grade, not the vignette.
