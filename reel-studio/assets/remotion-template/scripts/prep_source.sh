#!/usr/bin/env bash
# Prep a talking-head/podcast source for the reel:
#  1) a downscaled, MUTED speaker video (full-frame opener + split-screen top pane)
#  2) the spoken audio track (the reel's soundtrack)
#  3) a 16kHz mono wav for caption alignment
#
# Usage: scripts/prep_source.sh <source_video> [WIDTH] [HEIGHT]
#   defaults to 1080x1920 (9:16 vertical)
set -euo pipefail
SRC="${1:?usage: prep_source.sh <source_video> [WIDTH] [HEIGHT]}"
W="${2:-1080}"
H="${3:-1920}"
mkdir -p public/source public/broll public/fonts out

ffmpeg -y -i "$SRC" -vf "scale=${W}:${H}" -an -c:v libx264 -crf 20 -preset veryfast -pix_fmt yuv420p public/source/speaker.mp4
ffmpeg -y -i "$SRC" -vn -c:a aac -b:a 192k public/audio.m4a
ffmpeg -y -i "$SRC" -ar 16000 -ac 1 -c:a pcm_s16le out/audio16k.wav

echo "prepped -> public/source/speaker.mp4, public/audio.m4a, out/audio16k.wav"
echo "next: pip install faster-whisper && npm run captions"
