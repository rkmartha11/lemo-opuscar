#!/bin/sh
# Render both silent clips (run from the library root). Output: answered/03-onions/lemo/{hook,payoff}.mp4
set -e
D=answered/03-onions/lemo
for c in hook payoff; do
  node core/render/video.mjs $D/src/$c --size 1080x1920 --fps 30 --workers 1 --q ssaa=1.5 --out $D/src/out/$c.mp4
  ffmpeg -y -loglevel error -i $D/src/out/$c.mp4 -an -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -r 30 -movflags +faststart $D/$c.mp4
done
