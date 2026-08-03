#!/usr/bin/env python3
"""Pass 1 of the blue-wall recolor: person-matte every source frame the EDL
uses (+0.3s pad) with rembg, temporally smoothed, and write a grayscale alpha
video (out/alpha_matte.mp4) aligned 1:1 with speaker.mp4 frames. Frames outside
EDL ranges get black alpha (they're never shown). Color/opacity are applied in
pass 2, so re-tinting never re-runs the model."""
import json, subprocess, sys
import numpy as np
from PIL import Image
from rembg import new_session, remove

FPS = 30
W, H = 540, 960  # model works internally at 320px; small frames are plenty
SRC = "public/source/speaker.mp4"

edl = json.load(open("src/edl.json"))["segments"]
ranges = [(max(0, s["in"] - 0.3), s["out"] + 0.3) for s in edl]

def used(t):
    return any(a <= t <= b for a, b in ranges)

session = new_session("u2net_human_seg")

dec = subprocess.Popen(
    ["ffmpeg", "-loglevel", "error", "-i", SRC, "-vf", f"scale={W}:{H}",
     "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
    stdout=subprocess.PIPE,
)
enc = subprocess.Popen(
    ["ffmpeg", "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "gray",
     "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
     "-c:v", "h264_videotoolbox", "-b:v", "4M", "-pix_fmt", "yuv420p",
     "out/alpha_matte.mp4"],
    stdin=subprocess.PIPE,
)

frame_bytes = W * H * 3
prev = None
n = matted = 0
black = bytes(W * H)
while True:
    buf = dec.stdout.read(frame_bytes)
    if len(buf) < frame_bytes:
        break
    t = n / FPS
    if used(t):
        img = Image.frombytes("RGB", (W, H), buf)
        cut = remove(img, session=session, only_mask=True)
        a = np.asarray(cut, dtype=np.float32)
        if prev is not None:
            a = 0.65 * a + 0.35 * prev
        prev = a
        enc.stdin.write(a.astype(np.uint8).tobytes())
        matted += 1
        if matted % 200 == 0:
            print(f"matted {matted} (t={t:.1f}s)", flush=True)
    else:
        prev = None
        enc.stdin.write(black)
    n += 1

enc.stdin.close()
dec.wait()
enc.wait()
print(f"DONE: {n} frames, {matted} matted -> out/alpha_matte.mp4")
