#!/bin/sh
# python3 audio.py → out/soundtrack.wav ; sh shoot.sh render → out/frames ; sh build.sh → mp4
set -e
cd "$(dirname "$0")"
ffmpeg -y -hide_banner -loglevel warning \
  -framerate 60 -i out/frames/%04d.png -i out/soundtrack.wav \
  -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -profile:v high -movflags +faststart \
  -c:a aac -b:a 320k -ar 48000 -shortest \
  out/xiangqi-kingdom-brand-film-1080p60.mp4
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,duration -of compact out/xiangqi-kingdom-brand-film-1080p60.mp4
