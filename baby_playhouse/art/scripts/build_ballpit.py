"""Build the ball-pit play room (球池房間), east of the living room.

Centre: a big round ball pit (characters sink in). Around it: three giant
rollable balls (marked `dynamic` so they stay out of the baked walk grid),
a round trampoline in the north-east corner and a swim-ring swing in the
north-west corner. West wall door leads back to the living room.
"""
import importlib
import math
import os
import random
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
sys.path.insert(0, HERE)
import pb_lib  # noqa: E402

importlib.reload(pb_lib)
from pb_lib import H, IN_N, IN_W, Builder, collection  # noqa: E402

import bpy  # noqa: E402

W_DOOR_Y = 0.6  # matches the living room's east door

pb_lib.clear_scene()
palette = pb_lib.build_palette(os.path.join(ROOT, "art", "textures", "palette.png"))
MAT = pb_lib.palette_material(palette)
GLOW = pb_lib.palette_material(palette, "M_PaletteGlow", emissive=True)
room = collection("Room_Ballpit")
preview = collection("Preview")
b = Builder(room, MAT, GLOW)
rnd = random.Random(11)
BALL_COLS = ["coral", "lemon", "sky_deep", "mint", "lilac"]

# ------------------------------------------------------------------ shell: lemon walls, puzzle-mat floor
pb_lib.room_shell(b, wall="lemon", trim="white", low="white", floor="sand", doors={"W": W_DOOR_Y},
                  views={"W": ("peach", "sand")})
mats = {col: [] for col in ("coral", "mint", "sky", "lemon")}
order = list(mats)
for i in range(6):
    for j in range(6):
        col = order[(i + j * 2) % len(order)]
        mats[col].append(((0.98, 0.98, 0.012), (-H + 0.5 + i, -H + 0.5 + j, 0.006)))
for col, boxes in mats.items():
    b.multi_box(f"floor_mats_{col}", boxes, col, bevel=0.004)
b.box("doormat_W", (0.5, 1.0, 0.015), (IN_W + 0.35, W_DOOR_Y, 0.018), "lilac", bevel=0.005)
# rainbow on the north wall (half rings, the lower half hidden under the floor)
for k, col in enumerate(("coral", "orange", "lemon", "mint", "sky_deep", "lilac")):
    b.torus(f"rainbow_{k}", 1.05 - k * 0.11, 0.05, (0.3, IN_N - 0.03, 0.1), col, rot=(90, 0, 0), seg=40,
            arc=(0, 180))
for k, (sx, sz, col) in enumerate(((-2.2, 1.05, "coral"), (-1.4, 1.25, "sky_deep"), (2.2, 1.15, "mint"))):
    b.cyl(f"wall_star_{k}", 0.12, 0.02, (sx, IN_N - 0.01, sz), col, rot=(90, 0, 0), seg=5, bevel=0)

# ------------------------------------------------------------------ central ball pit
C = (0.3, -0.25)
R_IN, R_OUT = 1.05, 1.3
b.cyl("INT_ballpit", R_IN, 0.2, (C[0], C[1], 0.1), "sky", seg=40, bevel=0,
      props={"action": "ballpit", "sfx": "rattle"})
b.arc_block("ballpit_wall", C, R_IN, R_OUT, 0, 360, 0, 0.32, "sky_deep", seg=48, bevel=0.03)
b.torus("ballpit_rim", (R_IN + R_OUT) / 2, 0.08, (C[0], C[1], 0.34), "coral", seg=48)
balls = {col: [] for col in BALL_COLS}
for layer, z in enumerate((0.2, 0.26, 0.31)):
    n = (150, 140, 90)[layer]
    for _ in range(n):
        a = rnd.uniform(0, math.tau)
        rr = R_IN * 0.95 * math.sqrt(rnd.random())
        balls[rnd.choice(BALL_COLS)].append(
            (0.075, (C[0] + rr * math.cos(a), C[1] + rr * math.sin(a), z + rnd.uniform(-0.02, 0.02))))
for col, bl in balls.items():
    b.multi_ball(f"ballpit_balls_{col}", bl, col, seg=12)
# sit-in spot on the camera side of the pit
b.empty("SNAP_bath_ballpit", (C[0] + 0.42, C[1] - 0.42, 0.2), props={"pose": "bath", "owner": "INT_ballpit"})

# ------------------------------------------------------------------ giant rollable balls (dynamic)
for k, (gx, gy, col, stripe) in enumerate(((2.25, -1.55, "coral", "white"), (-1.85, -1.75, "lemon", "sky_deep"),
                                            (-0.75, 1.85, "sky_deep", "lemon"))):
    r = 0.3
    b.ball(f"INT_bigball_{k}", r, (gx, gy, r), col, seg=28, props={"action": "roll", "sfx": "boing", "dynamic": 1})
    for j in range(2):
        b.ball(f"bigball_{k}_stripe_{j}", r * 1.006, (gx, gy, r), stripe, scale=(0.3, 1, 1), rot=(0, 0, j * 90),
               seg=28)

# ------------------------------------------------------------------ trampoline (north-east corner)
tx, ty = 2.0, 1.85
TR = 0.55
for k in range(6):
    a = k * math.tau / 6
    b.cyl(f"trampoline_leg_{k}", 0.025, 0.18, (tx + TR * math.cos(a), ty + TR * math.sin(a), 0.09), "grey_dark", bevel=0)
b.torus("trampoline_frame", TR, 0.035, (tx, ty, 0.19), "grey", seg=36)
b.cyl("INT_trampoline", TR - 0.05, 0.02, (tx, ty, 0.2), "black", seg=36, bevel=0,
      props={"action": "trampoline", "sfx": "boing"})
b.torus("trampoline_pad", TR + 0.02, 0.07, (tx, ty, 0.215), "sky_deep", seg=36)
b.empty("SNAP_jump_trampoline", (tx, ty, 0.21), props={"pose": "jump", "owner": "INT_trampoline"})

# ------------------------------------------------------------------ swim-ring swing (north-west corner), faces -Y
sx, sy = -1.75, 2.0
BAR_Z = 1.25
for s_ in (-1, 1):
    x = sx + s_ * 0.62
    for t in (-1, 1):
        b.tube(f"swingframe_leg_{s_}_{t}", [(x, sy + t * 0.5, 0.0), (x, sy, BAR_Z)], 0.035, "coral")
b.cyl("swingframe_bar", 0.04, 1.36, (sx, sy, BAR_Z), "coral", rot=(0, 90, 0), bevel=0.01)
for s_ in (-1, 1):
    b.tube(f"swingseat_rope_{s_}", [(sx + s_ * 0.17, sy, BAR_Z), (sx + s_ * 0.17, sy, 0.43)], 0.012, "white")
for k in range(8):
    b.torus("INT_swingseat" if k == 0 else f"swingseat_ring_{k}", 0.19, 0.075, (sx, sy, 0.38),
            "red" if k % 2 == 0 else "white", seg=32, arc=(k * 45, (k + 1) * 45),
            props={"action": "swingseat", "sfx": "whee"} if k == 0 else None)
b.empty("SNAP_sit_swing", (sx, sy, 0.43), props={"pose": "sit", "owner": "INT_swingseat", "align": 1})
b.empty("FX_swing_axis", (sx, sy, BAR_Z), props={"fx": "swing_axis"})

# ------------------------------------------------------------------ shoe cubby by the door (no shoes in the pit!)
cx, cy = IN_W + 0.2, -0.5
# open-front cubby: back panel (the INT head) + sides + shelves so the shoes show
b.box("INT_cubby", (0.04, 0.7, 0.44), (IN_W + 0.02, cy, 0.22), "wood_dark", bevel=0.01,
      props={"action": "bounce", "sfx": "pop"})
for s_ in (-1, 1):
    b.box(f"cubby_side_{s_}", (0.36, 0.04, 0.44), (cx, cy + s_ * 0.33, 0.22), "wood", bevel=0.012)
for k in range(3):
    b.box(f"cubby_shelf_{k}", (0.36, 0.66, 0.03), (cx, cy, 0.03 + k * 0.2), "wood", bevel=0.006)
for k, (dy, dz, col) in enumerate(((-0.15, 0.08, "coral"), (0.12, 0.08, "sky_deep"), (-0.1, 0.28, "pink"),
                                   (0.16, 0.28, "lemon"))):
    b.ball(f"cubby_shoe_{k}", 0.05, (cx + 0.06, cy + dy, dz), col, scale=(1.3, 0.8, 0.6))

# ------------------------------------------------------------------ markers
pb_lib.nav_and_spawn(b, spawn=(-2.0, W_DOOR_Y))
b.empty("DOOR_west", (-H, W_DOOR_Y, 0), size=0.4, props={"to": "living", "spawn": "DOOR_east"}, shape="SINGLE_ARROW",
        rot=(0, -90, 0))

pb_lib.setup_preview(preview)
bpy.context.view_layer.update()
print("objects:", len(room.objects))
