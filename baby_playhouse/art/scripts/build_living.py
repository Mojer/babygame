"""Build the welcome living room (迎賓客廳) - the hub room where the game starts.

Centre: ring sofa (4 sittable cushions) around a round coffee table, opening
towards the camera. North wall: door to the cafe + TV cabinet + cuckoo clock.
West wall: bookshelf, floor lamp, photo frames. South-east: bean bags.
South low wall has the door out to the lawn.
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
from pb_lib import H, IN_N, IN_W, Builder, collection  # noqa: E402

import bpy  # noqa: E402

N_DOOR_X = -1.5  # to the cafe (matches the cafe's south door)
S_DOOR_X = 1.0  # out to the lawn

pb_lib.clear_scene()
palette = pb_lib.build_palette(os.path.join(ROOT, "art", "textures", "palette.png"))
MAT = pb_lib.palette_material(palette)
GLOW = pb_lib.palette_material(palette, "M_PaletteGlow", emissive=True)
room = collection("Room_Living")
preview = collection("Preview")
b = Builder(room, MAT, GLOW)

# ------------------------------------------------------------------ shell
pb_lib.room_shell(b, wall="peach", trim="white", low="white", floor="sand", doors={"N": N_DOOR_X, "S": S_DOOR_X})
PLANK = 0.4
for i in range(int(pb_lib.ROOM / PLANK)):
    if i % 2:
        b.box(f"floor_plank_{i}", (pb_lib.ROOM - 0.02, PLANK - 0.02, 0.004), (0, -H + PLANK / 2 + i * PLANK, 0.002),
              "cream", bevel=0)
b.box("doormat_N", (1.0, 0.5, 0.015), (N_DOOR_X, IN_N - 0.35, 0.008), "teal", bevel=0.005)
b.box("doormat_S", (1.0, 0.5, 0.015), (S_DOOR_X, -H + 0.35, 0.008), "grass_dark", bevel=0.005)
# coffee-cup plaque above the cafe door
b.box("door_sign", (0.34, 0.03, 0.26), (N_DOOR_X, IN_N, pb_lib.DOOR_H + 0.2), "wood", bevel=0.04)
b.cyl("door_sign_cup", 0.06, 0.09, (N_DOOR_X, IN_N - 0.05, pb_lib.DOOR_H + 0.19), "white", bevel=0.01)
b.torus("door_sign_cup_handle", 0.028, 0.009, (N_DOOR_X + 0.07, IN_N - 0.05, pb_lib.DOOR_H + 0.2), "white",
        rot=(90, 0, 0))

# welcome bunting along the top of the north and west walls
flag_cols = ["coral", "lemon", "mint", "sky", "lilac", "pink"]
pts = []
for i in range(19):
    x = -2.85 + i * 0.3
    sag = 0.1 * math.sin(math.pi * ((i / 18 * 2) % 1))
    pts.append((x, IN_N - 0.04, 1.43 - sag))
b.tube("bunting_cord", pts, 0.008, "choco")
for i, (x, y, z) in enumerate(pts[1:-1], 1):
    b.cyl(f"bunting_flag_{i:02d}", 0.075, 0.012, (x, y - 0.01, z - 0.07), flag_cols[i % len(flag_cols)],
          rot=(90, 90, 0), seg=3, bevel=0)  # triangle facing -Y, tip down


# ------------------------------------------------------------------ ring sofa + coffee table (centre)
C = (0.3, -0.3)
R_IN, R_OUT = 0.9, 1.35
A0, A1 = -5, 275  # opening centred at -45 deg, i.e. facing the south-east camera
b.cyl("rug_ring", 1.8, 0.012, (C[0], C[1], 0.006), "lemon", seg=48, bevel=0)
b.arc_block("sofa_base", C, R_IN, R_OUT, A0, A1, 0, 0.2, "sofa", seg=40, bevel=0.03)
b.arc_block("sofa_back", C, R_OUT - 0.17, R_OUT + 0.02, A0, A1, 0.2, 0.52, "sofa", seg=40, bevel=0.04)
cushion_cols = ["coral", "lemon", "lilac", "mint"]
span = (A1 - A0) / 4
for i in range(4):
    a0 = A0 + i * span
    a1 = a0 + span
    b.arc_block(f"INT_sofa_seat_{i}", C, R_IN + 0.02, R_OUT - 0.17, a0 + 2, a1 - 2, 0.2, 0.3, cushion_cols[i], seg=10,
                bevel=0.035, props={"action": "sit", "sfx": "squish"})
    mid = math.radians((a0 + a1) / 2)
    b.empty(f"SNAP_sit_sofa_{i}", (C[0] + 1.03 * math.cos(mid), C[1] + 1.03 * math.sin(mid), 0.3),
            props={"pose": "sit", "owner": f"INT_sofa_seat_{i}"})
# round coffee table
b.cyl("coffee_table_top", 0.24, 0.04, (C[0], C[1], 0.26), "white", seg=32, bevel=0.015)
b.cyl("coffee_table_leg", 0.05, 0.24, (C[0], C[1], 0.12), "wood", bevel=0)
b.cyl("INT_cookies", 0.09, 0.015, (C[0] - 0.06, C[1] + 0.05, 0.29), "white", seg=24, bevel=0.005,
      props={"action": "eat", "sfx": "yum"})
for k in range(4):
    a = k * math.pi / 2 + 0.4
    b.cyl(f"cookies_{k}", 0.028, 0.015, (C[0] - 0.06 + 0.045 * math.cos(a), C[1] + 0.05 + 0.045 * math.sin(a), 0.305),
          "orange", bevel=0.005)
b.ball("INT_teapot", 0.07, (C[0] + 0.09, C[1] - 0.05, 0.34), "sky", scale=(1, 1, 0.85),
       props={"action": "brew", "sfx": "coffee"})
b.cyl("teapot_spout", 0.015, 0.08, (C[0] + 0.17, C[1] - 0.05, 0.36), "sky", rot=(0, 55, 0), bevel=0)
b.ball("teapot_lid", 0.025, (C[0] + 0.09, C[1] - 0.05, 0.4), "white")
b.torus("teapot_handle", 0.035, 0.01, (C[0] + 0.02, C[1] - 0.05, 0.35), "sky", rot=(90, 0, 0))


# ------------------------------------------------------------------ north wall: TV cabinet + clock
tvx = 1.35
b.box("tv_cabinet", (1.3, 0.4, 0.32), (tvx, IN_N - 0.2, 0.16), "wood", bevel=0.03)
b.box("tv_cabinet_top", (1.34, 0.43, 0.03), (tvx, IN_N - 0.21, 0.335), "wood_dark", bevel=0.01)
for k, dx in enumerate((-0.32, 0.32)):
    b.box(f"tv_cabinet_door_{k}", (0.58, 0.02, 0.22), (tvx + dx, IN_N - 0.405, 0.16), "cream", bevel=0.015)
    b.ball(f"tv_cabinet_knob_{k}", 0.015, (tvx + dx * 0.2, IN_N - 0.42, 0.18), "wood_dark")
b.box("tv_body", (0.8, 0.22, 0.5), (tvx, IN_N - 0.2, 0.6), "coral", bevel=0.07)
b.box("INT_tv", (0.62, 0.02, 0.36), (tvx - 0.05, IN_N - 0.315, 0.6), "sky_deep", bevel=0.03,
      props={"action": "tv", "sfx": "tv"})
for k in range(2):
    b.ball(f"tv_knob_{k}", 0.025, (tvx + 0.31, IN_N - 0.315, 0.66 - k * 0.1), "lemon")
for s in (-1, 1):
    b.cyl(f"tv_antenna_{s}", 0.008, 0.28, (tvx + s * 0.08, IN_N - 0.2, 0.95), "grey", rot=(0, s * 25, 0), bevel=0)
    b.ball(f"tv_antenna_tip_{s}", 0.02, (tvx + s * 0.14, IN_N - 0.2, 1.07), "coral")
b.box("tv_remote", (0.05, 0.12, 0.02), (tvx - 0.5, IN_N - 0.3, 0.36), "grey_dark", bevel=0.008)
# cuckoo clock between the door and the TV
ckx = 0.15
b.box("INT_clock", (0.3, 0.1, 0.3), (ckx, IN_N - 0.05, 1.05), "wood", bevel=0.03, props={"action": "cuckoo", "sfx": "cuckoo"})
b.cyl("clock_roof", 0.24, 0.12, (ckx, IN_N - 0.05, 1.26), "wood_dark", r2=0.01, seg=4, rot=(0, 0, 45), bevel=0)
b.cyl("clock_face", 0.1, 0.015, (ckx, IN_N - 0.105, 1.03), "white", rot=(90, 0, 0), seg=32, bevel=0)
b.box("clock_hand_min", (0.012, 0.01, 0.08), (ckx, IN_N - 0.118, 1.06), "black", bevel=0)
b.box("clock_hand_hour", (0.055, 0.01, 0.012), (ckx + 0.02, IN_N - 0.118, 1.03), "black", bevel=0)
b.ball("clock_bird", 0.03, (ckx, IN_N - 0.1, 1.16), "yellow")
for s in (-1, 1):
    b.cyl(f"clock_weight_{s}", 0.018, 0.08, (ckx + s * 0.06, IN_N - 0.06, 0.75), "yellow", bevel=0.005)


# ------------------------------------------------------------------ west wall: bookshelf, lamp, photos
bsy = 1.35
# open-front shelf: back panel (the INT head) + sides + boards, so the books show
b.box("INT_bookshelf", (0.04, 1.2, 1.1), (IN_W + 0.02, bsy, 0.55), "wood_dark", bevel=0.01,
      props={"action": "books", "sfx": "page"})
for s_ in (-1, 1):
    b.box(f"bookshelf_side_{s_}", (0.36, 0.05, 1.1), (IN_W + 0.18, bsy + s_ * 0.575, 0.55), "wood", bevel=0.015)
b.box("bookshelf_top", (0.38, 1.22, 0.05), (IN_W + 0.19, bsy, 1.1), "wood", bevel=0.015)
for k in range(4):
    b.box(f"bookshelf_board_{k}", (0.34, 1.12, 0.035), (IN_W + 0.19, bsy, 0.04 + k * 0.33), "wood", bevel=0.005)
book_cols = ["coral", "sky_deep", "lemon", "mint", "plum", "orange", "pink"]
books = {col: [] for col in book_cols}
import random  # noqa: E402

rnd = random.Random(7)
for shelf in range(3):
    y = bsy - 0.5
    z0 = 0.058 + shelf * 0.33
    while y < bsy + 0.5:
        w = rnd.choice((0.05, 0.06, 0.07))
        hgt = rnd.uniform(0.17, 0.25)
        col = rnd.choice(book_cols)
        books[col].append(((0.22, w - 0.008, hgt), (IN_W + 0.22, y + w / 2, z0 + hgt / 2)))
        y += w
        if rnd.random() < 0.12:
            y += 0.08
for col, bx in books.items():
    if bx:
        b.multi_box(f"bookshelf_books_{col}", bx, col, bevel=0.006)
b.ball("bookshelf_globe", 0.07, (IN_W + 0.2, bsy + 0.35, 1.18), "sky")
# floor lamp
lx, ly = IN_W + 0.35, 0.35
b.cyl("lamp_base", 0.13, 0.03, (lx, ly, 0.015), "grey_dark", bevel=0.01)
b.cyl("lamp_pole", 0.015, 0.95, (lx, ly, 0.5), "grey_dark", bevel=0)
b.cyl("INT_lamp", 0.18, 0.22, (lx, ly, 1.05), "lemon", r2=0.1, seg=24, bevel=0.01, glow=True,
      props={"action": "lamp", "sfx": "click"})
# photo frames
for k, (fy, fz, col) in enumerate(((-0.6, 0.95, "sky"), (-1.1, 1.05, "pink"), (-1.55, 0.9, "mint"))):
    b.box(f"photo_{k}", (0.03, 0.3, 0.24), (IN_W + 0.01, fy, fz), "wood", bevel=0.015)
    b.box(f"photo_{k}_pic", (0.02, 0.24, 0.18), (IN_W + 0.025, fy, fz), col, bevel=0)
    b.ball(f"photo_{k}_heart", 0.03, (IN_W + 0.035, fy, fz), "white", scale=(0.3, 1, 1))


# ------------------------------------------------------------------ bean bags (懶人沙發) + plants
for k, (bx_, by_, col) in enumerate(((2.35, -1.25, "orange"), (1.85, -2.35, "plum"), (-2.1, -2.2, "sky_deep"))):
    b.ball(f"INT_beanbag_{k}", 0.3, (bx_, by_, 0.15), col, scale=(1, 1, 0.55), seg=28,
           props={"action": "sit", "sfx": "squish"})
    b.ball(f"beanbag_{k}_back", 0.22, (bx_ + 0.12, by_ + 0.12, 0.3), col, scale=(1, 1, 0.8), seg=24)
    b.empty(f"SNAP_sit_beanbag_{k}", (bx_ - 0.04, by_ - 0.04, 0.24), props={"pose": "sit", "owner": f"INT_beanbag_{k}"})
for k, (px, py) in enumerate(((2.55, 2.55), (-2.6, -2.6))):
    b.cyl(f"plant_{k}_pot", 0.14, 0.24, (px, py, 0.12), "coral", r2=0.17, bevel=0.02)
    for j, (dx, dy, dz, r) in enumerate(((0, 0, 0.38, 0.15), (0.07, 0.05, 0.5, 0.1), (-0.06, -0.05, 0.48, 0.09))):
        b.ball(f"plant_{k}_leaves_{j}", r, (px + dx, py + dy, dz), "green")


# ------------------------------------------------------------------ markers
pb_lib.nav_and_spawn(b, spawn=(1.2, -1.5))
# start positions for the cast (capybara principal greets at the sofa opening)
for k, (sx, sy) in enumerate(((1.35, -1.35), (-0.9, -1.8), (2.0, 0.5), (-1.3, 0.2), (-0.2, -2.2), (2.2, -0.3))):
    b.empty(f"SPAWN_cast_{k}", (sx, sy, 0), size=0.2, shape="CIRCLE", rot=(90, 0, 0))
b.empty("DOOR_north", (N_DOOR_X, H, 0), size=0.4, props={"to": "cafe", "spawn": "DOOR_south"}, shape="SINGLE_ARROW",
        rot=(-90, 0, 0))
b.empty("DOOR_south", (S_DOOR_X, -H, 0), size=0.4, props={"to": "lawn", "spawn": "DOOR_north"}, shape="SINGLE_ARROW",
        rot=(90, 0, 0))

pb_lib.setup_preview(preview)
bpy.context.view_layer.update()
print("objects:", len(room.objects))
