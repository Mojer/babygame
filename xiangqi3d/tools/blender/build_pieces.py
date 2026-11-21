"""
Builds the seven chibi xiangqi figures and exports public/models/pieces.glb.

Run inside Blender (Scripting tab or MCP execute_script_file). Parts are authored
in three.js space (y up, front +z, feet at y = 0) and rotated into Blender's z-up
at the end, so the glTF exporter hands them back in the same space.

Each face carries a material named after its colour role; the game swaps those
for toon materials, which is how red and black share one model.
"""

import math
import os

import bmesh
import bpy
from mathutils import Matrix, Vector

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
OUT_GLB = os.path.join(ROOT, 'public', 'models', 'pieces.glb')
OUT_BLEND = os.path.join(HERE, 'pieces.blend')
COLLECTION = 'XQ_Pieces'

# role -> preview colour in Blender (the game ignores these)
ROLES = {
    'main': (0.88, 0.28, 0.24),
    'trim': (1.0, 0.79, 0.29),
    'plume': (1.0, 0.88, 0.4),
    'skin': (1.0, 0.85, 0.72),
    'hair': (0.23, 0.16, 0.13),
    'dark': (0.23, 0.16, 0.13),
    'wood': (0.75, 0.53, 0.31),
    'metal': (0.33, 0.36, 0.4),
    'grey': (0.71, 0.76, 0.81),
    'coat': (0.95, 0.86, 0.69),
    'snout': (1.0, 0.93, 0.87),
    'pink': (0.95, 0.71, 0.75),
    'white': (1.0, 1.0, 1.0),
    'gem': (1.0, 0.2, 0.33),
    'fuse': (1.0, 0.69, 0.18),
    'cheek': (1.0, 0.6, 0.64),
    'eyehi': (1.0, 1.0, 1.0),
}
ROLE_NAMES = list(ROLES)

TAU = math.pi * 2


# ---------- transforms (three.js conventions) ----------

def trs(loc=(0, 0, 0), rot=(0, 0, 0), scale=1.0):
    """three.js Object3D matrix: T * Rx * Ry * Rz * S (Euler order XYZ)."""
    s = scale if isinstance(scale, (tuple, list)) else (scale, scale, scale)
    r = Matrix.Rotation(rot[0], 4, 'X') @ Matrix.Rotation(rot[1], 4, 'Y') @ Matrix.Rotation(rot[2], 4, 'Z')
    return Matrix.Translation(loc) @ r @ Matrix.Diagonal((s[0], s[1], s[2], 1.0))


# ---------- primitives (axis = +y, centred like three.js geometries) ----------

def _new():
    return bmesh.new()


def sphere(r, u=24, v=16):
    bm = _new()
    bmesh.ops.create_uvsphere(bm, u_segments=u, v_segments=v, radius=r)
    return bm


def cyl(rt, rb, h, seg=16):
    bm = _new()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=seg, radius1=rb, radius2=rt, depth=h)
    bmesh.ops.rotate(bm, verts=bm.verts, cent=(0, 0, 0), matrix=Matrix.Rotation(-math.pi / 2, 3, 'X'))
    return bm


def cone(r, h, seg=16):
    return cyl(0.0, r, h, seg)


def box(w, h, d, bevel=0.0, segments=2):
    bm = _new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=(w, h, d), verts=bm.verts)
    if bevel > 0:
        bmesh.ops.bevel(bm, geom=list(bm.edges), offset=bevel, segments=segments, profile=0.5, affect='EDGES')
    return bm


def lathe(profile, seg=24, closed=False, start=0.0, sweep=TAU):
    """Revolve (radius, y) points around +y. Angle 0 points along +z (the figure's front)."""
    bm = _new()
    full = abs(sweep - TAU) < 1e-6
    steps = seg if full else seg + 1
    rings = []
    for i in range(steps):
        a = start + sweep * i / seg
        ring = []
        for r, y in profile:
            ring.append(bm.verts.new((math.sin(a) * r, y, math.cos(a) * r)))
        rings.append(ring)
    n = len(profile)
    edges = n if closed else n - 1
    cols = steps if full else steps - 1
    for i in range(cols):
        a, b = rings[i], rings[(i + 1) % steps]
        for j in range(edges):
            k = (j + 1) % n
            quad = [a[j], b[j], b[k], a[k]]
            uniq = []
            for vtx in quad:
                if vtx not in uniq:
                    uniq.append(vtx)
            if len(uniq) >= 3:
                bm.faces.new(uniq)
    if not full and closed:
        bm.faces.new(list(reversed(rings[0])))
        bm.faces.new(rings[-1])
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6)
    if not closed and full:
        # cap open ends that sit off-axis
        for j in (0, n - 1):
            r = profile[j][0]
            if r > 1e-6:
                ring = [rings[i][j] for i in range(steps)]
                ring = [v for v in ring if v.is_valid]
                try:
                    bm.faces.new(ring if j == n - 1 else list(reversed(ring)))
                except ValueError:
                    pass
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm


def torus(R, r, seg=32, tube=10):
    """Ring lying flat (in the xz plane) around +y."""
    profile = [(R + math.cos(t) * r, math.sin(t) * r) for t in (TAU * i / tube for i in range(tube))]
    return lathe(profile, seg=seg, closed=True)


def capsule(r, length, seg=16, cap=6):
    pts = []
    for i in range(cap + 1):
        t = -math.pi / 2 + (math.pi / 2) * i / cap
        pts.append((math.cos(t) * r, -length / 2 + math.sin(t) * r))
    for i in range(cap + 1):
        t = (math.pi / 2) * i / cap
        pts.append((math.cos(t) * r, length / 2 + math.sin(t) * r))
    pts[0] = (0.0, pts[0][1])
    pts[-1] = (0.0, pts[-1][1])
    return lathe(pts, seg=seg)


# ---------- builder ----------

class Figure:
    def __init__(self, name):
        self.name = name
        self.bm = bmesh.new()
        self.stack = [Matrix.Identity(4)]

    def push(self, loc=(0, 0, 0), rot=(0, 0, 0), scale=1.0):
        self.stack.append(self.stack[-1] @ trs(loc, rot, scale))
        return self

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        self.stack.pop()

    def add(self, part, role, loc=(0, 0, 0), rot=(0, 0, 0), scale=1.0, smooth=True):
        m = self.stack[-1] @ trs(loc, rot, scale)
        bmesh.ops.transform(part, matrix=m, verts=part.verts)
        if m.determinant() < 0:
            bmesh.ops.reverse_faces(part, faces=part.faces)
        idx = ROLE_NAMES.index(role)
        for f in part.faces:
            f.material_index = idx
            f.smooth = smooth
        me = bpy.data.meshes.new('_tmp')
        part.to_mesh(me)
        part.free()
        self.bm.from_mesh(me)
        bpy.data.meshes.remove(me)

    def finish(self, collection, materials):
        me = bpy.data.meshes.new(self.name)
        self.bm.to_mesh(me)
        self.bm.free()
        for mat in materials:
            me.materials.append(mat)
        # three.js space (y up) -> Blender (z up); the glTF exporter reverses this
        me.transform(Matrix.Rotation(math.pi / 2, 4, 'X'))
        used = sorted({p.material_index for p in me.polygons})
        obj = bpy.data.objects.new(self.name, me)
        collection.objects.link(obj)
        # drop unused material slots so the GLB only carries real primitives
        for idx in reversed(range(len(me.materials))):
            if idx not in used:
                obj.active_material_index = idx
                me.materials.pop(index=idx)
        return obj


# ---------- shared parts ----------

def face(f, r, y=0.0, z=0.0, eye=0.13):
    """Eyes, highlights, cheeks and a little mouth on a sphere of radius r centred at (0, y, z)."""
    for sx in (-1, 1):
        ex, ey = sx * r * 0.34, y + r * 0.06
        f.add(sphere(r * eye, 10, 8), 'dark', (ex, ey, z + r * 0.9), scale=(1, 1.35, 0.55))
        f.add(sphere(r * eye * 0.38, 8, 6), 'eyehi', (ex + r * 0.03, ey + r * 0.07, z + r * 0.97))
        f.add(sphere(r * 0.15, 12, 8), 'cheek', (sx * r * 0.56, y - r * 0.2, z + r * 0.79),
              rot=(0, sx * 0.6, 0), scale=(1, 0.65, 0.28))
    f.add(torus(r * 0.07, r * 0.018, 12, 6), 'dark', (0, y - r * 0.24, z + r * 0.955), rot=(math.pi / 2 - 0.3, 0, 0),
          scale=(1, 1, 0.55))


def humanoid(f, sleeve_role='main'):
    """Chibi body; leaves the head transform on the stack as returned context values."""
    for sx in (-1, 1):
        f.add(sphere(0.055, 14, 10), 'dark', (sx * 0.062, 0.035, 0.012), scale=(1, 0.75, 1.3))
    robe = [(0.0, 0.055), (0.152, 0.055), (0.158, 0.075), (0.15, 0.1), (0.128, 0.19), (0.108, 0.29),
            (0.085, 0.335), (0.05, 0.36), (0.0, 0.365)]
    f.add(lathe(robe, 20), 'main')
    f.add(torus(0.152, 0.014, 24, 6), 'trim', (0, 0.07, 0))
    f.add(torus(0.127, 0.02, 24, 6), 'trim', (0, 0.2, 0))
    f.add(torus(0.06, 0.022, 16, 6), 'trim', (0, 0.348, 0))
    for sx in (-1, 1):
        f.add(cyl(0.038, 0.05, 0.14, 12), sleeve_role, (sx * 0.142, 0.268, 0.02), rot=(0.35, 0, sx * 0.55))
        f.add(sphere(0.046, 14, 10), 'skin', (sx * 0.185, 0.205, 0.06))


def head(f, r=0.19, hair=True):
    f.add(sphere(r, 20, 14), 'skin', scale=(1.03, 0.96, 1.0))
    for sx in (-1, 1):
        f.add(sphere(r * 0.24, 10, 8), 'skin', (sx * r * 0.98, -r * 0.05, -r * 0.05), scale=(0.6, 1, 1))
    if hair:
        f.add(sphere(r * 1.05, 20, 14), 'hair', (0, r * 0.1, -r * 0.13), scale=(1.02, 0.98, 0.97))
    face(f, r)


def wheel(f, x, z, r, role='wood'):
    with f.push((x, r, z), (0, 0, math.pi / 2)):
        f.add(torus(r - 0.018, 0.022, 20, 6), role, rot=(0, 0, 0))
        f.add(cyl(r * 0.32, r * 0.32, 0.07, 14), 'dark')
        for i in range(6):
            a = math.pi * i / 6
            f.add(box(0.02, 0.025, r * 1.8), role, rot=(0, a, 0))


# ---------- pieces ----------

def build_king(f):
    humanoid(f)
    # cape, behind the body
    cape = [(0.2, 0.075), (0.22, 0.08), (0.1, 0.37), (0.082, 0.365)]
    f.add(lathe(cape, 20, closed=True, start=math.pi * 0.55, sweep=math.pi * 0.9), 'main')
    f.add(torus(0.075, 0.03, 20, 8), 'white', (0, 0.36, -0.01), scale=(1.1, 0.8, 1.1))
    # scepter in the right hand
    f.add(cyl(0.014, 0.014, 0.3, 8), 'trim', (0.19, 0.27, 0.07), rot=(0.15, 0, -0.12))
    f.add(sphere(0.04, 14, 10), 'gem', (0.21, 0.42, 0.095))
    f.add(torus(0.04, 0.012, 16, 6), 'trim', (0.21, 0.42, 0.095))
    with f.push((0, 0.52, 0)):
        head(f)
        crown = [(0.148, 0.12), (0.166, 0.12), (0.172, 0.2), (0.155, 0.2)]
        f.add(lathe(crown, 28, closed=True), 'trim')
        for i in range(5):
            a = TAU * i / 5
            f.add(cone(0.038, 0.1, 10), 'trim', (math.sin(a) * 0.162, 0.245, math.cos(a) * 0.162))
            f.add(sphere(0.02, 6, 4), 'trim', (math.sin(a) * 0.162, 0.3, math.cos(a) * 0.162))
        f.add(sphere(0.032, 12, 8), 'gem', (0, 0.16, 0.172), scale=(1, 1, 0.6))


def build_advisor(f):
    humanoid(f)
    # round shield on the left arm
    with f.push((-0.21, 0.25, 0.08), (0, -0.5, 0)):
        f.add(cyl(0.12, 0.12, 0.03, 24), 'trim', rot=(math.pi / 2, 0, 0))
        f.add(torus(0.115, 0.014, 24, 6), 'main', (0, 0, 0.017), rot=(math.pi / 2, 0, 0))
        f.add(sphere(0.035, 12, 8), 'main', (0, 0, 0.02), scale=(1, 1, 0.6))
    # short sword in the right hand
    f.add(box(0.025, 0.2, 0.012, 0.004, 1), 'white', (0.2, 0.3, 0.07))
    f.add(box(0.08, 0.018, 0.03, 0.005, 1), 'trim', (0.2, 0.2, 0.07))
    with f.push((0, 0.52, 0)):
        head(f)
        helmet = [(0.0, 0.215)] + [(math.sin(t) * 0.205, math.cos(t) * 0.205 + 0.01) for t in
                                   (math.pi * 0.5 * i / 8 for i in range(1, 9))]
        f.add(lathe(helmet, 20), 'main', (0, 0.02, -0.01))
        f.add(torus(0.205, 0.022, 24, 6), 'trim', (0, 0.03, -0.01))
        f.add(sphere(0.042, 12, 8), 'trim', (0, 0.25, -0.01))
        f.add(cone(0.03, 0.12, 8), 'plume', (0, 0.32, -0.01))


def build_pawn(f):
    humanoid(f)
    # spear
    f.add(cyl(0.015, 0.015, 0.66, 8), 'wood', (0.19, 0.36, 0.06))
    f.add(cone(0.04, 0.12, 8), 'white', (0.19, 0.75, 0.06))
    f.add(torus(0.025, 0.012, 12, 6), 'main', (0.19, 0.68, 0.06))
    with f.push((0, 0.5, 0)):
        head(f)
        hat = [(0.0, 0.32), (0.06, 0.26), (0.13, 0.17), (0.2, 0.1), (0.25, 0.07), (0.245, 0.05), (0.0, 0.05)]
        f.add(lathe(hat, 20), 'main')
        f.add(torus(0.17, 0.016, 28, 6), 'trim', (0, 0.135, 0))
        f.add(sphere(0.05, 12, 8), 'plume', (0, 0.33, 0))


def build_elephant(f):
    grey = 'grey'
    f.add(sphere(0.24, 20, 14), grey, (0, 0.29, -0.02), scale=(1, 0.86, 1.15))
    for sx, sz in ((-1, -1), (1, -1), (-1, 1), (1, 1)):
        f.add(cyl(0.06, 0.068, 0.17, 12), grey, (sx * 0.12, 0.085, sz * 0.13 - 0.02))
        f.add(cyl(0.07, 0.07, 0.025, 12), 'white', (sx * 0.12, 0.012, sz * 0.13 - 0.02))
    # saddle blanket and a little howdah
    f.add(box(0.36, 0.05, 0.32, 0.02), 'main', (0, 0.48, -0.04))
    f.add(box(0.38, 0.02, 0.34, 0.008, 1), 'trim', (0, 0.455, -0.04))
    f.add(lathe([(0.0, 0.0), (0.09, 0.0), (0.1, 0.05), (0.07, 0.11), (0.0, 0.14)], 20), 'trim', (0, 0.5, -0.05))
    f.add(sphere(0.025, 8, 6), 'gem', (0, 0.655, -0.05))
    f.add(cyl(0.007, 0.007, 0.07, 6), 'dark', (0, 0.66, -0.05))
    # tail
    f.add(cyl(0.012, 0.02, 0.12, 6), grey, (0, 0.27, -0.29), rot=(-0.6, 0, 0))
    with f.push((0, 0.42, 0.24)):
        f.add(sphere(0.19, 20, 14), grey)
        face(f, 0.19, 0.02)
        # curled trunk
        f.add(cyl(0.045, 0.055, 0.1, 10), grey, (0, -0.12, 0.15), rot=(0.4, 0, 0))
        f.add(cyl(0.036, 0.045, 0.09, 10), grey, (0, -0.19, 0.19), rot=(0.1, 0, 0))
        f.add(cyl(0.03, 0.036, 0.06, 10), grey, (0, -0.24, 0.21), rot=(-0.7, 0, 0))
        f.add(torus(0.03, 0.008, 12, 6), 'pink', (0, -0.27, 0.235), rot=(-0.7, 0, 0))
        for sx in (-1, 1):
            with f.push((sx * 0.19, 0.03, -0.03), (0, sx * 0.45, 0)):
                f.add(sphere(0.14, 18, 12), grey, scale=(0.18, 1, 0.95))
                f.add(sphere(0.11, 16, 10), 'pink', (sx * 0.012, 0, 0.0), scale=(0.15, 1, 0.9))
            f.add(cone(0.022, 0.1, 8), 'white', (sx * 0.08, -0.12, 0.15), rot=(1.9, 0, sx * -0.2))
        f.add(sphere(0.042, 10, 8), 'trim', (0, 0.18, 0.02))
        f.add(torus(0.07, 0.012, 20, 6), 'trim', (0, 0.15, 0.0), rot=(0.25, 0, 0))


def build_horse(f):
    coat = 'coat'
    f.add(capsule(0.135, 0.22, 16, 5), coat, (0, 0.3, -0.02), rot=(math.pi / 2, 0, 0))
    for sx, sz in ((-1, -1), (1, -1), (-1, 1), (1, 1)):
        f.add(cyl(0.035, 0.042, 0.2, 10), coat, (sx * 0.085, 0.12, sz * 0.13 - 0.02))
        f.add(cyl(0.045, 0.045, 0.04, 10), 'dark', (sx * 0.085, 0.02, sz * 0.13 - 0.02))
    # saddle
    f.add(box(0.3, 0.06, 0.22, 0.02), 'main', (0, 0.435, -0.05))
    f.add(box(0.32, 0.02, 0.24, 0.008, 1), 'trim', (0, 0.41, -0.05))
    f.add(lathe([(0.0, 0.0), (0.04, 0.0), (0.035, 0.03), (0.0, 0.035)], 12), 'trim', (0, 0.465, 0.05))
    # neck and head
    f.add(cyl(0.075, 0.095, 0.24, 14), coat, (0, 0.45, 0.16), rot=(0.45, 0, 0))
    with f.push((0, 0.6, 0.24)):
        f.add(sphere(0.15, 20, 14), coat, scale=(0.95, 1, 1.02))
        face(f, 0.15, 0.03)
        f.add(sphere(0.085, 16, 12), 'snout', (0, -0.065, 0.11), scale=(1.05, 0.85, 1))
        for sx in (-1, 1):
            f.add(sphere(0.012, 6, 4), 'dark', (sx * 0.03, -0.07, 0.19))
            f.add(cone(0.038, 0.1, 8), coat, (sx * 0.075, 0.15, -0.03), rot=(-0.2, 0, sx * -0.25))
            f.add(cone(0.02, 0.06, 6), 'pink', (sx * 0.075, 0.145, -0.012), rot=(-0.2, 0, sx * -0.25))
        f.add(torus(0.152, 0.012, 24, 6), 'main', (0, -0.02, 0.0), rot=(0.25, 0, 0), scale=(1, 1, 1.03))
    # mane tufts along the neck, tail tufts behind
    for i in range(5):
        t = i / 4
        f.add(sphere(0.05 - t * 0.012, 12, 8), 'main', (0, 0.7 - t * 0.2, 0.17 - t * 0.12))
    for i in range(3):
        f.add(sphere(0.05 - i * 0.01, 12, 8), 'main', (0, 0.36 - i * 0.07, -0.27 - i * 0.04))


def build_rook(f):
    f.add(box(0.34, 0.2, 0.38, 0.03), 'wood', (0, 0.25, 0))
    f.add(box(0.38, 0.045, 0.42, 0.015), 'main', (0, 0.36, 0))
    for sx in (-1, 1):
        for sz in (-1, 1):
            f.add(cyl(0.015, 0.015, 0.1, 8), 'trim', (sx * 0.17, 0.42, sz * 0.19))
            f.add(sphere(0.026, 10, 8), 'trim', (sx * 0.17, 0.475, sz * 0.19))
    wheel(f, -0.21, -0.02, 0.135)
    wheel(f, 0.21, -0.02, 0.135)
    # flag
    f.add(cyl(0.014, 0.014, 0.55, 8), 'dark', (0.1, 0.62, -0.12))
    f.add(box(0.02, 0.16, 0.24, 0.006, 1), 'main', (0.1, 0.8, 0.0))
    f.add(box(0.024, 0.03, 0.25, 0.005, 1), 'trim', (0.1, 0.71, 0.0))
    f.add(sphere(0.032, 10, 8), 'trim', (0.1, 0.91, -0.12))
    # tow bar
    f.add(box(0.04, 0.04, 0.22, 0.01, 1), 'wood', (0, 0.2, 0.28))
    # the cart has a face on its front
    for sx in (-1, 1):
        f.add(sphere(0.03, 12, 8), 'dark', (sx * 0.075, 0.29, 0.19), scale=(1, 1.35, 0.5))
        f.add(sphere(0.011, 6, 4), 'eyehi', (sx * 0.075 + 0.008, 0.305, 0.205))
        f.add(sphere(0.03, 10, 6), 'cheek', (sx * 0.12, 0.245, 0.19), scale=(1, 0.65, 0.25))
    f.add(torus(0.016, 0.005, 12, 6), 'dark', (0, 0.24, 0.192), rot=(math.pi / 2 - 0.3, 0, 0), scale=(1, 1, 0.55))


def build_cannon(f):
    f.add(box(0.27, 0.11, 0.32, 0.025), 'wood', (0, 0.17, -0.01))
    wheel(f, -0.175, -0.02, 0.125)
    wheel(f, 0.175, -0.02, 0.125)
    with f.push((0, 0.3, 0.04), (math.pi / 2 - 0.35, 0, 0)):
        barrel = [(0.0, -0.27), (0.05, -0.27), (0.075, -0.25), (0.1, -0.21), (0.1, -0.15), (0.09, 0.0),
                  (0.078, 0.17), (0.095, 0.18), (0.098, 0.22), (0.07, 0.225), (0.055, 0.2), (0.0, 0.2)]
        f.add(lathe(barrel, 20), 'metal')
        f.add(sphere(0.045, 12, 8), 'metal', (0, -0.29, 0))
        f.add(torus(0.1, 0.018, 28, 6), 'main', (0, -0.12, 0))
        f.add(torus(0.088, 0.014, 28, 6), 'trim', (0, 0.06, 0))
        # eyes on top of the barrel, looking forward
        for sx in (-1, 1):
            f.add(sphere(0.028, 12, 8), 'dark', (sx * 0.04, -0.04, -0.088), rot=(math.pi / 2, 0, 0),
                  scale=(1, 1.3, 0.5))
            f.add(sphere(0.01, 6, 4), 'eyehi', (sx * 0.04 + 0.007, -0.025, -0.1))
    f.add(cyl(0.008, 0.008, 0.06, 6), 'dark', (0, 0.4, -0.18), rot=(-0.4, 0, 0))
    f.add(sphere(0.028, 10, 8), 'fuse', (0, 0.435, -0.195))


BUILDERS = {
    'king': build_king,
    'advisor': build_advisor,
    'pawn': build_pawn,
    'elephant': build_elephant,
    'horse': build_horse,
    'rook': build_rook,
    'cannon': build_cannon,
}


# ---------- scene + export ----------

def materials():
    out = []
    for role, rgb in ROLES.items():
        mat = bpy.data.materials.get(role) or bpy.data.materials.new(role)
        mat.diffuse_color = (*rgb, 1.0)
        mat.use_nodes = True
        bsdf = mat.node_tree.nodes.get('Principled BSDF')
        if bsdf:
            bsdf.inputs['Base Color'].default_value = (*rgb, 1.0)
            bsdf.inputs['Roughness'].default_value = 0.8
        out.append(mat)
    return out


def reset_collection():
    col = bpy.data.collections.get(COLLECTION)
    if col:
        for obj in list(col.objects):
            me = obj.data
            bpy.data.objects.remove(obj, do_unlink=True)
            if me and me.users == 0:
                bpy.data.meshes.remove(me)
    else:
        col = bpy.data.collections.new(COLLECTION)
        bpy.context.scene.collection.children.link(col)
    return col


def main():
    col = reset_collection()
    mats = materials()
    objs = []
    for i, (kind, build) in enumerate(BUILDERS.items()):
        fig = Figure(kind)
        build(fig)
        obj = fig.finish(col, mats)
        obj.location = ((i - 3) * 0.9, 0, 0)  # spread out for viewing in Blender only
        objs.append(obj)

    bpy.ops.object.select_all(action='DESELECT')
    for obj in objs:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]

    # export each figure at the origin
    saved = [o.location.copy() for o in objs]
    for o in objs:
        o.location = (0, 0, 0)
    os.makedirs(os.path.dirname(OUT_GLB), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=OUT_GLB,
        export_format='GLB',
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_texcoords=False,
        export_normals=True,
        export_materials='EXPORT',
        export_cameras=False,
        export_lights=False,
        export_animations=False,
    )
    for o, loc in zip(objs, saved):
        o.location = loc

    tris = {o.name: sum(len(p.vertices) - 2 for p in o.data.polygons) for o in objs}
    bpy.ops.wm.save_as_mainfile(filepath=OUT_BLEND, copy=True)
    print('exported', OUT_GLB, os.path.getsize(OUT_GLB), 'bytes', tris)


main()
