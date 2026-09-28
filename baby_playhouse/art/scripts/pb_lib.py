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
