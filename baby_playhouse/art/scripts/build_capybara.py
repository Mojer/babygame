"""Build the capybara principal (園長) with a sprout on its head.

Chibi 2-head proportions like the other characters, a bit taller (adult):
boxy capybara head with a big snout, sleepy eyes, tiny ears, a two-leaf
sprout on top, teal principal's vest with a star badge and a bow tie.
Faces -Y, feet at z=0. Export with export_all.py -> char_capybara.glb.
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

key = "capybara"
root = c.empty(f"CHAR_{key}", (0, 0, 0), size=0.2, props={"character": key}, shape="PLAIN_AXES")
p = lambda n: f"{key}_{n}"  # noqa: E731

# legs / arms (names matter: the game animates *_leg_L/R and *_arm_L/R)
for s in (-1, 1):
    side = "L" if s < 0 else "R"
    c.ball(p(f"leg_{side}"), 0.068, (s * 0.085, 0, 0.055), "capy_dark", scale=(1, 1.15, 0.85), parent=root)
    c.ball(p(f"arm_{side}"), 0.055, (s * 0.185, -0.01, 0.24), "capy", scale=(0.8, 0.8, 1.25), rot=(0, s * 22, 0),
           parent=root)

# body: teal vest with a peach belly showing in front
c.ball(p("body"), 0.17, (0, 0, 0.22), "teal", scale=(1.05, 0.95, 1.0), parent=root)
c.ball(p("belly"), 0.12, (0, -0.12, 0.21), "peach", scale=(0.78, 0.45, 1.0), parent=root)
c.cyl(p("badge"), 0.03, 0.012, (0.085, -0.155, 0.28), "yellow", rot=(90 - 12, 0, 0), seg=5, bevel=0, parent=root)
for s in (-1, 1):
    c.cyl(p(f"bowtie_{s}"), 0.032, 0.05, (s * 0.028, -0.135, 0.365), "red", r2=0.006, rot=(0, s * -90, 0), seg=12,
          bevel=0, parent=root)
c.ball(p("bowtie_knot"), 0.014, (0, -0.145, 0.365), "red", parent=root)

# head: rounded-box capybara head with a flat top and a blocky muzzle
head = c.box(p("head"), (0.4, 0.4, 0.32), (0, -0.02, 0.54), "capy", bevel=0.13, parent=root)
head.modifiers["Bevel"].segments = 5
snout = c.box(p("snout"), (0.3, 0.16, 0.2), (0, -0.23, 0.49), "capy", bevel=0.08, parent=root)
snout.modifiers["Bevel"].segments = 4
for ob in (head, snout):
    for poly in ob.data.polygons:
        poly.use_smooth = True
c.box(p("nose"), (0.14, 0.02, 0.06), (0, -0.315, 0.53), "choco", bevel=0.025, parent=root)
for s in (-1, 1):
    c.ball(p(f"nostril_{s}"), 0.01, (s * 0.03, -0.327, 0.53), "black", parent=root)
    c.ball(p(f"ear_{s}"), 0.045, (s * 0.15, 0.06, 0.715), "capy_dark", scale=(1, 0.7, 0.8), parent=root)
    c.ball(p(f"blush_{s}"), 0.028, (s * 0.12, -0.21, 0.56), "blush", scale=(1, 0.25, 0.6), parent=root)
    # sleepy, content eyes set high on the head
    c.ball(p(f"eye_{s}"), 0.024, (s * 0.1, -0.214, 0.625), "black", scale=(1.2, 0.5, 0.75), parent=root)
    c.ball(p(f"eye_hi_{s}"), 0.007, (s * 0.093, -0.226, 0.633), "white", parent=root)
c.box(p("mouth"), (0.05, 0.01, 0.008), (0, -0.31, 0.44), "choco", bevel=0, parent=root)

# sprout on top of the head
c.cyl(p("sprout_stem"), 0.012, 0.11, (0, 0.0, 0.75), "green", bevel=0, parent=root)
for s in (-1, 1):
    c.ball(p(f"sprout_leaf_{s}"), 0.05, (s * 0.05, 0, 0.81), "green", scale=(1.5, 0.45, 0.75), rot=(0, s * -28, 0),
           parent=root)

# preview
pb_lib.setup_preview(preview, lens=85, dist=3.2, target=(0, 0, 0.42))
bpy.context.view_layer.update()
print("parts:", len(root.children))
