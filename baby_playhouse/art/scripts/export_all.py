"""Save the .blend and export room/character GLBs (run after build_*.py)."""
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
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT, "art", "blender", "cafe.blend"), relative_remap=True)

room = bpy.data.collections["Room_Cafe"]
pb_lib.export_glb(list(room.all_objects), os.path.join(OUT, "room_cafe.glb"))
for root in [o for o in bpy.data.collections["Characters"].objects if o.name.startswith("CHAR_")]:
    key = root.name[5:]
    loc, rot = root.location.copy(), root.rotation_euler.copy()
    root.location, root.rotation_euler = (0, 0, 0), (0, 0, 0)  # export at origin, facing -Y (=> +Z in glTF)
    bpy.context.view_layer.update()
    pb_lib.export_glb([root, *root.children_recursive], os.path.join(OUT, f"char_{key}.glb"))
    root.location, root.rotation_euler = loc, rot
bpy.ops.wm.save_mainfile()
print("exported:", sorted(os.listdir(OUT)))
