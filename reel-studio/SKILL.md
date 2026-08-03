---
name: reel-studio
description: >-
  Turn a talking-head or podcast clip into a cinematic vertical brand reel: generate AI
  B-roll (via the Higgsfield MCP), cut it over the speaker with word-synced captions and
  centered split-screen, and edit it in Remotion. Use this whenever the user wants to make
  a short-form video or Reel from a transcript/interview/podcast, lay cinematic B-roll over
  someone talking, generate AI video clips from a shot list, create captioned vertical
  videos (Reels/TikTok/Shorts), or mentions Higgsfield, Remotion, B-roll, shot lists, or
  reels — even if they don't name the tools. Guides brand/caption/source onboarding, a
  style-selection flow with samples, shot-list generation, clip generation, and the render.
---

# Reel Studio

Build a cinematic vertical reel from a spoken clip: **AI B-roll + Remotion editing**. The
speaker's audio drives everything; generated B-roll and captions ride on top. The output is
a captioned, split-screen, grain-unified vertical video.

The pipeline (and this skill's spine):
**onboard → transcript → propose styles → sample each → user picks → shot list → generate clips → edit.**

Assets you'll use:
- `assets/remotion-template/` — the Remotion project. Copy into the user's repo (e.g. `reel/`).
- `assets/podcast-components/` — drop-in components for podcast-edit mode (see below).
- `references/higgsfield.md` — Higgsfield MCP models, generation, and **gotchas** (read before generating).
- `references/remotion-template.md` — template layout, customization points, commands.
- `references/captions.md` — caption alignment + styles.
- `references/podcast-edit.md` — **podcast edit mode** (two-speaker raw footage).
- `references/titles-and-graphics.md` — dynamic titles + code-built explanatory graphics
  (includes the SAFE-ZONE + COLLISION checklist — run it on every overlay).
- `references/broll-grammar.md` — when to cut to b-roll vs speaker vs cards, sourcing
  order (real footage > real screen recordings > generated), Playwright recording recipe.
- `references/ep02-style-analysis.md` — the full ep02 frame-by-frame style breakdown.
- `references/ugc-demo-ad-style.md` — the **"UGC demo-ad" style** (from the Tina/OpenArt
  reference): 50/50 split with seam captions, 16:9 media band + speaker PIP card,
  screen-recording proof beats, tweet-collage hook, no grain/grade.

## Two modes — pick before onboarding

1. **B-roll reel** (the phases below): one speaker, generate AI B-roll over the audio.
2. **Podcast edit** (`references/podcast-edit.md`): RAW one/two-speaker footage → cut
   retakes, per-speaker punch-in zooms, dynamic titles with a backdrop scrim, Helvetica
   cream captions, and code-built explanatory graphics with word-timed camera zooms
   (`references/titles-and-graphics.md`). No Higgsfield needed. The default style
   for technical talking-head episodes is this mode.

Tools required: the **Higgsfield MCP** (video/image generation, plan-billed), `ffmpeg`,
Node/npm (Remotion), and Python with `faster-whisper` (caption alignment).

---

## Phase 0 — Onboarding (first time in a repo)

If the project has no `reel/` set up yet, run onboarding once and persist the answers into
the project so you never re-ask. Copy the template first:

```bash
cp -r <skill>/assets/remotion-template <repo>/reel && cd <repo>/reel && npm install
```

Then gather (ask together, e.g. with a multi-question prompt) and write the answers in:

1. **Brand** → `src/brand.ts` + `src/fonts.ts` + `public/fonts/`.
   - Colors: background (dark), caption text (a light/bone that reads on footage), accent
     (active-word highlight + split divider). Look for a brand guide / existing palette in
     the repo before asking.
   - Fonts: copy the user's brand `.ttf`s into `public/fonts/` as `brand-medium/semibold/bold/extrabold.ttf`
     and map them in `fonts.ts`. Update `FONT` in `brand.ts` to the family name.
2. **Captions** → `src/Captions.tsx` (+ `align_words.py` flags). Phrase (3–4 words, natural
   case) vs one word at a time; case; accent on/off; position. Default: phrase, natural
   case, accent on — see `references/captions.md`.
3. **Source video(s)** and **aspect ratio** → `WIDTH`/`HEIGHT` in `src/shots.ts` (default
   9:16 → 1080×1920). Note where the user's talking-head clips live.
4. **Higgsfield MCP** — confirm it's connected (see `references/higgsfield.md` for the
   `.mcp.json` + OAuth). Check `balance`. Ask their preferred model (Kling 3.0 = 4K + cheap,
   Wan 2.7 = 1080p, Gemini Omni = 720p) — you can also recommend based on the style.

Persist a short `reel/reel.config.md` noting the choices so future runs skip onboarding.

---

## Phase 1 — Transcript intake

The user provides (or you extract) a transcript with timestamps — the timing windows for
each B-roll shot come from here. Note the **total duration** (last timestamp / audio length);
it sets `TOTAL_SECONDS` and the composition length. Prep the source now:

```bash
scripts/prep_source.sh /path/to/source.mp4     # -> public/source/speaker.mp4, public/audio.m4a, out/audio16k.wav
pip install faster-whisper && npm run captions  # real word-synced captions -> src/captions.json
```

---

## Phase 2 — Propose style options

This is where you set the film's soul. Offer the user **3–5 distinct visual styles** as
short mood pitches — each is a reusable `STYLE` block (palette + light + texture + motion +
emotional register) that will be appended to every clip's prompt so the reel feels like one
film. Make them genuinely different, e.g.:

- *"Chalk & Cosmos"* — slate-blue chalkboard dissolving into starfields; scholarly, reverent.
- *"Warm archival"* — sepia notebooks, film-grain, golden halation; nostalgic and tender.
- *"Cold-to-gold"* — cold blue shadow with one hard shaft of light warming to dawn; defiant.
- *"Liquid metaphor"* — ink blooming in water, macro caustics; elegant, abstract, timeless.

Tie the styles to the transcript's actual arc and emotion — read it first. Present them as a
choice (a question with the options), each 1–2 sentences.

---

## Phase 3 — Sample each style

Don't make the user pick blind. Generate **one or two quick samples per style** via the
Higgsfield MCP — a single representative still (`generate_image`, cheap) or a short clip per
style — and show them. Preflight with `get_cost` and keep it cheap; images are ideal here.
Follow `references/higgsfield.md` (preset interception, model params). Present the samples
side by side.

---

## Phase 4 — User picks the style

The user chooses one (or asks to blend/tweak). Lock the `STYLE` block from the winner into
`src/shots.ts`. If they want changes, it's cheap to re-sample before committing to a full batch.

---

## Phase 5 — Write the shot list

Now write the **extensive per-clip shot list** in the chosen style, mapped to the transcript.
For each timestamp window, author a Shot in `src/shots.ts`:

- **Windows contiguous**, covering 0 → total duration (each end = next start).
- **Rotate the subject** across clips (cosmos, hands, silhouette, landscape, architecture…)
  but hold the mood constant via the shared `STYLE` block — variety of image, unity of tone.
- **Carry a motif** across clips (e.g. a recurring light, dust→stars) so it reads as one piece.
- **`mode`**: `full` for hero B-roll; `split` for beats where seeing the speaker adds weight
  (personal claims, emotional lines). A few splits, not all — the user can dial this.
- **Opener**: a full-frame `source/speaker.mp4` beat is a strong establishing open.
- **`prompt`**: extensive and specific (composition, motion, light) + the `STYLE` block, and
  hard negatives: `no on-screen text, no captions, no words, no watermark`.

Confirm the shot list with the user before spending credits.

---

## Phase 6 — Generate the clips

Generate each B-roll clip with the Higgsfield MCP. **Read `references/higgsfield.md` first** —
it covers model choice, durations, seeding, polling/downloading, and the gotchas that will
otherwise bite you. Key rules:

- Pick durations the model supports; generate **≥ window + ~0.5s** so the edit trims, not freezes.
- Consistency: seed varied scenes with text-to-video + the shared `STYLE` block (unify in post
  via grain); seed same-look scenes from a style still. Don't reuse one identical start-frame
  across differently-composed clips.
- **Submit in small batches** (>~5 at once → 429). Record job ids; poll `job_display` /
  `show_generations`; `curl` each `rawUrl` into `public/broll/clipN.mp4`.
- **Verify actual frames** of every clip (`ffmpeg` extract → look). Higgsfield **false-flags
  dark/silhouette clips as NSFW** — the pixels are usually clean. Check before reacting, and
  tell the user what you saw. If a moody prompt returns a preset suggestion instead of a job,
  resend with `declined_preset_id`.

---

## Phase 7 — Edit in Remotion

With clips in `public/broll/`, audio + captions in place, and `src/shots.ts` filled:

```bash
npm run studio     # live preview — tweak split beats, timing, caption style
npm run render     # -> out/reel.mp4
```

Validate with a still before the full render
(`npx remotion still src/index.ts Reel out/chk.png --frame=240`), then render and **open the
result for the user**. See `references/remotion-template.md` for how the composition works
and every tweak point.

---

## Defaults & principles (what makes these reels good)

- **9:16 vertical**, 1080×1920, 30fps unless the user says otherwise.
- **Split-screen panes are centered crops** — subjects centered, equal top/bottom cut, never
  one lopsided half. This was a specific, hard-won fix.
- **Grain/vignette unifier is not optional** — it ties clips from different prompts (and the
  real footage, and a 720p upscale) into one cinematic look.
- **Real word sync** via faster-whisper, not interpolation.
- **Verify frames, trust pixels over labels** — especially for the recurring NSFW false-flags.
- **Preview cheap, commit late** — samples/stills and `get_cost` before batch generation;
  one test clip before a full batch; a still before a full render.
- **Iterate in Studio** — most creative changes (which clips split, caption look, timing) are
  a one-line edit + re-render, not a regeneration.
