# Reference analysis: f.io/RPt_WbX6 — "Anthropic #2" (What does AI mean for my job?, ep 02)

1080×1920, 25fps, 111s. Same series voice as ep01 but a richer graphics language.
Frame-by-frame findings for emulation.

## Grade / mood
Warm, cozy, saturated — window-light warmth on the footage and on every graphic
background. Cream backgrounds are NOT flat: soft warm gradients (window-light falloff).

## Caption system
- Small white Helvetica-ish phrases, sentence case, ~78% height, subtle shadow.
- **Key-word highlight chips**, two styles used constantly:
  - BLUE chip, white text — core nouns/concepts ("you delegate", "It collapses", "took weeks").
  - PALE-YELLOW chip, dark text — verbs/actions/time ("every tool", "in history", "on building").
- Chips are rounded (~8px), tight padding, same font size as the caption.

## Media/graphics language (the big lesson: everything is a floating object)
1. **Floating screen-recording cards**: phone- and browser-shaped rounded cards with
   soft drop shadows, floating over dimmed footage or cream; screen recordings play
   inside (Claude UI prompt → result reveal). Sometimes two cards side by side
   (before/after).
2. **Pinned definition card**: dictionary-style card ("tool (noun) …") pinned at the
   top ~8–15% of frame, key phrases inline-highlighted with blue/orange chips; stays
   pinned ~20s while the speaker talks below it.
3. **Polaroid history cards**: white polaroid frames, slightly rotated (±5–10°),
   tossed one-by-one onto a warm cream background, accumulating into a collage;
   handwritten-style italic labels under each ("fire", "farming", "printing press",
   "washing machine"); cut-out object PNGs (brick phone, calculator) mixed in.
4. **Archival sweeps**: rapid-cut B&W/sepia stills (patents, engravings, rocket-era
   photos, old newspapers) with Ken Burns, while caption chips carry the narration.
5. **Cream data chart**: hand-drawn-feel line chart (life expectancy) that draws on
   over time; blue + orange lines; small serif annotations ("30–40 years" → "70–80
   years"); tiny "sponsored" note top-right.
6. **Article cards**: news screenshots (MIT News) as floating rounded cards with the
   headline readable; caption chips point at the key stat.
7. **Scattered italic-serif overlays**: mid-video phrases ("but what did / we do with
   that / time?", "not only to solve problems / but it also gives") — words placed at
   different x/y across the frame in the italic title serif, staggered blur-in, over a
   scrim.
8. Brand cards: ANTHROP\C / Claude wordmarks full-frame between chapters.

## What we adopted into the Remotion system (assets/podcast-components/)
- Graphics render as **floating rounded cards** (warm-gradient cream, 26px radius,
  large soft shadow, spring scale-in) over the full-frame speaker — speaker's face
  stays visible below the card.
- **Caption highlight chips** (blue/white + pale-yellow/ink) via term lists.
- Warm **grade** on footage: saturate(1.18) contrast(1.07) brightness(1.03) + a
  soft-light warm gradient overlay; vignette pulled way down.
- Terminal card types the real command in sync with speech.

## Not yet built (recipes for future episodes)
Polaroid toss-in component; pinned definition card; draw-on chart; archival Ken Burns
sweep; scattered-word serif overlay; phone-frame screen-recording card.
