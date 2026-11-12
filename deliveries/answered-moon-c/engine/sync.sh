#!/bin/sh
# copy the shared engine into both tool pages (identical kit/brand/fonts/data)
set -e
SH=/home/user/lemo-opuscar/films/moon-c/shared
for P in /home/user/lemo-opuscar/films/moon-c/page /home/user/OpenMontage/projects/moon-c/page; do
  mkdir -p $P/fonts; cp $SH/index.html $SH/brand.js $SH/data.js $SH/kit.js $SH/boot.js $P/; cp $SH/fonts/*.ttf $P/fonts/
done
cp $SH/shots_lemo.js /home/user/lemo-opuscar/films/moon-c/page/shots.js
[ -f $SH/shots_om.js ] && cp $SH/shots_om.js /home/user/OpenMontage/projects/moon-c/page/shots.js || true
