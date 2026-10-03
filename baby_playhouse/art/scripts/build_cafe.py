"""Build the Cafe room + 3 chibi characters in Blender.

Run inside Blender (Scripting tab or MCP). Re-running rebuilds everything.
Layout: 6x6 m room centred on origin. Full-height walls on north (+Y) and
west (-X); low walls on south/east so the 45° camera (from south-east) can
see in. Door on the east wall leads to the bathroom.
"""
import importlib
import math
import os
import sys

import bpy

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
sys.path.insert(0, HERE)
import pb_lib  # noqa: E402

importlib.reload(pb_lib)
from pb_lib import Builder, collection, look_at  # noqa: E402

ROOM = 6.0
H = ROOM / 2
WALL_T = 0.15
WALL_H = 1.5
LOW_H = 0.25
IN_N = H - WALL_T / 2  # inner face of north wall (y)
IN_W = -H + WALL_T / 2  # inner face of west wall (x)

pb_lib.clear_scene()
palette = pb_lib.build_palette(os.path.join(ROOT, "art", "textures", "palette.png"))
MAT = pb_lib.palette_material(palette)
GLOW = pb_lib.palette_material(palette, "M_PaletteGlow", emissive=True)

room = collection("Room_Cafe")
chars = collection("Characters")
preview = collection("Preview")
b = Builder(room, MAT, GLOW)


# ------------------------------------------------------------------ shell
b.box("floor", (ROOM, ROOM, 0.1), (0, 0, -0.05), "floor", bevel=0.03)
# floor planks (thin strips for a cute wooden look)
PLANK = 0.4
for i in range(int(ROOM / PLANK)):
    if i % 2:
        b.box(f"floor_plank_{i}", (ROOM - 0.02, PLANK - 0.02, 0.004), (0, -H + PLANK / 2 + i * PLANK, 0.002),
              "floor_dark", bevel=0)
b.box("wall_N", (ROOM + WALL_T, WALL_T, WALL_H), (-WALL_T / 2, H, WALL_H / 2), "wall", bevel=0.03)
# west wall with a door out to the farm (centred at y = W_DOOR_Y)
W_DOOR_Y = 0.15
pb_lib._wall_run(b, "wall_W", "y", -H, -H, H, W_DOOR_Y, WALL_H, WALL_T, "wall", 0.03)
pb_lib.door_frame(b, "W", W_DOOR_Y, "white", wall="wall", view_color="grass", view_floor="grass")
b.box("wall_N_skirting", (ROOM, 0.03, 0.12), (0, IN_N - 0.015, 0.06), "wall_trim", bevel=0.01)
for k, (y0, y1) in enumerate(((-H, W_DOOR_Y - 0.6), (W_DOOR_Y + 0.6, H))):
    b.box(f"wall_W_skirting_{k}", (0.03, y1 - y0, 0.12), (IN_W + 0.015, (y0 + y1) / 2, 0.06), "wall_trim", bevel=0.01)
b.box("wall_N_cap", (ROOM + WALL_T + 0.04, WALL_T + 0.04, 0.05), (-WALL_T / 2, H, WALL_H), "wall_trim")
b.box("wall_W_cap", (WALL_T + 0.04, ROOM + 0.04, 0.05), (-H, 0, WALL_H), "wall_trim")
# low front walls; east wall has a 1.2 m door gap
# south low wall with a door gap to the living room (centred at x = S_DOOR_X)
S_DOOR_X, S_DOOR_W = -1.5, 1.2
s_left = (-H - WALL_T / 2, S_DOOR_X - S_DOOR_W / 2)
s_right = (S_DOOR_X + S_DOOR_W / 2, H + WALL_T / 2)
for k, (x0, x1) in enumerate((s_left, s_right)):
    b.box(f"wall_S_low_{k}", (x1 - x0, WALL_T, LOW_H), ((x0 + x1) / 2, -H, LOW_H / 2), "wall_trim", bevel=0.04)
b.box("doormat_S", (1.0, 0.5, 0.015), (S_DOOR_X, -H + 0.35, 0.008), "coral", bevel=0.005)
seg = (ROOM - 1.2) / 2
b.box("wall_E_low_a", (WALL_T, seg, LOW_H), (H, -H + seg / 2, LOW_H / 2), "wall_trim", bevel=0.04)
b.box("wall_E_low_b", (WALL_T, seg, LOW_H), (H, H - seg / 2, LOW_H / 2), "wall_trim", bevel=0.04)
b.box("doormat", (0.5, 1.0, 0.015), (H - 0.35, 0, 0.008), "teal", bevel=0.005)


# ------------------------------------------------------------------ furniture helpers
def stool(name, x, y, color="wood", seat=0.30):
    s = b.cyl(f"INT_{name}", 0.15, 0.06, (x, y, seat - 0.03), color, bevel=0.02,
              props={"action": "sit", "sfx": "pop"})
    for i, (dx, dy) in enumerate(((1, 1), (1, -1), (-1, 1), (-1, -1))):
        b.cyl(f"{name}_leg{i}", 0.018, seat - 0.06, (x + dx * 0.09, y + dy * 0.09, (seat - 0.06) / 2),
              "wood_dark", bevel=0)
    b.torus(f"{name}_ring", 0.125, 0.012, (x, y, 0.1), "wood_dark")
    b.empty(f"SNAP_sit_{name}", (x, y, seat), props={"pose": "sit", "owner": f"INT_{name}"})


def cup(name, x, y, z, color="white"):
    b.cyl(name, 0.035, 0.07, (x, y, z + 0.035), color, bevel=0.008)
    b.torus(name + "_handle", 0.018, 0.006, (x + 0.04, y, z + 0.04), color, rot=(90, 0, 0))


# ------------------------------------------------------------------ barista corner (sketch 1 + curved counter)
# back counter against north wall, 3 drawers + coffee machine
bc_x0, bc_x1 = -2.85, -1.25
bc_w = bc_x1 - bc_x0
bc_cx = (bc_x0 + bc_x1) / 2
bc_d = 0.45
bc_cy = IN_N - bc_d / 2
b.box("back_counter", (bc_w, bc_d, 0.42), (bc_cx, bc_cy, 0.21), "wood")
b.box("back_counter_top", (bc_w + 0.04, bc_d + 0.03, 0.04), (bc_cx, bc_cy - 0.01, 0.44), "wood_dark")
for i in range(3):
    z = 0.08 + i * 0.12
    b.box(f"back_counter_drawer{i}", (0.5, 0.02, 0.09), (bc_cx + 0.35, bc_cy - bc_d / 2 - 0.005, z), "cream", bevel=0.01)
    b.ball(f"back_counter_knob{i}", 0.015, (bc_cx + 0.35, bc_cy - bc_d / 2 - 0.02, z), "wood_dark")
b.box("back_counter_door", (0.55, 0.02, 0.32), (bc_cx - 0.35, bc_cy - bc_d / 2 - 0.005, 0.2), "cream", bevel=0.01)
top = 0.46
b.box("INT_coffee_machine", (0.26, 0.2, 0.3), (-2.45, bc_cy + 0.03, top + 0.15), "red", bevel=0.04,
      props={"action": "brew", "sfx": "coffee"})
b.box("coffee_machine_head", (0.18, 0.1, 0.05), (-2.45, bc_cy - 0.1, top + 0.2), "grey_dark", bevel=0.015)
b.box("coffee_machine_tray", (0.2, 0.12, 0.02), (-2.45, bc_cy - 0.1, top + 0.01), "grey_dark", bevel=0.005)
cup("coffee_machine_cup", -2.45, bc_cy - 0.1, top + 0.02)
b.ball("coffee_machine_light", 0.018, (-2.37, bc_cy - 0.075, top + 0.26), "bulb", glow=True)
# jar with spoons (the pencil-cup-like thing in sketch 1)
b.cyl("spoon_jar", 0.05, 0.12, (-1.95, bc_cy, top + 0.06), "glass", bevel=0.01)
for i, (dx, tilt) in enumerate(((-0.015, -12), (0.015, 10))):
    b.cyl(f"spoon_{i}", 0.006, 0.18, (-1.95 + dx, bc_cy, top + 0.15), "grey", rot=(0, tilt, 0), bevel=0)
cup("cup_stack_a", -1.65, bc_cy, top, "mint")
cup("cup_stack_b", -1.5, bc_cy + 0.05, top, "pink")

# CAFES sign on the north wall above the back counter
b.box("sign_board", (1.5, 0.04, 0.42), (bc_cx, IN_N - 0.02, 1.02), "mint", bevel=0.05)
b.text("INT_sign_CAFES", "CAFES", 0.3, (bc_cx, IN_N - 0.06, 1.0), "white", depth=0.02,
       props={"action": "glow", "sfx": "chime"})

# step shelf on the west wall (sketch 2: steps + cabinet with a jar)
for i in range(3):
    h = 0.14 * (i + 1)
    b.box(f"step_shelf_{i}", (0.35, 0.3, h), (IN_W + 0.175, 1.55 - i * 0.3, h / 2), "wood", bevel=0.02)
b.cyl("step_shelf_jar", 0.06, 0.12, (IN_W + 0.175, 0.95, 0.42 + 0.06), "orange", bevel=0.01)
b.cyl("step_shelf_jar_lid", 0.065, 0.025, (IN_W + 0.175, 0.95, 0.55), "wood_dark", bevel=0.008)
b.ball("step_shelf_plant", 0.09, (IN_W + 0.175, 1.55, 0.14 + 0.08), "green")

# curved service counter around the barista corner (bottom-right sketch)
corner = (-H, H)
R_IN, R_OUT = 1.85, 2.2
ARC_START = -55  # leave a walkable entry gap next to the west wall (>= 0.6 m)
b.arc_block("curved_counter", corner, R_IN, R_OUT, ARC_START, -2, 0, 0.42, "cream", seg=20)
b.arc_block("curved_counter_top", corner, R_IN - 0.03, R_OUT + 0.04, ARC_START - 1, -1, 0.42, 0.46, "wood_dark", seg=20)
for k, ang in enumerate((-12, -29, -46)):
    a = math.radians(ang)
    nx, ny = math.cos(a), math.sin(a)
    rot_z = math.degrees(a) - 90 + 180
    for j in range(3):
        z = 0.1 + j * 0.11
        b.box(f"curved_counter_drawer{k}_{j}", (0.42, 0.02, 0.08),
              (corner[0] + (R_OUT + 0.005) * nx, corner[1] + (R_OUT + 0.005) * ny, z),
              "wood", rot=(0, 0, rot_z), bevel=0.01)
# register + cake dome on the counter top
ra = math.radians(-20)
rr = (R_IN + R_OUT) / 2
reg = (corner[0] + rr * math.cos(ra), corner[1] + rr * math.sin(ra))
b.box("INT_register", (0.22, 0.18, 0.12), (reg[0], reg[1], top + 0.06), "sky",
      rot=(0, 0, -20 + 90 + 180), bevel=0.03, props={"action": "ding", "sfx": "register"})
b.box("register_screen", (0.14, 0.03, 0.07), (reg[0] - 0.02, reg[1] + 0.04, top + 0.15), "navy",
      rot=(20, 0, -20 + 90 + 180), bevel=0.01)
ca = math.radians(-45)
cake = (corner[0] + rr * math.cos(ca), corner[1] + rr * math.sin(ca))
b.cyl("cake_plate", 0.12, 0.015, (cake[0], cake[1], top + 0.008), "white", bevel=0.005)
b.cyl("INT_cake", 0.08, 0.07, (cake[0], cake[1], top + 0.05), "pink", bevel=0.02,
      props={"action": "eat", "sfx": "yum"})
b.ball("cake_cherry", 0.02, (cake[0], cake[1], top + 0.1), "red")


# ------------------------------------------------------------------ window bar (sketch 3)
ledge_x0, ledge_x1 = 0.1, 2.75
lcx = (ledge_x0 + ledge_x1) / 2
b.box("window_ledge", (ledge_x1 - ledge_x0, 0.32, 0.04), (lcx, IN_N - 0.16, 0.44), "wood_dark")
for i, lx in enumerate((ledge_x0 + 0.1, ledge_x1 - 0.1)):
    b.box(f"window_ledge_bracket{i}", (0.05, 0.28, 0.4), (lx, IN_N - 0.14, 0.2), "wood", bevel=0.01)
for i, wx in enumerate((0.85, 2.0)):
    b.box(f"window_{i}_frame", (0.78, 0.05, 0.62), (wx, IN_N - 0.01, 0.98), "white", bevel=0.02)
    b.box(f"window_{i}_glass", (0.66, 0.02, 0.5), (wx, IN_N - 0.035, 0.98), "sky", bevel=0)
    b.box(f"window_{i}_mullion_v", (0.035, 0.03, 0.5), (wx, IN_N - 0.05, 0.98), "white", bevel=0)
    b.box(f"window_{i}_mullion_h", (0.66, 0.03, 0.035), (wx, IN_N - 0.05, 0.98), "white", bevel=0)
    b.box(f"window_{i}_sill", (0.86, 0.1, 0.035), (wx, IN_N - 0.05, 0.655), "white", bevel=0.01)
stool("stool_bar_1", 0.85, IN_N - 0.5)
stool("stool_bar_2", 2.0, IN_N - 0.5)

# string lights along the top of the north wall
xs = [-2.85 + i * 0.3 for i in range(20)]
pts = []
span = xs[-1] - xs[0]
for x in xs:
    t = (x - xs[0]) / span
    sag = 0.12 * math.sin(math.pi * ((t * 3) % 1))  # three drooping swags
    pts.append((x, IN_N - 0.05, 1.45 - sag * 0.8))
b.tube("string_lights_cord", pts, 0.01, "choco")
for i, p in enumerate(pts[1:-1], 1):
    b.ball(f"INT_string_bulb_{i:02d}" if i == 1 else f"string_bulb_{i:02d}", 0.05,
           (p[0], p[1] - 0.02, p[2] - 0.06), ["bulb", "pink", "mint", "bulb"][i % 4],
           scale=(1, 1, 1.25), glow=True,
           props={"action": "toggle_lights", "sfx": "twinkle"} if i == 1 else None)


# ------------------------------------------------------------------ customer area
# round table with two stools + rug
b.cyl("rug", 0.9, 0.012, (0.6, -0.5, 0.006), "pink", seg=40, bevel=0)
b.cyl("table_round_top", 0.38, 0.04, (0.6, -0.5, 0.42), "white", seg=32, bevel=0.015)
b.cyl("table_round_leg", 0.04, 0.38, (0.6, -0.5, 0.21), "wood_dark", bevel=0)
b.cyl("table_round_base", 0.16, 0.03, (0.6, -0.5, 0.015), "wood_dark", bevel=0.01)
cup("table_round_cup", 0.5, -0.45, 0.44, "mint")
b.cyl("table_round_vase", 0.035, 0.08, (0.72, -0.58, 0.48), "sky", bevel=0.01)
b.ball("table_round_flower", 0.04, (0.72, -0.58, 0.56), "yellow")
stool("stool_table_1", 0.05, -0.35, "mint")
stool("stool_table_2", 1.15, -0.75, "pink")

# tall side table + stool with candle (sketch 4)
b.box("side_table", (0.32, 0.32, 0.5), (IN_W + 0.3, -1.6, 0.25), "wood", bevel=0.02)
b.box("side_table_top", (0.38, 0.38, 0.03), (IN_W + 0.3, -1.6, 0.515), "wood_dark", bevel=0.01)
b.cyl("INT_candle", 0.03, 0.08, (IN_W + 0.3, -1.6, 0.57), "cream", bevel=0.008,
      props={"action": "flicker", "sfx": "whoosh"})
b.ball("candle_flame", 0.018, (IN_W + 0.3, -1.6, 0.635), "orange", scale=(1, 1, 1.6), glow=True)
stool("stool_side", IN_W + 0.3, -1.05, "wood", seat=0.3)

# chalk menu board on the west wall + potted plant in the south-west corner
b.box("menu_board", (0.04, 0.8, 0.55), (IN_W - 0.0, -1.05, 0.95), "wood_dark", bevel=0.02)
b.box("menu_board_face", (0.02, 0.7, 0.45), (IN_W + 0.02, -1.05, 0.95), "choco", bevel=0)
for i in range(3):
    b.box(f"menu_line_{i}", (0.01, 0.45 - i * 0.08, 0.025), (IN_W + 0.035, -1.05, 1.08 - i * 0.1), "white", bevel=0)
b.cyl("plant_pot", 0.14, 0.2, (IN_W + 0.3, -2.55, 0.1), "orange", r2=0.17, bevel=0.02)
for i, (dx, dy, dz, r) in enumerate(((0, 0, 0.32, 0.14), (0.07, 0.05, 0.43, 0.1), (-0.06, -0.04, 0.42, 0.09))):
    b.ball(f"plant_leaves_{i}", r, (IN_W + 0.3 + dx, -2.55 + dy, dz), "green")


# ------------------------------------------------------------------ game markers
nav = b.box("NAV_floor", (ROOM - 0.4, ROOM - 0.4, 0.001), (0, 0, 0.001), "mint", bevel=0)
nav.display_type = "WIRE"
nav.hide_render = True
b.box("doormat_W", (0.5, 1.0, 0.015), (IN_W + 0.35, W_DOOR_Y, 0.008), "grass_dark", bevel=0.005)
b.empty("DOOR_west", (-H, W_DOOR_Y, 0), size=0.4, props={"to": "farm", "spawn": "DOOR_west"}, shape="SINGLE_ARROW",
        rot=(0, -90, 0))
b.empty("DOOR_south", (S_DOOR_X, -H, 0), size=0.4, props={"to": "living", "spawn": "DOOR_north"},
        shape="SINGLE_ARROW", rot=(90, 0, 0))
b.empty("DOOR_east", (H, 0, 0), size=0.4, props={"to": "bathroom", "spawn": "DOOR_west"}, shape="SINGLE_ARROW",
        rot=(0, 90, 0))
b.empty("SPAWN_01", (1.6, -1.6, 0), size=0.3, shape="CIRCLE", rot=(90, 0, 0))
b.empty("SNAP_barista", (-2.1, 2.1, 0), props={"pose": "stand", "role": "barista"})


# ------------------------------------------------------------------ characters (facing -Y, feet at z=0)
def character(key, main, limb, outfit, loc, turn):
    c = Builder(chars, MAT, GLOW)
    root = c.empty(f"CHAR_{key}", loc, size=0.2, props={"character": key}, shape="PLAIN_AXES")
    root.rotation_euler = (0, 0, math.radians(turn))
    p = lambda n: f"{key}_{n}"  # noqa: E731
    for s in (-1, 1):
        c.ball(p(f"leg_{'L' if s < 0 else 'R'}"), 0.06, (s * 0.07, 0, 0.05), limb, scale=(1, 1.1, 0.85), parent=root)
        c.ball(p(f"arm_{'L' if s < 0 else 'R'}"), 0.05, (s * 0.16, -0.01, 0.22), limb, scale=(0.8, 0.8, 1.25),
               rot=(0, s * 25, 0), parent=root)
    c.ball(p("body"), 0.15, (0, 0, 0.2), outfit, scale=(1, 0.9, 1.05), parent=root)
    c.ball(p("head"), 0.19, (0, 0, 0.47), main, scale=(1.1, 1, 0.95), parent=root)
    for s in (-1, 1):
        c.ball(p(f"blush_{s}"), 0.035, (s * 0.12, -0.155, 0.42), "blush", scale=(1, 0.4, 0.7), parent=root)
    c.ball(p("nose"), 0.018, (0, -0.19, 0.44), "choco", scale=(1.3, 0.8, 1), parent=root)
    return c, root, p


def eyes(c, root, p, color="black", squint=1.0, y=-0.172):
    for s in (-1, 1):
        c.ball(p(f"eye_{s}"), 0.028 if y > -0.18 else 0.019, (s * 0.075, y, 0.47), color, scale=(1, 0.5, 1.25 * squint), parent=root)
        c.ball(p(f"eye_hi_{s}"), 0.009, (s * 0.068, y - 0.012, 0.485), "white", parent=root)


# Panda barista with apron
c, root, p = character("panda", "white", "black", "white", (-2.05, 2.05, 0), 45)
for s in (-1, 1):
    c.ball(p(f"ear_{s}"), 0.065, (s * 0.15, 0.01, 0.62), "black", scale=(1, 0.7, 1), parent=root)
    c.ball(p(f"eyepatch_{s}"), 0.05, (s * 0.078, -0.158, 0.465), "black", scale=(1, 0.4, 1.3),
           rot=(0, s * -25, 0), parent=root)
for s in (-1, 1):
    c.ball(p(f"eye_white_{s}"), 0.026, (s * 0.075, -0.176, 0.47), "white", scale=(1, 0.5, 1.2), parent=root)
eyes(c, root, p, y=-0.184)
c.ball(p("apron"), 0.13, (0, -0.1, 0.17), "red", scale=(1, 0.45, 1.05), parent=root)
c.box(p("apron_pocket"), (0.09, 0.02, 0.05), (0, -0.16, 0.14), "white", bevel=0.01, parent=root)
c.box(p("apron_strap"), (0.07, 0.02, 0.12), (0, -0.13, 0.31), "red", bevel=0.01, parent=root)
panda = root

# Bunny with shirt and tie
c, root, p = character("bunny", "cream", "cream", "sky", (1.55, -1.35, 0), 45)
for s in (-1, 1):
    c.ball(p(f"ear_{s}"), 0.05, (s * 0.075, 0.01, 0.78), "cream", scale=(1, 0.6, 3.0), rot=(0, s * 10, 0), parent=root)
    c.ball(p(f"ear_in_{s}"), 0.032, (s * 0.078, -0.015, 0.78), "pink", scale=(1, 0.3, 3.4), rot=(0, s * 10, 0),
           parent=root)
eyes(c, root, p)
c.box(p("collar"), (0.14, 0.05, 0.03), (0, -0.1, 0.33), "white", bevel=0.012, parent=root)
c.cyl(p("tie"), 0.035, 0.12, (0, -0.135, 0.25), "red", r2=0.012, rot=(180 - 12, 0, 0), seg=4, bevel=0, parent=root)
c.ball(p("tie_knot"), 0.02, (0, -0.135, 0.315), "red", parent=root)
c.ball(p("tail"), 0.05, (0, 0.15, 0.13), "white", parent=root)
bunny = root

# Cat with jacket and tie + curled tail
c, root, p = character("cat", "cat_grey", "cat_grey", "navy", (2.2, 0.55, 0), 45 + 20)
for s in (-1, 1):
    c.cyl(p(f"ear_{s}"), 0.07, 0.13, (s * 0.12, 0, 0.64), "cat_grey", r2=0.005, rot=(0, s * 22, 0), seg=16,
          bevel=0, parent=root)
    c.cyl(p(f"ear_in_{s}"), 0.04, 0.08, (s * 0.118, -0.03, 0.63), "pink", r2=0.004, rot=(-8, s * 22, 0), seg=16,
          bevel=0, parent=root)
    # jacket lapels
    c.box(p(f"lapel_{s}"), (0.05, 0.02, 0.14), (s * 0.045, -0.135, 0.25), "white", rot=(0, s * -20, 0),
          bevel=0.008, parent=root)
eyes(c, root, p, squint=0.75)
c.cyl(p("tie"), 0.03, 0.1, (0, -0.145, 0.24), "red", r2=0.01, rot=(180 - 12, 0, 0), seg=4, bevel=0, parent=root)
tail_pts = [(0, 0.13, 0.12), (0.05, 0.22, 0.12), (0.12, 0.26, 0.2), (0.14, 0.24, 0.3), (0.1, 0.2, 0.36)]
c.tube(p("tail"), tail_pts, 0.025, "cat_grey", parent=root)
cat = root


# ------------------------------------------------------------------ preview camera + light (not exported)
scn = bpy.context.scene
cam_data = bpy.data.cameras.new("PreviewCam")
cam_data.lens = 50
cam = bpy.data.objects.new("PreviewCam", cam_data)
preview.objects.link(cam)
target = (-0.3, 0.3, 0.4)
dist = 15.5
az = math.radians(-45)  # from south-east
el = math.radians(45)
cam.location = (target[0] + dist * math.cos(el) * math.sin(-az),
                target[1] - dist * math.cos(el) * math.cos(az),
                target[2] + dist * math.sin(el))
look_at(cam, target)
scn.camera = cam

sun_data = bpy.data.lights.new("Sun", "SUN")
sun_data.energy = 3.6
sun_data.angle = math.radians(8)
sun = bpy.data.objects.new("Sun", sun_data)
preview.objects.link(sun)
sun.rotation_euler = (math.radians(40), math.radians(0), math.radians(30))

world = scn.world or bpy.data.worlds.new("World")
scn.world = world
world.use_nodes = True
bg = world.node_tree.nodes.get("Background")
bg.inputs["Color"].default_value = (0.93, 0.90, 0.86, 1)
bg.inputs["Strength"].default_value = 0.55

scn.view_settings.view_transform = "Standard"
for eng in ("BLENDER_EEVEE", "BLENDER_EEVEE_NEXT"):
    try:
        scn.render.engine = eng
        break
    except TypeError:
        continue
scn.render.resolution_x = 1600
scn.render.resolution_y = 1000
scn.render.film_transparent = False

bpy.context.view_layer.update()
print("objects:", len(room.objects), "room /", len(chars.all_objects), "character parts")
