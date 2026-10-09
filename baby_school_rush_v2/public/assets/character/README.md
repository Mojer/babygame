# Schoolgirl Spine export target

Place the matching Spine 4.3 export here:

```text
schoolgirl.skel
schoolgirl.atlas
schoolgirl.png
```

Enable it locally with:

```sh
VITE_SPINE_CHARACTER=1 pnpm dev
```

Required animation names:

```text
idle
run
run_fast
rush
jump_up
jump_apex
fall
land
slide_start
slide_loop
slide_end
hit
victory
```

Export from Spine Editor 4.3.x to match `@esotericsoftware/spine-phaser-v4@4.3.11`.

## Running-material reference

`reference/schoolgirl-run-keyposes-v1.png` is the first transparent character-art
reference generated for the V2 runner. It establishes the working direction:
cream school blouse, muted rose skirt and backpack, dark safety shorts, teal
socks, cream running shoes, right-facing profile, and a compact athletic
silhouette.

This PNG is a **visual/key-pose reference**, not a shippable sprite animation.
The image model kept the character design consistent, but did not produce a
strict opposite-foot pair for all four poses. Do not import the figures as a
looping spritesheet. Use the design as the source for the layered Spine build,
then author the run cycle on the rig in this exact sequence:

1. Contact L
2. Down L
3. Passing L
4. Up L
5. Contact R
6. Down R
7. Passing R
8. Up R

The Root bone stays fixed on X. Left/right phases must be mirrored at the bone
level, arms oppose legs, and foot contacts must not slide. Add hair, skirt, and
backpack follow-through only after the body mechanics are approved.

## Setup-pose master

The first rigging master is available at
`setup/schoolgirl-setup-pose-v1.png`. Use `setup/SPINE_SETUP_V1.md` and
`setup/schoolgirl-rig-plan-v1.json` when rebuilding it as a layered PSD and
creating the initial Spine tree.

The first separated attachment pack is available under `components/png/`.
Review `components/components-preview.png` and `components/README.md` before
assembling the Spine setup pose.

The Blender-authored run-cycle pose guide is available under
`blender-run-guide/`. It can be used as the structural reference for generating
consistent 2D run frames without Spine.
