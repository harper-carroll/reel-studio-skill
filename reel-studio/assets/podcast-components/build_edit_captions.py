#!/usr/bin/env python3
"""Rebuild captions against the EDIT timeline.

Reads out/segments_small.json (faster-whisper word timestamps, source time) and
src/edl.json (keeper segments), assigns each word to the EDL segment containing
its midpoint, remaps source time -> output time, and groups into short phrase
cues (<=4 words, <=2.4s, broken at .?! and never across a cut).

Writes src/captions_edit.json = { fps, durationInFrames, cues:[...] } in FRAMES.
"""
import json, re

FPS = 30
segs = json.load(open("out/segments_small.json"))
edl = json.load(open("src/edl.json"))["segments"]

words = [w for s in segs for w in s["words"] if w["w"].strip() and w["w"].strip() != "-"]

# display overrides: (approx source start, replacement text)
OVERRIDES = [(83.30, '"only"'), (19.33, 'What')]
for w in words:
    for t, repl in OVERRIDES:
        if abs(w["s"] - t) < 0.15:
            w["w"] = repl

# caption-timing overrides: whisper starts some words early; delay the DISPLAY
# start (extends the previous cue equally). (approx source start, delay s)
START_DELAYS = [(43.65, 0.35)]
for w in words:
    for t, d in START_DELAYS:
        if abs(w["s"] - t) < 0.15:
            w["s"] = w["s"] + d

# output frame offsets per EDL segment (mirror JS Math.round = floor(x+0.5))
def rnd(x):
    return int(x + 0.5)

starts, cum = [], 0.0
for e in edl:
    starts.append(rnd(cum * FPS))
    cum += (e["out"] - e["in"]) / e.get("rate", 1)
total_frames = rnd(cum * FPS)

def out_frame(seg_i, src_t):
    e = edl[seg_i]
    t = min(max(src_t, e["in"]), e["out"])
    return starts[seg_i] + rnd((t - e["in"]) * FPS / e.get("rate", 1))

# italic emphasis overrides by source word-start time ("the model code IS released")
ITALIC_STARTS = [86.26]

# assign words to segments by midpoint; if the midpoint fell into a removed
# micro-splice gap, fall back to the segment with the largest overlap (a word
# audible in a segment must never vanish from captions)
assigned = []  # (seg_i, text, startF, endF, italic)
for w in words:
    mid = (w["s"] + w["e"]) / 2
    seg_i = None
    for i, e in enumerate(edl):
        if e["in"] <= mid < e["out"]:
            seg_i = i
            break
    if seg_i is None:
        best = 0.0
        for i, e in enumerate(edl):
            ov = min(w["e"], e["out"]) - max(w["s"], e["in"])
            if ov > best:
                best, seg_i = ov, i
        if best <= 0:
            seg_i = None
    if seg_i is not None:
        sf = out_frame(seg_i, w["s"])
        ef = max(sf + 1, out_frame(seg_i, w["e"]))
        it = any(abs(w["s"] - t) < 0.15 for t in ITALIC_STARTS)
        assigned.append((seg_i, w["w"].strip(), sf, ef, it))

# proper punctuation (spec — better than the reference videos):
# keep periods; capitalize sentence starts
fixed = []
prev_text = ""
for (si, text, sf, ef, it) in assigned:
    if (not prev_text or prev_text.rstrip('"')[-1:] in ".?!") and text and text[0].islower():
        text = text[0].upper() + text[1:]
    fixed.append((si, text, sf, ef, it))
    prev_text = text
assigned = fixed

# group into phrase cues: never across segments, <=4 words, <=2.4s, break at .?!
groups, cur = [], []
for item in assigned:
    if cur and (item[0] != cur[0][0] or len(cur) >= 4 or (item[3] - cur[0][2]) / FPS > 2.4):
        groups.append(cur); cur = []
    cur.append(item)
    if re.search(r"[.?!]$", item[1]):
        groups.append(cur); cur = []
if cur:
    groups.append(cur)

seg_end_f = {
    i: starts[i] + rnd((edl[i]["out"] - edl[i]["in"]) * FPS / edl[i].get("rate", 1))
    for i in range(len(edl))
}

cues = []
for gi, g in enumerate(groups):
    seg_i = g[0][0]
    start_f = g[0][2]
    if gi + 1 < len(groups) and groups[gi + 1][0][0] == seg_i:
        end_f = groups[gi + 1][0][2]
    else:
        end_f = min(seg_end_f[seg_i], g[-1][3] + rnd(0.5 * FPS))
    end_f = max(start_f + 1, end_f)
    ws = []
    for j, (si, text, sf, ef, it) in enumerate(g):
        we = g[j + 1][2] if j + 1 < len(g) else end_f
        w_obj = {"text": text, "start": sf, "end": max(sf + 1, we)}
        if it:
            w_obj["it"] = 1
        ws.append(w_obj)
    cues.append({"start": start_f, "end": end_f, "words": ws})

out = {"fps": FPS, "durationInFrames": total_frames, "cues": cues}
json.dump(out, open("src/captions_edit.json", "w"), indent=1)
print(f"{len(assigned)} words -> {len(cues)} cues, {total_frames} frames -> src/captions_edit.json")
