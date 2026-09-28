"""Build the Bathroom room in Blender (sketch sheet 2).

Same 6x6 m module as the cafe: full walls north (+Y) / west (-X), low walls
south / east. The door is in the west wall and leads back to the cafe
(cafe's east door). Characters are not rebuilt here; they come from the
cafe build.
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
from pb_lib import Builder, collection, look_at  # noqa: E402

import bpy  # noqa: E402

ROOM = 6.0
H = ROOM / 2
WALL_T = 0.15
WALL_H = 1.5
LOW_H = 0.25
IN_N = H - WALL_T / 2
IN_W = -H + WALL_T / 2
DOOR_W = 1.2
DOOR_H = 1.1
TILE_H = 0.55  # height of the tiled band on the walls

pb_lib.clear_scene()
palette = pb_lib.build_palette(os.path.join(ROOT, "art", "textures", "palette.png"))
MAT = pb_lib.palette_material(palette)
GLOW = pb_lib.palette_material(palette, "M_PaletteGlow", emissive=True)

room = collection("Room_Bathroom")
preview = collection("Preview")
b = Builder(room, MAT, GLOW)


# ------------------------------------------------------------------ shell
b.box("floor", (ROOM, ROOM, 0.1), (0, 0, -0.05), "tile_blue", bevel=0.03)
T = 0.5
tiles = []
for i in range(int(ROOM / T)):
    for j in range(int(ROOM / T)):
        if (i + j) % 2 == 0:
            tiles.append(((T - 0.02, T - 0.02, 0.004), (-H + T / 2 + i * T, -H + T / 2 + j * T, 0.002)))
b.multi_box("floor_tiles", tiles, "white")

# north wall (full), west wall split around the door
b.box("wall_N", (ROOM + WALL_T, WALL_T, WALL_H), (-WALL_T / 2, H, WALL_H / 2), "glass", bevel=0.03)
seg = (ROOM - DOOR_W) / 2
b.box("wall_W_a", (WALL_T, seg, WALL_H), (-H, -H + seg / 2, WALL_H / 2), "glass", bevel=0.03)
b.box("wall_W_b", (WALL_T, seg, WALL_H), (-H, H - seg / 2, WALL_H / 2), "glass", bevel=0.03)
b.box("wall_W_lintel", (WALL_T, DOOR_W + 0.02, WALL_H - DOOR_H), (-H, 0, DOOR_H + (WALL_H - DOOR_H) / 2), "glass",
      bevel=0.02)
# tiled wainscot band + trim
b.box("wall_N_tiles", (ROOM, 0.03, TILE_H), (0, IN_N - 0.015, TILE_H / 2), "white", bevel=0.01)
b.box("wall_N_trim", (ROOM, 0.05, 0.05), (0, IN_N - 0.025, TILE_H), "mint", bevel=0.015)
for k, yc in enumerate((-H + seg / 2, H - seg / 2)):
    b.box(f"wall_W_tiles_{k}", (0.03, seg, TILE_H), (IN_W + 0.015, yc, TILE_H / 2), "white", bevel=0.01)
    b.box(f"wall_W_trim_{k}", (0.05, seg, 0.05), (IN_W + 0.025, yc, TILE_H), "mint", bevel=0.015)
b.box("wall_N_cap", (ROOM + WALL_T + 0.04, WALL_T + 0.04, 0.05), (-WALL_T / 2, H, WALL_H), "white")
b.box("wall_W_cap", (WALL_T + 0.04, ROOM + 0.04, 0.05), (-H, 0, WALL_H), "white")
# door frame
for k, yy in enumerate((-DOOR_W / 2, DOOR_W / 2)):
    b.box(f"door_frame_side_{k}", (WALL_T + 0.06, 0.07, DOOR_H), (-H, yy, DOOR_H / 2), "white", bevel=0.02)
# glimpse of the cafe behind the doorway (warm wood instead of empty background)
b.box("doorway_view", (0.04, DOOR_W + 0.1, DOOR_H), (-H - WALL_T / 2 - 0.3, 0, DOOR_H / 2), "wall", bevel=0)
b.box("doorway_view_floor", (0.4, DOOR_W, 0.1), (-H - WALL_T / 2 - 0.12, 0, -0.05), "floor", bevel=0)
b.box("door_frame_top", (WALL_T + 0.06, DOOR_W + 0.14, 0.07), (-H, 0, DOOR_H), "white", bevel=0.02)
# coffee-cup plaque above the door (it leads to the cafe)
b.box("door_sign", (0.03, 0.34, 0.26), (IN_W - 0.0, 0, DOOR_H + 0.2), "wood", bevel=0.04)
b.cyl("door_sign_cup", 0.06, 0.09, (IN_W + 0.05, 0, DOOR_H + 0.19), "white", rot=(0, 0, 0), bevel=0.01)
b.torus("door_sign_cup_handle", 0.028, 0.009, (IN_W + 0.05, -0.07, DOOR_H + 0.2), "white", rot=(90, 0, 90))
b.ball("door_sign_steam", 0.022, (IN_W + 0.05, 0, DOOR_H + 0.28), "white")

b.box("wall_S_low", (ROOM + WALL_T, WALL_T, LOW_H), (0, -H, LOW_H / 2), "white", bevel=0.04)
b.box("wall_E_low", (WALL_T, ROOM, LOW_H), (H, 0, LOW_H / 2), "white", bevel=0.04)
b.box("doormat", (0.5, 1.0, 0.015), (IN_W + 0.35, 0, 0.008), "teal", bevel=0.005)


# ------------------------------------------------------------------ clawfoot tub + shower (sketches 1, 2, 4)
TUB_L, TUB_D = 1.6, 0.8
TUB_Z0, TUB_Z1 = 0.08, 0.42  # body bottom (above feet) and rim
tx, ty = -1.0, IN_N - TUB_D / 2 - 0.12
tub = b.box("INT_tub", (TUB_L, TUB_D, TUB_Z1 - TUB_Z0), (tx, ty, (TUB_Z0 + TUB_Z1) / 2), "white", bevel=0.14,
            props={"action": "bath", "sfx": "splash"})
tub.modifiers["Bevel"].segments = 5
inner = b.box("tub_cutter", (TUB_L - 0.12, TUB_D - 0.12, 0.5), (tx, ty, TUB_Z0 + 0.06 + 0.25), "white", bevel=0.1)
inner.modifiers["Bevel"].segments = 4
b.cut(tub, inner)
b.box("tub_water", (TUB_L - 0.16, TUB_D - 0.16, 0.02), (tx, ty, TUB_Z1 - 0.07), "sky", bevel=0.05)
for i, (sx, sy) in enumerate(((1, 1), (1, -1), (-1, 1), (-1, -1))):
    b.ball(f"tub_foot_{i}", 0.05, (tx + sx * (TUB_L / 2 - 0.16), ty + sy * (TUB_D / 2 - 0.12), 0.05), "yellow",
           scale=(1, 1, 1.1))
# foam heap (hidden by the game until someone bathes / taps the tub)
foam_spots = [(-0.5, 0.05, 0.12), (-0.2, -0.12, 0.14), (0.12, 0.1, 0.13), (0.42, -0.06, 0.12), (0.0, 0.0, 0.16),
              (-0.35, -0.18, 0.09), (0.3, 0.18, 0.1), (0.58, 0.14, 0.08), (-0.6, -0.12, 0.08), (0.2, -0.2, 0.09)]
for i, (dx, dy, r) in enumerate(foam_spots):
    b.ball(f"tub_foam_{i}", r, (tx + dx, ty + dy, TUB_Z1 - 0.04), "white", scale=(1, 1, 0.75))
b.empty("SNAP_bath_tub", (tx, ty, TUB_Z0 + 0.06), props={"pose": "bath", "owner": "INT_tub"})

# shower: pipe rises behind the left end of the tub, arm reaches over, rain head
px = tx - TUB_L / 2 + 0.12
py = IN_N - 0.06
b.cyl("INT_shower", 0.022, 1.25, (px, py, 0.625), "grey", bevel=0, props={"action": "shower", "sfx": "water"})
arm = [(px, py, 1.25), (px + 0.05, py - 0.02, 1.33), (px + 0.2, py - 0.12, 1.36), (px + 0.4, py - 0.3, 1.3)]
b.tube("shower_arm", arm, 0.022, "grey")
b.cyl("shower_head", 0.15, 0.05, (px + 0.4, py - 0.3, 1.26), "white", r2=0.1, bevel=0.015)
b.cyl("shower_head_face", 0.13, 0.012, (px + 0.4, py - 0.3, 1.232), "grey", bevel=0)
b.ball("shower_valve", 0.04, (px, py - 0.01, 0.62), "red", scale=(1, 0.6, 1))
b.empty("FX_shower", (px + 0.4, py - 0.3, 1.2), props={"fx": "shower"})

# rubber duck on the rim
dxp, dyp = tx + TUB_L / 2 - 0.2, ty - TUB_D / 2 + 0.07
b.ball("INT_duck", 0.06, (dxp, dyp, TUB_Z1 + 0.05), "yellow", scale=(1.2, 1, 0.85), props={"action": "squeak", "sfx": "squeak"})
b.ball("duck_head", 0.04, (dxp - 0.045, dyp, TUB_Z1 + 0.11), "yellow")
b.cyl("duck_beak", 0.02, 0.04, (dxp - 0.09, dyp, TUB_Z1 + 0.105), "orange", r2=0.005, rot=(0, -90, 0), seg=12, bevel=0)
for s in (-1, 1):
    b.ball(f"duck_eye_{s}", 0.008, (dxp - 0.07, dyp + s * 0.022, TUB_Z1 + 0.125), "black")

# bottle shelf above the tub
b.box("bottle_shelf", (0.6, 0.14, 0.03), (tx + 0.2, IN_N - 0.07, 0.8), "white", bevel=0.01)
for i, (col, h) in enumerate((("pink", 0.16), ("mint", 0.12), ("yellow", 0.14))):
    bx = tx + 0.02 + i * 0.18
    b.cyl("INT_bottles" if i == 0 else f"bottles_{i}", 0.045, h, (bx, IN_N - 0.07, 0.815 + h / 2), col,
          bevel=0.015, props={"action": "bubbles", "sfx": "bloop"} if i == 0 else None)
    b.cyl(f"bottles_cap_{i}", 0.02, 0.03, (bx, IN_N - 0.07, 0.815 + h + 0.015), "white", bevel=0.005)

# bath mat in front of the tub
b.box("rug_bath", (1.0, 0.55, 0.012), (tx, ty - TUB_D / 2 - 0.45, 0.006), "pink", bevel=0.005)


# ------------------------------------------------------------------ vanity sink + round mirror
vx, vw, vd, vh = 1.55, 0.8, 0.42, 0.42
vy = IN_N - vd / 2
b.box("vanity", (vw, vd, vh - 0.04), (vx, vy, (vh - 0.04) / 2), "sky", bevel=0.03)
for k, dxv in enumerate((-0.19, 0.19)):
    b.box(f"vanity_door_{k}", (0.34, 0.02, 0.28), (vx + dxv, vy - vd / 2 - 0.005, 0.2), "glass", bevel=0.015)
    b.ball(f"vanity_knob_{k}", 0.015, (vx + dxv * 0.35, vy - vd / 2 - 0.02, 0.26), "yellow")
b.box("vanity_top", (vw + 0.04, vd + 0.03, 0.04), (vx, vy - 0.01, vh - 0.02), "white", bevel=0.015)
b.cyl("INT_sink", 0.17, 0.08, (vx, vy - 0.02, vh + 0.03), "white", r2=0.14, bevel=0.02,
      props={"action": "wash", "sfx": "water"})
b.cyl("sink_water", 0.13, 0.01, (vx, vy - 0.02, vh + 0.06), "sky", bevel=0)
faucet = [(vx, vy + 0.15, vh), (vx, vy + 0.15, vh + 0.16), (vx, vy + 0.08, vh + 0.2), (vx, vy + 0.02, vh + 0.16)]
b.tube("sink_faucet", faucet, 0.018, "grey")
b.empty("FX_sink", (vx, vy + 0.02, vh + 0.15), props={"fx": "sink"})
b.cyl("toothbrush_cup", 0.035, 0.08, (vx + 0.3, vy + 0.05, vh + 0.04), "mint", bevel=0.01)
for i, (dx2, col) in enumerate(((-0.012, "pink"), (0.012, "yellow"))):
    b.cyl(f"toothbrush_{i}", 0.007, 0.14, (vx + 0.3 + dx2, vy + 0.05, vh + 0.1), col, rot=(0, dx2 * 900, 0), bevel=0)
# round mirror (disc facing -Y)
b.cyl("INT_mirror", 0.3, 0.04, (vx, IN_N - 0.02, 0.98), "yellow", rot=(90, 0, 0), seg=40, bevel=0.015,
      props={"action": "sparkle", "sfx": "chime"})
b.cyl("mirror_glass", 0.26, 0.02, (vx, IN_N - 0.045, 0.98), "glass", rot=(90, 0, 0), seg=40, bevel=0)
b.box("mirror_shine_a", (0.12, 0.01, 0.025), (vx - 0.08, IN_N - 0.058, 1.08), "white", rot=(0, -40, 0), bevel=0)
b.box("mirror_shine_b", (0.06, 0.01, 0.025), (vx - 0.02, IN_N - 0.058, 1.12), "white", rot=(0, -40, 0), bevel=0)


# ------------------------------------------------------------------ west wall: towel rack + towel bench (sketch 3)
ry = 1.7
b.cyl("towel_rack_bar", 0.015, 0.7, (IN_W + 0.08, ry, 0.95), "grey", rot=(90, 0, 0), bevel=0)
for k in (-1, 1):
    b.box(f"towel_rack_bracket_{k}", (0.08, 0.03, 0.03), (IN_W + 0.04, ry + k * 0.35, 0.95), "grey", bevel=0.005)
b.box("INT_towel_pink", (0.04, 0.26, 0.42), (IN_W + 0.1, ry - 0.15, 0.76), "pink", bevel=0.02,
      props={"action": "swing", "sfx": "whoosh"})
b.box("INT_towel_mint", (0.04, 0.26, 0.36), (IN_W + 0.1, ry + 0.16, 0.79), "mint", bevel=0.02,
      props={"action": "swing", "sfx": "whoosh"})

bx0, by0 = IN_W + 0.25, -1.75
b.box("INT_bench", (0.42, 1.0, 0.24), (bx0, by0, 0.12 + 0.02), "wood", bevel=0.03,
      props={"action": "sit", "sfx": "pop"})
for k in (-1, 1):
    b.box(f"bench_leg_{k}", (0.36, 0.06, 0.04), (bx0, by0 + k * 0.42, 0.02), "wood_dark", bevel=0.01)
b.box("bench_cushion", (0.38, 0.6, 0.06), (bx0, by0 + 0.17, 0.29), "pink", bevel=0.03)
for i, col in enumerate(("mint", "yellow", "sky")):
    b.box(f"bench_towels_{i}", (0.32, 0.28, 0.06), (bx0, by0 - 0.3, 0.29 + i * 0.065), col, bevel=0.025)
b.empty("SNAP_sit_bench", (bx0, by0 + 0.17, 0.32), props={"pose": "sit", "owner": "INT_bench"})

# potted plant in the south-west corner + laundry basket near the vanity
b.cyl("plant_pot", 0.13, 0.2, (IN_W + 0.3, -2.6, 0.1), "white", r2=0.16, bevel=0.02)
for i, (dx3, dy3, dz3, r) in enumerate(((0, 0, 0.32, 0.13), (0.06, 0.05, 0.42, 0.09), (-0.05, -0.05, 0.41, 0.08))):
    b.ball(f"plant_leaves_{i}", r, (IN_W + 0.3 + dx3, -2.6 + dy3, dz3), "green")
b.cyl("INT_basket", 0.2, 0.3, (2.5, 2.2, 0.15), "sand", r2=0.23, bevel=0.03, props={"action": "bounce", "sfx": "pop"})
b.ball("basket_shirt", 0.12, (2.48, 2.2, 0.3), "lilac", scale=(1.3, 1, 0.5))
b.ball("basket_sock", 0.06, (2.58, 2.12, 0.33), "red", scale=(1.4, 0.8, 0.6))


# ------------------------------------------------------------------ middle of the room
b.cyl("rug_round", 0.95, 0.012, (0.2, -0.4, 0.006), "lemon", seg=40, bevel=0)
# step stool in front of the sink (kids climb it to wash hands)
b.box("INT_step_stool", (0.36, 0.26, 0.2), (vx, vy - vd / 2 - 0.3, 0.1), "mint", bevel=0.04,
      props={"action": "sit", "sfx": "pop"})
b.box("step_stool_top", (0.38, 0.28, 0.03), (vx, vy - vd / 2 - 0.3, 0.215), "white", bevel=0.012)
b.empty("SNAP_sit_step_stool", (vx, vy - vd / 2 - 0.3, 0.23), props={"pose": "sit", "owner": "INT_step_stool"})
# toy box with a boat on the round rug
b.box("INT_toybox", (0.5, 0.36, 0.26), (0.55, -0.25, 0.13), "red", bevel=0.04, props={"action": "toot", "sfx": "toot"})
b.box("toybox_lid", (0.54, 0.4, 0.04), (0.55, -0.25, 0.28), "yellow", bevel=0.015)
b.box("toybox_boat_hull", (0.24, 0.1, 0.06), (0.5, -0.25, 0.33), "sky", bevel=0.025)
b.cyl("toybox_boat_mast", 0.008, 0.14, (0.5, -0.25, 0.42), "wood_dark", bevel=0)
b.cyl("toybox_boat_sail", 0.06, 0.09, (0.53, -0.25, 0.43), "white", r2=0.003, rot=(0, 0, 0), seg=3, bevel=0)
b.ball("toybox_ball", 0.07, (0.72, -0.2, 0.37), "pink")

# ------------------------------------------------------------------ game markers
nav = b.box("NAV_floor", (ROOM - 0.4, ROOM - 0.4, 0.001), (0, 0, 0.001), "mint", bevel=0)
nav.display_type = "WIRE"
nav.hide_render = True
b.empty("DOOR_west", (-H, 0, 0), size=0.4, props={"to": "cafe", "spawn": "DOOR_east"}, shape="SINGLE_ARROW",
        rot=(0, -90, 0))
b.empty("SPAWN_01", (-1.8, 0, 0), size=0.3, shape="CIRCLE", rot=(90, 0, 0))


# ------------------------------------------------------------------ preview camera + light (not exported)
scn = bpy.context.scene
cam_data = bpy.data.cameras.new("PreviewCam")
cam_data.lens = 50
cam = bpy.data.objects.new("PreviewCam", cam_data)
preview.objects.link(cam)
target = (-0.3, 0.3, 0.4)
dist = 15.5
el = math.radians(45)
cam.location = (target[0] + dist * math.cos(el) * math.sin(math.radians(45)),
                target[1] - dist * math.cos(el) * math.cos(math.radians(45)),
                target[2] + dist * math.sin(el))
look_at(cam, target)
scn.camera = cam
sun_data = bpy.data.lights.new("Sun", "SUN")
sun_data.energy = 3.6
sun_data.angle = math.radians(8)
sun = bpy.data.objects.new("Sun", sun_data)
preview.objects.link(sun)
sun.rotation_euler = (math.radians(40), 0, math.radians(30))
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

bpy.context.view_layer.update()
print("objects:", len(room.objects))
