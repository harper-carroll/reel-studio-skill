#!/usr/bin/env python3
"""Word-level caption timing via faster-whisper forced alignment.

Writes src/captions.json = { fps, durationInFrames, cues:[{start,end,words:[{text,start,end}]}] }
with times in FRAMES. Cues are grouped into short phrases (default <=4 words),
broken on sentence punctuation, with natural/proper case preserved. This beats
interpolating word times between sparse transcript timestamps — the sync is real.

Usage:
  python3 scripts/align_words.py            # defaults below
  python3 scripts/align_words.py --max-words 1   # one word at a time
  python3 scripts/align_words.py --wav out/audio16k.wav --fps 30 --model base.en
"""
import argparse, json, re, os
from faster_whisper import WhisperModel

ap = argparse.ArgumentParser()
ap.add_argument("--wav", default="out/audio16k.wav", help="16kHz mono wav of the audio")
ap.add_argument("--fps", type=int, default=30)
ap.add_argument("--max-words", type=int, default=4)
ap.add_argument("--max-secs", type=float, default=2.4)
ap.add_argument("--model", default="base.en", help="faster-whisper model (base.en is a good default)")
ap.add_argument("--out", default="src/captions.json")
args = ap.parse_args()
FPS = args.fps

model = WhisperModel(args.model, device="cpu", compute_type="int8")
segments, info = model.transcribe(
    args.wav, language="en", word_timestamps=True, beam_size=5,
    vad_filter=False, condition_on_previous_text=True,
)

raw = []
for seg in segments:
    for w in (seg.words or []):
        t = w.word.strip()
        if t:
            raw.append({"text": t, "start": float(w.start), "end": float(w.end)})

TOTAL = float(getattr(info, "duration", 0) or 0)
if not TOTAL:
    TOTAL = (raw[-1]["end"] + 0.5) if raw else 1.0

# Group into short phrase cues; break on sentence-ending punctuation.
groups, cur = [], []
for w in raw:
    cur.append(w)
    if re.search(r"[.?!]$", w["text"]) or len(cur) >= args.max_words or (w["end"] - cur[0]["start"]) >= args.max_secs:
        groups.append(cur); cur = []
if cur:
    groups.append(cur)

def fr(t):
    return max(0, round(t * FPS))

cues = []
for i, g in enumerate(groups):
    start_f = fr(g[0]["start"])
    end_f = fr(groups[i + 1][0]["start"]) if i + 1 < len(groups) else fr(min(TOTAL, g[-1]["end"] + 0.5))
    end_f = max(start_f + 1, end_f)
    words = []
    for j, w in enumerate(g):
        ws = fr(w["start"])
        we = fr(g[j + 1]["start"]) if j + 1 < len(g) else end_f
        disp = re.sub(r"[.]+$", "", w["text"])  # drop trailing period; keep commas/apostrophes
        words.append({"text": disp, "start": ws, "end": max(ws + 1, we)})
    cues.append({"start": start_f, "end": end_f, "words": words})

out = {"fps": FPS, "durationInFrames": round(TOTAL * FPS), "cues": cues}
os.makedirs(os.path.dirname(args.out) or ".", exist_ok=True)
with open(args.out, "w") as f:
    json.dump(out, f, indent=2)
print(f"{len(raw)} words -> {len(cues)} cues, {out['durationInFrames']} frames -> {args.out}")
