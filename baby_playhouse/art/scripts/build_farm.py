"""Build the happy farm (開心農場), entered from the cafe's west door.

Layout (north = +Y, matching the reference painting seen from the front):
  north  radish bed + cabbage bed, big tree with a nest in the NE corner
  east   logs growing mushrooms
  south  chick pen + watermelon patch
  west   the entrance (gate posts with lanterns), pumpkin crate, picnic table
  all round: a wooden fence; entrance: a HAPPY FARM arch; centre lawn: a tomato crate and
  birds that fly in (birds and chicks are `dynamic` and animated by the game).
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

import bmesh  # noqa: E402
from mathutils import Matrix, Vector  # noqa: E402

importlib.reload(pb_lib)
from pb_lib import H, ROOM, Builder, collection  # noqa: E402

import bpy  # noqa: E402

ENTRY_Y = 0.4  # gap in the west fence

pb_lib.clear_scene()
palette = pb_lib.build_palette(os.path.join(ROOT, "art", "textures", "palette.png"))
MAT = pb_lib.palette_material(palette)
GLOW = pb_lib.palette_material(palette, "M_PaletteGlow", emissive=True)
room = collection("Room_Farm")
preview = collection("Preview")
b = Builder(room, MAT, GLOW)
rnd = random.Random(5)

# ------------------------------------------------------------------ ground
b.box("floor", (ROOM, ROOM, 0.1), (0, 0, -0.05), "grass", bevel=0.03)
for k, (px, py, r, sx) in enumerate(((-0.9, 0.6, 0.5, 1.4), (0.8, -0.8, 0.45, 1.3), (-0.2, -1.2, 0.35, 1.0))):
    b.ball(f"floor_patch_{k}", r, (px, py, 0.0), "grass_dark", scale=(sx, 1, 0.02), seg=24)
for k in range(5):
    b.cyl(f"floor_stone_{k}", 0.15, 0.02, (-2.5 + k * 0.42, ENTRY_Y + (0.08 if k % 2 else -0.08), 0.01), "sand", seg=16,
          bevel=0.005)
flowers = {c: [] for c in ("white", "lemon", "pink", "lilac")}
for _ in range(40):
    x, y = rnd.uniform(-2.7, 2.7), rnd.uniform(-2.7, 2.7)
    if -1.6 < x < 1.6 and -1.6 < y < 1.2 and rnd.random() < 0.6:
        continue
    flowers[rnd.choice(list(flowers))].append((0.025, (x, y, 0.03)))
for col, fl in flowers.items():
    b.multi_ball(f"floor_flowers_{col}", fl, col, seg=8)


# ------------------------------------------------------------------ outer wooden fence (gap on the west side)
def fence_run(name, pts_from, pts_to, n):
    posts, rails = [], []
    (x0, y0), (x1, y1) = pts_from, pts_to
    for i in range(n + 1):
        t = i / n
        posts.append(((0.09, 0.09, 0.5), (x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, 0.25)))
    ln = math.hypot(x1 - x0, y1 - y0)
    for z in (0.18, 0.38):
        if abs(x1 - x0) > abs(y1 - y0):
            rails.append(((ln, 0.05, 0.06), ((x0 + x1) / 2, (y0 + y1) / 2, z)))
        else:
            rails.append(((0.05, ln, 0.06), ((x0 + x1) / 2, (y0 + y1) / 2, z)))
    b.multi_box(f"{name}_posts", posts, "wood", bevel=0.015)
    b.multi_box(f"{name}_rails", rails, "wood_dark", bevel=0.01)


E = H - 0.08
fence_run("fence_N", (-E, E), (E, E), 14)
fence_run("fence_S", (-E, -E), (E, -E), 14)
fence_run("fence_E", (E, -E), (E, E), 14)
fence_run("fence_W_a", (-E, -E), (-E, ENTRY_Y - 0.6), 6)
fence_run("fence_W_b", (-E, ENTRY_Y + 0.6), (-E, E), 4)
# gate posts with lanterns
for k, gy in enumerate((ENTRY_Y - 0.62, ENTRY_Y + 0.62)):
    b.box(f"gate_post_{k}", (0.14, 0.14, 1.45), (-E, gy, 0.725), "wood_dark", bevel=0.02)
    b.box(f"INT_lantern_{k}", (0.11, 0.11, 0.13), (-E + 0.13, gy, 0.78), "lemon", bevel=0.02, glow=True,
          props={"action": "lamp", "sfx": "click"})
    b.cyl(f"lantern_{k}_roof", 0.1, 0.05, (-E + 0.13, gy, 0.87), "wood_dark", r2=0.02, seg=4, rot=(0, 0, 45), bevel=0)
    b.box(f"lantern_{k}_arm", (0.12, 0.03, 0.03), (-E + 0.07, gy, 0.9), "wood_dark", bevel=0.005)
# HAPPY FARM arch over the entrance, reading towards the farm (+X)
b.box("INT_farmsign", (0.08, 1.56, 0.4), (-E + 0.11, ENTRY_Y, 1.34), "wood_dark", bevel=0.04,
      props={"action": "sparkle", "sfx": "chime"})
b.box("farmsign_face", (0.03, 1.46, 0.31), (-E + 0.16, ENTRY_Y, 1.34), "cream", bevel=0.012)
# flat lettering printed on the board (no depth/bevel, so no side faces or self-shadow)
b.text("farmsign_text", "HAPPY FARM", 0.2, (-E + 0.177, ENTRY_Y, 1.33), "choco", rot=(90, 0, 90), depth=0, bevel=0,
       font="/System/Library/Fonts/Supplemental/Arial Rounded Bold.ttf")
b.empty("DOOR_west", (-H, ENTRY_Y, 0), size=0.4, props={"to": "cafe", "spawn": "DOOR_west"}, shape="SINGLE_ARROW",
        rot=(0, -90, 0))
b.box("doormat_W", (0.5, 1.0, 0.012), (-H + 0.45, ENTRY_Y, 0.006), "sand", bevel=0.005)


# ------------------------------------------------------------------ signs with little 3D icons
def sign(name, x, y, icon, h=0.75, w=0.42, face="S"):
    """Post + board with a tiny 3D icon. face='S' reads towards -Y, face='E' towards +X."""
    rz = 90 if face == "E" else 0

    def at(lx, ly, lz):  # local (across, forward=-Y, up) -> world
        return (x + lx, y + ly, lz) if face == "S" else (x - ly, y + lx, lz)

    b.box(f"{name}_post", (0.06, 0.06, h), at(0, 0, h / 2), "wood_dark", bevel=0.01)
    b.box(f"{name}_board", (w, 0.05, 0.26), at(0, -0.01, h), "wood", rot=(0, 0, rz), bevel=0.03)
    fz, fy = h, -0.05
    if icon == "radish":
        b.ball(f"{name}_icon_a", 0.05, at(0, fy, fz - 0.02), "white", scale=(0.8, 0.5, 1.1), rot=(0, 0, rz))
        b.ball(f"{name}_icon_b", 0.04, at(0, fy, fz + 0.06), "green", scale=(1.4, 0.4, 0.8), rot=(0, 0, rz))
    elif icon == "cabbage":
        b.ball(f"{name}_icon_a", 0.07, at(0, fy, fz), "green", scale=(1, 0.5, 0.9), rot=(0, 0, rz))
    elif icon == "melon":
        b.ball(f"{name}_icon_a", 0.07, at(0, fy, fz), "grass", scale=(1.2, 0.5, 0.9), rot=(0, 0, rz))
        for j, dz in enumerate((-0.035, 0.0, 0.035)):
            b.box(f"{name}_icon_s{j}", (0.13, 0.012, 0.012), at(0, fy - 0.03, fz + dz), "melon", rot=(0, 0, rz), bevel=0)
    elif icon == "mushroom":
        b.ball(f"{name}_icon_a", 0.06, at(0, fy, fz + 0.03), "mushcap", scale=(1.2, 0.5, 0.7), rot=(0, 0, rz))
        b.box(f"{name}_icon_b", (0.03, 0.02, 0.07), at(0, fy, fz - 0.04), "cream", rot=(0, 0, rz), bevel=0.005)
    elif icon == "chick":
        b.ball(f"{name}_icon_a", 0.06, at(0, fy, fz), "yellow", scale=(1, 0.5, 1), rot=(0, 0, rz))
        b.cyl(f"{name}_icon_b", 0.015, 0.03, at(-0.07, fy, fz + 0.01), "orange", r2=0.003, rot=(0, -90, rz), seg=8,
              bevel=0)
    elif icon == "tomato":
        b.ball(f"{name}_icon_a", 0.06, at(0, fy, fz), "red", scale=(1, 0.5, 0.9), rot=(0, 0, rz))


# ------------------------------------------------------------------ north: radish + cabbage beds
def bed(key, x0, x1, y0, y1, soil="choco"):
    w, d = x1 - x0, y1 - y0
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    b.box(f"INT_{key}", (w - 0.12, d - 0.12, 0.12), (cx, cy, 0.06), soil, bevel=0.02,
          props={"action": "harvest", "sfx": "pop"})
    edge = [((w, 0.07, 0.16), (cx, y0 + 0.035, 0.08)), ((w, 0.07, 0.16), (cx, y1 - 0.035, 0.08)),
            ((0.07, d, 0.16), (x0 + 0.035, cy, 0.08)), ((0.07, d, 0.16), (x1 - 0.035, cy, 0.08))]
    b.multi_box(f"{key}_edge", edge, "wood", bevel=0.01)
    return cx, cy


cx, cy = bed("radishbed", -2.7, -0.4, 2.0, 2.75)
for k in range(5):
    x = -2.45 + k * 0.45
    b.ball(f"radishbed_veg_{k}_root", 0.075, (x, cy, 0.17), "white", scale=(1, 1, 1.15))
    for j, rz in enumerate((-25, 0, 25)):
        b.ball(f"radishbed_veg_{k}_leaf_{j}", 0.07, (x + math.sin(math.radians(rz)) * 0.07, cy, 0.34), "green",
               scale=(0.55, 0.4, 1.6), rot=(0, rz, 0))
sign("sign_radish", -1.55, 2.84, "radish")  # on the north fence
cx, cy = bed("cabbagebed", -0.25, 1.75, 2.0, 2.75)
for k in range(3):
    x = 0.08 + k * 0.62
    b.ball(f"cabbagebed_veg_{k}_head", 0.17, (x, cy, 0.24), "green", scale=(1, 1, 0.85))
    for j in range(5):
        a = j * math.tau / 5
        b.ball(f"cabbagebed_veg_{k}_leaf_{j}", 0.1, (x + 0.14 * math.cos(a), cy + 0.14 * math.sin(a), 0.2),
               "grass_dark", scale=(1.3, 1.3, 0.45), rot=(0, 0, math.degrees(a)))
sign("sign_cabbage", 0.75, 2.84, "cabbage")

# NE corner: big tree with a nest and a bird, flowers below
tx, ty = 2.3, 2.25
b.cyl("INT_tree", 0.13, 1.1, (tx, ty, 0.55), "bark", r2=0.09, bevel=0.01, props={"action": "shake", "sfx": "tweet"})
for j, (dx, dy, dz, r) in enumerate(((0, 0, 1.35, 0.5), (0.32, -0.1, 1.2, 0.35), (-0.3, 0.05, 1.22, 0.36),
                                     (0.05, -0.3, 1.5, 0.33), (0.1, 0.25, 1.62, 0.3))):
    b.ball(f"tree_leaves_{j}", r, (tx + dx, ty + dy, dz), "green")
b.torus("tree_nest", 0.11, 0.04, (tx - 0.05, ty - 0.42, 1.4), "bark")
b.ball("tree_nest_bird", 0.06, (tx - 0.05, ty - 0.42, 1.46), "white", scale=(1, 1.2, 0.9))
b.cyl("tree_nest_beak", 0.015, 0.04, (tx - 0.05, ty - 0.5, 1.48), "orange", r2=0.002, rot=(90, 0, 0), seg=8, bevel=0)
for k, (fx_, fy_, col) in enumerate(((1.95, 1.75, "pink"), (2.25, 1.6, "lemon"), (2.6, 1.75, "lilac"), (2.0, 2.65, "coral"))):
    b.cyl(f"tree_flower_stem_{k}", 0.008, 0.14, (fx_, fy_, 0.07), "green", bevel=0)
    b.ball(f"tree_flower_{k}", 0.045, (fx_, fy_, 0.16), col)


# ------------------------------------------------------------------ east: mushroom logs
for k in range(4):
    ly = 0.55 - k * 0.72
    b.cyl("INT_mushlogs" if k == 0 else f"mushlogs_log_{k}", 0.14, 0.72, (2.35, ly, 0.14), "bark", rot=(0, 90, 0),
          bevel=0.02, props={"action": "harvest", "sfx": "pop"} if k == 0 else None)
    b.cyl(f"mushlogs_end_{k}", 0.115, 0.02, (2.72, ly, 0.14), "sand", rot=(0, 90, 0), bevel=0)
    for j in range(3):
        mx = 2.1 + j * 0.24 + rnd.uniform(-0.03, 0.03)
        b.cyl(f"mushlogs_veg_{k}_{j}_stem", 0.028, 0.09, (mx, ly - 0.02, 0.32), "cream", bevel=0.006)
        b.ball(f"mushlogs_veg_{k}_{j}_cap", 0.085, (mx, ly - 0.02, 0.38), "mushcap", scale=(1, 1, 0.55))
fence_run("mushfence", (1.9, -2.75), (1.9, 0.95), 6)
sign("sign_mushroom", 1.96, -0.9, "mushroom", face="E")  # on the mushroom fence


def striped_melon(name, r, loc, scale):
    """Watermelon: light green body with 8 dark stripes running end to end, painted per face
    (two palette swatches) with a little zigzag where the rows step."""
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=32, v_segments=14, radius=r)
    bmesh.ops.rotate(bm, verts=bm.verts, cent=(0, 0, 0), matrix=Matrix.Rotation(math.radians(90), 3, "Y"))  # poles on X
    bmesh.ops.scale(bm, vec=Vector(scale), verts=bm.verts)
    ob = b._finish(name, bm, "grass", loc, (0, 0, 0), True, False, 0, None, None)
    uv = ob.data.uv_layers.active
    light, dark = pb_lib.swatch_uv("grass"), pb_lib.swatch_uv("melon")
    rx = r * scale[0]
    for poly in ob.data.polygons:
        c = poly.center
        lon = int(((math.atan2(c.z / scale[2], c.y / scale[1]) + math.pi) / math.tau) * 32) % 32
        lat = int((c.x / rx + 1) * 7)
        band = ((lon + (lat % 2)) // 2) % 2
        for li in poly.loop_indices:
            uv.data[li].uv = dark if band else light
    return ob


# ------------------------------------------------------------------ south: chick pen + watermelon patch
b.box("pen_dirt", (2.3, 0.75, 0.01), (-1.6, -2.35, 0.006), "sand", bevel=0)
fence_run("penfence", (-2.75, -1.92), (-0.35, -1.92), 6)
b.cyl("pen_bowl", 0.1, 0.05, (-0.7, -2.5, 0.025), "sky_deep", r2=0.07, bevel=0.01)
sign("sign_chick", -2.84, -2.35, "chick", face="E")  # on the west fence by the pen
b.box("melon_dirt", (1.95, 0.75, 0.01), (0.8, -2.35, 0.006), "choco", bevel=0)
fence_run("melonfence", (-0.25, -1.92), (1.8, -1.92), 5)
b.box("INT_melons", (1.8, 0.6, 0.02), (0.8, -2.35, 0.015), "grass_dark", bevel=0.005,
      props={"action": "harvest", "sfx": "pop"})
for k in range(5):
    mx = 0.0 + k * 0.4
    my = -2.35 + (0.08 if k % 2 else -0.08)
    striped_melon(f"melons_veg_{k}_fruit", 0.15, (mx, my, 0.14), (1.2, 1, 0.9))
    b.tube(f"melons_veg_{k}_stem", [(mx + 0.18, my, 0.16), (mx + 0.22, my + 0.02, 0.19), (mx + 0.24, my - 0.01, 0.21)],
           0.008, "green")
b.tube("melons_vine", [(-0.15, -2.2, 0.03), (0.25, -2.5, 0.03), (0.6, -2.2, 0.03), (1.0, -2.5, 0.03), (1.6, -2.25, 0.03)],
       0.015, "green")
sign("sign_melon", 0.8, -2.84, "melon", h=0.62)  # on the south fence


# ------------------------------------------------------------------ west: pumpkin crate + picnic table
pxc, pyc = -2.35, 1.5
b.box("INT_pumpkins", (0.7, 0.55, 0.22), (pxc, pyc, 0.11), "wood", bevel=0.02,
      props={"action": "harvest", "sfx": "pop"})
b.box("pumpkins_hay", (0.62, 0.47, 0.03), (pxc, pyc, 0.23), "lemon", bevel=0.01)
for k, (dx, dy, r) in enumerate(((-0.12, 0.05, 0.16), (0.2, -0.08, 0.1))):
    b.ball(f"pumpkins_veg_{k}_fruit", r, (pxc + dx, pyc + dy, 0.24 + r * 0.8), "orange", scale=(1.2, 1.2, 0.85), seg=20)
    b.cyl(f"pumpkins_veg_{k}_stem", 0.015, 0.06, (pxc + dx, pyc + dy, 0.24 + r * 1.6), "green", bevel=0)
b.cyl("pumpkin_barrel", 0.14, 0.32, (-2.5, 0.95, 0.16), "wood", r2=0.14, bevel=0.02)

tbx, tby = -2.25, -0.9
b.box("picnic_table_top", (0.5, 0.85, 0.04), (tbx, tby, 0.34), "white", bevel=0.01)
for k in range(4):
    b.box(f"picnic_table_check_{k}", (0.5, 0.09, 0.006), (tbx, tby - 0.32 + k * 0.21, 0.362), "red", bevel=0)
for s in (-1, 1):
    b.box(f"picnic_table_leg_{s}", (0.06, 0.6, 0.32), (tbx, tby + s * 0.3, 0.16), "wood_dark", bevel=0.01)
b.box("INT_picnicbench", (0.24, 0.85, 0.05), (tbx + 0.4, tby, 0.24), "wood", bevel=0.015,
      props={"action": "sit", "sfx": "pop"})
for s in (-1, 1):
    b.box(f"picnicbench_leg_{s}", (0.2, 0.05, 0.22), (tbx + 0.4, tby + s * 0.35, 0.11), "wood_dark", bevel=0.01)
b.empty("SNAP_sit_picnic", (tbx + 0.4, tby, 0.27), props={"pose": "sit", "owner": "INT_picnicbench"})


# ------------------------------------------------------------------ centre: 開心農場 sign + tomato crate
tmx, tmy = 1.3, 0.95
b.box("INT_tomatoes", (0.5, 0.36, 0.2), (tmx, tmy, 0.1), "wood", bevel=0.02, props={"action": "harvest", "sfx": "pop"})
for k in range(6):
    b.ball(f"tomatoes_veg_{k}", 0.065, (tmx - 0.16 + (k % 3) * 0.16, tmy - 0.07 + (k // 3) * 0.14, 0.24), "red")
# label board on the crate front with the tomato icon (part of the crate, so tapping it harvests)
b.box("tomatoes_label", (0.3, 0.025, 0.14), (tmx, tmy - 0.19, 0.11), "cream", bevel=0.01)
b.ball("tomatoes_label_icon", 0.045, (tmx, tmy - 0.205, 0.11), "red", scale=(1, 0.45, 0.9))
b.ball("tomatoes_label_leaf", 0.02, (tmx, tmy - 0.21, 0.155), "green", scale=(1.4, 0.4, 0.6))
b.cyl("tomato_barrel", 0.1, 0.22, (tmx + 0.42, tmy - 0.05, 0.11), "wood", bevel=0.015)


# ------------------------------------------------------------------ critters (dynamic, animated by the game)
def bird(key, x, y, turn):
    head_ = f"INT_{key}"
    b.ball(head_, 0.09, (x, y, 0.12), "white", scale=(0.85, 1.25, 0.85), rot=(0, 0, turn),
           props={"action": "bird", "sfx": "tweet", "dynamic": 1})
    a = math.radians(turn)
    fx, fy = -math.sin(a), -math.cos(a)  # forward (-Y rotated)
    b.ball(f"{key}_head", 0.06, (x + fx * 0.09, y + fy * 0.09, 0.22), "white")
    b.cyl(f"{key}_beak", 0.022, 0.07, (x + fx * 0.16, y + fy * 0.16, 0.22), "orange", r2=0.003, rot=(90, 0, turn),
          seg=10, bevel=0)
    for s in (-1, 1):
        rx, ry = math.cos(a) * s, -math.sin(a) * s
        b.ball(f"{key}_eye_{s}", 0.01, (x + fx * 0.12 + rx * 0.035, y + fy * 0.12 + ry * 0.035, 0.24), "black")
        b.ball(f"{key}_wing_{s}", 0.06, (x + rx * 0.07, y + ry * 0.07, 0.13), "cream", scale=(0.35, 1.0, 0.6),
               rot=(0, 0, turn))
        b.cyl(f"{key}_leg_{s}", 0.008, 0.06, (x + rx * 0.03, y + ry * 0.03, 0.03), "orange", bevel=0)
    b.ball(f"{key}_tail", 0.04, (x - fx * 0.11, y - fy * 0.11, 0.15), "cream", scale=(0.8, 1.3, 0.4), rot=(25, 0, turn))


def chick(key, x, y, turn):
    a = math.radians(turn)
    fx, fy = -math.sin(a), -math.cos(a)
    b.ball(f"INT_{key}", 0.075, (x, y, 0.08), "yellow", scale=(1, 1.1, 0.95),
           props={"action": "chick", "sfx": "peep", "dynamic": 1})
    b.ball(f"{key}_head", 0.05, (x + fx * 0.05, y + fy * 0.05, 0.16), "yellow")
    b.cyl(f"{key}_beak", 0.016, 0.04, (x + fx * 0.1, y + fy * 0.1, 0.16), "orange", r2=0.002, rot=(90, 0, turn), seg=8,
          bevel=0)
    for s in (-1, 1):
        rx, ry = math.cos(a) * s, -math.sin(a) * s
        b.ball(f"{key}_eye_{s}", 0.008, (x + fx * 0.085 + rx * 0.025, y + fy * 0.085 + ry * 0.025, 0.175), "black")
        b.ball(f"{key}_wing_{s}", 0.035, (x + rx * 0.065, y + ry * 0.065, 0.085), "lemon", scale=(0.4, 1, 0.6),
               rot=(0, 0, turn))


for k, (x, y, turn) in enumerate(((-0.6, 0.1, 30), (0.5, -0.6, -60), (0.1, 0.6, 160))):
    bird(f"bird_{k}", x, y, turn)
for k, (x, y, turn) in enumerate(((-2.3, -2.35, 20), (-1.6, -2.5, -40), (-1.0, -2.2, 90))):
    chick(f"chick_{k}", x, y, turn)
b.empty("FX_lawn_a", (-1.5, -1.5, 0), props={"fx": "lawn_a"})
b.empty("FX_lawn_b", (1.5, 1.05, 0), props={"fx": "lawn_b"})
b.empty("FX_pen_a", (-2.6, -2.65, 0), props={"fx": "pen_a"})
b.empty("FX_pen_b", (-0.5, -2.05, 0), props={"fx": "pen_b"})

# ------------------------------------------------------------------ markers
pb_lib.nav_and_spawn(b, spawn=(-2.0, ENTRY_Y))
pb_lib.setup_preview(preview)
bpy.context.view_layer.update()
print("objects:", len(room.objects))
