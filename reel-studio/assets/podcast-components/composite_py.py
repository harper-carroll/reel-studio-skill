#!/usr/bin/env python3
import json, subprocess
import numpy as np
from PIL import Image

FPS, W, H = 30, 1620, 2880
OP = 0.59
BLUE = np.array([128, 152, 182], dtype=np.float32)

edl = json.load(open("src/edl.json"))["segments"]
ranges = [(max(0, s["in"] - 0.3), s["out"] + 0.3) for s in edl]
used = lambda t: any(a <= t <= b for a, b in ranges)

wall = np.asarray(Image.open("out/wallmask.png").convert("L"), dtype=np.float32) / 255.0

dec_v = subprocess.Popen(["ffmpeg","-loglevel","error","-i","public/source/speaker.mp4",
    "-f","rawvideo","-pix_fmt","rgb24","-"], stdout=subprocess.PIPE, bufsize=W*H*3*2)
dec_a = subprocess.Popen(["ffmpeg","-loglevel","error","-i","out/alpha_matte.mp4",
    "-vf",f"scale={W}:{H}","-f","rawvideo","-pix_fmt","gray","-"], stdout=subprocess.PIPE, bufsize=W*H*2)
enc = subprocess.Popen(["ffmpeg","-loglevel","error","-y","-f","rawvideo","-pix_fmt","rgb24",
    "-s",f"{W}x{H}","-r",str(FPS),"-i","-","-c:v","libx264","-preset","ultrafast","-crf","20",
    "-pix_fmt","yuv420p","-movflags","+faststart","public/source/speaker_blue.mp4"], stdin=subprocess.PIPE)

n = 0
fv, fa = W*H*3, W*H
while True:
    vb = dec_v.stdout.read(fv)
    ab = dec_a.stdout.read(fa)
    if len(vb) < fv:
        break
    if used(n / FPS) and len(ab) == fa:
        img = np.frombuffer(vb, dtype=np.uint8).reshape(H, W, 3).astype(np.float32)
        alpha = np.frombuffer(ab, dtype=np.uint8).reshape(H, W).astype(np.float32) / 255.0
        m = (wall * (1.0 - alpha) * OP)[..., None]
        out = img * (1 - m) + BLUE * m
        enc.stdin.write(out.astype(np.uint8).tobytes())
    else:
        enc.stdin.write(vb)
    n += 1
    if n % 300 == 0:
        print(f"frame {n}/6068 ({n/6068*100:.0f}%)", flush=True)

enc.stdin.close(); enc.wait(); dec_v.wait(); dec_a.wait()
print(f"DONE {n} frames")
