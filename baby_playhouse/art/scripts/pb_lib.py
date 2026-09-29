"""Shared helpers for Baby Playhouse Blender build scripts.

Conventions (see README):
- 1 unit = 1 m, Z up in Blender (glTF exporter converts to Y up).
- Characters are ~0.7 m tall (2 heads), furniture is scaled to them.
- Every mesh uses the single palette texture: all UVs of an object sit on
  the centre of one colour swatch.
- Object name prefixes: INT_ (interactable), SNAP_ (pose point),
  NAV_ (walkable area), DOOR_ (room link), SPAWN_ (spawn point), COL_ (blocker).
"""
import math
import os

import bmesh
import bpy
from mathutils import Euler, Vector

# name -> sRGB hex. Order defines swatch position (8x8 grid, 32 px cells).
PALETTE = [
    ("wall", "F6E7CF"), ("wall_trim", "E9CFA8"), ("floor", "E2B07E"), ("floor_dark", "C48A57"),
    ("wood", "C98B5A"), ("wood_dark", "8C5A3C"), ("white", "FFFDF7"), ("cream", "FFF1DC"),
    ("black", "2E2B33"), ("grey", "B8B6C4"), ("grey_dark", "6E6A7C"), ("navy", "44507A"),
    ("sky", "A9D3F2"), ("glass", "D6EEFA"), ("mint", "A5DCC8"), ("green", "7CC47F"),
    ("pink", "F7A8B8"), ("blush", "FFB7B2"), ("red", "E8665A"), ("orange", "F5A45D"),
    ("yellow", "FFE08A"), ("bulb", "FFF2B0"), ("brown", "7A5240"), ("choco", "5A3B2E"),
    ("lilac", "C9B8E8"), ("cat_grey", "B3AEC6"), ("sand", "EED9B5"), ("teal", "5FB3A8"),
    ("tile_blue", "BCDDF3"), ("lemon", "FFF3C4"),
    ("capy", "B98250"), ("capy_dark", "8A5A38"), ("grass", "A3D67E"), ("grass_dark", "86C25F"),
    ("coral", "F28C7A"), ("peach", "FBD3B8"), ("sofa", "8FC7B5"), ("bark", "9A6B47"),
    ("sky_deep", "6FA8DC"), ("plum", "9C7BC4"),
]
GRID = 8
CELL = 32
TEX_SIZE = GRID * CELL
_INDEX = {name: i for i, (name, _) in enumerate(PALETTE)}


def hex_to_rgb(h):
    return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))


def swatch_uv(color):
    i = _INDEX[color]
    col, row = i % GRID, i // GRID
    u = (col + 0.5) / GRID
    v = 1 - (row + 0.5) / GRID
    return u, v


# ---------------------------------------------------------------- scene setup

def clear_scene():
    for o in list(bpy.data.objects):
        bpy.data.objects.remove(o, do_unlink=True)
    for coll in (bpy.data.meshes, bpy.data.curves, bpy.data.materials, bpy.data.lights,
                 bpy.data.cameras, bpy.data.images):
        for d in list(coll):
            coll.remove(d)
    for c in list(bpy.data.collections):
        bpy.data.collections.remove(c)


def collection(name, parent=None):
    c = bpy.data.collections.get(name) or bpy.data.collections.new(name)
    p = parent or bpy.context.scene.collection
    if c.name not in p.children:
        p.children.link(c)
    return c


def build_palette(png_path):
    img = bpy.data.images.new("palette", TEX_SIZE, TEX_SIZE, alpha=False)
    px = [0.0] * (TEX_SIZE * TEX_SIZE * 4)
    for i, (_, h) in enumerate(PALETTE):
        r, g, b = hex_to_rgb(h)
        col, row = i % GRID, i // GRID
        for y in range(CELL):
            py = TEX_SIZE - 1 - (row * CELL + y)  # image rows start at bottom
            for x in range(CELL):
                o = (py * TEX_SIZE + col * CELL + x) * 4
                px[o:o + 4] = (r, g, b, 1.0)
    img.pixels = px
    os.makedirs(os.path.dirname(png_path), exist_ok=True)
    img.filepath_raw = png_path
    img.file_format = "PNG"
    img.save()
    return img


def palette_material(img, name="M_Palette", emissive=False):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    bsdf = nt.nodes.get("Principled BSDF")
    if bsdf is None:  # Blender 5.x may create an empty node tree
        nt.nodes.clear()
        bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
        out = nt.nodes.new("ShaderNodeOutputMaterial")
        nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    tex = nt.nodes.new("ShaderNodeTexImage")
    tex.image = img
    tex.interpolation = "Closest"
    nt.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = 0.85
    if emissive:
        nt.links.new(tex.outputs["Color"], bsdf.inputs["Emission Color"])
        bsdf.inputs["Emission Strength"].default_value = 2.5
    return m


class Builder:
    """Creates palette-coloured primitives into a target collection."""

    def __init__(self, coll, mat, glow_mat):
        self.coll = coll
        self.mat = mat
        self.glow = glow_mat

    # -- core
    def _finish(self, name, bm, color, loc, rot, smooth, glow, bevel, parent, props):
        me = bpy.data.meshes.new(name)
        bm.to_mesh(me)
        bm.free()
        uv = me.uv_layers.new(name="UVMap")
        u, v = swatch_uv(color)
        for d in uv.data:
            d.uv = (u, v)
        me.materials.append(self.glow if glow else self.mat)
        for p in me.polygons:
            p.use_smooth = smooth
        ob = bpy.data.objects.new(name, me)
        self.coll.objects.link(ob)
        ob.location = loc
        ob.rotation_euler = Euler(tuple(math.radians(a) for a in rot))
        if bevel:
            mod = ob.modifiers.new("Bevel", "BEVEL")
            mod.width = bevel
            mod.segments = 3
            mod.limit_method = "ANGLE"
            mod.harden_normals = False
        if parent:
            ob.parent = parent
        for k, val in (props or {}).items():
            ob[k] = val
        return ob

    def box(self, name, size, loc, color, rot=(0, 0, 0), bevel=0.02, glow=False, parent=None, props=None):
        """size = full (x, y, z); loc = centre of the box."""
        bm = bmesh.new()
        bmesh.ops.create_cube(bm, size=1.0)
        bmesh.ops.scale(bm, vec=Vector(size), verts=bm.verts)
        bevel = min(bevel, min(size) * 0.45) if bevel else 0
        return self._finish(name, bm, color, loc, rot, False, glow, bevel, parent, props)

    def multi_box(self, name, boxes, color, bevel=0, parent=None, props=None):
        """Many boxes merged into one mesh (one draw call). boxes = [(size, centre), ...]."""
        bm = bmesh.new()
        for size, centre in boxes:
            geom = bmesh.ops.create_cube(bm, size=1.0)
            verts = geom["verts"]
            bmesh.ops.scale(bm, vec=Vector(size), verts=verts)
            bmesh.ops.translate(bm, vec=Vector(centre), verts=verts)
        return self._finish(name, bm, color, (0, 0, 0), (0, 0, 0), False, False, bevel, parent, props)

    def cut(self, target, cutter):
        """Boolean-subtract `cutter` from `target` (applied on export). Cutter is hidden, not exported."""
        mod = target.modifiers.new("Cut", "BOOLEAN")
        mod.operation = "DIFFERENCE"
        mod.solver = "EXACT"
        mod.object = cutter
        cutter.display_type = "WIRE"
        cutter.hide_render = True
        for c in list(cutter.users_collection):
            c.objects.unlink(cutter)
        cutters = bpy.data.collections.get("Cutters") or collection("Cutters")
        cutters.objects.link(cutter)
        cutters.hide_render = True
        return mod

    def cyl(self, name, r, h, loc, color, rot=(0, 0, 0), seg=24, r2=None, bevel=0.01,
            glow=False, parent=None, props=None):
        """Cylinder/cone standing on Z; loc = centre."""
        bm = bmesh.new()
        bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=seg,
                              radius1=r, radius2=r if r2 is None else r2, depth=h)
        bevel = min(bevel, h * 0.4, r * 0.4) if bevel else 0
        ob = self._finish(name, bm, color, loc, rot, True, glow, bevel, parent, props)
        if bevel:
            ob.modifiers["Bevel"].limit_method = "ANGLE"
        return ob

    def ball(self, name, r, loc, color, scale=(1, 1, 1), rot=(0, 0, 0), seg=24, glow=False,
             parent=None, props=None):
        bm = bmesh.new()
        bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=max(8, seg // 2), radius=r)
        bmesh.ops.scale(bm, vec=Vector(scale), verts=bm.verts)
        return self._finish(name, bm, color, loc, rot, True, glow, 0, parent, props)

    def torus(self, name, R, r, loc, color, rot=(0, 0, 0), seg=24, parent=None, props=None):
        bm = bmesh.new()
        ring = []
        minor = 8
        for i in range(seg):
            a = 2 * math.pi * i / seg
            row = []
            for j in range(minor):
                b = 2 * math.pi * j / minor
                rr = R + r * math.cos(b)
                row.append(bm.verts.new((rr * math.cos(a), rr * math.sin(a), r * math.sin(b))))
            ring.append(row)
        for i in range(seg):
            for j in range(minor):
                a, b = ring[i], ring[(i + 1) % seg]
                bm.faces.new((a[j], b[j], b[(j + 1) % minor], a[(j + 1) % minor]))
        return self._finish(name, bm, color, loc, rot, True, False, 0, parent, props)

    def arc_block(self, name, center, r_in, r_out, a0, a1, z0, z1, color, seg=20, bevel=0.02,
                  parent=None, props=None):
        """Annular sector (angles in degrees, CCW from +X) extruded between z0..z1."""
        bm = bmesh.new()
        rings = []
        for i in range(seg + 1):
            a = math.radians(a0 + (a1 - a0) * i / seg)
            c, s = math.cos(a), math.sin(a)
            rings.append([
                bm.verts.new((center[0] + r_in * c, center[1] + r_in * s, z0)),
                bm.verts.new((center[0] + r_out * c, center[1] + r_out * s, z0)),
                bm.verts.new((center[0] + r_out * c, center[1] + r_out * s, z1)),
                bm.verts.new((center[0] + r_in * c, center[1] + r_in * s, z1)),
            ])
        for i in range(seg):
            a, b = rings[i], rings[i + 1]
            for j in range(4):
                bm.faces.new((a[j], a[(j + 1) % 4], b[(j + 1) % 4], b[j]))
        bm.faces.new(tuple(reversed(rings[0])))
        bm.faces.new(tuple(rings[-1]))
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
        return self._finish(name, bm, color, (0, 0, 0), (0, 0, 0), False, False, bevel, parent, props)

    def text(self, name, body, size, loc, color, rot=(90, 0, 0), depth=0.03, glow=False, props=None):
        cu = bpy.data.curves.new(name + "_curve", "FONT")
        cu.body = body
        cu.size = size
        cu.extrude = depth
        cu.bevel_depth = 0.008
        cu.align_x = "CENTER"
        cu.align_y = "CENTER"
        tmp = bpy.data.objects.new(name + "_tmp", cu)
        self.coll.objects.link(tmp)
        return self._curve_to_mesh(tmp, name, color, loc, rot, glow, props, smooth=False)

    def tube(self, name, points, radius, color, glow=False, parent=None, props=None):
        cu = bpy.data.curves.new(name + "_curve", "CURVE")
        cu.dimensions = "3D"
        cu.bevel_depth = radius
        cu.bevel_resolution = 3
        cu.use_fill_caps = True
        sp = cu.splines.new("POLY")
        sp.points.add(len(points) - 1)
        for p, co in zip(sp.points, points):
            p.co = (*co, 1)
        tmp = bpy.data.objects.new(name + "_tmp", cu)
        self.coll.objects.link(tmp)
        ob = self._curve_to_mesh(tmp, name, color, (0, 0, 0), (0, 0, 0), glow, props)
        if parent:
            ob.parent = parent
        return ob

    def _curve_to_mesh(self, tmp, name, color, loc, rot, glow, props, smooth=True):
        bpy.context.view_layer.update()
        dg = bpy.context.evaluated_depsgraph_get()
        me = bpy.data.meshes.new_from_object(tmp.evaluated_get(dg))
        curve = tmp.data
        bpy.data.objects.remove(tmp, do_unlink=True)
        bpy.data.curves.remove(curve)
        bm = bmesh.new()
        bm.from_mesh(me)
        bpy.data.meshes.remove(me)
        return self._finish(name, bm, color, loc, rot, smooth, glow, 0, None, props)

    def empty(self, name, loc, size=0.15, parent=None, props=None, shape="ARROWS", rot=(0, 0, 0)):
        ob = bpy.data.objects.new(name, None)
        ob.empty_display_type = shape
        ob.empty_display_size = size
        self.coll.objects.link(ob)
        ob.location = loc
        ob.rotation_euler = Euler(tuple(math.radians(a) for a in rot))
        if parent:
            ob.parent = parent
        for k, val in (props or {}).items():
            ob[k] = val
        return ob


def look_at(ob, target):
    d = Vector(target) - ob.location
    ob.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()


def select_only(objs):
    for o in bpy.context.view_layer.objects:
        o.select_set(False)
    for o in objs:
        o.select_set(True)


def export_glb(objs, path):
    select_only(objs)
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        use_selection=True,
        export_extras=True,
        export_apply=True,
        export_yup=True,
        export_animations=True,
        export_cameras=False,
        export_lights=False,
    )
    select_only([])


# ---------------------------------------------------------------- room kit (shared by new rooms)

ROOM = 6.0
H = ROOM / 2
WALL_T = 0.15
WALL_H = 1.5
LOW_H = 0.25
IN_N = H - WALL_T / 2
IN_W = -H + WALL_T / 2
DOOR_W = 1.2
DOOR_H = 1.1


def _wall_run(b, name, axis, fixed, length_min, length_max, door, height, thick, color, bevel):
    """One straight wall along `axis` ('x' or 'y') at `fixed`, with an optional door gap centred at `door`."""
    spans = [(length_min, length_max)]
    if door is not None:
        spans = [(length_min, door - DOOR_W / 2), (door + DOOR_W / 2, length_max)]
    parts = []
    for i, (a, c) in enumerate(spans):
        if c - a < 0.02:
            continue
        mid, ln = (a + c) / 2, c - a
        if axis == "x":
            parts.append(b.box(f"{name}_{i}", (ln, thick, height), (mid, fixed, height / 2), color, bevel=bevel))
        else:
            parts.append(b.box(f"{name}_{i}", (thick, ln, height), (fixed, mid, height / 2), color, bevel=bevel))
    return parts


def room_shell(b, wall="wall", trim="wall_trim", low="wall_trim", doors=None, floor=None, views=None):
    """Standard 6x6 room: full walls N/W, low walls S/E. doors = {'N': x, 'W': y, 'S': x, 'E': y}.

    views = {'N': (wall_color, floor_color)} tints the glimpse behind a full-wall door.
    """
    doors = doors or {}
    if floor:
        b.box("floor", (ROOM, ROOM, 0.1), (0, 0, -0.05), floor, bevel=0.03)
    _wall_run(b, "wall_N", "x", H, -H - WALL_T, H, doors.get("N"), WALL_H, WALL_T, wall, 0.03)
    _wall_run(b, "wall_W", "y", -H, -H, H, doors.get("W"), WALL_H, WALL_T, wall, 0.03)
    _wall_run(b, "wall_S_low", "x", -H, -H - WALL_T / 2, H + WALL_T / 2, doors.get("S"), LOW_H, WALL_T, low, 0.04)
    _wall_run(b, "wall_E_low", "y", H, -H, H, doors.get("E"), LOW_H, WALL_T, low, 0.04)
    b.box("wall_N_cap", (ROOM + WALL_T + 0.04, WALL_T + 0.04, 0.05), (-WALL_T / 2, H, WALL_H), trim)
    b.box("wall_W_cap", (WALL_T + 0.04, ROOM + 0.04, 0.05), (-H, 0, WALL_H), trim)
    b.box("wall_N_skirting", (ROOM, 0.03, 0.12), (0, IN_N - 0.015, 0.06), trim, bevel=0.01)
    b.box("wall_W_skirting", (0.03, ROOM, 0.12), (IN_W + 0.015, 0, 0.06), trim, bevel=0.01)
    for side, pos in doors.items():
        if side in ("N", "W"):
            vw, vf = (views or {}).get(side, ("wall", "floor"))
            door_frame(b, side, pos, trim, wall=wall, view_color=vw, view_floor=vf)


def door_frame(b, side, pos, color="white", wall="wall", view_color="wall", view_floor="floor"):
    """Frame + lintel for a door in a full-height wall, plus a glimpse of the room behind it."""
    lintel_h = WALL_H - DOOR_H
    if side == "N":
        b.box("wall_N_lintel", (DOOR_W + 0.02, WALL_T, lintel_h), (pos, H, DOOR_H + lintel_h / 2), wall, bevel=0.02)
        for k, dx in enumerate((-DOOR_W / 2, DOOR_W / 2)):
            b.box(f"door_frame_N_side_{k}", (0.07, WALL_T + 0.06, DOOR_H), (pos + dx, H, DOOR_H / 2), color, bevel=0.02)
        b.box("door_frame_N_top", (DOOR_W + 0.14, WALL_T + 0.06, 0.07), (pos, H, DOOR_H), color, bevel=0.02)
        b.box("doorway_N_view", (DOOR_W + 0.1, 0.04, DOOR_H), (pos, H + WALL_T / 2 + 0.3, DOOR_H / 2), view_color, bevel=0)
        b.box("doorway_N_view_floor", (DOOR_W, 0.4, 0.1), (pos, H + WALL_T / 2 + 0.12, -0.05), view_floor, bevel=0)
    else:
        b.box("wall_W_lintel", (WALL_T, DOOR_W + 0.02, lintel_h), (-H, pos, DOOR_H + lintel_h / 2), wall, bevel=0.02)
        for k, dy in enumerate((-DOOR_W / 2, DOOR_W / 2)):
            b.box(f"door_frame_W_side_{k}", (WALL_T + 0.06, 0.07, DOOR_H), (-H, pos + dy, DOOR_H / 2), color, bevel=0.02)
        b.box("door_frame_W_top", (WALL_T + 0.06, DOOR_W + 0.14, 0.07), (-H, pos, DOOR_H), color, bevel=0.02)
        b.box("doorway_W_view", (0.04, DOOR_W + 0.1, DOOR_H), (-H - WALL_T / 2 - 0.3, pos, DOOR_H / 2), view_color, bevel=0)
        b.box("doorway_W_view_floor", (0.4, DOOR_W, 0.1), (-H - WALL_T / 2 - 0.12, pos, -0.05), view_floor, bevel=0)


def setup_preview(preview_coll, lens=50, dist=15.5, target=(-0.3, 0.3, 0.4)):
    """Camera from the south-east at 45 deg, sun + warm world, EEVEE, Standard view transform."""
    scn = bpy.context.scene
    cam_data = bpy.data.cameras.new("PreviewCam")
    cam_data.lens = lens
    cam = bpy.data.objects.new("PreviewCam", cam_data)
    preview_coll.objects.link(cam)
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
    preview_coll.objects.link(sun)
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


def nav_and_spawn(b, spawn=(0, 0)):
    nav = b.box("NAV_floor", (ROOM - 0.4, ROOM - 0.4, 0.001), (0, 0, 0.001), "mint", bevel=0)
    nav.display_type = "WIRE"
    nav.hide_render = True
    b.empty("SPAWN_01", (spawn[0], spawn[1], 0), size=0.3, shape="CIRCLE", rot=(90, 0, 0))
    return nav
