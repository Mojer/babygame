#!/bin/sh
# 1) python3 audio.py                      → out/soundtrack.wav   (from score.json)
# 2) node server.mjs 5214 + vite, open /promo/?render → out/frames/0000-1799.png
# 3) sh build.sh                           → out/baby-playhouse-akane-kirakira-noblush-1080p.mp4
set -e
cd "$(dirname "$0")"
FPS=$(python3 -c "import json;print(json.load(open('score.json'))['fps'])")
ffmpeg -y -hide_banner -loglevel warning \
  -framerate "$FPS" -i out/frames/%04d.png -i out/soundtrack.wav \
  -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -profile:v high -movflags +faststart \
  -c:a aac -b:a 320k -ar 48000 -shortest \
  out/baby-playhouse-akane-kirakira-noblush-1080p.mp4
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,duration -of compact out/baby-playhouse-akane-kirakira-noblush-1080p.mp4
