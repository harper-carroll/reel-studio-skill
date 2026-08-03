# Podcast edit mode — two-speaker raw footage → finished vertical episode

Learned on the "open source vs open weights" edit (an example dual-speaker edit, Aug 2026). Use this
mode when the source is RAW multi-take footage of one or two seated speakers and the ask
is an *edit* (cuts, zooms, captions, titles, graphics) rather than AI B-roll. Reusable
components live in `assets/podcast-components/` — copy `podcast/` into `reel/src/` and
`build_edit_captions.py` into `reel/scripts/`.

## Pipeline

**download → prep (keep resolution!) → transcribe fine → diarize → take-select → EDL →
components → stills-validate → render.**

## 1. Prep: keep resolution headroom for punch-ins

Do NOT downscale to comp size. Punch-ins re-crop the source, so keep ~1.5x the comp
(e.g. 4K vertical source → 1620×2880 for a 1080×1920 comp; h264_videotoolbox is fast):

```bash
ffmpeg -i src.mp4 -vf "scale=1620:2880,fps=30" -an -c:v h264_videotoolbox -b:v 14M -pix_fmt yuv420p public/source/speaker.mp4
```

## 2. Transcribe with the take structure in mind

`small.en` + `vad_filter=True` + `condition_on_previous_text=False` recovers quiet lines
that `base.en` misses (a whole missing sentence in one case). Save full word timestamps.
Raw shoot footage contains **retakes and direction** ("say that again", "one more time",
"cool, good job", "that's too slow") — the transcript IS the take log: repeated lines are
takes (usually keep the LAST/most complete), coaching lines get cut. If the user can share
the script, ask — it resolves both take selection and speaker attribution instantly.

## 3. Diarization without an ML stack

- Check audio channels first: dual-mono means no free channel diarization.
- **Mouth-motion works**: decode grayscale at 540×960@10fps, per-frame abs-diff means in a
  tight mouth box per speaker, subtract a static background box, then **robust z-normalize
  each speaker's series against its own median/MAD** before comparing. Raw motion is biased
  by whoever gestures more; normalized separation matched the script on every content line.
- Confirm ambiguous windows visually: extract face crops mid-line; the speaker has an open
  mouth across frames, the listener smiles/nods (smiling inflates raw mouth motion — the
  z-norm handles it, eyes confirm it).

## 4. The EDL is the single source of truth

`src/edl.json`: `{in, out, framing, speaker, graphic?, title?, paneZoom?}` per keeper, in
SOURCE seconds. Both the TS composition (`podcast/layout.ts`) and the caption rebuilder
(`scripts/build_edit_captions.py`) read it; both must use the same rounding
(`Math.round` ≡ `int(x+0.5)`).

- Cut points from word timestamps: in ≈ first word −0.3s (land inside the pre-take pause),
  out ≈ last word +0.5s. Whisper word bounds are ±50ms; when a filler word ("yeah", "and")
  abuts the keeper, cut inside the silence between them and verify by listening/waveform.
- **Words are assigned to EDL segments by midpoint containment** — overlap rules
  double-assign boundary words.
- Contiguous source ranges with a framing change = a natural punch-out cut; use them.

## 5. Framing grammar (no jump cuts, other speaker removed)

- **Fill the frame** (note: no dead space above heads): anchor so the EYE LINE
  sits ~20% from the top on tight views — punch-ins ~2.0–2.2x, two-shots ~1.55x (width
  is the limit; slight edge-crop of shoulders is fine). EXCEPTION: shots that host a
  title/name-tag keep eyes ~30% — the title owns the wall space, like the reference.
- Framings: `two`/`two_title`, `<speaker>` punch-in (other speaker crops out),
  `<speaker>_title` (looser, hosts a card), tighter `<speaker>2` for a second
  consecutive punch, and `split` (graphic panel top 55%, speaker pane bottom 45%).
- **Never repeat the exact framing across a cut.** Alternate two-shot → punch → split; for
  consecutive same-speaker splits, step `paneZoom` (1.66 → 1.73 → 1.80) — the bottom pane
  changes size subtly instead of jumping.
- Crop = position the scaled video inside a clipped viewport (transform math, not
  objectFit), clamped so source edges never show. Anchors measured once on a gridded frame
  (`drawgrid`). Slow Ken Burns push (+0.08–0.15 zoom over the segment) keeps shots alive.
- Long single punch-ins (>8s) get a slightly bigger push arc.
- Audio: per-segment `<Audio trimBefore/trimAfter>` with 2-frame volume fades — no pops.

## 6. Captions on the EDIT timeline

Rebuild captions from the word timestamps THROUGH the EDL (source→output remap); never
show words from cut material. Caption position is PER FRAMING (spec:
mid-screen, never on a face): tight full views → vertically centered (faces are at the
top, text lands on the chest); loose title two-shot → low (faces are mid-frame); split
beats → chest level within the bottom pane. Verify each mode with a still.

## 6b. Pacing

Trim hard: cut filler openers ("So,"), enter ~0.1–0.3s before the first word, leave
~0.2–0.3s after the last. Landing each cut inside the silence between takes matters more
than the exact pad. ~4s came out of an 81s cut this way with zero content loss.

## 6c. Cut-point pads (words must NEVER clip)

Whisper word bounds are ±100ms. On REAL cuts pad in = first word −0.12s, out = last
word +0.18s (the "0.1s pauses" note is about the *perceived* gap; tighter pads
clip consonants). Visual-only boundaries inside a continuous take need NO pad — and
NO audio fade: fade only at real source cuts, or the fade dips mid-word. If a take
starts inside a long silence ("...or— [pause] Some models"), cut into the silence,
not at whisper's word-start.

## 6c-2. Advanced edit moves (learned across review rounds; all in the components)

- **J-cut / freeze**: to let a graphic breathe past its audio, insert a short
  `freeze_prev` EDL segment — it renders the PREVIOUS segment's final frame (Remotion
  `<Freeze>`) while the next line's audio already plays, then cuts to the new visual.
- **Speed ramps**: `rate: 1.1` per EDL segment (she speeds guests slightly for pace).
  Rate must divide EVERYTHING derived from time: segment output duration, SEG_START,
  relF (graphics/camera/word timing), the caption builder's frame mapping, Audio
  trimAfter (= trimBefore + durF*rate), and playbackRate on both Audio and video.
- **Micro-splices**: cut 0.1–0.4s dead air INSIDE a take by splitting the segment at
  RMS-measured silence. Continuity rules: graphics/titles spanning the splice get
  entered/exits flags (same-graphic adjacency) so cards don't re-animate; audio keeps
  its 2-frame ramps at these real cuts (cutting in silence makes them inaudible).
- **Finding exact cut points**: whisper word spans HIDE noises — a "word" spanning a
  pause can contain a mouth click or the previous take's tail. Scan 20ms-window RMS
  around the region, cut in true silence, never trust whisper's start for a word that
  follows a pause. (One line's real onset was 0.3s after whisper's start, with a click
  in between.)
- Remotion trap: `interpolate` input ranges must be STRICTLY increasing — conditional
  fade ranges collapse to duplicates; branch to explicit range/value arrays instead.

## 6d. Review loop (Frame.io-style, local)

`assets/podcast-components/review_server.mjs` (copy to reel/scripts/) serves
http://localhost:3444: the latest cut (`out/reel_current.mp4`) with click-to-comment
at timestamps; comments persist to `out/review_comments.json` — read that file and
apply all notes in one pass. Add it to .claude/launch.json to open in the browser pane.
**After applying a round**: append the comments to `out/review_archive.json` keyed by
version, then CLEAR the live file so each new cut is reviewed fresh (the review flow).
The archive is also skill-improvement input — mine it, with the transcript and her
annotated screenshots, for recurring preferences worth promoting into these docs.
The app has a **"✨ Generate next version" button** → POST /generate writes
`out/review_ready.flag`; arm a persistent Monitor on that flag (cat + rm + emit) so
her click notifies you to ingest comments and render, no message needed.
Caption builder rule learned from a dropped word: a word whose midpoint lands in a
micro-splice GAP must fall back to the max-overlap segment — audible words can never
vanish from captions.

## 7. Validate with stills before the render

One still per beat type (title mid-entrance, each graphic mid-zoom, each punch framing,
outro). Almost every bug found this way: chip colliding with a camera-panned headline,
detached checkmarks, captions on faces, pane anchors too low.


## 8. Style-system pattern (brand-agnostic)

The learned patterns behind the podcast-edit style are: a caption color system
(primary/secondary/over-overlay variants) driven per-speaker; name titles as
paired lower-third BARS sliding from opposite screen edges (identity-colored per
speaker) that PERSIST across beats — sliding behind floating overlay cards and
peeking at the edges — versus arrow tags reserved for static shots; card
overlays over DIMMED + BLURRED footage (blur ~7px + rgba wash) for "receipt"
beats; cards compound (a pile stays up for a whole beat); zoom INTO the
load-bearing detail with a marker ellipse drawn around it; live media
composited into screenshot rects; brand graphic cards for checklists/labels
(color-coded rows, tick pops, camera pushes). Feed the concrete palette,
fonts, exact tag lines, and per-project preferences through the Phase 0 onboarding
in SKILL.md; keep every design axis one-flag swappable so per-episode overrides
are cheap.

## Wall recolor (the blue-wall pass, hard-won)

1. **Matte once, composite cheap**: rembg person-matte only EDL-used frames at 540p
   (`matte_pass.py`, ~40 min incl. model) → alpha video. Tint/opacity changes then
   NEVER re-run the model.
2. Static wall mask from a luma/sat key on one reference frame + y-boundary (couch
   line), feathered; lamp/wood excluded automatically by the key.
3. **Composite in plain Python/numpy** (`composite_py.py`): stream-decode both, blend
   `out = base*(1-m) + color*m` with `m = wall*(1-alpha)*opacity`, pipe to libx264
   ultrafast. ~30fps → whole video in minutes. Do NOT use an ffmpeg filter graph
   (maskedmerge chains at 4K ran at ~1fps and twice produced runaway/invalid output),
   and do NOT trust videotoolbox `-b:v` (ignored; 7.5GB). SANITY-CHECK any long
   encode's output size/validity ONE MINUTE in.
4. Translucent tint (~59%) keeps real wall shadows/texture — reads as painted, not
   keyed. Soft matte halo around hair reads as rim light; erode alpha if it bothers.
5. Long media jobs: `nohup` (session restarts kill background shells), progress
   prints every N frames, and NEVER queue fast edit-renders behind them.


### Audio loudness (always do this)
Phone-shoot audio lands ~-26 LUFS — far too quiet for platforms. During prep,
two-pass loudnorm the SOURCE audio to I=-14, TP=-1.0, LRA=11 (measure first,
feed measured_* into pass 2) and write that as public/audio.m4a so every render
inherits it. Dynamic mode is fine for banter footage (evens quiet crosstalk);
verify the final render lands ≈ -14 LUFS / ≤ -1 dBTP with a loudnorm probe.
