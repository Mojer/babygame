#!/bin/sh
# Rebuild all three LEGO models from src/ into the served pages one level up.
set -e
cd "$(dirname "$0")"
[ -d ldraw-lib/ldraw ] || { echo "缺少 tools/ldraw-lib：下載 https://library.ldraw.org/library/updates/complete.zip 解壓到 tools/ldraw-lib/"; exit 1; }
node realfit.js ../src/bolt01/index.html bolt-real.json bolt01
node realfit.js ../src/tk16/index.html tk16-real.json tk16
python3 realpatch.py
node build.js ../src/bolt01 ../bolt01.html
node build.js ../src/tk16 ../tk16.html
node realldr.js ../src/bolt01/index.html bolt-real.json ../BOLT-01.ldr
node realldr.js ../src/tk16/index.html tk16-real.json ../TK-16.ldr
node support.js
node export.js
node build3.js
python3 legonav.py ..
