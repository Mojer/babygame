# Schoolgirl Spine setup V1

繁體中文版請參閱 `SPINE_SETUP_V1.zh-TW.md`。

## Master artwork

`schoolgirl-setup-pose-v1.png` is a 1024 × 1536 RGBA setup-pose master with a
genuine transparent background. It is the visual source for redrawing the
layered PSD; it is not itself a layered file.

## PSD canvas and origin

- Keep the PSD at 1024 × 1536.
- Keep the character at the same scale and position as the master.
- Use `(512, 805)` as the initial Spine root/pelvis reference.
- Do not trim individual layers before PSD import.
- Paint 10–15% overlap underneath every rotating joint.
- Reconstruct hidden anatomy instead of cutting only the visible pixels.

## Required PSD layer order

Listed back-to-front:

```text
hair_back
ponytail_02
ponytail_01
backpack
arm_rear_upper
arm_rear_lower
hand_rear
leg_rear_thigh
leg_rear_calf
shoe_rear
skirt_back
torso
shorts
leg_front_thigh
leg_front_calf
shoe_front
skirt_front
arm_front_upper
arm_front_lower
hand_front
neck
head_base
face
eyes
hair_front
bow
backpack_strap
```

## Paint-under requirements

- `head_base`: paint a complete skull under both hair layers.
- `torso`: paint the blouse under the bow, straps, arms, skirt waistband, and
  backpack edge.
- `arm_*_upper`: include each sleeve and extend the shoulder beneath the torso.
- `arm_*_lower`: extend beneath the elbow and hand.
- `shorts`: paint the entire pelvis/shorts shape under both skirt layers.
- `leg_*_thigh`: extend to the hip pivot beneath the shorts.
- `leg_*_calf`: extend beneath the knee and sock edge.
- `shoe_*`: include the full ankle beneath each sock.
- `skirt_front` and `skirt_back`: keep separate silhouettes so they can receive
  separate meshes and follow-through.
- `backpack_strap`: keep independent from the backpack body and blouse.

## Rigging order

1. Import the layered PSD.
2. Build the root, pelvis, spine, chest, neck, and head chain.
3. Build rear limbs, then front limbs.
4. Add foot IK targets and test contact poses.
5. Add simple meshes to hair, skirt, and backpack strap only.
6. Complete the body run cycle before adding secondary motion.

The initial bone coordinates and slot order are recorded in
`schoolgirl-rig-plan-v1.json`.
