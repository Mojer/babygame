# Schoolgirl Spine component pack V1

繁體中文版請參閱 `README.zh-TW.md`。

This folder contains 27 independently trimmed RGBA PNG attachments derived from
the approved schoolgirl setup-pose direction.

## Contents

- `png/` — individual transparent attachments for Spine
- `components-manifest.json` — dimensions and source-cell metadata
- `components-preview.png` — visual inventory
- `source-sheets/` — original chroma-key generation sheets

## Import notes

1. Create matching slots using the names in `components-manifest.json`.
2. Assemble the attachments over `../setup/schoolgirl-setup-pose-v1.png` as the
   visual registration reference.
3. Put rear limbs and `skirt_back` behind the torso.
4. Put front limbs and `skirt_front` in front of the torso.
5. Place rotation origins inside the rounded hidden overlap at each joint.
6. Use meshes only for hair, ponytail, skirt panels, and backpack straps during
   the first rig pass.

These are a production **draft component pack**. Generative artwork can vary by
a few pixels between attachments, so verify seams in the setup pose and repaint
small overlaps before final atlas export. Do not animate until the assembled
setup pose has passed a silhouette and seam check.

## Generation prompt set

The built-in image generator received the setup-pose PNG as the authoritative
identity reference and generated four separate chroma-key atlases:

- six head and hair puppet layers
- nine torso, clothing, and accessory layers
- six arm layers with rounded joint overlap
- six leg and shoe layers with rounded joint overlap

Each sheet was requested on uniform `#00FF00`, then locally keyed, edge-despilled,
cleaned of cross-cell fragments, automatically trimmed, and saved as RGBA PNG.
