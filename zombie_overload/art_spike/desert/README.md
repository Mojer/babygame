# 沙漠冥域 · STAGE 04

Generated with Codex's built-in image_gen tool (host_image); each real prompt is
saved beside its corresponding source. Native output dimensions are measured,
not inferred from prompts. Ground is 1254², fitted to the 2048² world. No new API
key or image/video API was used. No generated video is claimed.

Five individual generated masters: mummy, jackal, scarab, reaper and titan.
`pack_desert.py` samples eight bilinear joint-deformed poses per master, fixed
canvas/feet anchors, plus hit/frozen/corpse states. `src/render/desertMotion.ts`
adds per-kind cadence, lean and lift, with individual phase offsets. Simulation
clock controls playback; frozen enemies stay still. 40 distinct frames, clear
transparent borders; animation-qa.json records the checks. `motion-runtime.gif`
contains 32 actual browser captures of the official ParticleContainer and
runtime motion function; motion-proof/qa.json checks every creature changed.
This is code-driven cutout animation made from generated stills.

Props first draft had an opaque backdrop and unsuitable spacing, so it was
rejected. props-v2-source.png is the accepted native-alpha edit. Its columns are
irregular: measured component bounds in prop-source-boxes.json preserve whole
objects and exclude neighboring props. No equal-grid assumption is made.
The transparent object border checks run before packing.

Rebuild from project root with Python 3.10+, Pillow, numpy:

    python art_spike/desert/pack_desert.py

The input is the accepted horde_detail atlas from the first three stages. New
assets append into horde_world without moving or altering old frame definitions;
all four stages use one 2048x4096 GPU source (32 MiB). Logical sizes stay in
world units, texture resolution is 2. The complete source atlas, high-resolution
player, depth sorting and low-allocation horde batching are retained.

Data: map-layout.json is built from buildMap(42, 'desert'), blocked grid copied
as an array. map-bundle.json copies the game's exact blocked rectangles and
landmark positions, not inferred painted collision. `map_bundle.py validate`
passes with zero warnings; nav/nav-report.json has six reachable targets and no
thin gaps. scene-snapshot.json uses the shared map runtime to walk all six routes
at speed 82. preview/ is the scene preview; its browser automation verify was
not requested. The Node runtime routes and real game browser were checked.

Tests: 37 unit/integration tests, including three seeds with all open cells
reachable, 48px spawn clearance, traversable gate opening, final titan victory,
eight-frame runtime cadence, and shared-atlas bounds/old-frame preservation.
Browser: desktop 1280x720, real 390x844 iframe responsive layout; chosen-stage
state, fixed actions and selection-to-equipment navigation verified. These are
layout checks, not physical mobile-device performance measurements.

Screenshots: stage-selection.png, mobile-selection.png, gameplay.png.
Archive: python tools/collect_artwork.py copies sources, prompts, runtime art,
processed frames and previews into artwork/ with SHA-256 checks.
