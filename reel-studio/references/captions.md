# Captions — real word sync + styling

## Why forced alignment

Transcripts usually have sparse timestamps (every few seconds). Interpolating word times
between them drifts and feels off. Instead, run **faster-whisper** on the audio to get true
per-word timings (forced alignment), then group into caption cues. The sync is noticeably
tighter — this was a specific fix the user asked for.

## Generate

```bash
pip install faster-whisper          # once
npm run captions                    # = python3 scripts/align_words.py
```

`align_words.py` reads `out/audio16k.wav`, writes `src/captions.json` as
`{ fps, durationInFrames, cues:[{ start, end, words:[{text,start,end}] }] }` (frames).
It groups words into short phrases, breaks on sentence punctuation, and preserves natural
case. Options: `--max-words N`, `--max-secs S`, `--model base.en`, `--wav`, `--out`.

## Styles (all in `src/Captions.tsx`)

- **Phrase (default):** 3–4 words, natural/proper case, active word accented in
  `BRAND.accent`. Readable and on-brand.
- **One word at a time:** run `align_words.py --max-words 1`. Each cue is a single word;
  the component already renders one cue at a time. Punchy, TikTok-style.
- **All caps:** add `textTransform: "uppercase"` to the caption div. (The user preferred
  natural case over all-caps — default to that unless asked.)
- **Position/size:** `paddingBottom` and `fontSize`. Lower-third (~470px up) keeps captions
  off the speaker's face in split beats.
- **No highlight:** color every word `BRAND.text` instead of accenting the active one.

Keep captions in a safe lower-third band so they sit over B-roll (not faces) during splits.
