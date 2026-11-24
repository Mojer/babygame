#!/bin/sh
# Render in chunks so the PNGs never fill the disk: each chunk → out/seg_NN.mp4, then delete its frames.
set -e
cd "$(dirname "$0")"
TOTAL=3510; STEP=900; i=0; s=0
mkdir -p out/frames
: > out/segs.txt
while [ $s -lt $TOTAL ]; do
  e=$((s + STEP)); [ $e -gt $TOTAL ] && e=$TOTAL
  python3 resume.py $s $e
  seg=$(printf 'out/seg_%02d.mp4' $i)
  ffmpeg -y -hide_banner -loglevel warning -framerate 60 -start_number $s -i out/frames/%04d.png -frames:v $((e - s)) \
    -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -profile:v high "$seg"
  find out/frames -name '*.png' -type f -delete
  echo "file '$(basename $seg)'" >> out/segs.txt
  echo "chunk $i: $s-$e done"
  s=$e; i=$((i + 1))
done
ffmpeg -y -hide_banner -loglevel warning -f concat -safe 0 -i out/segs.txt -i out/soundtrack.wav -map 0:v -map 1:a \
  -c:v copy -c:a aac -b:a 320k -ar 48000 -shortest -movflags +faststart out/xiangqi-kingdom-seven-classes-1080p60.mp4
find out -name 'seg_*.mp4' -type f -delete
ffprobe -v error -count_frames -show_entries stream=codec_name,width,height,r_frame_rate,nb_read_frames,duration -of compact out/xiangqi-kingdom-seven-classes-1080p60.mp4
