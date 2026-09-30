"""Build 茜 (Akane) from her character sheet, in the cast's chibi 2-head style.

Long straight dark-brown hair with blunt bangs, pink polo shirt with white
collar and cuffs, grey pleated suspender skirt, pink backpack, black socks
and beige sneakers. Faces -Y, feet at z=0. Export with export_all.py ->
char_akane.glb.

Child parts use locations relative to their parent (legs carry sock + shoe
+ shin so the game's walk swing moves them together; arms carry sleeves).
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
from pb_lib import Builder, collection  # noqa: E402

import bpy  # noqa: E402

pb_lib.clear_scene()
palette = pb_lib.build_palette(os.path.join(ROOT, "art", "textures", "palette.png"))
MAT = pb_lib.palette_material(palette)
GLOW = pb_lib.palette_material(palette, "M_PaletteGlow", emissive=True)
chars = collection("Characters")
preview = collection("Preview")
c = Builder(chars, MAT, GLOW)

key = "akane"
root = c.empty(f"CHAR_{key}", (0, 0, 0), size=0.2, props={"character": key}, shape="PLAIN_AXES")
p = lambda n: f"{key}_{n}"  # noqa: E731
SKIN = "peach"


def flat(ob):
    for poly in ob.data.polygons:
        poly.use_smooth = False
    return ob


# ------------------------------------------------------------------ legs: beige sneaker + black sock + shin
for s in (-1, 1):
    side = "L" if s < 0 else "R"
    leg = c.ball(p(f"leg_{side}"), 0.056, (s * 0.07, -0.012, 0.038), "beige", scale=(0.95, 1.3, 0.72), parent=root)
    c.box(p(f"sole_{side}"), (0.095, 0.14, 0.014), (0, -0.003, -0.031), "cream", bevel=0.006, parent=leg)
    c.box(p(f"shoe_stripe_{side}"), (0.012, 0.05, 0.02), (s * 0.052, 0.005, 0.005), "white", bevel=0.004, parent=leg)
    c.cyl(p(f"sock_{side}"), 0.033, 0.06, (0, 0.012, 0.05), "black", bevel=0.01, parent=leg)
    c.cyl(p(f"shin_{side}"), 0.03, 0.06, (0, 0.012, 0.1), SKIN, bevel=0.008, parent=leg)

# ------------------------------------------------------------------ pleated suspender skirt + pink polo
skirt = c.cyl(p("skirt"), 0.185, 0.14, (0, 0, 0.2), "skirt", r2=0.105, seg=14, bevel=0, parent=root)
flat(skirt)  # faceted cone reads as pleats
c.cyl(p("skirt_band"), 0.108, 0.025, (0, 0, 0.275), "skirt", seg=24, bevel=0.006, parent=root)
c.ball(p("body"), 0.118, (0, 0, 0.33), "pink", scale=(1, 0.88, 0.85), parent=root)
for s in (-1, 1):
    c.ball(p(f"collar_{s}"), 0.042, (s * 0.04, -0.075, 0.405), "white", scale=(1.15, 0.5, 0.55), rot=(0, 0, s * 25),
           parent=root)
    # suspender straps over the shoulders with little buckles
    c.box(p(f"strap_{s}"), (0.028, 0.012, 0.14), (s * 0.055, -0.098, 0.335), "skirt", rot=(-8, s * -6, 0), bevel=0.004,
          parent=root)
    c.box(p(f"buckle_{s}"), (0.036, 0.014, 0.022), (s * 0.057, -0.107, 0.37), "grey", bevel=0.005, parent=root)
c.box(p("placket"), (0.02, 0.01, 0.06), (0, -0.103, 0.365), "rose", bevel=0.003, parent=root)
for k in range(2):
    c.ball(p(f"button_{k}"), 0.006, (0, -0.109, 0.385 - k * 0.025), "white", parent=root)

# ------------------------------------------------------------------ arms: hand + pink sleeve + white cuff
for s in (-1, 1):
    side = "L" if s < 0 else "R"
    arm = c.ball(p(f"arm_{side}"), 0.042, (s * 0.15, -0.005, 0.25), SKIN, scale=(0.85, 0.85, 1.2), rot=(0, s * 18, 0),
                 parent=root)
    c.ball(p(f"sleeve_{side}"), 0.05, (0, 0, 0.07), "pink", scale=(1, 1, 0.95), parent=arm)
    c.torus(p(f"cuff_{side}"), 0.04, 0.009, (0, 0, 0.035), "white", parent=arm)

# ------------------------------------------------------------------ pink backpack (on the back, +Y)
c.box(p("backpack"), (0.21, 0.1, 0.21), (0, 0.155, 0.29), "pink", bevel=0.045, parent=root)
c.box(p("backpack_pocket"), (0.16, 0.03, 0.08), (0, 0.208, 0.24), "rose", bevel=0.02, parent=root)
c.cyl(p("backpack_logo"), 0.02, 0.008, (0, 0.207, 0.33), "rose", rot=(90, 45, 0), seg=4, bevel=0, parent=root)
c.torus(p("backpack_handle"), 0.02, 0.006, (0, 0.155, 0.405), "rose", rot=(90, 0, 0), parent=root)
for s in (-1, 1):
    c.box(p(f"backpack_strap_{s}"), (0.026, 0.02, 0.16), (s * 0.085, 0.02, 0.35), "rose", rot=(0, s * 8, 0),
          bevel=0.006, parent=root)

# ------------------------------------------------------------------ head + face
c.ball(p("head"), 0.19, (0, -0.005, 0.55), SKIN, scale=(1.08, 1.0, 1.0), parent=root)
for s in (-1, 1):
    c.ball(p(f"ear_{s}"), 0.03, (s * 0.198, 0.0, 0.535), SKIN, scale=(0.5, 0.8, 1), parent=root)
    c.ball(p(f"eye_{s}"), 0.032, (s * 0.075, -0.178, 0.54), "choco", scale=(1, 0.45, 1.25), parent=root)
    c.ball(p(f"eye_hi_{s}"), 0.01, (s * 0.068, -0.193, 0.556), "white", parent=root)
    c.ball(p(f"blush_{s}"), 0.03, (s * 0.12, -0.158, 0.49), "blush", scale=(1, 0.35, 0.6), parent=root)
c.ball(p("nose"), 0.01, (0, -0.19, 0.505), "coral", scale=(1.2, 0.6, 0.8), parent=root)
c.box(p("mouth"), (0.035, 0.008, 0.012), (0, -0.182, 0.47), "coral", bevel=0.004, parent=root)

# ------------------------------------------------------------------ hair: long, straight, blunt bangs
c.ball(p("hair_cap"), 0.205, (0, 0.03, 0.575), "hair", scale=(1.08, 1.0, 1.0), parent=root)
# bangs: a dome over the forehead, cut straight across just above the eyes
bangs = c.ball(p("hair_bangs"), 0.2, (0, -0.012, 0.572), "hair", scale=(1.1, 1.0, 1.0), seg=32, parent=root)
bangs_cut = c.box(p("hair_bangs_cutter"), (0.6, 0.6, 0.4), (0, 0, 0.61 - 0.2), "hair", bevel=0)
c.cut(bangs, bangs_cut)
# long straight hair: one smooth curtain from behind the ears, around the back,
# falling straight down over the top of the backpack (no separate side locks)
curtain = c.arc_block(p("hair_long"), (0, 0.03), 0.17, 0.222, -18, 198, 0.35, 0.6, "hair", seg=28, bevel=0.07,
                      parent=root)
curtain.modifiers["Bevel"].segments = 4
for poly in curtain.data.polygons:
    poly.use_smooth = True
c.ball(p("hair_back"), 0.2, (0, 0.07, 0.48), "hair", scale=(1.0, 0.45, 1.0), parent=root)

# preview
pb_lib.setup_preview(preview, lens=85, dist=3.2, target=(0, 0, 0.4))
bpy.context.view_layer.update()
print("parts:", len(root.children_recursive))
