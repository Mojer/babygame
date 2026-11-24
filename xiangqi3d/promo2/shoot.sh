#!/bin/sh
# Headless Chrome against the Vite page (5240) + sink (5241).
#   sh shoot.sh snaps 2,5.5,21   → out/snaps/b*.jpg
#   sh shoot.sh render           → out/frames/0000.png … then sh build.sh
set -e
cd "$(dirname "$0")"
DIR=$(mktemp -d)
case "$1" in
  snaps) Q="snaps=$2" ;;
  render) Q="render${2:+&$2}" ;;
esac
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --user-data-dir="$DIR" \
  --window-size=1920,1200 --hide-scrollbars --mute-audio --disable-background-timer-throttling \
  --disable-renderer-backgrounding --enable-gpu --use-angle=metal --ignore-gpu-blocklist \
  --remote-debugging-port=9334 "http://127.0.0.1:5240/promo2/?$Q" >/dev/null 2>&1 &
PID=$!
while :; do
  sleep 3
  T=$(curl -s http://127.0.0.1:9334/json | python3 -c "import json,sys;print(next((p['title'] for p in json.load(sys.stdin) if p['type']=='page'),''))" 2>/dev/null || true)
  echo "$T"
  [ "$T" = "DONE" ] && break
done
kill $PID
