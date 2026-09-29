"""Save the .blend and export GLBs for whatever build_*.py just created.

Every collection named Room_<Name> becomes room_<name>.glb and the blend is
saved as art/blender/<name>.blend. If a Characters collection exists, each
CHAR_* root is exported as char_<key>.glb (a characters-only scene is saved
as art/blender/char_<key>.blend).
"""
import importlib
import os
import sys

import bpy

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
sys.path.insert(0, HERE)
import pb_lib  # noqa: E402

importlib.reload(pb_lib)

OUT = os.path.join(ROOT, "art", "export")
os.makedirs(OUT, exist_ok=True)

rooms = [c for c in bpy.data.collections if c.name.startswith("Room_")]
chars = bpy.data.collections.get("Characters")
char_roots = [o for o in (chars.objects if chars else []) if o.name.startswith("CHAR_")]
assert rooms or char_roots, "nothing to export - run a build_*.py script first"
blend_name = rooms[0].name[5:].lower() if rooms else f"char_{char_roots[0].name[5:]}"
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT, "art", "blender", f"{blend_name}.blend"), relative_remap=True)

for room in rooms:
    pb_lib.export_glb(list(room.all_objects), os.path.join(OUT, f"room_{room.name[5:].lower()}.glb"))

for root in char_roots:
    key = root.name[5:]
    loc, rot = root.location.copy(), root.rotation_euler.copy()
    root.location, root.rotation_euler = (0, 0, 0), (0, 0, 0)  # export at origin, facing -Y (=> +Z in glTF)
    bpy.context.view_layer.update()
    pb_lib.export_glb([root, *root.children_recursive], os.path.join(OUT, f"char_{key}.glb"))
    root.location, root.rotation_euler = loc, rot
bpy.ops.wm.save_mainfile()
print("exported:", [r.name for r in rooms], "chars:", [r.name for r in char_roots])
