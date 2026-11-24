#!/bin/sh
cd "$(dirname "$0")/out/snaps" && rm -rf ../seq && mkdir ../seq && i=0
for f in $(ls b*.jpg | sed 's/^b//;s/\.jpg$//' | sort -g); do cp "b$f.jpg" ../seq/$(printf %02d $i).jpg; i=$((i+1)); done
ffmpeg -y -hide_banner -loglevel error -i ../seq/%02d.jpg -vf "scale=480:-1,tile=4x5:padding=4" -frames:v 1 ../sheet.jpg
