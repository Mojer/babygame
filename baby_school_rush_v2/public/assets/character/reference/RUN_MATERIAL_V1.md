# Schoolgirl runner — key-pose reference V1

## Purpose

Art-direction and tracing reference for the layered Spine character. This is not
the final runtime spritesheet.

## Source image

`schoolgirl-run-keyposes-v1.png` — 2073 × 758 RGBA PNG with transparent alpha.

## Character lock

- Right-facing Taiwanese middle-school runner
- Dark brown bob with short tied side ponytail
- Cream short-sleeve school blouse
- Muted rose pleated skirt and small backpack
- Dark fitted safety shorts
- Deep teal knee socks
- Cream running shoes with aqua accents
- Warm cream, rose, forest-teal, and aqua palette

## Production rule

Trace and repaint the character into separate, overlap-safe parts before rigging.
Do not animate the four generated figures directly. The approved 8-pose run
cycle is built in Spine so left/right contacts, pelvis height, limb opposition,
and foot locking can be controlled deterministically.

## Generation prompt summary

The built-in image generator was asked for four equally spaced, transparent,
right-facing, orthographic run-cycle key poses with consistent proportions and
clean cel-shaded shapes suitable for a Spine 2D game character reference.
