"""Build 宇 (Yu) from his character sheet, in the cast's chibi 2-head style.

Dark-brown bowl cut with a faded undercut (sides/back) and visible ears,
open navy zip hoodie with a grey-lined hood over a cream henley with an
orange collar/placket, dark purple joggers and navy velcro sneakers with
cream soles. Faces -Y, feet at z=0. Export with export_all.py -> char_yu.glb.

Child parts use locations relative to their parent (legs carry shoe sole,
strap and trouser leg; arms carry sleeves).
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

key = "yu"
root = c.empty(f"CHAR_{key}", (0, 0, 0), size=0.2, props={"character": key}, shape="PLAIN_AXES")
p = lambda n: f"{key}_{n}"  # noqa: E731
SKIN = "peach"

# ------------------------------------------------------------------ legs: navy velcro sneaker + jogger leg
for s in (-1, 1):
    side = "L" if s < 0 else "R"
    leg = c.ball(p(f"leg_{side}"), 0.058, (s * 0.072, -0.012, 0.04), "hoodie", scale=(0.95, 1.3, 0.72), parent=root)
    c.box(p(f"sole_{side}"), (0.098, 0.145, 0.016), (0, -0.003, -0.031), "cream", bevel=0.007, parent=leg)
    c.box(p(f"strap_{side}"), (0.085, 0.03, 0.012), (0, -0.03, 0.03), "cream", rot=(-25, 0, 0), bevel=0.004, parent=leg)
    c.box(p(f"logo_{side}"), (0.008, 0.04, 0.022), (s * 0.054, 0.008, 0.004), "cream", bevel=0.003, parent=leg)
    c.cyl(p(f"cuff_{side}"), 0.04, 0.03, (0, 0.012, 0.05), "jogger", bevel=0.008, parent=leg)
    c.cyl(p(f"trouser_{side}"), 0.047, 0.1, (0, 0.012, 0.11), "jogger", r2=0.052, bevel=0.01, parent=leg)

# ------------------------------------------------------------------ joggers + hoodie + henley
c.cyl(p("hips"), 0.11, 0.08, (0, 0, 0.19), "jogger", r2=0.115, bevel=0.02, parent=root)
c.ball(p("body"), 0.125, (0, 0, 0.31), "hoodie", scale=(1.02, 0.9, 0.95), parent=root)
c.cyl(p("hoodie_hem"), 0.118, 0.03, (0, 0, 0.215), "hoodie", seg=24, bevel=0.01, parent=root)
# open front shows the cream henley
c.ball(p("henley"), 0.1, (0, -0.06, 0.31), "henley", scale=(0.55, 0.6, 0.95), parent=root)
c.ball(p("henley_collar"), 0.05, (0, -0.07, 0.396), "orange", scale=(0.95, 0.5, 0.3), parent=root)
c.box(p("henley_placket"), (0.02, 0.01, 0.055), (0, -0.115, 0.36), "orange", bevel=0.003, parent=root)
for k in range(2):
    c.ball(p(f"henley_button_{k}"), 0.006, (0, -0.121, 0.375 - k * 0.022), "henley", parent=root)
for s in (-1, 1):
    c.box(p(f"zip_{s}"), (0.006, 0.01, 0.15), (s * 0.052, -0.108, 0.3), "grey", rot=(0, s * 4, 0), bevel=0, parent=root)
# hood resting on the back, grey lining showing at the neck
c.ball(p("hood"), 0.12, (0, 0.085, 0.405), "hoodie", scale=(1.0, 0.62, 0.55), parent=root)
for s in (-1, 1):
    c.ball(p(f"hood_lining_{s}"), 0.04, (s * 0.075, -0.035, 0.408), "grey", scale=(0.8, 1.1, 0.55), parent=root)

# ------------------------------------------------------------------ arms: hand + long navy sleeve + rib cuff
for s in (-1, 1):
    side = "L" if s < 0 else "R"
    arm = c.ball(p(f"arm_{side}"), 0.04, (s * 0.155, -0.005, 0.24), SKIN, scale=(0.85, 0.85, 1.15), rot=(0, s * 18, 0),
                 parent=root)
    c.ball(p(f"sleeve_{side}"), 0.038, (0, 0, 0.08), "hoodie", scale=(0.9, 0.9, 1.8), parent=arm)
    c.torus(p(f"sleeve_cuff_{side}"), 0.036, 0.011, (0, 0, 0.032), "hoodie", parent=arm)

# ------------------------------------------------------------------ head + face
c.ball(p("head"), 0.19, (0, -0.005, 0.55), SKIN, scale=(1.06, 1.0, 1.0), parent=root)
for s in (-1, 1):
    c.ball(p(f"ear_{s}"), 0.034, (s * 0.2, 0.0, 0.535), SKIN, scale=(0.55, 0.8, 1.05), parent=root)
    c.ball(p(f"eye_{s}"), 0.03, (s * 0.073, -0.177, 0.535), "choco", scale=(1, 0.45, 1.12), parent=root)
    c.ball(p(f"eye_hi_{s}"), 0.009, (s * 0.066, -0.191, 0.55), "white", parent=root)
    c.box(p(f"brow_{s}"), (0.04, 0.01, 0.008), (s * 0.074, -0.181, 0.578), "hair", rot=(0, s * -6, 0), bevel=0.003,
          parent=root)
c.ball(p("nose"), 0.009, (0, -0.19, 0.5), "coral", scale=(1.2, 0.6, 0.8), parent=root)
c.box(p("mouth"), (0.03, 0.008, 0.008), (0, -0.182, 0.466), "coral", bevel=0.003, parent=root)

# ------------------------------------------------------------------ hair: bowl cut + faded undercut
# faded undercut: a thin shell on the sides/back of the head (face and neck cut away)
fade = c.ball(p("hair_fade"), 0.192, (0, 0.006, 0.55), "hair_fade", scale=(1.07, 1.01, 1.0), seg=32, parent=root)
c.cut(fade, c.box(p("hair_fade_cut_face"), (0.7, 0.36, 0.7), (0, -0.24, 0.55), "hair_fade", bevel=0))
c.cut(fade, c.box(p("hair_fade_cut_neck"), (0.7, 0.7, 0.5), (0, 0, 0.445 - 0.25), "hair_fade", bevel=0))
# bowl: a full dome cut straight around just above the brows and ears
bowl = c.ball(p("hair_bowl"), 0.203, (0, 0.008, 0.575), "hair", scale=(1.065, 1.02, 0.93), seg=32, parent=root)
c.cut(bowl, c.box(p("hair_bowl_cut"), (0.7, 0.7, 0.5), (0, 0, 0.6 - 0.25), "hair", bevel=0))
# bangs: the front of the bowl comes down to just above the brows
bangs = c.ball(p("hair_bangs"), 0.2, (0, -0.006, 0.568), "hair", scale=(1.06, 1.0, 1.0), seg=32, parent=root)
c.cut(bangs, c.box(p("hair_bangs_cut_low"), (0.7, 0.7, 0.5), (0, 0, 0.588 - 0.25), "hair", bevel=0))
c.cut(bangs, c.box(p("hair_bangs_cut_back"), (0.7, 0.6, 0.7), (0, -0.06 + 0.3, 0.55), "hair", bevel=0))
# fringe: small overlapping strands along the bangs so the front edge reads as hair
for k in range(9):
    a = math.radians(-90 + (k - 4) * 12)
    c.ball(p(f"hair_tuft_{k}"), 0.024, (0.198 * math.cos(a), 0.196 * math.sin(a) - 0.004, 0.593), "hair",
           scale=(1.25, 0.5, 0.9), rot=(0, 0, math.degrees(a) + 90), parent=root)

# preview
pb_lib.setup_preview(preview, lens=85, dist=3.2, target=(0, 0, 0.4))
bpy.context.view_layer.update()
print("parts:", len(root.children_recursive))
