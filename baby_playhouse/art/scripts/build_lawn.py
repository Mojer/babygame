"""Build the outdoor lawn (室外草坪): slide, ride-on toy car, rocking horse.

North side is the house's outside wall with the door back to the living
room. West side is a hedge with trees, south/east a low picket fence.
Same 6x6 module and camera as the indoor rooms.
"""
import importlib
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
sys.path.insert(0, HERE)
import pb_lib  # noqa: E402

importlib.reload(pb_lib)
from pb_lib import H, IN_N, ROOM, WALL_H, WALL_T, Builder, collection  # noqa: E402

import bpy  # noqa: E402

N_DOOR_X = 1.0  # back into the living room (matches its south door)

pb_lib.clear_scene()
palette = pb_lib.build_palette(os.path.join(ROOT, "art", "textures", "palette.png"))
MAT = pb_lib.palette_material(palette)
GLOW = pb_lib.palette_material(palette, "M_PaletteGlow", emissive=True)
room = collection("Room_Lawn")
preview = collection("Preview")
b = Builder(room, MAT, GLOW)


# ------------------------------------------------------------------ ground
b.box("floor", (ROOM, ROOM, 0.1), (0, 0, -0.05), "grass", bevel=0.03)
for k, (px, py, r, sx) in enumerate(((-1.6, -1.2, 0.55, 1.5), (1.9, 0.3, 0.45, 1.2), (0.2, -2.1, 0.5, 1.7),
                                     (-0.4, 1.6, 0.4, 1.3), (2.3, -2.2, 0.35, 1.0))):
    b.ball(f"floor_patch_{k}", r, (px, py, 0.0), "grass_dark", scale=(sx, 1, 0.02), seg=24)
# stepping-stone path from the house door towards the middle
for k in range(6):
    t = k / 5
    x = N_DOOR_X + math.sin(t * 2.2) * 0.35 - t * 0.6
    y = IN_N - 0.4 - t * 2.3
    b.cyl(f"floor_stone_{k}", 0.17 - (k % 2) * 0.02, 0.02, (x, y, 0.01), "sand", seg=16, bevel=0.005)


# ------------------------------------------------------------------ house wall (north) with the door
pb_lib._wall_run(b, "house_wall", "x", H, -H - WALL_T, H, N_DOOR_X, WALL_H, WALL_T, "peach", 0.03)
pb_lib.door_frame(b, "N", N_DOOR_X, "white", wall="peach", view_color="peach", view_floor="sand")
b.box("house_eave", (ROOM + 0.5, 0.4, 0.08), (-WALL_T / 2, H - 0.1, WALL_H + 0.03), "coral", bevel=0.03)
b.box("house_skirting", (ROOM, 0.03, 0.12), (0, IN_N - 0.015, 0.06), "white", bevel=0.01)
for k, wx in enumerate((-1.6, 2.35)):
    b.box(f"house_window_{k}_frame", (0.8, 0.05, 0.6), (wx, IN_N - 0.01, 0.95), "white", bevel=0.02)
    b.box(f"house_window_{k}_glass", (0.68, 0.02, 0.48), (wx, IN_N - 0.035, 0.95), "sky", bevel=0)
    b.box(f"house_window_{k}_mullion", (0.03, 0.03, 0.48), (wx, IN_N - 0.05, 0.95), "white", bevel=0)
    b.box(f"house_window_{k}_flowerbox", (0.82, 0.16, 0.12), (wx, IN_N - 0.1, 0.6), "wood", bevel=0.02)
    for j in range(5):
        b.ball(f"house_window_{k}_flower_{j}", 0.045, (wx - 0.32 + j * 0.16, IN_N - 0.1, 0.7),
               ["coral", "lemon", "pink", "lilac", "coral"][j])
b.empty("DOOR_north", (N_DOOR_X, H, 0), size=0.4, props={"to": "living", "spawn": "DOOR_south"}, shape="SINGLE_ARROW",
        rot=(-90, 0, 0))
b.box("doormat_N", (1.0, 0.5, 0.015), (N_DOOR_X, IN_N - 0.35, 0.008), "coral", bevel=0.005)


# ------------------------------------------------------------------ west hedge + trees, south/east fence
b.box("hedge", (0.45, ROOM - 0.2, 0.62), (-H + 0.22, 0, 0.31), "grass_dark", bevel=0.2)
for k in range(9):
    b.ball(f"hedge_bump_{k}", 0.2, (-H + 0.22, -2.6 + k * 0.65, 0.58), "grass_dark", scale=(1.1, 1.2, 0.8))


def tree(key, x, y, scale=1.0, interactive=False):
    head = f"INT_{key}" if interactive else f"{key}_trunk"
    b.cyl(head, 0.09 * scale, 0.7 * scale, (x, y, 0.35 * scale), "bark", r2=0.07 * scale, bevel=0.01,
          props={"action": "shake", "sfx": "rustle"} if interactive else None)
    for j, (dx, dy, dz, r) in enumerate(((0, 0, 0.95, 0.42), (0.25, 0.1, 0.8, 0.3), (-0.22, -0.12, 0.82, 0.3),
                                         (0.05, -0.2, 1.2, 0.28))):
        b.ball(f"{key}_leaves_{j}", r * scale, (x + dx * scale, y + dy * scale, dz * scale), "green")
    if interactive:
        for j, (dx, dy, dz) in enumerate(((0.2, -0.3, 0.9), (-0.25, -0.25, 0.75), (0.05, -0.38, 1.1))):
            b.ball(f"{key}_apple_{j}", 0.045 * scale, (x + dx * scale, y + dy * scale, dz * scale), "red")


tree("tree", -2.3, -1.9, 1.0, interactive=True)
tree("oak_back", -2.35, 2.35, 1.15)

posts = []
rails = []
for k in range(21):
    x = -H + 0.15 + k * 0.285
    posts.append(((0.06, 0.05, 0.36), (x, -H + 0.05, 0.18)))
for k in range(20):
    y = -H + 0.15 + k * 0.285
    posts.append(((0.05, 0.06, 0.36), (H - 0.05, y, 0.18)))
for z in (0.12, 0.26):
    rails.append(((ROOM - 0.1, 0.03, 0.04), (0, -H + 0.08, z)))
    rails.append(((0.03, ROOM - 0.1, 0.04), (H - 0.08, 0, z)))
b.multi_box("fence_posts", posts, "white", bevel=0.012)
b.multi_box("fence_rails", rails, "white", bevel=0.005)


# ------------------------------------------------------------------ slide (溜滑梯)
sx, sy = -1.3, 1.1  # platform centre
TOP = 0.6
b.box("slide_platform", (0.52, 0.52, 0.06), (sx, sy, TOP - 0.03), "lemon", bevel=0.02)
for i, (dx, dy) in enumerate(((1, 1), (1, -1), (-1, 1), (-1, -1))):
    b.cyl(f"slide_post_{i}", 0.03, 1.1, (sx + dx * 0.24, sy + dy * 0.24, 0.55), "sky_deep", bevel=0)
b.cyl("slide_roof", 0.46, 0.22, (sx, sy, 1.2), "coral", r2=0.02, seg=4, rot=(0, 0, 45), bevel=0.01)
for s in (-1, 1):
    b.box(f"slide_guard_{s}", (0.04, 0.5, 0.18), (sx + s * 0.24, sy, TOP + 0.09), "sky_deep", bevel=0.01)
# ladder on the north side
lad_y0, lad_y1 = sy + 0.26, sy + 0.5  # top / bottom
lad_len = math.hypot(lad_y1 - lad_y0, TOP)
lad_ang = math.degrees(math.atan2(lad_y1 - lad_y0, TOP))
for s in (-1, 1):
    b.box(f"slide_ladder_rail_{s}", (0.035, 0.035, lad_len), (sx + s * 0.17, (lad_y0 + lad_y1) / 2, TOP / 2), "sky_deep",
          rot=(lad_ang, 0, 0), bevel=0.008)
for k in range(4):
    t = (k + 0.5) / 4
    b.box(f"slide_ladder_rung_{k}", (0.32, 0.035, 0.025), (sx, lad_y1 - (lad_y1 - lad_y0) * t, TOP * t), "white",
          bevel=0.005)
# ramp down towards the south (camera side)
ry0, ry1, rz1 = sy - 0.26, sy - 1.5, 0.07
rlen = math.hypot(ry0 - ry1, TOP - rz1)
rang = math.degrees(math.atan2(TOP - rz1, ry0 - ry1))
rcy, rcz = (ry0 + ry1) / 2, (TOP + rz1) / 2
b.box("INT_slide", (0.42, rlen, 0.04), (sx, rcy, rcz), "lemon", rot=(rang, 0, 0), bevel=0.015,
      props={"action": "slide", "sfx": "whee"})
for s in (-1, 1):
    b.box(f"slide_rail_{s}", (0.04, rlen, 0.1), (sx + s * 0.21, rcy, rcz + 0.04), "coral", rot=(rang, 0, 0), bevel=0.015)
b.box("slide_lip", (0.42, 0.25, 0.04), (sx, ry1 - 0.11, rz1 - 0.01), "lemon", bevel=0.015)
b.empty("SNAP_slide_top", (sx, sy, TOP), props={"pose": "slide", "owner": "INT_slide"})
b.empty("FX_slide_ladder", (sx, lad_y1 + 0.3, 0), props={"fx": "slide_ladder"})
b.empty("FX_slide_0", (sx, ry0, TOP + 0.02), props={"fx": "slide_0"})
b.empty("FX_slide_1", (sx, ry1, rz1 + 0.02), props={"fx": "slide_1"})
b.empty("FX_slide_2", (sx, ry1 - 0.45, 0), props={"fx": "slide_2"})


# ------------------------------------------------------------------ ride-on toy car (小汽車), facing -Y
cx, cy = 1.35, -0.75
b.box("INT_car", (0.44, 0.66, 0.2), (cx, cy, 0.17), "coral", bevel=0.08, props={"action": "drive", "sfx": "honk"})
b.box("car_hood", (0.4, 0.22, 0.08), (cx, cy - 0.2, 0.3), "coral", bevel=0.035)
b.box("car_seat_back", (0.38, 0.08, 0.22), (cx, cy + 0.28, 0.36), "sky_deep", bevel=0.035)
b.box("car_seat", (0.34, 0.26, 0.04), (cx, cy + 0.13, 0.28), "sky_deep", bevel=0.015)
b.torus("car_wheel_steer", 0.07, 0.012, (cx, cy - 0.06, 0.4), "black", rot=(55, 0, 0))
b.cyl("car_steer_col", 0.012, 0.12, (cx, cy - 0.1, 0.33), "grey_dark", rot=(35, 0, 0), bevel=0)
for i, (dx, dy) in enumerate(((1, 1), (1, -1), (-1, 1), (-1, -1))):
    b.cyl(f"car_wheel_{i}", 0.085, 0.06, (cx + dx * 0.23, cy + dy * 0.21, 0.085), "black", rot=(0, 90, 0), bevel=0.015)
    b.cyl(f"car_hub_{i}", 0.035, 0.065, (cx + dx * 0.235, cy + dy * 0.21, 0.085), "white", rot=(0, 90, 0), bevel=0)
for s in (-1, 1):
    b.ball(f"car_light_{s}", 0.035, (cx + s * 0.13, cy - 0.33, 0.22), "lemon", glow=True)
b.empty("SNAP_sit_car", (cx, cy + 0.12, 0.3), props={"pose": "sit", "owner": "INT_car", "align": 1})


# ------------------------------------------------------------------ rocking horse (搖搖馬), facing -Y
hx, hy = 2.05, 1.25
for s in (-1, 1):
    pts = [(hx + s * 0.15, hy + t, 0.035 + 0.12 * (t / 0.4) ** 2) for t in [(-0.4 + 0.1 * i) for i in range(9)]]
    b.tube(f"horse_rocker_{s}", pts, 0.025, "wood_dark")
for i, (dx, dy) in enumerate(((1, 1), (1, -1), (-1, 1), (-1, -1))):
    b.cyl(f"horse_leg_{i}", 0.028, 0.34, (hx + dx * 0.12, hy + dy * 0.18, 0.24), "white", bevel=0)
b.ball("INT_horse", 0.2, (hx, hy, 0.48), "white", scale=(0.75, 1.35, 0.72), props={"action": "rock", "sfx": "neigh"})
b.ball("horse_neck", 0.1, (hx, hy - 0.22, 0.62), "white", scale=(0.9, 1, 1.4), rot=(-30, 0, 0))
b.ball("horse_head", 0.12, (hx, hy - 0.32, 0.78), "white", scale=(0.8, 1.2, 0.9))
b.ball("horse_snout", 0.07, (hx, hy - 0.44, 0.74), "peach", scale=(1, 1, 0.85))
for s in (-1, 1):
    b.cyl(f"horse_ear_{s}", 0.03, 0.08, (hx + s * 0.05, hy - 0.28, 0.9), "white", r2=0.003, seg=12, bevel=0)
    b.ball(f"horse_eye_{s}", 0.014, (hx + s * 0.07, hy - 0.39, 0.81), "black")
    b.cyl(f"horse_handle_{s}", 0.012, 0.12, (hx + s * 0.08, hy - 0.26, 0.7), "wood_dark", rot=(0, 90, 0), bevel=0)
for k in range(5):
    b.ball(f"horse_mane_{k}", 0.045, (hx, hy - 0.12 - k * 0.05, 0.66 + k * 0.05), "coral")
b.box("horse_saddle", (0.3, 0.24, 0.05), (hx, hy + 0.03, 0.63), "red", bevel=0.02)
for k in range(3):
    b.ball(f"horse_tail_{k}", 0.05 - k * 0.008, (hx, hy + 0.3 + k * 0.05, 0.52 - k * 0.07), "coral")
b.empty("SNAP_sit_horse", (hx, hy + 0.03, 0.66), props={"pose": "sit", "owner": "INT_horse", "align": 1})


# ------------------------------------------------------------------ flower bed + beach ball
fbx, fby = -0.4, -2.5
b.box("flowerbed", (1.6, 0.4, 0.12), (fbx, fby, 0.06), "bark", bevel=0.03)
b.box("INT_flowers", (1.5, 0.32, 0.03), (fbx, fby, 0.125), "choco", bevel=0.01,
      props={"action": "flowers", "sfx": "twinkle"})
fcols = ["coral", "lemon", "pink", "lilac", "orange", "sky"]
for k in range(8):
    x = fbx - 0.65 + k * 0.185
    b.cyl(f"flowers_stem_{k}", 0.01, 0.16, (x, fby + (0.05 if k % 2 else -0.05), 0.2), "green", bevel=0)
    b.ball(f"flowers_bloom_{k}", 0.055, (x, fby + (0.05 if k % 2 else -0.05), 0.3), fcols[k % len(fcols)])
b.ball("INT_ball", 0.16, (0.35, 0.3, 0.16), "white", props={"action": "bounce", "sfx": "boing"})
for k, col in enumerate(("coral", "sky_deep", "lemon")):
    b.ball(f"ball_stripe_{k}", 0.162, (0.35, 0.3, 0.16), col, scale=(0.35, 1, 1), rot=(0, 0, k * 60))


# ------------------------------------------------------------------ markers
pb_lib.nav_and_spawn(b, spawn=(N_DOOR_X, 2.0))
# start positions (the game starts here): the principal front and centre, the others around him
for k, (sx_, sy_) in enumerate(((0.6, -0.35), (-0.35, -0.75), (1.55, 0.35), (-0.2, 0.8), (1.15, 0.95), (0.15, -1.45))):
    b.empty(f"SPAWN_cast_{k}", (sx_, sy_, 0), size=0.2, shape="CIRCLE", rot=(90, 0, 0))
pb_lib.setup_preview(preview)
bpy.context.view_layer.update()
print("objects:", len(room.objects))
